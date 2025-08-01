import React, { useState } from 'react'
import { ArrowLeft, BookOpen, Info, MousePointer } from 'lucide-react'
import { TooltipPosition } from '../types'
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
  const [termExplanations, setTermExplanations] = useState<Record<string, any>>({})
  const [selectedText, setSelectedText] = useState('')

  const MAX_SELECTION_WORDS = 5 // Word limit for manual selection

  // Handle text selection for manual mode
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      const wordCount = selectedText.split(/\s+/).filter(word => word.length > 0).length
      
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
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top - 10 + window.scrollY,
          visible: true
        })
        setActiveTerm(term)
      }
    } catch (error) {
      console.error('Error getting term explanation:', error)
    }
  }



  const handleCloseTooltip = () => {
    setTooltipPosition(prev => ({ ...prev, visible: false }))
    setActiveTerm(null)
  }

  const renderContent = () => {
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
          {renderContent()}
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