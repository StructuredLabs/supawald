import { supabase, BUCKET_NAME } from '@/lib/supabase'
import yaml from 'yaml'
import { Frontmatter, ProcessedContent } from '../types/markdown'

export const processFrontmatter = (content: string): ProcessedContent => {
  const lines = content.split('\n')
  let inFrontmatter = false
  let frontmatterLines: string[] = []
  let contentLines: string[] = []

  for (const line of lines) {
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter
      continue
    }

    if (inFrontmatter) {
      frontmatterLines.push(line)
    } else {
      contentLines.push(line)
    }
  }

  let frontmatter: Frontmatter | null = null
  if (frontmatterLines.length > 0) {
    try {
      frontmatter = yaml.parse(frontmatterLines.join('\n'))
    } catch (e) {
      console.error('Failed to parse frontmatter:', e)
    }
  }

  return {
    frontmatter,
    content: contentLines.join('\n')
  }
}

export const processImagePaths = (content: string, fileUrl: string): string => {
  const baseDir = fileUrl.substring(0, fileUrl.lastIndexOf('/'))
  
  return content.replace(
    /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
    (match, alt, relativePath) => {
      const fullPath = `${baseDir}/${relativePath}`
      const imageUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath).data?.publicUrl
      return `![${alt}](${imageUrl})`
    }
  )
}

export const cleanMarkdown = (content: string): string => {
  return content
    .replace(/<li>/g, '')
    .replace(/<\/li>/g, '')
    .replace(/<hr>/g, '---')
    .replace(/<hr\/>/g, '---')
    .replace(/<strong>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<em>/g, '_')
    .replace(/<\/em>/g, '_')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
} 