import React, { useState } from 'react'
import { Upload, FileText, ArrowRight, AlertCircle, Globe } from 'lucide-react'
import { parsePDF } from '../utils/pdfParser'
import { parseEPUB, isEPUBFile } from '../utils/epubParser'
import { scrapeWebsite, isValidUrl } from '../utils/webScraper'

interface TextInputProps {
  onStartReading: (text: string) => void
}

const TextInput: React.FC<TextInputProps> = ({ onStartReading }) => {
  const [text, setText] = useState<string>('')
  const [url, setUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [inputMode, setInputMode] = useState<'text' | 'file' | 'url'>('text')

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const sampleText = `## Understanding Business Metrics

The company's P/E ratio of 15.2 indicates strong market confidence. This quarter's EBITDA margins improved significantly, while ROI on our SaaS platform exceeded projections. 

The board approved additional CAPEX for our API infrastructure. Our Machine Learning algorithms are driving better conversion rates, and the new MVP features have improved user engagement metrics.

## Financial Overview

Due diligence revealed that the startup's burn rate is sustainable. Their blockchain technology shows promise, but regulatory compliance remains a challenge. The term sheet includes standard liquidation preferences and anti-dilution provisions.

Try selecting any technical term above to see instant AI explanations!`

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Please upload a file smaller than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (file.type === 'application/pdf') {
        const pdfText = await parsePDF(file)
        onStartReading(pdfText)
      } else if (isEPUBFile(file)) {
        const epubText = await parseEPUB(file)
        onStartReading(epubText)
      } else if (file.type === 'text/plain') {
        const text = await file.text()
        onStartReading(text)
      } else {
        setError('Please upload a PDF, EPUB, or text file.')
      }
    } catch (error) {
      console.error('Error processing file:', error)
      setError('Error processing file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlLoad = async () => {
    if (!url.trim()) return
    
    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('Loading content from URL:', url.trim())
      const scrapedContent = await scrapeWebsite(url.trim())
      
      // Format the content with title
      const formattedContent = `# ${scrapedContent.title}\n\n${scrapedContent.content}`
      onStartReading(formattedContent)
    } catch (error) {
      console.error('Error loading URL:', error)
      setError(error instanceof Error ? error.message : 'Failed to load website content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartReading = () => {
    if (inputMode === 'url') {
      handleUrlLoad()
    } else if (text.trim()) {
      onStartReading(text)
    }
  }

  const handleUseSample = () => {
    setInputMode('text')
    setText(sampleText)
    setUrl('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Powered Text Explanations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a document (PDF, EPUB, text), paste text, or load a website URL, then select any word or phrase to get instant AI-powered explanations. 
            Perfect for understanding books, technical documents, blog posts, and professional content.
          </p>
        </div>

        <div className="space-y-6">
          {/* Input Mode Toggle */}
          <div className="flex justify-center space-x-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => { setInputMode('text'); setError(''); }}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'text' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Text
            </button>
            <button
              onClick={() => { setInputMode('file'); setError(''); }}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'file' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              File
            </button>
            <button
              onClick={() => { setInputMode('url'); setError(''); }}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'url' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              Website
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* URL Input */}
          {inputMode === 'url' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Enter a website URL to extract and read its content</p>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full max-w-md mx-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">Works with most blog posts, articles, and news websites</p>
            </div>
          )}
          
          {/* File Upload */}
          {inputMode === 'file' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload a PDF, EPUB, or text file (max 5MB)</p>
              <input
                type="file"
                accept=".txt,.pdf,.epub"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
              >
                Choose File
              </label>
            </div>
          )}

          {/* Text Input */}
          {inputMode === 'text' && (
            <div>
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your text here:
              </label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your content here... After uploading, select any technical terms like 'P/E ratio', 'EBITDA', or 'Machine Learning' to get instant AI explanations."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUseSample}
              className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Try Demo Content
            </button>
            <button
              onClick={handleStartReading}
              disabled={
                isLoading || 
                (inputMode === 'text' && !text.trim()) ||
                (inputMode === 'url' && !url.trim())
              }
              className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                inputMode === 'url' ? 'Loading Website...' : 'Processing...'
              ) : (
                <>
                  {inputMode === 'url' ? 'Load Website' : 'Start Reading'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">👆</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Select & Learn</h3>
            <p className="text-sm text-gray-600">Simply select any text to get AI-powered explanations</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">🧠</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Explanations</h3>
            <p className="text-sm text-gray-600">Powered by Google Gemini for accurate, contextual definitions</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Cost Efficient</h3>
            <p className="text-sm text-gray-600">Only uses API when you select text - cached results save money</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextInput