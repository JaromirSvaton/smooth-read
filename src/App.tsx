import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import TextInput from './components/TextInput'
import Reader from './components/Reader'
import Settings from './components/Settings'
import DocumentHistoryPanel from './components/DocumentHistory'
import DebugPanel from './components/DebugPanel'
import { GeminiService } from './services/geminiService'
import { TermDictionary, DocumentHistory as DocumentHistoryType } from './types'

function App() {
  const [content, setContent] = useState<string>('')
  const [isReading, setIsReading] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const [apiKey, setApiKey] = useState<string>('')
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null)
  const [documentHistory, setDocumentHistory] = useState<DocumentHistoryType[]>([])

  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('gemini-api-key') || ''
    setApiKey(savedApiKey)
    if (savedApiKey) {
      setGeminiService(new GeminiService(savedApiKey))
    }
    
    // Load document history from localStorage
    const savedHistory = localStorage.getItem('document-history')
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory)
        setDocumentHistory(history.map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt)
        })))
      } catch (error) {
        console.error('Error loading document history:', error)
      }
    }
  }, [])

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey)
    localStorage.setItem('gemini-api-key', newApiKey)
    if (newApiKey) {
      setGeminiService(new GeminiService(newApiKey))
    } else {
      setGeminiService(null)
    }
  }

  const handleStartReading = (text: string) => {
    setContent(text)
    setIsReading(true)
    
    // Add to document history
    const newDoc: DocumentHistoryType = {
      id: Date.now().toString(),
      title: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      content: text,
      uploadedAt: new Date(),
      termCount: 0, // Will be updated after processing
      categories: {}
    }
    
    const updatedHistory = [newDoc, ...documentHistory.slice(0, 9)] // Keep last 10 documents
    setDocumentHistory(updatedHistory)
    localStorage.setItem('document-history', JSON.stringify(updatedHistory))
  }

  const handleBackToInput = () => {
    setIsReading(false)
  }

  const handleSelectDocument = (document: DocumentHistoryType) => {
    setContent(document.content)
    setIsReading(true)
    setShowHistory(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistory={() => setShowHistory(true)}
      />
      <main className="container mx-auto px-4 py-8">
        {!isReading ? (
          <TextInput onStartReading={handleStartReading} />
        ) : (
          <Reader 
            content={content} 
            onBackToInput={handleBackToInput}
            geminiService={geminiService}
          />
        )}
      </main>
      
      {showSettings && (
        <Settings
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          onClose={() => setShowSettings(false)}
          onOpenDebug={() => {
            setShowSettings(false)
            setShowDebug(true)
          }}
        />
      )}
      
      {showHistory && (
        <DocumentHistoryPanel
          documents={documentHistory}
          onSelectDocument={handleSelectDocument}
          onClose={() => setShowHistory(false)}
        />
      )}
      
      {showDebug && (
        <DebugPanel
          geminiService={geminiService}
          apiKey={apiKey}
          onClose={() => setShowDebug(false)}
        />
      )}
    </div>
  )
}

export default App 