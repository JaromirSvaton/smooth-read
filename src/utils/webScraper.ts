// Web scraping utility for extracting text content from URLs
// Uses a CORS proxy service to bypass browser CORS restrictions

interface ScrapedContent {
  title: string
  content: string
  url: string
}

const CORS_PROXY = 'https://api.allorigins.win/get?url='

export const scrapeWebsite = async (url: string): Promise<ScrapedContent> => {
  try {
    // Validate URL format
    const urlPattern = /^https?:\/\/.+/i
    if (!urlPattern.test(url)) {
      throw new Error('Please enter a valid URL starting with http:// or https://')
    }

    console.log('Fetching content from:', url)
    
    // Use CORS proxy to fetch the content
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    const htmlContent = data.contents
    
    if (!htmlContent) {
      throw new Error('No content received from the website')
    }

    // Parse HTML content to extract text
    const parsed = parseHTMLContent(htmlContent)
    
    return {
      title: parsed.title || getHostname(url),
      content: parsed.content,
      url: url
    }
  } catch (error) {
    console.error('Error scraping website:', error)
    if (error instanceof Error) {
      throw new Error(`Unable to load website: ${error.message}`)
    }
    throw new Error('Unable to load website. Please check the URL and try again.')
  }
}

const parseHTMLContent = (html: string): { title: string; content: string } => {
  // Create a temporary DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // Extract title
  const titleElement = doc.querySelector('title')
  const title = titleElement ? titleElement.textContent?.trim() || '' : ''
  
  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style, nav, header, footer, aside, .sidebar, .menu, .navigation')
  scripts.forEach(el => el.remove())
  
  // Try to find main content areas
  const contentSelectors = [
    'main',
    'article', 
    '.content',
    '.post',
    '.article',
    '.entry',
    '.blog-post',
    '.post-content',
    '[role="main"]',
    '.main-content'
  ]
  
  let contentElement = null
  for (const selector of contentSelectors) {
    contentElement = doc.querySelector(selector)
    if (contentElement) break
  }
  
  // If no main content found, use body but try to filter out common non-content elements
  if (!contentElement) {
    contentElement = doc.body
    if (contentElement) {
      // Remove common non-content elements
      const elementsToRemove = contentElement.querySelectorAll(
        '.sidebar, .menu, .navigation, .nav, .header, .footer, .ad, .advertisement, .social, .share, .comments, .comment'
      )
      elementsToRemove.forEach(el => el.remove())
    }
  }
  
  if (!contentElement) {
    throw new Error('Could not extract content from the webpage')
  }
  
  // Extract text content and preserve some structure
  let content = ''
  const walker = doc.createTreeWalker(
    contentElement,
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
          if (['script', 'style', 'nav', 'header', 'footer'].includes(element.tagName.toLowerCase())) {
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
          content += `## ${headingText}\n\n`
          lastWasHeading = true
        }
        // Skip processing children since we got the full text
        walker.filter = {
          acceptNode: () => NodeFilter.FILTER_REJECT
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
  
  // Clean up the content
  content = content
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/[ \t]+/g, ' ') // Normalize spaces
  
  if (!content || content.length < 50) {
    throw new Error('The webpage appears to have very little readable content')
  }
  
  return { title, content }
}

const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return 'Website'
  }
}

// Utility to validate if a string looks like a URL
export const isValidUrl = (string: string): boolean => {
  const urlPattern = /^https?:\/\/.+\..+/i
  return urlPattern.test(string)
}