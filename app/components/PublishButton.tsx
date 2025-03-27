'use client'

import { useState, useEffect } from 'react'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface PublishButtonProps {
  isSidebarCollapsed?: boolean;
  variant?: 'sidebar' | 'inline';
}

const baseButtonStyles = 'btn btn-primary'
const variantStyles = {
  sidebar: 'w-full',
  inline: 'w-auto'
}

export default function PublishButton({ 
  isSidebarCollapsed = false,
  variant = 'sidebar'
}: PublishButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownProgress, setCooldownProgress] = useState(0)
  const [isMinDuration, setIsMinDuration] = useState(false)

  useEffect(() => {
    let cooldownInterval: NodeJS.Timeout
    if (cooldownProgress > 0) {
      cooldownInterval = setInterval(() => {
        setCooldownProgress(prev => {
          if (prev <= 1) {
            clearInterval(cooldownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(cooldownInterval)
  }, [cooldownProgress])

  const handlePublish = async () => {
    if (isLoading || cooldownProgress > 0) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setIsMinDuration(true)

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to publish')
      }

      setSuccess(true)
      setCooldownProgress(30) // 30 second cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setIsLoading(false)
      // Ensure minimum duration of 2 seconds
      setTimeout(() => setIsMinDuration(false), 2000)
    }
  }

  const getSaveButtonText = () => {
    if (cooldownProgress > 0) {
      return `Wait ${cooldownProgress}s`
    }
    return 'Publish'
  }

  return (
    <div className="relative">
      <button
        onClick={handlePublish}
        disabled={isLoading || cooldownProgress > 0}
        className={`${baseButtonStyles} ${variantStyles[variant]} flex items-center justify-center gap-2 px-2 py-1.5 text-sm`}
        title="Publish changes"
      >
        <CloudArrowUpIcon 
          className={`h-3.5 w-3.5 ${(isLoading || cooldownProgress > 0) ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        {!isSidebarCollapsed && (
          <span className="flex-1">
            {isLoading ? 'Publishing...' : getSaveButtonText()}
          </span>
        )}
      </button>
      
      {/* Only show success message after both cooldown and API call are complete */}
      {success && (
        <div 
          className={`
            absolute ${isSidebarCollapsed ? 'left-full ml-2' : 'top-full mt-2 left-0 right-0'}
            alert alert-success
            shadow-lg border animate-in fade-in slide-in-from-top-2
          `}
        >
          Changes published
        </div>
      )}
      
      {/* Show error message immediately if there's an error */}
      {error && (
        <div 
          className={`
            absolute ${isSidebarCollapsed ? 'left-full ml-2' : 'top-full mt-2 left-0 right-0'}
            alert alert-error
            shadow-lg border animate-in fade-in slide-in-from-top-2
          `}
        >
          {error}
        </div>
      )}
    </div>
  )
} 