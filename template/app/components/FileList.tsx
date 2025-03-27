import { useState } from 'react'
import { FolderIcon, DocumentIcon, ArrowPathIcon, ViewColumnsIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import { formatDistanceToNow } from 'date-fns'

interface FileListProps {
  files: Array<{
    name: string
    id: string
    updated_at: string
    metadata: {
      isDir?: boolean
      size?: number
    }
  }>
  currentPath: string
  onFileClick: (file: any) => void
  onRefresh?: () => void
}

export default function FileList({ files, currentPath, onFileClick, onRefresh }: FileListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const router = useRouter()

  const handleFileClick = (file: any) => {
    if (file.metadata?.isDir) {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name
      router.push(`/files/${newPath}`)
    } else {
      onFileClick(file)
    }
  }

  const ListView = () => (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {files.map((file) => (
          <li
            key={file.id}
            className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => handleFileClick(file)}
          >
            <div className="flex items-center min-w-0">
              {file.metadata?.isDir ? (
                <FolderIcon className="h-6 w-6 flex-shrink-0 text-gray-400" />
              ) : (
                <DocumentIcon className="h-6 w-6 flex-shrink-0 text-gray-400" />
              )}
              <div className="ml-3 flex-1 truncate">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {file.name}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(file.updated_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => handleFileClick(file)}
          className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 cursor-pointer p-4"
        >
          <div className="flex-shrink-0 self-center">
            {file.metadata?.isDir ? (
              <FolderIcon className="h-12 w-12 text-gray-400" />
            ) : (
              <DocumentIcon className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between mt-4">
            <div className="text-center">
              <h3 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {file.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(file.updated_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ViewColumnsIcon className="h-5 w-5" />
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            Create folder
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 focus:outline-none">
            Upload file
          </button>
        </div>
      </div>
      {viewMode === 'list' ? <ListView /> : <GridView />}
    </div>
  )
} 