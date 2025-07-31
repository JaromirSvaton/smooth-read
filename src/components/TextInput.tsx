import React, { useState } from 'react'
import { Upload, FileText, ArrowRight, AlertCircle } from 'lucide-react'
import { parsePDF } from '../utils/pdfParser'

interface TextInputProps {
  onStartReading: (text: string) => void
}

const TextInput: React.FC<TextInputProps> = ({ onStartReading }) => {
  const [text, setText] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const sampleText = `The company's P/E ratio of 15.2 indicates it's trading at a reasonable valuation compared to its earnings. The CEO mentioned that EBITDA margins have improved by 2.3% this quarter, while the ROI on recent investments exceeded expectations. The board approved a new CAPEX budget for the upcoming fiscal year.`

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
      } else if (file.type === 'text/plain') {
        const text = await file.text()
        onStartReading(text)
      } else {
        setError('Please upload a PDF or text file.')
      }
    } catch (error) {
      console.error('Error processing file:', error)
      setError('Error processing file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartReading = () => {
    if (text.trim()) {
      onStartReading(text)
    }
  }

  const handleUseSample = () => {
    setText(sampleText)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Your Enhanced Reading Experience
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your text or upload a document. We'll automatically highlight professional terms 
            and provide explanations when you hover over them.
          </p>
        </div>

        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error Processing File</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Upload a PDF or text file</p>
            <input
              type="file"
              accept=".txt,.pdf"
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

          {/* Text Input */}
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
              Or paste your text here:
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your content here... We'll automatically detect and highlight professional terms like P/E ratio, EBITDA, ROI, etc."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUseSample}
              className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Try Sample Text
            </button>
            <button
              onClick={handleStartReading}
              disabled={!text.trim() || isLoading}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  Start Reading
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 font-bold">A</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Highlighting</h3>
            <p className="text-sm text-gray-600">Automatically detects and highlights professional terms</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">ℹ</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Explanations</h3>
            <p className="text-sm text-gray-600">Hover over terms to see clear, concise definitions</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">📚</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Professional Terms</h3>
            <p className="text-sm text-gray-600">Covers finance, technology, legal, and medical terms</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextInput 