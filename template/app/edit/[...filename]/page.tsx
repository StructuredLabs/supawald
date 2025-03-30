'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, BUCKET_NAME } from '@/lib/supabase'
import MarkdownEditor from '@/app/components/MarkdownEditor'

export default function EditFile() {
  const params = useParams()
  const filename = Array.isArray(params.filename) ? params.filename.join('/') : params.filename
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchFile()
  }, [filename])

  const fetchFile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: downloadError } = await supabase.storage
        .from(BUCKET_NAME)
        .download(filename)

      if (downloadError) throw downloadError
      if (!data) throw new Error('No data received')

      const text = await data.text()
      setContent(text)
    } catch (err) {
      console.error('Error fetching file:', err)
      setError(err instanceof Error ? err.message : 'Failed to load file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (newContent: string) => {
    try {
      setIsSaving(true)
      setError(null)

      // Save to Supabase
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, newContent, {
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      setContent(newContent)

      // Show success message
      const successMessage = document.createElement('div')
      successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50'
      successMessage.textContent = 'File saved successfully'
      document.body.appendChild(successMessage)
      setTimeout(() => successMessage.remove(), 3000)

      // Optionally trigger revalidation after successful save
      try {
        const revalidateResponse = await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: filename }),
        })
        
        if (revalidateResponse.ok) {
          console.log('Revalidation successful')
        }
      } catch (revalidateError) {
        // Don't fail the save if revalidation fails
        console.warn('Revalidation failed:', revalidateError)
      }

      // Save file changes
      const saveResponse = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: Array.isArray(params.filename) ? params.filename.join('/') : params.filename,
          content: content
        })
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save file')
      }

      // Publish to external service
      const publishResponse = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!publishResponse.ok) {
        console.warn('Publish failed:', await publishResponse.text())
      }
    } catch (err) {
      console.error('Save failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to save file')
      
      // Show error message
      const errorMessage = document.createElement('div')
      errorMessage.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50'
      errorMessage.textContent = err instanceof Error ? err.message : 'Failed to save file'
      document.body.appendChild(errorMessage)
      setTimeout(() => errorMessage.remove(), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <MarkdownEditor
        content={content}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  )
} 