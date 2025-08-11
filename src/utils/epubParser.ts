// EPUB parsing utility for extracting text content from EPUB files using epubjs
import ePub from 'epubjs'

interface EbookChapter {
  title: string
  content: string
  id: string
}

interface EbookData {
  id?: string
  title: string
  author?: string
  chapters: EbookChapter[]
  arrayBuffer: ArrayBuffer
}

export const parseEPUB = async (file: File): Promise<string> => {
  // Legacy function for backward compatibility
  const ebookData = await parseEPUBToChapters(file)
  return ebookData.chapters.map(chapter => `## ${chapter.title}\n\n${chapter.content}`).join('\n\n')
}

export const parseEPUBToChapters = async (file: File): Promise<EbookData> => {
  try {
    console.log('📚 Starting EPUB chapter parsing for:', file.name)
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Create Book instance from epubjs
    const book = ePub(arrayBuffer)
    
    // Load the book
    await book.ready
    
    const metadata = book.packaging?.metadata
    console.log('📖 EPUB metadata loaded:', {
      title: metadata?.title,
      creator: metadata?.creator,
      description: metadata?.description
    })
    
    // Extract chapters separately
    const chapters = await extractChapters(book)
    
    if (!chapters || chapters.length === 0) {
      throw new Error('The EPUB file appears to have no readable chapters')
    }
    
    return {
      title: metadata?.title || 'Unknown Title',
      author: metadata?.creator,
      chapters: chapters,
      arrayBuffer
    }
  } catch (error) {
    console.error('Error parsing EPUB:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to parse EPUB file: ${error.message}`)
    }
    throw new Error('Failed to parse EPUB file. Please make sure it\'s a valid EPUB document.')
  }
}

const extractChapters = async (book: any): Promise<EbookChapter[]> => {
  try {
    const spine = book.spine.spineItems
    console.log(`📄 Processing ${spine.length} sections as chapters`)
    
    const chapters: EbookChapter[] = []
    
    // Process each section as a separate chapter
    for (let i = 0; i < spine.length; i++) {
      const section = spine[i]
      try {
        console.log(`📄 Processing chapter ${i + 1}/${spine.length}: ${section.href}`)
        
        // Load the section
        const doc = await section.load(book.load.bind(book))
        const sectionContent = extractTextFromDocument(doc)
        
        if (sectionContent && sectionContent.trim()) {
          // Try to get chapter title from the first heading or use a default
          const lines = sectionContent.split('\n')
          let title = `Chapter ${i + 1}`
          let content = sectionContent
          
          // Look for title in first few lines
          for (let j = 0; j < Math.min(3, lines.length); j++) {
            const line = lines[j].trim()
            if (line && !line.startsWith('#') && line.length < 100) {
              title = line
              content = lines.slice(j + 1).join('\n').trim()
              break
            } else if (line.startsWith('# ')) {
              title = line.substring(2).trim()
              content = lines.slice(j + 1).join('\n').trim()
              break
            }
          }
          
          chapters.push({
            title: title,
            content: content,
            id: section.href
          })
        }
      } catch (sectionError) {
        console.warn(`⚠️ Failed to process section ${section.href}:`, sectionError)
      }
    }
    
    return chapters
  } catch (error) {
    console.error('Error extracting chapters:', error)
    throw new Error('Failed to extract chapters from EPUB')
  }
}

const extractAllSections = async (book: any): Promise<string> => {
  try {
    let fullContent = ''
    
    // Add book metadata at the beginning
    const metadata = book.packaging?.metadata
    if (metadata) {
      if (metadata.title) {
        fullContent += `# ${metadata.title}\n\n`
      }
      if (metadata.creator) {
        fullContent += `**Author:** ${metadata.creator}\n\n`
      }
      if (metadata.description) {
        fullContent += `${metadata.description}\n\n`
      }
      fullContent += '---\n\n'
    }
    
    // Get the spine (reading order)
    const spine = book.spine.spineItems
    console.log(`Processing ${spine.length} sections from EPUB`)
    
    // Process each section
    for (let i = 0; i < spine.length; i++) {
      const section = spine[i]
      try {
        console.log(`Processing section ${i + 1}/${spine.length}: ${section.href}`)
        
        // Load the section
        const doc = await section.load(book.load.bind(book))
        const sectionContent = extractTextFromDocument(doc)
        
        if (sectionContent && sectionContent.trim()) {
          fullContent += sectionContent + '\n\n'
        }
      } catch (sectionError) {
        console.warn(`Failed to process section ${section.href}:`, sectionError)
        // Continue with other sections even if one fails
      }
    }
    
    // Clean up the content
    fullContent = fullContent
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/[ \t]+/g, ' ') // Normalize spaces
    
    return fullContent
  } catch (error) {
    console.error('Error extracting sections:', error)
    throw new Error('Failed to extract content from EPUB sections')
  }
}

const extractTextFromDocument = (doc: Document): string => {
  try {
    // Check if doc is a proper Document with required methods
    if (!doc || typeof doc.createTreeWalker !== 'function') {
      console.warn('Invalid document object, falling back to text extraction')
      return doc?.textContent || doc?.body?.textContent || ''
    }
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style')
    scripts.forEach(el => el.remove())
    
    // Get the body content
    const body = doc.body || doc.documentElement
    
    // Extract text content and preserve some structure
    let content = ''
    const walker = doc.createTreeWalker(
      body,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim()
            return text ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
          }
          
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            // Skip certain elements
            if (['script', 'style'].includes(element.tagName.toLowerCase())) {
              return NodeFilter.FILTER_REJECT
            }
            return NodeFilter.FILTER_ACCEPT
          }
          
          return NodeFilter.FILTER_REJECT
        }
      }
    )
    
    let node
    let lastWasHeading = false
    
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          // Add spacing if needed
          if (content && !content.endsWith('\n') && !lastWasHeading) {
            content += ' '
          }
          content += text
          lastWasHeading = false
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const tagName = element.tagName.toLowerCase()
        
        // Handle headings
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          const headingText = element.textContent?.trim()
          if (headingText) {
            if (content && !content.endsWith('\n')) {
              content += '\n'
            }
            // Use appropriate markdown heading level
            const level = parseInt(tagName.charAt(1))
            const prefix = level <= 2 ? '## ' : '### '
            content += `${prefix}${headingText}\n\n`
            lastWasHeading = true
          }
          continue
        }
        
        // Handle paragraphs and line breaks
        if (['p', 'div', 'br'].includes(tagName)) {
          if (content && !content.endsWith('\n')) {
            content += '\n'
          }
          lastWasHeading = false
        }
      }
    }
    
    return content
  } catch (error) {
    console.error('Error extracting text from document:', error)
    // Fallback: just extract text content without structure
    return doc.body?.textContent || doc.textContent || ''
  }
}

// Utility to check if a file is an EPUB
export const isEPUBFile = (file: File): boolean => {
  return file.type === 'application/epub+zip' || 
         file.name.toLowerCase().endsWith('.epub')
}

// Export types
export type { EbookChapter, EbookData }