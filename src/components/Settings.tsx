import React, { useState } from 'react'
import { Settings as SettingsIcon, Key, Eye, EyeOff, Bug, Palette } from 'lucide-react'
import { getCurrentUsername, saveUserSettings } from '../utils/auth'

interface SettingsProps {
  apiKey: string
  theme: 'light' | 'dark' | 'sepia'
  onApiKeyChange: (apiKey: string) => void
  onThemeChange: (theme: 'light' | 'dark' | 'sepia') => void
  onClose: () => void
  onOpenDebug: () => void
}

const Settings: React.FC<SettingsProps> = ({ apiKey, theme, onApiKeyChange, onThemeChange, onClose, onOpenDebug }) => {
  const [showApiKey, setShowApiKey] = useState(false)
  const [tempApiKey, setTempApiKey] = useState(apiKey)
  const [tempTheme, setTempTheme] = useState<'light' | 'dark' | 'sepia'>(theme)

  const handleSave = () => {
    onApiKeyChange(tempApiKey)
    onThemeChange(tempTheme)
    const user = getCurrentUsername()
    if (user) {
      saveUserSettings(user, { apiKey: tempApiKey, theme: tempTheme })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <SettingsIcon className="w-6 h-6 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showApiKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Theme selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${tempTheme==='light' ? 'border-primary-300 bg-primary-50' : 'border-gray-300'}`}>
                <input
                  id="theme-light"
                  type="radio"
                  name="theme"
                  checked={tempTheme==='light'}
                  onChange={() => setTempTheme('light')}
                />
                <label htmlFor="theme-light" className="text-sm">Light</label>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${tempTheme==='dark' ? 'border-primary-300 bg-primary-50' : 'border-gray-300'}`}>
                <input
                  id="theme-dark"
                  type="radio"
                  name="theme"
                  checked={tempTheme==='dark'}
                  onChange={() => setTempTheme('dark')}
                />
                <label htmlFor="theme-dark" className="text-sm">Dark</label>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${tempTheme==='sepia' ? 'border-primary-300 bg-primary-50' : 'border-gray-300'}`}>
                <input
                  id="theme-sepia"
                  type="radio"
                  name="theme"
                  checked={tempTheme==='sepia'}
                  onChange={() => setTempTheme('sepia')}
                />
                <label htmlFor="theme-sepia" className="text-sm">Sepia</label>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-medium text-blue-900 mb-1">How it works</h3>
            <p className="text-xs text-blue-700">
              With Gemini AI, the app will automatically detect and explain any professional terms 
              found in your documents, providing contextual definitions instead of using a static database.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onOpenDebug}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings 