"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, File, ImageIcon, Video } from "lucide-react"
import { uploadFile } from "@/lib/movie-service"
import { toast } from "@/hooks/use-toast"

interface FileUploadProps {
  accept: string
  maxSize?: number // in MB, set to 0 for unlimited
  onUpload: (url: string) => void
  label: string
  currentUrl?: string
  onUploadStateChange?: (isUploading: boolean) => void
}

export function FileUpload({
  accept,
  maxSize = 10,
  onUpload,
  label,
  currentUrl,
  onUploadStateChange,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = async (file: File) => {
    if (maxSize > 0 && file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Алдаа",
        description: `Файлын хэмжээ ${maxSize}MB-аас их байж болохгүй`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    onUploadStateChange?.(true)
    setProgress(0)
    setUploadStatus(`Файл бэлтгэж байна... (${formatFileSize(file.size)})`)

    try {
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name}`
      const filePath = accept.includes("video") ? `videos/${fileName}` : `images/${fileName}`

      setUploadStatus(`Файл хуулж байна... (${formatFileSize(file.size)})`)
      console.log(`[v0] Starting upload of ${file.name} (${formatFileSize(file.size)}) to ${filePath}`)

      const downloadURL = await uploadFile(file, filePath, (progress) => {
        setProgress(progress)
        if (progress < 100) {
          setUploadStatus(`Файл хуулж байна... ${progress.toFixed(1)}% (${formatFileSize(file.size)})`)
        } else {
          setUploadStatus(`Дуусгаж байна... (${formatFileSize(file.size)})`)
        }
      })

      setProgress(100)
      setUploadStatus("Амжилттай хуулагдлаа!")

      console.log(`[v0] Successfully uploaded ${file.name} to:`, downloadURL)
      console.log(`[v0] Upload completed for file size: ${formatFileSize(file.size)}`)

      setTimeout(() => {
        onUpload(downloadURL)
      }, 500)

      toast({
        title: "Амжилттай",
        description: `Файл амжилттай хуулагдлаа (${formatFileSize(file.size)})`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Файл хуулахад алдаа гарлаа. Дахин оролдоно уу."
      setUploadStatus("Алдаа гарлаа")
      toast({
        title: "Алдаа",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setUploading(false)
        onUploadStateChange?.(false)
        setProgress(0)
        setUploadStatus("")
      }, 1000)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const getFileIcon = () => {
    if (accept.includes("image")) return <ImageIcon className="h-8 w-8" />
    if (accept.includes("video")) return <Video className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">{label}</label>

      {currentUrl && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon()}
              <span className="text-sm">Одоогийн файл</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onUpload("")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {accept.includes("image") && (
            <img
              src={currentUrl || "/placeholder.svg"}
              alt="Current file"
              className="mt-2 max-w-xs max-h-32 object-cover rounded"
            />
          )}
        </Card>
      )}

      <Card
        className={`border-2 border-dashed transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {uploading ? (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Upload className="h-8 w-8 animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">{uploadStatus}</p>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">{progress.toFixed(1)}%</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">{getFileIcon()}</div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Файлыг энд чирж оруулах эсвэл товчийг дарна уу</p>
                  <p className="text-xs text-muted-foreground">
                    {maxSize === 0 || (accept.includes("video") && maxSize >= 1000)
                      ? "Хэмжээний хязгааргүй"
                      : `Хамгийн их ${maxSize}MB`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Файл сонгох
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileInputChange} className="hidden" />
    </div>
  )
}
