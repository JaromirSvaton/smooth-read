import * as pdfjsLib from 'pdfjs-dist'

// Set up the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface TextItem {
  str: string
  transform: number[]
  width: number
  height: number
  fontName: string
  fontSize: number
}

export const parsePDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''

    // Extract text from all pages with formatting
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // Group text items by their vertical position to preserve line breaks
      const lines: TextItem[][] = []
      let currentLine: TextItem[] = []
      let lastY = -1
      
      textContent.items.forEach((item: TextItem) => {
        const y = item.transform[5] // Y position from transform matrix
        
        if (lastY === -1 || Math.abs(y - lastY) < 5) {
          // Same line or very close
          currentLine.push(item)
        } else {
          // New line
          if (currentLine.length > 0) {
            lines.push(currentLine)
          }
          currentLine = [item]
        }
        lastY = y
      })
      
      if (currentLine.length > 0) {
        lines.push(currentLine)
      }
      
      // Process each line to detect headings and formatting
      lines.forEach((line, lineIndex) => {
        if (line.length === 0) return
        
        // Sort items by X position
        line.sort((a, b) => a.transform[4] - b.transform[4])
        
        // Check if this might be a heading (larger font, centered, or all caps)
        const avgFontSize = line.reduce((sum, item) => sum + item.fontSize, 0) / line.length
        const lineText = line.map(item => item.str).join('')
        const isAllCaps = lineText === lineText.toUpperCase() && lineText.length > 3
        const isLargerFont = avgFontSize > 14
        
        if (isLargerFont || isAllCaps) {
          fullText += `\n## ${lineText}\n\n`
        } else {
          fullText += lineText + '\n'
        }
      })
      
      fullText += '\n\n' // Add space between pages
    }

    return fullText.trim()
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error('Failed to parse PDF file. Please make sure it\'s a valid PDF document.')
  }
} 