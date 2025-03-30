import { XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useRef } from 'react'
import { supabase, BUCKET_NAME } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import { Frontmatter } from '../types/markdown'
import { processFrontmatter, processImagePaths, cleanMarkdown } from '../utils/markdown'
import { markdownComponents } from './markdown/MarkdownComponents'
import '../styles/components/FileViewModal.css'

interface FileViewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  filename: string
}

export default function FileViewModal({ isOpen, onClose, fileUrl, filename }: FileViewModalProps) {
  const [content, setContent] = useState<string>('')
  const [frontmatter, setFrontmatter] = useState<Frontmatter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && fileUrl) {
      setIsLoading(true)
      setError(null)
      
      const loadFile = async () => {
        try {
          // First try to get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileUrl)

          if (publicUrl) {
            // Try fetching via public URL first
            const response = await fetch(publicUrl)
            if (response.ok) {
              const text = await response.text()
              const { frontmatter, content } = processFrontmatter(text)
              setFrontmatter(frontmatter)
              setContent(content)
              setIsLoading(false)
              return
            }
          }

          // If public URL fails, try direct download
          const { data, error: downloadError } = await supabase.storage
            .from(BUCKET_NAME)
            .download(fileUrl)

          if (downloadError) throw downloadError
          if (!data) throw new Error('No data received')

          const text = await data.text()
          const { frontmatter, content } = processFrontmatter(text)
          setFrontmatter(frontmatter)
          setContent(content)
        } catch (err) {
          console.error('Error loading file:', err)
          setError(err instanceof Error ? err.message : 'Failed to load file')
        } finally {
          setIsLoading(false)
        }
      }

      loadFile()
    }
  }, [isOpen, fileUrl])

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-container" onClick={handleClickOutside}>
      {/* Backdrop with blur */}
      <div className="modal-backdrop" aria-hidden="true" />

      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="modal-content h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="modal-header">
            <div className="flex items-center space-x-2">
              <DocumentIcon className="icon text-gray-400" />
              <h3 className="modal-title">
                {filename}
              </h3>
            </div>
            <button
              type="button"
              className="btn-icon"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="icon" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="relative flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="loading-spinner" />
                  <p className="loading-text">Loading file...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <DocumentIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="loading-text">Failed to load file</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{error}</p>
                </div>
              </div>
            ) : (
              <div className="markdown-content">
                {frontmatter && (
                  <div className="frontmatter-container">
                    <h1 className="frontmatter-title">{frontmatter.title}</h1>
                    <div className="frontmatter-meta">
                      {frontmatter.date && <span>{frontmatter.date}</span>}
                      {frontmatter.author && <span>By {frontmatter.author}</span>}
                      {frontmatter.readingTime && <span>{frontmatter.readingTime}</span>}
                    </div>
                    {frontmatter.description && (
                      <p className="frontmatter-description">{frontmatter.description}</p>
                    )}
                    {frontmatter.tags && frontmatter.tags.length > 0 && (
                      <div className="frontmatter-tags">
                        {frontmatter.tags.map((tag: string) => (
                          <span key={tag} className="frontmatter-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkParse as any, remarkGfm as any, remarkFrontmatter as any]}
                  components={markdownComponents}
                >
                  {cleanMarkdown(processImagePaths(content, fileUrl))}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 