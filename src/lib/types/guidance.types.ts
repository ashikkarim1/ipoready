// ═══════════════════════════════════════════════════════════════════════
// Guidance Library Types
// ═══════════════════════════════════════════════════════════════════════

export type GuidanceDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type GuidanceCategory = 'executive-summary' | 'risk-factors' | 'financial-da' | 'management' | 'use-of-proceeds' | 'market' | 'capitalization'
export type ExampleQuality = 'weak' | 'passable' | 'defendable' | 'strong'
export type UserProgressStatus = 'viewed' | 'applied' | 'helpful'

export interface GuidanceArticle {
  id: string
  title: string
  category: GuidanceCategory
  difficulty: GuidanceDifficulty
  readingTimeMinutes: number
  description: string
  rating: number // 0-5
  helpfulCount: number
  totalRatings: number
  views: number
  createdDate: string
  updatedDate: string
}

export interface HighlightRegion {
  start: number
  end: number
  type: 'added' | 'removed' | 'modified'
  suggestion?: string
}

export interface ProspectusExample {
  id: string
  quality: ExampleQuality
  companyName: string
  industry: string
  text: string
  highlights: HighlightRegion[]
  reasoning: string
  strengths: string[]
  weaknesses?: string[]
  benchmarks: {
    label: string
    value: string
    comparison: string
  }[]
}

export interface GuidanceTemplate {
  id: string
  name: string
  category: GuidanceCategory
  description: string
  placeholders: {
    key: string
    label: string
    hint: string
    defaultValue?: string
  }[]
  templateText: string
  exampleOutput: string
  difficulty: GuidanceDifficulty
}

export interface GuidanceDetail {
  id: string
  articleId: string
  article: GuidanceArticle
  summary: string
  whatMakesItStrong: string[]
  whyItMatters: string
  industryBenchmarks: {
    metric: string
    average: number
    yourScore: number
    unit: string
    explanation: string
  }[]
  examples: ProspectusExample[]
  templates: GuidanceTemplate[]
  relatedTopics: string[]
}

export interface UserProspectusContent {
  id: string
  section: GuidanceCategory
  title: string
  content: string
  lastModified: string
}

export interface UserGuidanceProgress {
  articleId: string
  status: UserProgressStatus[]
  viewedDate?: string
  appliedDate?: string
  markedHelpfulDate?: string
  notes?: string
  savedTemplate?: boolean
}

export interface GuidanceLibraryFilter {
  searchQuery: string
  categories: GuidanceCategory[]
  difficulties: GuidanceDifficulty[]
  sortBy: 'helpful' | 'newest' | 'views'
}

export interface ComparisonView {
  weak?: ProspectusExample
  passable?: ProspectusExample
  defendable?: ProspectusExample
  strong?: ProspectusExample
}

export interface TemplatePreview {
  templateId: string
  previewText: string
  filledPlaceholders: Record<string, string>
}
