import React from 'react'
import { History, FileText, Calendar, Tag } from 'lucide-react'
import { DocumentHistory } from '../types'

interface DocumentHistoryProps {
  documents: DocumentHistory[]
  onSelectDocument: (document: DocumentHistory) => void
  onClose: () => void
}

const DocumentHistoryPanel: React.FC<DocumentHistoryProps> = ({ 
  documents, 
  onSelectDocument, 
  onClose 
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const truncateTitle = (title: string) => {
    return title.length > 50 ? title.substring(0, 50) + '...' : title
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <History className="w-6 h-6 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Document History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600">Upload your first document to see it here</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {truncateTitle(doc.title)}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(doc.uploadedAt)}
                        </div>
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          {doc.termCount} terms
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-4">
                      {Object.entries(doc.categories).slice(0, 3).map(([category, count]) => (
                        <span
                          key={category}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {category}: {count}
                        </span>
                      ))}
                      {Object.keys(doc.categories).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{Object.keys(doc.categories).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentHistoryPanel 