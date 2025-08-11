import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ArrowLeft, BookOpen, Info, MousePointer } from 'lucide-react'
import { TooltipPosition } from '../types'
import StableTooltip from './StableTooltip'
import { GeminiService } from '../services/geminiService'

interface ReaderProps {
  content: string
  onBackToInput: () => void
  geminiService: GeminiService | null
}

const Reader: React.FC<ReaderProps> = ({ content, onBackToInput, geminiService }) => {
  const renderCount = useRef(0)
  renderCount.current += 1
  console.log(`🔄 Reader render #${renderCount.current}, content length:`, content.length)
  
  // Track what's causing re-renders
  const prevProps = useRef({ content, onBackToInput, geminiService })
  if (prevProps.current.content !== content) console.log('❌ Re-render caused by: content change')
  if (prevProps.current.onBackToInput !== onBackToInput) console.log('❌ Re-render caused by: onBackToInput change')  
  if (prevProps.current.geminiService !== geminiService) console.log('❌ Re-render caused by: geminiService change')
  prevProps.current = { content, onBackToInput, geminiService }
  
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    x: 0,
    y: 0,
    visible: false
  })
  const [activeTerm, setActiveTerm] = useState<string | null>(null)
  const [termExplanations, setTermExplanations] = useState<Record<string, any>>({})
  const [selectedText, setSelectedText] = useState('')
  
  // Use refs to prevent re-renders from affecting state
  const activeTermRef = useRef<string | null>(null)
  const tooltipPositionRef = useRef<TooltipPosition>({ x: 0, y: 0, visible: false })

  const MAX_SELECTION_WORDS = 5 // Word limit for manual selection

  // Debug when state changes
  useEffect(() => {
    console.log('TooltipPosition changed:', tooltipPosition)
  }, [tooltipPosition])

  useEffect(() => {
    console.log('ActiveTerm changed:', activeTerm)
  }, [activeTerm])

  // Handle text selection for manual mode
  const handleTextSelection = useCallback(() => {
    console.log('=== Text selection triggered ===')
    const selection = window.getSelection()
    console.log('Selection object:', selection)
    console.log('Selection text:', selection?.toString())
    
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      console.log('Selected text:', selectedText)
      const wordCount = selectedText.split(/\s+/).filter(word => word.length > 0).length
      console.log('Word count:', wordCount)
      
      if (wordCount > MAX_SELECTION_WORDS) {
        // Show error tooltip for too many words
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setTooltipPosition({
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top - 10 + window.scrollY,
          visible: true
        })
        setActiveTerm('Selection too long')
        setTermExplanations(prev => ({
          ...prev,
          'Selection too long': {
            term: 'Selection too long',
            definition: `Please select fewer words (max ${MAX_SELECTION_WORDS} words). You selected ${wordCount} words.`,
            category: 'Error',
            examples: ['Try selecting individual terms or short phrases like "P/E ratio" or "EBITDA".']
          }
        }))
        
        // Auto-hide error tooltip after 3 seconds
        setTimeout(() => {
          setTooltipPosition(prev => ({ ...prev, visible: false }))
          setActiveTerm(null)
        }, 3000)
        return
      }
      
      setSelectedText(selectedText)
      
      // Capture selection position before async operations
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const tooltipPos = {
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top - 10 + window.scrollY,
        visible: true
      }
      
      // Get explanation for selected text
      if (geminiService && selectedText.length > 0) {
        handleManualTermExplanation(selectedText, tooltipPos)
      }
    }
  }, [geminiService, content])

  const handleManualTermExplanation = async (term: string, tooltipPos: TooltipPosition) => {
    if (!geminiService) return

    try {
      console.log('Getting AI explanation for selected term:', term)
      const explanation = await geminiService.explainTerm(term, content)
      console.log('Received AI explanation:', explanation)
      setTermExplanations(prev => ({
        ...prev,
        [term]: explanation
      }))
      
      // Show tooltip at the captured position
      console.log('Setting tooltip position:', tooltipPos)
      console.log('Setting active term:', term)
      
      // Update refs immediately
      activeTermRef.current = term
      tooltipPositionRef.current = tooltipPos
      
      // Update state in a way that won't trigger re-renders during async operations  
      setActiveTerm(term)
      setTooltipPosition(tooltipPos)
      
      // Force re-render with a small delay to ensure state sticks
      setTimeout(() => {
        setActiveTerm(term)
        setTooltipPosition(tooltipPos)
        console.log('Force re-set tooltip state:', { term, tooltipPos })
      }, 50)
      
      console.log('Tooltip and term set successfully')
    } catch (error) {
      console.error('Error getting term explanation:', error)
    }
  }



  const handleCloseTooltip = () => {
    setTooltipPosition(prev => ({ ...prev, visible: false }))
    setActiveTerm(null)
  }

  const renderContent = useMemo(() => {
    console.log('Rendering content (memoized)')
    return (
      <div 
        className="text-gray-700 leading-relaxed cursor-text"
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
      >
        {content.split('\n').map((line, index) => {
          if (line.trim() === '') return <br key={index} />
          
          // Handle main title (# Title)
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{line.substring(2)}</h1>
          }
          
          // Handle chapter headings (## Chapter)
          if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.substring(3)}</h2>
          }
          
          // Handle subheadings (### Section)
          if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2">{line.substring(4)}</h3>
          }
          
          // Handle horizontal separator (---)
          if (line.trim() === '---') {
            return <hr key={index} className="my-6 border-gray-300" />
          }
          
          // Handle bold text (**text**)
          if (line.includes('**')) {
            const parts = line.split('**')
            return (
              <p key={index} className="mb-3">
                {parts.map((part, partIndex) => (
                  partIndex % 2 === 1 ? (
                    <strong key={partIndex}>{part}</strong>
                  ) : (
                    part
                  )
                ))}
              </p>
            )
          }
          
          return <p key={index} className="mb-3">{line}</p>
        })}
      </div>
    )
  }, [content, handleTextSelection])



  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToInput}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Input
          </button>
          <div className="flex items-center text-sm text-gray-500">
            <MousePointer className="w-4 h-4 mr-1" />
            Manual Mode
          </div>
        </div>
        
        {/* AI Status */}
        {geminiService && (
          <div className="flex items-center text-sm text-gray-500">
            <MousePointer className="w-4 h-4 mr-1" />
            Select any text to get AI-powered explanations
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="prose prose-lg max-w-none formatted-content">
          {renderContent}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">How to use</h3>
            <p className="text-blue-700 text-sm">
              Select any text with your mouse to get AI-powered explanations. Only selected terms will use the API - no automatic scanning.
            </p>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {(() => {
        const shouldShow = tooltipPosition.visible && activeTerm && termExplanations[activeTerm]
        console.log('Tooltip render check:', {
          visible: tooltipPosition.visible,
          activeTerm: activeTerm,
          position: tooltipPosition,
          hasExplanation: !!termExplanations[activeTerm || ''],
          shouldShow: shouldShow
        })
        return null
      })()}
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

export default Reader 