export interface TermDefinition {
  term: string
  definition: string
  category: string
  examples?: string[]
}

export interface TermDictionary {
  [key: string]: TermDefinition
}

export interface HighlightedTerm {
  term: string
  startIndex: number
  endIndex: number
  definition: TermDefinition
}

export interface TooltipPosition {
  x: number
  y: number
  visible: boolean
}

export interface DocumentHistory {
  id: string
  title: string
  content: string
  uploadedAt: Date
  termCount: number
  categories: Record<string, number>
} 