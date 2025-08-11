import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, MousePointer, Minus, Plus } from 'lucide-react'
import { TooltipPosition } from '../types'
import StableTooltip from './StableTooltip'
import { GeminiService } from '../services/geminiService'
import ePub from 'epubjs'
import { EbookData } from '../utils/epubParser'
import { saveReadingPosition, getReadingPosition } from '../utils/bookshelf'

interface EbookReaderProps {
  ebook: EbookData
  onBackToInput: () => void
  geminiService: GeminiService | null
  theme?: 'light' | 'dark' | 'sepia'
}

const EbookReader: React.FC<EbookReaderProps> = ({ 
  ebook,
  onBackToInput, 
  geminiService,
  theme = 'light'
}) => {
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const bookRef = useRef<any>(null)
  const renditionRef = useRef<any>(null)
  const canResizeRef = useRef<boolean>(false)

  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0, visible: false })
  const [activeTerm, setActiveTerm] = useState<string | null>(null)
  const [termExplanations, setTermExplanations] = useState<Record<string, any>>({})
  const isDarkMode = theme === 'dark'
  const isSepia = theme === 'sepia'
  const [fontSize, setFontSize] = useState<number>(100)
  const [containerWidth, setContainerWidth] = useState<number>(960)
  const [pageInfo, setPageInfo] = useState<{ current: number, total: number }>({ current: 1, total: 1 })
  
  const MAX_SELECTION_WORDS = 5

  // Initialize epub.js rendition
  useEffect(() => {
    if (!viewerRef.current) return
    const book = ePub(ebook.arrayBuffer)
    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '75vh',
      flow: 'paginated',
      spread: 'none' // always single-page
    })
    bookRef.current = book
    renditionRef.current = rendition

    // Themes
    rendition.themes.register('light', {
      body: { background: '#ffffff', color: '#111827' }
    })
    rendition.themes.register('dark', {
      body: { background: '#0f172a', color: '#e2e8f0' },
      a: { color: '#93c5fd' }
    })
    rendition.themes.register('sepia', {
      body: { background: '#f6f1e1', color: '#3a2f1d' },
      a: { color: '#8b6b28' }
    })
    rendition.themes.select(theme)
    rendition.themes.fontSize(`${fontSize}%`)

    // Resume position if available
    ;(async () => {
      try {
        if (ebook.id) {
          const saved = await getReadingPosition(ebook.id)
          if (saved) {
            await rendition.display(saved)
            return
          }
        }
      } catch {}
      rendition.display()
    })()

    // Track location for simple page counter
    rendition.on('relocated', async (location: any) => {
      try {
        const current = location?.start?.displayed?.page || 1
        const total = location?.start?.displayed?.total || 1
        setPageInfo({ current, total })
        if (ebook.id && location?.start?.cfi) {
          await saveReadingPosition(ebook.id, location.start.cfi)
        }
      } catch {}
    })

    // Mark ready after first render
    rendition.on('rendered', () => {
      canResizeRef.current = true
    })

    // Selection handling inside iframe with proper coordinates
    rendition.on('selected', async (cfiRange: string, contents: any) => {
      try {
        // Derive a stable DOM Range from the CFI
        let domRange: Range | null = null
        try {
          domRange = contents.range?.(cfiRange) || null
        } catch {}
        if (!domRange) {
          try {
            domRange = contents.window?.getSelection?.()?.getRangeAt(0) || null
          } catch {}
        }
        if (!domRange) return

        // Compute rect with fallback to first client rect
        let rect = domRange.getBoundingClientRect()
        if (!rect || (rect.width === 0 && rect.height === 0)) {
          const rects = domRange.getClientRects?.() || []
          if (rects.length > 0) rect = rects[0] as DOMRect
        }
        const iframeRect = contents.iframe.getBoundingClientRect()
        const tooltipPos = {
          x: iframeRect.left + rect.left + rect.width / 2,
          y: iframeRect.top + rect.top - 10,
          visible: true
        }

        // Extract text reliably from the range
        let selectedText = (domRange.toString?.() || '').trim()
        if (!selectedText) return

        const wordCount = selectedText.split(/\s+/).filter((w: string) => w.length > 0).length
        if (wordCount > MAX_SELECTION_WORDS) {
          setTooltipPosition(tooltipPos)
          setActiveTerm('Selection too long')
          setTermExplanations(prev => ({
            ...prev,
            'Selection too long': {
              term: 'Selection too long',
              definition: `Please select fewer words (max ${MAX_SELECTION_WORDS} words). You selected ${wordCount} words.`,
              category: 'Error',
              examples: ['Try selecting individual terms or short phrases.']
            }
          }))
          setTimeout(() => {
            setTooltipPosition(prev => ({ ...prev, visible: false }))
            setActiveTerm(null)
          }, 3000)
          return
        }

        // Show loading state immediately
        setTooltipPosition(tooltipPos)
        setActiveTerm(selectedText)
        setTermExplanations(prev => ({
          ...prev,
          [selectedText]: { term: selectedText, definition: 'Loading...', category: 'Other', examples: [] }
        }))

        if (geminiService) {
          // Use book range text as context if available
          let contextText = selectedText
          try {
            const bookRange = await book.getRange(cfiRange)
            contextText = bookRange?.toString?.() || selectedText
          } catch {}
          const explanation = await geminiService.explainTerm(selectedText, contextText)
          setTermExplanations(prev => ({ ...prev, [selectedText]: explanation }))
          setTooltipPosition(tooltipPos)
          setActiveTerm(selectedText)
        }
      } catch (err) {
        // ignore
      }
    })

    // Fallback: handle mouse/touch selection events from contents if 'selected' doesn't fire
    const attachSelectionHandlers = (contents: any) => {
      const handler = async () => {
        try {
          const sel = contents.window?.getSelection?.()
          const hasText = sel && sel.toString && sel.toString().trim().length > 0
          if (!hasText) return
          const range = sel!.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          const iframeRect = contents.iframe.getBoundingClientRect()
          const pos = { x: iframeRect.left + rect.left + rect.width / 2, y: iframeRect.top + rect.top - 10, visible: true }
          let selectedText = sel!.toString().trim()
          if (!selectedText) return
          const wordCount = selectedText.split(/\s+/).filter((w: string) => w.length > 0).length
          if (wordCount > MAX_SELECTION_WORDS) {
            setTooltipPosition(pos)
            setActiveTerm('Selection too long')
            setTermExplanations(prev => ({
              ...prev,
              'Selection too long': {
                term: 'Selection too long',
                definition: `Please select fewer words (max ${MAX_SELECTION_WORDS} words). You selected ${wordCount} words.`,
                category: 'Error',
                examples: ['Try selecting individual terms or short phrases.']
              }
            }))
            setTimeout(() => {
              setTooltipPosition(prev => ({ ...prev, visible: false }))
              setActiveTerm(null)
            }, 3000)
            return
          }
          setTooltipPosition(pos)
          setActiveTerm(selectedText)
          setTermExplanations(prev => ({ ...prev, [selectedText]: { term: selectedText, definition: 'Loading...', category: 'Other', examples: [] } }))
          if (geminiService) {
            const explanation = await geminiService.explainTerm(selectedText, selectedText)
            setTermExplanations(prev => ({ ...prev, [selectedText]: explanation }))
            setTooltipPosition(pos)
            setActiveTerm(selectedText)
          }
        } catch {}
      }
      contents.document.addEventListener('mouseup', handler)
      contents.document.addEventListener('touchend', handler)
      contents.on('destroy', () => {
        try { contents.document.removeEventListener('mouseup', handler) } catch {}
        try { contents.document.removeEventListener('touchend', handler) } catch {}
      })
    }

    rendition.on('rendered', (_section: any, contents: any) => {
      attachSelectionHandlers(contents)
    })

    return () => {
      try { rendition?.destroy?.() } catch {}
      try { book?.destroy?.() } catch {}
    }
  }, [ebook.arrayBuffer])

  // Apply theme changes
  useEffect(() => {
    const rendition = renditionRef.current
    if (!rendition) return
    rendition.themes.select(theme)
  }, [theme])

  // Apply font size changes

  // Apply theme and font size when toggled
  useEffect(() => {
    const rendition = renditionRef.current
    if (!rendition) return
    rendition.themes.fontSize(`${fontSize}%`)
  }, [fontSize])

  // Resize without reinitializing
  useEffect(() => {
    const rendition = renditionRef.current
    if (!rendition || !canResizeRef.current) return
    try {
      // Some versions require manager to exist before resize
      if (rendition.manager && typeof rendition.resize === 'function') {
        rendition.resize(containerWidth, '75vh')
      }
    } catch (e) {
      // Ignore resize errors if rendition is not fully ready yet
    }
  }, [containerWidth])

  // inline explanation calls are performed inside selection handlers

  const handleCloseTooltip = () => {
    setTooltipPosition(prev => ({ ...prev, visible: false }))
    setActiveTerm(null)
  }

  const goToNextPage = () => {
    handleCloseTooltip()
    renditionRef.current?.next?.()
  }

  const goToPrevPage = () => {
    handleCloseTooltip()
    renditionRef.current?.prev?.()
  }

  return (
    <div className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-slate-900' : ''}`}>
      {/* Header */}
      <div className={`rounded-xl shadow-lg p-6 mb-6 ${isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToInput}
            className={`flex items-center transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Library
          </button>
          <div className="text-center">
            <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{ebook.title}</h1>
            {ebook.author && <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{ebook.author}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
              <MousePointer className="w-4 h-4 mr-1" />
              Select text for AI explanations
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs">Width</span>
                <input type="range" min={600} max={1200} value={containerWidth} onChange={e=>setContainerWidth(parseInt(e.target.value))} />
                <span className="text-xs w-10 text-right">{containerWidth}px</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFontSize(s => Math.max(80, s - 10))}
                  className={`px-2 py-2 rounded-lg border ${isDarkMode ? 'border-slate-600 bg-slate-700 text-slate-100' : 'border-gray-300 bg-white text-gray-700'}`}
                  title="Decrease font size"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className={`text-sm w-12 text-center ${isDarkMode ? 'text-slate-200' : 'text-gray-600'}`}>{fontSize}%</span>
                <button
                  onClick={() => setFontSize(s => Math.min(180, s + 10))}
                  className={`px-2 py-2 rounded-lg border ${isDarkMode ? 'border-slate-600 bg-slate-700 text-slate-100' : 'border-gray-300 bg-white text-gray-700'}`}
                  title="Increase font size"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevPage}
            className={`flex items-center px-4 py-2 transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous Page
          </button>
          
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Page {pageInfo.current} of {pageInfo.total}
            </span>
          </div>
          
          <button
            onClick={goToNextPage}
            className={`flex items-center px-4 py-2 transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Next Page
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>

      {/* EPUB Viewer */}
      <div className={`rounded-xl shadow-lg p-4 mb-6 ${isDarkMode ? 'bg-slate-800' : isSepia ? 'bg-[var(--bg)]' : 'bg-white'}`} style={{ display: 'flex', justifyContent: 'center' }}>
        <div ref={viewerRef} style={{ width: '100%', maxWidth: `${containerWidth}px` }} />
      </div>

      {/* Footer Pagination */}
      <div className="flex justify-between mb-8">
        <button
          onClick={goToPrevPage}
          className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        
        <button
          onClick={goToNextPage}
          className="flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      {/* Tooltip */}
      {tooltipPosition.visible && activeTerm && termExplanations[activeTerm] && (
        <StableTooltip
          term={activeTerm}
          definition={termExplanations[activeTerm]}
          position={tooltipPosition}
          onClose={handleCloseTooltip}
        />
      )}
    </div>
  )
}

export default EbookReader