import React, { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, BookOpen, Info, Brain, MousePointer } from 'lucide-react'
import { termDictionary } from '../data/termDictionary'
import { HighlightedTerm, TooltipPosition } from '../types'
import TermTooltip from './TermTooltip'
import { GeminiService } from '../services/geminiService'

interface ReaderProps {
  content: string
  onBackToInput: () => void
  geminiService: GeminiService | null
}

const Reader: React.FC<ReaderProps> = ({ content, onBackToInput, geminiService }) => {
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    x: 0,
    y: 0,
    visible: false
  })
  const [activeTerm, setActiveTerm] = useState<string | null>(null)
  const [detectedTerms, setDetectedTerms] = useState<string[]>([])
  const [isDetectingTerms, setIsDetectingTerms] = useState(false)
  const [termExplanations, setTermExplanations] = useState<Record<string, any>>({})
  const [manualMode, setManualMode] = useState(false)
  const [selectedText, setSelectedText] = useState('')

  // Detect terms using Gemini if available
  useEffect(() => {
    if (geminiService && content && !isDetectingTerms && !manualMode) {
      console.log('Starting term detection with Gemini...')
      setIsDetectingTerms(true)
      geminiService.detectTerms(content)
        .then(terms => {
          console.log('Gemini detected terms:', terms)
          setDetectedTerms(terms)
          setIsDetectingTerms(false)
        })
        .catch(error => {
          console.error('Error detecting terms:', error)
          setIsDetectingTerms(false)
          // If AI detection fails, switch to manual mode
          setManualMode(true)
        })
    } else if (!geminiService) {
      console.log('No Gemini service available')
      setDetectedTerms([])
      setManualMode(true)
    }
  }, [content, geminiService, manualMode])

  // Handle text selection for manual mode
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      setSelectedText(selectedText)
      
      // Get explanation for selected text
      if (geminiService && selectedText.length > 0) {
        handleManualTermExplanation(selectedText)
      }
    }
  }

  const handleManualTermExplanation = async (term: string) => {
    if (!geminiService) return

    try {
      console.log('Getting AI explanation for selected term:', term)
      const explanation = await geminiService.explainTerm(term, content)
      console.log('Received AI explanation:', explanation)
      setTermExplanations(prev => ({
        ...prev,
        [term]: explanation
      }))
      
      // Show tooltip for the selected term
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
          visible: true
        })
        setActiveTerm(term)
      }
    } catch (error) {
      console.error('Error getting term explanation:', error)
    }
  }

  // Find and highlight terms in the content
  const highlightedContent = useMemo(() => {
    if (manualMode) {
      // In manual mode, just render the content without highlights
      return { processedContent: content, highlightedTerms: [] }
    }

    const terms = detectedTerms
    const highlightedTerms: HighlightedTerm[] = []
    
    // Sort terms by length (longest first) to avoid partial matches
    const sortedTerms = terms.sort((a, b) => b.length - a.length)
    
    let processedContent = content
    let offset = 0
    
    sortedTerms.forEach(term => {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      let match
      
      while ((match = regex.exec(content)) !== null) {
        const startIndex = match.index + offset
        const endIndex = startIndex + term.length
        
        // Use placeholder for AI terms
        const definition = {
          term: term,
          definition: 'Loading...',
          category: 'Other'
        }
        
        highlightedTerms.push({
          term: term,
          startIndex: startIndex,
          endIndex: endIndex,
          definition: definition
        })
        
        // Replace the term with a placeholder to avoid overlapping matches
        processedContent = processedContent.slice(0, startIndex) + 
                         `__TERM_${highlightedTerms.length - 1}__` + 
                         processedContent.slice(endIndex)
        offset += `__TERM_${highlightedTerms.length - 1}__`.length - term.length
      }
    })
    
    return { processedContent, highlightedTerms }
  }, [content, detectedTerms, manualMode])

  const handleTermHover = async (event: React.MouseEvent, term: string) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      visible: true
    })
    setActiveTerm(term)

    // Get explanation from Gemini if available and not already cached
    if (geminiService && !termExplanations[term]) {
      try {
        console.log('Getting AI explanation for term:', term)
        const explanation = await geminiService.explainTerm(term, content)
        console.log('Received AI explanation:', explanation)
        setTermExplanations(prev => ({
          ...prev,
          [term]: explanation
        }))
      } catch (error) {
        console.error('Error getting term explanation:', error)
        // Set a fallback explanation
        setTermExplanations(prev => ({
          ...prev,
          [term]: {
            term: term,
            definition: 'Unable to get AI explanation. Using static definition.',
            category: 'Other',
            examples: []
          }
        }))
      }
    }
  }

  const handleTermLeave = () => {
    setTooltipPosition(prev => ({ ...prev, visible: false }))
    setActiveTerm(null)
  }

  const handleCloseTooltip = () => {
    setTooltipPosition(prev => ({ ...prev, visible: false }))
    setActiveTerm(null)
  }

  const renderHighlightedContent = () => {
    if (manualMode) {
      // In manual mode, render content with selection support
      return (
        <div 
          className="text-gray-700 leading-relaxed cursor-text"
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
        >
          {content.split('\n').map((line, index) => {
            if (line.trim() === '') return <br key={index} />
            if (line.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.substring(3)}</h2>
            }
            return <p key={index} className="mb-3">{line}</p>
          })}
        </div>
      )
    }

    const { processedContent, highlightedTerms } = highlightedContent
    
    if (highlightedTerms.length === 0) {
      // Split content by lines and preserve formatting
      return (
        <div className="text-gray-700 leading-relaxed">
          {content.split('\n').map((line, index) => {
            if (line.trim() === '') return <br key={index} />
            if (line.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.substring(3)}</h2>
            }
            return <p key={index} className="mb-3">{line}</p>
          })}
        </div>
      )
    }
    
    // Split content by lines and preserve formatting with highlights
    const lines = processedContent.split('\n')
    
    return (
      <div className="text-gray-700 leading-relaxed">
        {lines.map((line, lineIndex) => {
          if (line.trim() === '') return <br key={lineIndex} />
          
          // Check if this is a heading
          if (line.startsWith('## ')) {
            const headingText = line.substring(3)
            return <h2 key={lineIndex} className="text-xl font-bold text-gray-900 mt-6 mb-3">{headingText}</h2>
          }
          
          // Process regular lines with term highlights
          const parts = line.split(/(__TERM_\d+__)/)
          
          return (
            <p key={lineIndex} className="mb-3">
              {parts.map((part, partIndex) => {
                const termMatch = part.match(/__TERM_(\d+)__/)
                if (termMatch) {
                  const termIndex = parseInt(termMatch[1])
                  const highlightedTerm = highlightedTerms[termIndex]
                  
                  return (
                    <span
                      key={partIndex}
                      className="term-highlight"
                      onMouseEnter={(e) => handleTermHover(e, highlightedTerm.term)}
                      onMouseLeave={handleTermLeave}
                    >
                      {highlightedTerm.term}
                    </span>
                  )
                }
                return part
              })}
            </p>
          )
        })}
      </div>
    )
  }

  const stats = useMemo(() => {
    const { highlightedTerms } = highlightedContent
    const categories = highlightedTerms.reduce((acc, term) => {
      acc[term.definition.category] = (acc[term.definition.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalTerms: highlightedTerms.length,
      categories
    }
  }, [highlightedContent])

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
            <BookOpen className="w-4 h-4 mr-1" />
            {manualMode ? 'Manual mode' : `${stats.totalTerms} terms highlighted`}
          </div>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setManualMode(false)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                !manualMode 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-1" />
              Auto Mode
            </button>
            <button
              onClick={() => setManualMode(true)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                manualMode 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MousePointer className="w-4 h-4 inline mr-1" />
              Manual Mode
            </button>
          </div>
        </div>
        
        {/* Stats */}
        {!manualMode && stats.totalTerms > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.categories).map(([category, count]) => (
              <span
                key={category}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
              >
                {category}: {count}
              </span>
            ))}
          </div>
        )}
        
        {/* AI Status */}
        {geminiService && (
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Brain className="w-4 h-4 mr-1" />
            {manualMode 
              ? 'Manual mode - Select text to get AI explanations' 
              : isDetectingTerms 
                ? 'AI detecting terms...' 
                : 'AI-powered explanations'
            }
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="prose prose-lg max-w-none formatted-content">
          {renderHighlightedContent()}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">How to use</h3>
            <p className="text-blue-700 text-sm">
              {manualMode 
                ? 'Select any text to get AI-powered explanations. Click "Auto Mode" to switch back to automatic term detection.'
                : 'Hover over highlighted terms to see AI-powered definitions. Click "Manual Mode" to select text manually.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltipPosition.visible && activeTerm && (
        <TermTooltip
          term={activeTerm}
          definition={termExplanations[activeTerm] || {
            term: activeTerm,
            definition: 'Loading...',
            category: 'Other'
          }}
          position={tooltipPosition}
          onClose={handleCloseTooltip}
        />
      )}
    </div>
  )
}

export default Reader 