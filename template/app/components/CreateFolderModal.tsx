'use client'

import { useState, useRef, useEffect } from 'react'
import { FolderIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (name: string) => Promise<void>
  currentPath: string
}

export default function CreateFolderModal({ isOpen, onClose, onCreateFolder, currentPath }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState<string | null>(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!folderName.trim()) {
      setError('Folder name cannot be empty')
      return
    }

    try {
      await onCreateFolder(folderName.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder')
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
          className="modal-content max-w-md"
        >
          {/* Header */}
          <div className="modal-header">
            <div className="flex items-center space-x-2">
              <FolderIcon className="icon text-gray-400" />
              <h3 className="modal-title">
                Create New Folder
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
          <div className="px-4 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="folderName" className="label">
                  Folder Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="folderName"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="input"
                    placeholder="Enter folder name"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!folderName.trim()}
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 