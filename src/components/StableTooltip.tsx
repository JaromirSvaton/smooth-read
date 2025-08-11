import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { X } from 'lucide-react'
import { TermDefinition, TooltipPosition } from '../types'

interface StableTooltipProps {
  term: string
  definition: TermDefinition
  position: TooltipPosition
  onClose: () => void
}

const StableTooltip: React.FC<StableTooltipProps> = ({ term, definition, position, onClose }) => {
  console.log('🎯 StableTooltip rendering:', { 
    term, 
    position: { x: position.x, y: position.y, visible: position.visible },
    screenSize: { width: window.innerWidth, height: window.innerHeight }
  })
  
  // Fallback positioning if coordinates are invalid
  const safeX = isNaN(position.x) || position.x < 0 ? 100 : position.x
  const safeY = isNaN(position.y) || position.y < 0 ? 100 : position.y
  
  console.log('📍 Tooltip positioning:', { 
    original: { x: position.x, y: position.y }, 
    safe: { x: safeX, y: safeY },
    visible: position.visible
  })
  
  const getCategoryColor = (category: string) => {
    const colors = {
      'Finance': 'bg-green-100 text-green-800 border-green-200',
      'Technology': 'bg-blue-100 text-blue-800 border-blue-200',
      'Legal': 'bg-purple-100 text-purple-800 border-purple-200',
      'Medical': 'bg-red-100 text-red-800 border-red-200',
      'Business': 'bg-orange-100 text-orange-800 border-orange-200',
      'Error': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const tooltipElement = (
    <div
      className="fixed z-[9999] bg-yellow-300 border-4 border-red-500 rounded-lg shadow-lg p-3 max-w-xs text-sm"
      style={{
        left: `${safeX}px`,
        top: `${safeY}px`,
        transform: 'translateX(-50%) translateY(-100%)',
        animation: 'slideUp 0.2s ease-out',
        backgroundColor: '#fef08a',
        zIndex: 9999,
        position: 'fixed',
        pointerEvents: 'auto',
        minWidth: '200px',
        minHeight: '100px'
      }}
    >
      <div className="absolute w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45" 
           style={{ left: '50%', top: '100%', transform: 'translateX(-50%) rotate(45deg)' }} />
      
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 text-base">{term}</h4>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(definition.category)}`}>
              {definition.category}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors" 
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div>
          <p className="text-gray-700 leading-relaxed">
            {definition.definition === 'Loading...' ? (
              <span className="inline-flex items-center">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full mr-2" />
                Getting AI explanation...
              </span>
            ) : (
              definition.definition
            )}
          </p>
        </div>
        
        {definition.examples && definition.examples.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 text-sm mb-1">Example:</h5>
            <p className="text-gray-600 text-sm italic">
              {definition.examples[0]}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // Render tooltip to document body to avoid parent re-render issues
  console.log('🚀 Creating tooltip portal with element:', tooltipElement)
  return ReactDOM.createPortal(tooltipElement, document.body)
}

export default StableTooltip