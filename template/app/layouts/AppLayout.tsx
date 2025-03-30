'use client'

import { useState } from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import PublishButton from '../components/PublishButton'
import Link from 'next/link'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div 
        className={`sidebar bg-white border-r border-gray-200/50 shadow-sm transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200/50">
          {!isSidebarCollapsed && (
            <Link 
              href="/" 
              className="text-xl font-medium tracking-tight text-gray-900 hover:text-gray-700 transition-colors duration-200"
            >
              supawald
            </Link>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="btn-icon rounded-md hover:bg-gray-100/80 transition-colors duration-200"
          >
            <Bars3Icon className="icon h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="p-4 border-t border-gray-200/50 space-y-4">
          <PublishButton isSidebarCollapsed={isSidebarCollapsed} />
          {!isSidebarCollapsed ? (
            <a
              href="https://structuredlabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 block"
            >
              Built by Structured Labs
            </a>
          ) : (
            <a
              href="https://structuredlabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <img
                src="/logo.png"
                alt="Structured Labs"
                className="h-8 grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-200"
              />
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  )
} 