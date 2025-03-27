export interface Frontmatter {
  title?: string
  date?: string
  author?: string
  avatar?: string
  description?: string
  tags?: string[]
  category?: string
  readingTime?: string
}

export interface ProcessedContent {
  frontmatter: Frontmatter | null
  content: string
} 