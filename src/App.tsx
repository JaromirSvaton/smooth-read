import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import TextInput from './components/TextInput'
import Reader from './components/Reader'
import EbookReader from './components/EbookReader'
import Settings from './components/Settings'
import DocumentHistoryPanel from './components/DocumentHistory'
import DebugPanel from './components/DebugPanel'
import { GeminiService } from './services/geminiService'
import { TermDictionary, DocumentHistory as DocumentHistoryType } from './types'
import { EbookChapter, EbookData } from './utils/epubParser'

function App() {
  const [content, setContent] = useState<string>('')
  const [isReading, setIsReading] = useState<boolean>(false)
  const [isEbookMode, setIsEbookMode] = useState<boolean>(false)
  const [ebookData, setEbookData] = useState<EbookData | null>(null)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const [showAuth, setShowAuth] = useState<boolean>(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light')
  const [readerWidth, setReaderWidth] = useState<number>(1024)
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
    // Load account settings if logged in
    try {
      const { getCurrentUsername, getUserRecord } = require('./utils/auth')
      const u = getCurrentUsername?.()
      if (u) {
        const rec = getUserRecord?.(u)
        if (rec?.settings?.apiKey) {
          setApiKey(rec.settings.apiKey)
          setGeminiService(new GeminiService(rec.settings.apiKey))
        }
        if (rec?.settings?.theme) setTheme(rec.settings.theme)
        if (rec?.settings?.readerWidth) setReaderWidth(rec.settings.readerWidth)
      }
    } catch {}
    
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

  // Apply global theme class
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.remove('sepia')
    if (theme === 'dark') root.classList.add('dark')
    if (theme === 'sepia') root.classList.add('sepia')
  }, [theme])

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

  const handleStartEbookReading = (ebook: EbookData) => {
    setEbookData(ebook)
    setIsEbookMode(true)
    setIsReading(true)
    
    // Add to document history
    const newDoc: DocumentHistoryType = {
      id: Date.now().toString(),
      title: `📖 ${ebook.title}`,
      content: `Ebook: ${ebook.title} by ${ebook.author || 'Unknown Author'} (${ebook.chapters.length} chapters)`,
      uploadedAt: new Date(),
      termCount: 0,
      categories: {}
    }
    
    const updatedHistory = [newDoc, ...documentHistory.slice(0, 9)]
    setDocumentHistory(updatedHistory)
    localStorage.setItem('document-history', JSON.stringify(updatedHistory))
  }

  const handleBackToInput = () => {
    setIsReading(false)
    setIsEbookMode(false)
    setEbookData(null)
  }

  const handleSelectDocument = (document: DocumentHistoryType) => {
    setContent(document.content)
    setIsReading(true)
    setShowHistory(false)
  }

  // Open ebook from Bookshelf panel
  useEffect(() => {
    const handler = async (e: any) => {
      try {
        const id = e?.detail?.id
        if (!id) return
        const { getEbook } = await import('./utils/bookshelf')
        const stored = await getEbook(id)
        if (!stored) return
        const arrayBuffer = await stored.blob.arrayBuffer()
        const ebook: EbookData = { id: stored.id, title: stored.title, author: stored.author, chapters: [], arrayBuffer }
        setEbookData(ebook)
        setIsEbookMode(true)
        setIsReading(true)
      } catch (err) {
        console.error('Failed to open ebook from bookshelf:', err)
      }
    }
    window.addEventListener('open-bookshelf-ebook', handler as EventListener)
    return () => window.removeEventListener('open-bookshelf-ebook', handler as EventListener)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenAuth={() => setShowAuth(true)}
      />
      <main className="container mx-auto px-4 py-8">
        {!isReading ? (
          <TextInput 
            onStartReading={handleStartReading}
            onStartEbookReading={handleStartEbookReading}
          />
        ) : isEbookMode && ebookData ? (
          <EbookReader 
            ebook={ebookData}
            onBackToInput={handleBackToInput}
            geminiService={geminiService}
            theme={theme}
          />
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
          theme={theme}
          onApiKeyChange={handleApiKeyChange}
          onThemeChange={(t) => {
            setTheme(t)
            // Persist per user if logged in
            try {
              const { getCurrentUsername, saveUserSettings } = require('./utils/auth')
              const u = getCurrentUsername?.()
              if (u) saveUserSettings?.(u, { theme: t })
            } catch {}
          }}
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

      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
          onAuthChange={() => {
            // Reload settings from user
            try {
              const { getCurrentUsername, getUserRecord } = require('./utils/auth')
              const u = getCurrentUsername?.()
              if (u) {
                const rec = getUserRecord?.(u)
                if (rec?.settings?.apiKey) {
                  setApiKey(rec.settings.apiKey)
                  setGeminiService(new GeminiService(rec.settings.apiKey))
                }
                if (rec?.settings?.theme) setTheme(rec.settings.theme)
                if (rec?.settings?.readerWidth) setReaderWidth(rec.settings.readerWidth)
              }
            } catch {}
          }}
        />
      )}
    </div>
  )
}

export default App 