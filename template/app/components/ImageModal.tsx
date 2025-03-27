'use client'

import { useState, useRef, useEffect } from 'react'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { supabase, BUCKET_NAME } from '@/lib/supabase'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  filename: string
}

export default function ImageModal({ isOpen, onClose, imageUrl, filename }: ImageModalProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageData, setImageData] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose()
    }
  }

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleDocumentClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && imageUrl) {
      setIsLoading(true)
      setImageError(false)
      
      const loadImage = async () => {
        try {
          // First try to get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(imageUrl)

          if (publicUrl) {
            // Try loading via public URL first
            const img = new Image()
            img.onload = () => {
              setImageData(publicUrl)
              setIsLoading(false)
            }
            img.onerror = () => {
              // If public URL fails, try direct download
              loadImageDirectly()
            }
            img.src = publicUrl
          } else {
            // If no public URL, try direct download
            loadImageDirectly()
          }
        } catch (err) {
          console.error('Error loading image:', err)
          setImageError(true)
          setIsLoading(false)
        }
      }

      const loadImageDirectly = async () => {
        try {
          const { data, error: downloadError } = await supabase.storage
            .from(BUCKET_NAME)
            .download(imageUrl)

          if (downloadError) throw downloadError
          if (!data) throw new Error('No data received')

          const url = URL.createObjectURL(data)
          setImageData(url)
        } catch (err) {
          console.error('Error downloading image:', err)
          setImageError(true)
        } finally {
          setIsLoading(false)
        }
      }

      loadImage()
    }

    // Cleanup function to revoke the object URL when component unmounts or image changes
    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData)
      }
    }
  }, [isOpen, imageUrl])

  if (!isOpen) return null

  return (
    <div className="modal-container" onClick={handleClickOutside}>
      {/* Backdrop with blur */}
      <div className="modal-backdrop" aria-hidden="true" />

      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="modal-content"
        >
          {/* Header */}
          <div className="modal-header">
            <h3 className="modal-title">
              {filename}
            </h3>
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
          <div className="relative">
            {isLoading ? (
              <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="loading-spinner" />
                  <p className="loading-text">Loading image...</p>
                </div>
              </div>
            ) : imageError ? (
              <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <PhotoIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="loading-text">Failed to load image</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Please try again later</p>
                </div>
              </div>
            ) : (
              <div className="flex h-[60vh] items-center justify-center p-4">
                <img
                  src={imageData || ''}
                  alt={filename}
                  className="max-h-full max-w-full object-contain"
                  onLoad={() => setIsLoading(false)}
                  onError={(e) => {
                    console.error('Image failed to load:', e)
                    setImageError(true)
                    setIsLoading(false)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 