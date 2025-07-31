import React, { useState } from 'react'
import { Bug, X, CheckCircle, AlertCircle, Database, Trash2 } from 'lucide-react'
import { termCache } from '../utils/cache'

interface DebugPanelProps {
  geminiService: any // Should be GeminiService | null
  apiKey: string
  onClose: () => void
}

const DebugPanel: React.FC<DebugPanelProps> = ({ geminiService, apiKey, onClose }) => {
  const [testResult, setTestResult] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)
  const [termDetectionResult, setTermDetectionResult] = useState<string>('')
  const [cacheStats, setCacheStats] = useState(termCache.getCacheStats())

  const testApiConnection = async () => {
    setIsTesting(true)
    setTestResult('')
    try {
      if (!geminiService) {
        setTestResult('❌ No Gemini service available')
        return
      }
      const result = await geminiService.explainTerm('API', 'This is a test document about APIs.')
      setTestResult(`✅ Success! Received: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsTesting(false)
    }
  }

  const testTermDetection = async () => {
    setIsTesting(true)
    setTermDetectionResult('')
    try {
      if (!geminiService) {
        setTermDetectionResult('❌ No Gemini service available')
        return
      }
      const testText = 'This document discusses APIs, P/E ratios, and Machine Learning algorithms. The company uses SaaS solutions and has an EBITDA of $10M.'
      const result = await geminiService.detectTerms(testText)
      setTermDetectionResult(`✅ Success! Detected terms: ${JSON.stringify(result)}`)
      // Update cache stats after operation
      setCacheStats(termCache.getCacheStats())
    } catch (error) {
      setTermDetectionResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsTesting(false)
    }
  }

  const clearCache = () => {
    termCache.clearCache()
    setCacheStats(termCache.getCacheStats())
    setTestResult('✅ Cache cleared successfully')
  }

  const refreshCacheStats = () => {
    setCacheStats(termCache.getCacheStats())
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bug className="w-6 h-6 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Debug Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* API Key Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">API Key Status</h3>
            <div className="flex items-center">
              {apiKey ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700">API Key is set</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">No API Key found</span>
                </>
              )}
            </div>
            {apiKey && (
              <p className="text-sm text-gray-600 mt-1">
                Key: {apiKey.substring(0, 10)}...{apiKey.substring(apiKey.length - 4)}
              </p>
            )}
          </div>

          {/* Gemini Service Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Gemini Service Status</h3>
            <div className="flex items-center">
              {geminiService ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700">Gemini Service initialized</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">Gemini Service not available</span>
                </>
              )}
            </div>
          </div>

          {/* Test API Connection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Test API Connection</h3>
            <button
              onClick={testApiConnection}
              disabled={isTesting || !geminiService}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? 'Testing...' : 'Test API Connection'}
            </button>
            {testResult && (
              <div className="mt-3 p-3 bg-gray-100 rounded text-sm font-mono overflow-auto max-h-32">
                {testResult}
              </div>
            )}
          </div>

          {/* Test Term Detection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Test Term Detection</h3>
            <button
              onClick={testTermDetection}
              disabled={isTesting || !geminiService}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? 'Testing...' : 'Test Term Detection'}
            </button>
            {termDetectionResult && (
              <div className="mt-3 p-3 bg-gray-100 rounded text-sm font-mono overflow-auto max-h-32">
                {termDetectionResult}
              </div>
            )}
          </div>

          {/* Cache Management */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Cache Statistics
              </h3>
              <button
                onClick={refreshCacheStats}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cacheStats.explanations}</div>
                <div className="text-sm text-gray-600">Explanations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{cacheStats.detectedTerms}</div>
                <div className="text-sm text-gray-600">Term Lists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{cacheStats.sizeKB}</div>
                <div className="text-sm text-gray-600">KB Used</div>
              </div>
            </div>
            
            <button
              onClick={clearCache}
              className="flex items-center text-red-600 hover:text-red-800 text-sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear Cache
            </button>
          </div>

          {/* Troubleshooting Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Troubleshooting Tips</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Make sure your API key is valid and has access to Gemini Pro</li>
              <li>• Check the browser console for detailed error messages</li>
              <li>• Ensure you have a stable internet connection</li>
              <li>• Try uploading a document with technical terms to test</li>
              <li>• The API may take a few seconds to respond</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel 