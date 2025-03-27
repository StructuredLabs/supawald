'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { supabase, BUCKET_NAME } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowUpTrayIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  TrashIcon,
  PencilIcon,
  Bars3Icon,
  ChevronDoubleLeftIcon,
  EyeIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline'
import ImageModal from './components/ImageModal'
import FileViewModal from './components/FileViewModal'
import PublishButton from './components/PublishButton'
import CreateFolderModal from './components/CreateFolderModal'

interface FileObject {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: Record<string, any>
}

function FileExplorer() {
  const [files, setFiles] = useState<FileObject[]>([])
  const [folders, setFolders] = useState<FileObject[]>([])
  const [currentPath, setCurrentPath] = useState('')
  const [folderContents, setFolderContents] = useState<Record<string, { files: FileObject[], folders: FileObject[] }>>({})
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'columns'>('list')
  const [isDragging, setIsDragging] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length === 0) return

    setUploading(true)
    try {
      for (const file of droppedFiles) {
        const filePath = currentPath ? `${currentPath}/${file.name}` : file.name
        const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
        })
        
        if (error) throw error
      }
      fetchFiles(currentPath)
    } catch (err) {
      console.error('Error in handleDrop:', err)
      setError('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const fetchFolderContents = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list(path, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })
      
      if (error) throw error

      const fileItems = data.filter(item => 
        item.metadata && 
        typeof item.metadata === 'object' && 
        'size' in item.metadata &&
        item.name !== '.empty'
      )
      const folderItems = data.filter(item => 
        (!item.metadata || typeof item.metadata !== 'object' || !('size' in item.metadata)) &&
        item.name !== '.empty'
      )

      setFolderContents(prev => ({
        ...prev,
        [path]: { files: fileItems, folders: folderItems }
      }))
    } catch (err) {
      console.error('Error in fetchFolderContents:', err)
    }
  }

  useEffect(() => {
    // Get path and view from URL if they exist
    const pathParam = searchParams.get('path')
    const viewParam = searchParams.get('view') as 'list' | 'columns'
    
    // Set view mode from URL or default to list
    if (viewParam && ['list', 'columns'].includes(viewParam)) {
      setViewMode(viewParam)
    } else {
      // If no view param in URL, set it to default (list)
      const params = new URLSearchParams(searchParams.toString())
      params.set('view', 'list')
      if (pathParam) {
        params.set('path', pathParam)
      }
      router.replace(`/?${params.toString()}`)
    }

    // Always fetch root contents first
    fetchFolderContents('')

    if (pathParam) {
      const path = decodeURIComponent(pathParam)
      setCurrentPath(path)
      
      // Fetch contents for each level of the path
      const segments = path.split('/')
      let accPath = ''
      
      // Fetch each parent folder's contents sequentially
      segments.forEach((segment) => {
        accPath = accPath ? `${accPath}/${segment}` : segment
        fetchFolderContents(accPath)
      })
      
      // Also fetch the current path's contents using fetchFiles
      fetchFiles(path)
    } else {
      setCurrentPath('')
      fetchFiles('')
    }
  }, [searchParams])

  const fetchFiles = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list(path, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })
      
      if (error) throw error

      const fileItems = data.filter(item => 
        item.metadata && 
        typeof item.metadata === 'object' && 
        'size' in item.metadata &&
        item.name !== '.empty'
      )
      const folderItems = data.filter(item => 
        (!item.metadata || typeof item.metadata !== 'object' || !('size' in item.metadata)) &&
        item.name !== '.empty'
      )

      setFiles(fileItems)
      setFolders(folderItems)
      
      // Update folder contents for the current path
      setFolderContents(prev => ({
        ...prev,
        [path]: { files: fileItems, folders: folderItems }
      }))
      
      setError(null)
    } catch (err) {
      console.error('Error in fetchFiles:', err)
      setError('Failed to fetch files')
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }

    // Validate file name
    if (!/^[a-zA-Z0-9-_. ]+$/.test(file.name)) {
      setError('File name can only contain letters, numbers, spaces, and basic punctuation')
      return
    }

    setUploading(true)
    
    try {
      const filePath = currentPath ? `${currentPath}/${file.name}` : file.name
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      })
      
      if (error) {
        if (error.message.includes('permission denied')) {
          throw new Error('You do not have permission to upload files')
        }
        throw error
      }
      fetchFiles(currentPath)
    } catch (err) {
      console.error('Error in handleUpload:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    
    try {
      // Validate file name
      if (!/^[a-zA-Z0-9-_. ]+$/.test(name)) {
        setError('Invalid file name')
        return
      }

      const filePath = currentPath ? `${currentPath}/${name}` : name
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])
      
      if (error) {
        if (error.message.includes('permission denied')) {
          throw new Error('You do not have permission to delete files')
        }
        throw error
      }
      fetchFiles(currentPath)
    } catch (err) {
      console.error('Error in handleDelete:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    }
  }

  const handleCreateFolder = async (folderName: string) => {
    try {
      const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(`${folderPath}/.empty`, '', {
        upsert: true,
        cacheControl: '3600',
      })
      
      if (error) {
        if (error.message.includes('permission denied')) {
          throw new Error('You do not have permission to create folders')
        }
        throw error
      }
      
      fetchFiles(currentPath)
      fetchFolderContents(currentPath)
    } catch (err) {
      console.error('Error creating folder:', err)
      throw err
    }
  }

  const handleDeleteFolder = async (name: string) => {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return
    
    // Validate folder name
    if (!/^[a-zA-Z0-9-_. ]+$/.test(name)) {
      setError('Invalid folder name')
      return
    }

    try {
      const folderPath = currentPath ? `${currentPath}/${name}` : name
      
      // First, list all contents of the folder recursively
      const listFolderContents = async (path: string): Promise<string[]> => {
        const { data: contents, error: listError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(path)
        
        if (listError) {
          if (listError.message.includes('permission denied')) {
            throw new Error('You do not have permission to list folder contents')
          }
          throw listError
        }

        let allPaths: string[] = []
        
        // Process each item
        for (const item of contents) {
          const itemPath = `${path}/${item.name}`
          if (!item.metadata || typeof item.metadata !== 'object' || !('size' in item.metadata)) {
            // If it's a folder, recursively get its contents
            allPaths = [...allPaths, ...await listFolderContents(itemPath)]
          } else {
            // If it's a file, add it to the list
            allPaths.push(itemPath)
          }
        }
        
        return allPaths
      }

      // Get all paths to delete
      const pathsToDelete = await listFolderContents(folderPath)
      
      // Delete all contents
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(pathsToDelete)
      
      if (deleteError) {
        if (deleteError.message.includes('permission denied')) {
          throw new Error('You do not have permission to delete folders')
        }
        throw deleteError
      }

      // If we deleted the current folder, navigate up one level
      if (currentPath === name) {
        const parentPath = currentPath.split('/').slice(0, -1).join('/')
        setCurrentPath(parentPath)
        router.push(parentPath ? `/?path=${encodeURIComponent(parentPath)}` : '/')
      }

      // Refresh the current directory
      fetchFiles(currentPath)
      fetchFolderContents(currentPath)
    } catch (err) {
      console.error('Error in handleDeleteFolder:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete folder')
    }
  }

  const handleBack = () => {
    if (currentPath) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/')
      setCurrentPath(parentPath)
      router.push(parentPath ? `/?path=${encodeURIComponent(parentPath)}` : '/')
    } else {
      router.push('/')
    }
  }

  const navigateToFolder = (folder: FileObject) => {
    const newPath = currentPath ? `${currentPath}/${folder.name}` : folder.name
    setCurrentPath(newPath)
    const params = new URLSearchParams()
    params.set('path', newPath)
    params.set('view', viewMode)
    router.push(`/?${params.toString()}`)
  }

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/')
    setCurrentPath(parentPath)
    const params = new URLSearchParams()
    if (parentPath) {
      params.set('path', parentPath)
    }
    params.set('view', viewMode)
    router.push(`/?${params.toString()}`)
  }

  const navigateToRoot = () => {
    setCurrentPath('')
    const params = new URLSearchParams()
    params.set('view', viewMode)
    router.push(`/?${params.toString()}`)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <PhotoIcon className="w-4 h-4 text-blue-500" />
    }
    return <DocumentIcon className="w-4 h-4 text-gray-500" />
  }

  const updateUrlWithView = (newViewMode: 'list' | 'columns') => {
    const currentPath = searchParams.get('path')
    const params = new URLSearchParams()
    params.set('view', newViewMode)
    if (currentPath) {
      params.set('path', currentPath)
    }
    router.push(`/?${params.toString()}`)
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
              onClick={navigateToRoot}
              className="hover:text-gray-900"
            >
              Files
            </button>
            {currentPath && currentPath.split('/').map((segment, index, array) => (
              <div key={index} className="flex items-center">
                <span className="mx-2">/</span>
                <button
                  onClick={() => {
                    const path = array.slice(0, index + 1).join('/')
                    setCurrentPath(path)
                    router.push(`/?path=${encodeURIComponent(path)}`)
                  }}
                  className="hover:text-gray-900"
                >
                  {segment}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className={`flex-1 overflow-auto p-4 ${isDragging ? 'bg-blue-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newViewMode = viewMode === 'list' ? 'columns' : 'list'
                setViewMode(newViewMode)
                updateUrlWithView(newViewMode)
              }}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <ViewColumnsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchFiles(currentPath)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Create folder
            </button>
            <label className="px-3 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-900 cursor-pointer flex items-center">
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              Upload to {currentPath ? `"${currentPath}"` : 'root'}
              <input
                type="file"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
                multiple
              />
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* File List */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {/* Folders */}
                {folders.map(folder => (
                  <tr key={folder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <FolderIcon className="w-4 h-4 text-gray-400" />
                        <button
                          onClick={() => navigateToFolder(folder)}
                          className="ml-3 text-sm text-gray-900 hover:text-gray-600"
                        >
                          {folder.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">--</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">--</td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                      {currentPath === '' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.name);
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Files */}
                {files.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(file.name)}
                        <button
                          onClick={() => {
                            const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
                            const extension = file.name.split('.').pop()?.toLowerCase();
                            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
                              setSelectedImage({
                                url: filePath,
                                name: file.name
                              });
                            } else {
                              setSelectedFile({
                                url: filePath,
                                name: file.name
                              });
                            }
                          }}
                          className="ml-3 text-sm text-gray-900 hover:text-gray-600"
                        >
                          {file.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.metadata.size)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.name.split('.').pop()?.toLowerCase() || '') ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
                              setSelectedImage({
                                url: filePath,
                                name: file.name
                              });
                            }}
                            className="text-gray-400 hover:text-blue-500"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <Link
                            href={`/edit/${currentPath ? `${currentPath}/${file.name}` : file.name}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.name);
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {files.length === 0 && folders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      No files or folders found in this directory
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
            <div className="h-full flex">
              {/* Root Column */}
              <div className="w-72 min-w-72 border-r border-gray-200">
                <div className="p-2">
                  <div className="space-y-1">
                    {/* Use root folder contents */}
                    {(() => {
                      const rootContents = folderContents[''] || { files: [], folders: [] }
                      return [...rootContents.folders, ...rootContents.files].map(item => (
                        <div
                          key={item.id}
                          className="group flex items-center px-2 py-1.5 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => {
                            if (!item.metadata?.size) {
                              const newPath = item.name
                              setCurrentPath(newPath)
                              router.push(`/?path=${encodeURIComponent(newPath)}`)
                              fetchFolderContents(newPath)
                            } else {
                              const filePath = item.name;
                              const extension = item.name.split('.').pop()?.toLowerCase();
                              if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
                                setSelectedImage({
                                  url: filePath,
                                  name: item.name
                                });
                              } else {
                                setSelectedFile({
                                  url: filePath,
                                  name: item.name
                                });
                              }
                            }
                          }}
                        >
                          {!item.metadata?.size ? (
                            <FolderIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          ) : (
                            getFileIcon(item.name)
                          )}
                          <span className="ml-2 text-sm text-gray-900 truncate">
                            {item.name}
                          </span>
                          <div className="ml-auto flex items-center space-x-2 opacity-0 group-hover:opacity-100">
                            {!item.metadata?.size ? (
                              currentPath === '' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(item.name);
                                  }}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )
                            ) : (
                              <>
                                {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(item.name.split('.').pop()?.toLowerCase() || '') ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
                                      setSelectedImage({
                                        url: filePath,
                                        name: item.name
                                      });
                                    }}
                                    className="text-gray-400 hover:text-blue-500"
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <Link
                                    href={`/edit/${currentPath ? `${currentPath}/${item.name}` : item.name}`}
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </Link>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.name);
                                  }}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    })()}
                    {/* Use root folder empty state */}
                    {(() => {
                      const rootContents = folderContents[''] || { files: [], folders: [] }
                      return rootContents.files.length === 0 && rootContents.folders.length === 0 && (
                        <div className="text-sm text-gray-500 text-center py-4">
                          No files or folders
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Nested Path Columns */}
              {currentPath && currentPath.split('/').map((segment, index, array) => {
                const currentSegmentPath = array.slice(0, index + 1).join('/')
                const contents = folderContents[currentSegmentPath] || { files: [], folders: [] }
                
                return (
                  <div key={currentSegmentPath} className="w-72 min-w-72 border-r border-gray-200">
                    <div className="p-2">
                      <div className="space-y-1">
                        {[...contents.folders, ...contents.files].map(item => (
                          <div
                            key={item.id}
                            className="group flex items-center px-2 py-1.5 hover:bg-gray-50 rounded-md cursor-pointer"
                            onClick={() => {
                              if (!item.metadata?.size) {
                                const newPath = `${currentSegmentPath}/${item.name}`
                                setCurrentPath(newPath)
                                router.push(`/?path=${encodeURIComponent(newPath)}`)
                                fetchFolderContents(newPath)
                              } else {
                                const filePath = `${currentSegmentPath}/${item.name}`
                                const extension = item.name.split('.').pop()?.toLowerCase();
                                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
                                  setSelectedImage({
                                    url: filePath,
                                    name: item.name
                                  });
                                } else {
                                  setSelectedFile({
                                    url: filePath,
                                    name: item.name
                                  });
                                }
                              }
                            }}
                          >
                            {!item.metadata?.size ? (
                              <FolderIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              getFileIcon(item.name)
                            )}
                            <span className="ml-2 text-sm text-gray-900 truncate">
                              {item.name}
                            </span>
                            <div className="ml-auto flex items-center space-x-2 opacity-0 group-hover:opacity-100">
                              {!item.metadata?.size ? (
                                currentPath === '' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteFolder(item.name);
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )
                              ) : (
                                <>
                                  {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(item.name.split('.').pop()?.toLowerCase() || '') ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const filePath = currentSegmentPath ? `${currentSegmentPath}/${item.name}` : item.name;
                                        setSelectedImage({
                                          url: filePath,
                                          name: item.name
                                        });
                                      }}
                                      className="text-gray-400 hover:text-blue-500"
                                    >
                                      <EyeIcon className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <Link
                                      href={`/edit/${currentSegmentPath ? `${currentSegmentPath}/${item.name}` : item.name}`}
                                      className="text-gray-400 hover:text-gray-600"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                    </Link>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(item.name);
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                        {contents.files.length === 0 && contents.folders.length === 0 && (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No files or folders
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          imageUrl={selectedImage.url}
          filename={selectedImage.name}
          onClose={() => setSelectedImage(null)}
        />
      )}
      {selectedFile && (
        <FileViewModal
          isOpen={!!selectedFile}
          fileUrl={selectedFile.url}
          filename={selectedFile.name}
          onClose={() => setSelectedFile(null)}
        />
      )}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
        currentPath={currentPath}
      />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FileExplorer />
    </Suspense>
  )
}