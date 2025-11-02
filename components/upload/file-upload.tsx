"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, File } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  uploadedBy: string
}

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
}

export function FileUpload({ onFilesSelected, maxFiles = 5, maxSize = 10 * 1024 * 1024 }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList) => {
    if (uploadedFiles.length >= maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const newFiles: UploadedFile[] = []
    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large`)
        return
      }

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        uploadedBy: "You",
      })
    })

    setUploadedFiles([...uploadedFiles, ...newFiles])
    onFilesSelected?.(Array.from(files))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <Card
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-8 border-2 border-dashed cursor-pointer transition ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
      >
        <div className="text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium mb-1">Drag and drop files here</p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to select (max {maxFiles} files, {formatFileSize(maxSize)} each)
          </p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.uploadedBy}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
