import { termCache, CachedTerm } from '../utils/cache'

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface TermExplanation {
  term: string
  definition: string
  category: string
  examples?: string[]
}

export class GeminiService {
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-8b:generateContent'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async explainTerm(term: string, context: string): Promise<TermExplanation> {
    // Check persistent cache first
    const cachedExplanation = termCache.getExplanation(term)
    if (cachedExplanation) {
      console.log('Using cached explanation for:', term)
      return {
        term: cachedExplanation.term,
        definition: cachedExplanation.definition,
        category: cachedExplanation.category,
        examples: cachedExplanation.examples
      }
    }

    try {
      console.log('Calling Gemini API for term:', term)
      
      const prompt = `Explain "${term}" in simple terms. Return ONLY valid JSON without any markdown formatting or code blocks:
{
  "term": "${term}",
  "definition": "Simple 1-2 sentence definition",
  "category": "Finance|Technology|Legal|Medical|Business|Other",
  "examples": ["One example sentence"]
}`

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API error:', response.status, errorText)
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
      }

      const data: GeminiResponse = await response.json()
      console.log('Gemini API response:', data)
      
      const responseText = data.candidates[0]?.content.parts[0]?.text || ''
      console.log('Response text:', responseText)

      // Try to parse JSON response
      try {
        // Clean the response text - remove markdown code blocks if present
        let cleanedText = responseText.trim()
        
        // Remove markdown code blocks if present
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        console.log('Cleaned response text:', cleanedText)
        
        const parsed = JSON.parse(cleanedText)
        const result = {
          term: parsed.term || term,
          definition: parsed.definition || 'Definition not available',
          category: parsed.category || 'Other',
          examples: parsed.examples || []
        }
        
        // Cache the result persistently
        termCache.cacheExplanation(term, {
          term: result.term,
          definition: result.definition,
          category: result.category,
          examples: result.examples,
          timestamp: Date.now(),
          context: context.substring(0, 100) // Store a snippet of context
        })
        
        return result
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        // Fallback if JSON parsing fails
        const fallback = {
          term: term,
          definition: responseText || 'Definition not available',
          category: 'Other',
          examples: []
        }
        
        // Cache fallback result too
        termCache.cacheExplanation(term, {
          term: fallback.term,
          definition: fallback.definition,
          category: fallback.category,
          examples: fallback.examples,
          timestamp: Date.now(),
          context: context.substring(0, 100)
        })
        
        return fallback
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      const fallback = {
        term: term,
        definition: 'Unable to get definition at this time.',
        category: 'Other',
        examples: []
      }
      
      // Don't cache error results - let them try again next time
      return fallback
    }
  }

  async detectTerms(text: string): Promise<string[]> {
    // Generate content hash for caching
    const contentHash = termCache.generateContentHash(text)
    
    // Check persistent cache first
    const cachedTerms = termCache.getDetectedTerms(contentHash)
    if (cachedTerms) {
      console.log('Using cached term detection for content')
      return cachedTerms
    }

    try {
      console.log('Detecting terms with Gemini API')
      
      const prompt = `Find 5-10 technical terms in this text. Return ONLY a JSON array of terms without any markdown formatting:
["term1", "term2", "term3"]

Text: ${text.substring(0, 1000)}`

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API error:', response.status, errorText)
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
      }

      const data: GeminiResponse = await response.json()
      console.log('Gemini API response for term detection:', data)
      
      const responseText = data.candidates[0]?.content.parts[0]?.text || ''
      console.log('Term detection response text:', responseText)

      try {
        // Clean the response text - remove markdown code blocks if present
        let cleanedText = responseText.trim()
        
        // Remove markdown code blocks if present
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        console.log('Cleaned term detection response:', cleanedText)
        
        const terms = JSON.parse(cleanedText)
        console.log('Detected terms:', terms)
        const result = Array.isArray(terms) ? terms : []
        
        // Cache the detected terms persistently
        termCache.cacheDetectedTerms(contentHash, result)
        
        return result
      } catch (parseError) {
        console.error('Failed to parse terms as JSON:', parseError)
        console.log('Raw response was:', responseText)
        // Don't cache parse errors - let them try again
        return []
      }
    } catch (error) {
      console.error('Error detecting terms:', error)
      // Don't cache API errors - let them try again
      return []
    }
  }
} 