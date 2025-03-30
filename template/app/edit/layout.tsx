'use client'

import { useRouter, useParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function EditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const filename = Array.isArray(params.filename) ? params.filename.join('/') : params.filename
  const pathSegments = filename.split('/')

  const navigateToPath = (index: number) => {
    const path = pathSegments.slice(0, index + 1).join('/')
    // If we're not at the last segment (which would be the file), navigate to the file list
    if (index < pathSegments.length - 1) {
      router.push(path ? `/?path=${encodeURIComponent(path)}` : '/')
    }
  }

  const handleBack = () => {
    // If we're in a subdirectory, go up one level
    if (pathSegments.length > 1) {
      const parentPath = pathSegments.slice(0, -1).join('/')
      router.push(parentPath ? `/?path=${encodeURIComponent(parentPath)}` : '/')
    } else {
      // If we're at the root, go back to the previous page
      router.back()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center px-4 py-2 space-x-4">
          <button
            onClick={handleBack}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => router.push('/')}
              className="hover:text-gray-900"
            >
              Files
            </button>
            {pathSegments.map((segment, index) => (
              <div key={index} className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => navigateToPath(index)}
                  className="ml-2 hover:text-gray-900"
                >
                  {segment}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
} 