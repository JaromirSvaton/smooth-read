import React from 'react'
import { X } from 'lucide-react'
import { TermDefinition, TooltipPosition } from '../types'

interface TermTooltipProps {
  term: string
  definition: TermDefinition
  position: TooltipPosition
  onClose: () => void
}

const TermTooltip: React.FC<TermTooltipProps> = ({ term, definition, position, onClose }) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Finance': 'bg-green-100 text-green-800 border-green-200',
      'Technology': 'bg-blue-100 text-blue-800 border-blue-200',
      'Legal': 'bg-purple-100 text-purple-800 border-purple-200',
      'Medical': 'bg-red-100 text-red-800 border-red-200',
      'Business': 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div
      className="tooltip"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%) translateY(-100%)'
      }}
    >
      {/* Arrow */}
      <div 
        className="tooltip-arrow"
        style={{
          left: '50%',
          top: '100%',
          transform: 'translateX(-50%)'
        }}
      />
      
      {/* Content */}
      <div className="space-y-3">
        {/* Header */}
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
        
        {/* Definition */}
        <div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {definition.definition === 'Loading...' ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                Getting AI explanation...
              </span>
            ) : (
              definition.definition
            )}
          </p>
        </div>
        
        {/* Examples */}
        {definition.examples && definition.examples.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Example
            </p>
            <p className="text-sm text-gray-600 italic">
              "{definition.examples[0]}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TermTooltip 