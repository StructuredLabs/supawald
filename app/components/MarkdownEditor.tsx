'use client'

import { useState, useEffect } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'

interface MarkdownEditorProps {
  content: string
  onSave: (content: string) => Promise<void>
  isSaving: boolean
}

export default function MarkdownEditor({ content, onSave, isSaving }: MarkdownEditorProps) {
  const [editorContent, setEditorContent] = useState(content)
  const [timeUntilNextSave, setTimeUntilNextSave] = useState(0)
  const [isMinDuration, setIsMinDuration] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timeUntilNextSave > 0) {
      interval = setInterval(() => {
        setTimeUntilNextSave(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timeUntilNextSave])

  const handleSave = async () => {
    if (isSaving || timeUntilNextSave > 0) return

    setIsMinDuration(true)
    try {
      await onSave(editorContent)
      setTimeUntilNextSave(30) // 30 second cooldown
    } finally {
      // Ensure minimum duration of 2 seconds
      setTimeout(() => setIsMinDuration(false), 2000)
    }
  }

  const getSaveButtonText = () => {
    if (timeUntilNextSave > 0) {
      return `Wait ${timeUntilNextSave}s`
    }
    return 'Save'
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving || timeUntilNextSave > 0 || isMinDuration}
            className={`btn ${isSaving || timeUntilNextSave > 0 || isMinDuration ? 'btn-secondary' : 'btn-primary'}`}
          >
            {(isSaving || isMinDuration) ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="icon-sm mr-1" />
                {getSaveButtonText()}
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <textarea
          value={editorContent}
          onChange={(e) => setEditorContent(e.target.value)}
          className="w-full h-full p-4 font-mono text-base leading-relaxed resize-none focus:outline-none"
          placeholder="Start writing your markdown..."
          spellCheck="true"
        />
      </div>
    </div>
  )
} 