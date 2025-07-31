export interface CachedTerm {
  term: string
  definition: string
  category: string
  examples?: string[]
  timestamp: number
  context?: string
}

export interface CacheData {
  explanations: Record<string, CachedTerm>
  detectedTerms: Record<string, string[]>
}

class TermCache {
  private static readonly CACHE_KEY = 'smooth-read-term-cache'
  private static readonly CACHE_VERSION = '1.0'
  private static readonly MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
  
  private cache: CacheData

  constructor() {
    this.cache = this.loadCache()
    this.cleanExpiredEntries()
  }

  private loadCache(): CacheData {
    try {
      const cached = localStorage.getItem(TermCache.CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.version === TermCache.CACHE_VERSION) {
          console.log('Loaded term cache from localStorage')
          return {
            explanations: parsed.explanations || {},
            detectedTerms: parsed.detectedTerms || {}
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
    }
    
    console.log('Initializing new term cache')
    return {
      explanations: {},
      detectedTerms: {}
    }
  }

  private saveCache(): void {
    try {
      const cacheData = {
        version: TermCache.CACHE_VERSION,
        explanations: this.cache.explanations,
        detectedTerms: this.cache.detectedTerms,
        lastUpdated: Date.now()
      }
      localStorage.setItem(TermCache.CACHE_KEY, JSON.stringify(cacheData))
      console.log('Cache saved to localStorage')
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error)
    }
  }

  private cleanExpiredEntries(): void {
    const now = Date.now()
    let cleanedCount = 0

    // Clean expired explanations
    Object.keys(this.cache.explanations).forEach(key => {
      const entry = this.cache.explanations[key]
      if (now - entry.timestamp > TermCache.MAX_CACHE_AGE) {
        delete this.cache.explanations[key]
        cleanedCount++
      }
    })

    // Clean expired term detection results (older than 7 days)
    const termDetectionMaxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
    Object.keys(this.cache.detectedTerms).forEach(key => {
      const entry = this.cache.detectedTerms[key]
      // For simplicity, we'll remove all old detection results
      // In a real app, you might want to store timestamps for these too
    })

    if (cleanedCount > 0) {
      console.log(`Cleaned ${cleanedCount} expired cache entries`)
      this.saveCache()
    }
  }

  // Cache term explanations
  cacheExplanation(term: string, explanation: CachedTerm): void {
    const cacheKey = term.toLowerCase().trim()
    this.cache.explanations[cacheKey] = {
      ...explanation,
      timestamp: Date.now()
    }
    this.saveCache()
    console.log('Cached explanation for:', term)
  }

  getExplanation(term: string): CachedTerm | null {
    const cacheKey = term.toLowerCase().trim()
    const cached = this.cache.explanations[cacheKey]
    
    if (cached) {
      // Check if cache entry is still valid
      const age = Date.now() - cached.timestamp
      if (age < TermCache.MAX_CACHE_AGE) {
        console.log('Retrieved cached explanation for:', term)
        return cached
      } else {
        // Remove expired entry
        delete this.cache.explanations[cacheKey]
        this.saveCache()
        console.log('Removed expired cache entry for:', term)
      }
    }
    
    return null
  }

  // Cache detected terms for content
  cacheDetectedTerms(contentHash: string, terms: string[]): void {
    this.cache.detectedTerms[contentHash] = terms
    this.saveCache()
    console.log('Cached detected terms for content:', terms.length, 'terms')
  }

  getDetectedTerms(contentHash: string): string[] | null {
    const cached = this.cache.detectedTerms[contentHash]
    if (cached) {
      console.log('Retrieved cached detected terms:', cached.length, 'terms')
      return cached
    }
    return null
  }

  // Utility methods
  getCacheStats(): { explanations: number, detectedTerms: number, sizeKB: number } {
    const explanationsCount = Object.keys(this.cache.explanations).length
    const detectedTermsCount = Object.keys(this.cache.detectedTerms).length
    
    // Estimate cache size
    const cacheString = JSON.stringify(this.cache)
    const sizeKB = Math.round(new Blob([cacheString]).size / 1024)
    
    return {
      explanations: explanationsCount,
      detectedTerms: detectedTermsCount,
      sizeKB
    }
  }

  clearCache(): void {
    this.cache = {
      explanations: {},
      detectedTerms: {}
    }
    localStorage.removeItem(TermCache.CACHE_KEY)
    console.log('Cache cleared')
  }

  // Generate a simple hash for content to use as cache key
  generateContentHash(content: string): string {
    // Simple hash function - for production you might want to use a proper hash
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }
}

// Export singleton instance
export const termCache = new TermCache()