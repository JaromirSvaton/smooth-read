import React from 'react'
import { BookOpen, Settings, History } from 'lucide-react'

interface HeaderProps {
  onOpenSettings: () => void
  onOpenHistory: () => void
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenHistory }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smooth Read</h1>
              <p className="text-sm text-gray-600">Enhanced reading with term explanations</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenHistory}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Document History"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 