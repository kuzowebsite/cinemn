"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { type Movie, addMovie, updateMovie } from "@/lib/movie-service"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

interface MovieFormAdminProps {
  movie?: Movie | null
  onBack: () => void
  onSave: () => void
}

export function MovieFormAdmin({ movie, onBack, onSave }: MovieFormAdminProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "",
    detailImages: [] as string[],
    videoUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState({
    coverImage: false,
    video: false,
  })

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        description: movie.description,
        coverImage: movie.coverImage,
        detailImages: movie.detailImages,
        videoUrl: movie.videoUrl,
      })
    }
  }, [movie])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (uploading.coverImage || uploading.video) {
      toast({
        title: "Түр хүлээнэ үү",
        description: "Файл хуулж дуусах хүртэл хүлээнэ үү",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Submitting movie form with data:", formData)
      if (movie?.id) {
        await updateMovie(movie.id, formData)
        toast({
          title: "Амжилттай",
          description: "Кино амжилттай шинэчлэгдлээ",
        })
      } else {
        await addMovie(formData)
        toast({
          title: "Амжилттай",
          description: "Шинэ кино амжилттай нэмэгдлээ",
        })
      }
      onSave()
    } catch (error) {
      console.error("[v0] Error saving movie:", error)
      toast({
        title: "Алдаа",
        description: "Кино хадгалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !loading && !uploading.coverImage && !uploading.video && formData.title && formData.description

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Буцах
        </Button>
        <h2 className="text-2xl font-bold">{movie ? "Кино засах" : "Шинэ кино нэмэх"}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Кинонын мэдээлэл</CardTitle>
          <CardDescription>
            Кинонын дэлгэрэнгүй мэдээллийг оруулна уу
            {(uploading.coverImage || uploading.video) && (
              <span className="block text-orange-600 font-medium mt-1">Файл хуулж байна... Түр хүлээнэ үү</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Кинонын нэр *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Кинонын нэрийг оруулна уу"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Тайлбар *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Кинонын тухай дэлгэрэнгүй тайлбар"
                rows={4}
                required
              />
            </div>

            <FileUpload
              accept="image/*"
              maxSize={5}
              label="Нүүр зураг *"
              currentUrl={formData.coverImage}
              onUpload={(url) => {
                console.log("[v0] Cover image uploaded:", url)
                setFormData({ ...formData, coverImage: url })
              }}
              onUploadStateChange={(isUploading) => {
                setUploading((prev) => ({ ...prev, coverImage: isUploading }))
              }}
            />

            <FileUpload
              accept="video/*"
              maxSize={0}
              label="Кино файл (MP4) - Хэмжээний хязгааргүй"
              currentUrl={formData.videoUrl}
              onUpload={(url) => {
                console.log("[v0] Video uploaded:", url)
                setFormData({ ...formData, videoUrl: url })
              }}
              onUploadStateChange={(isUploading) => {
                setUploading((prev) => ({ ...prev, video: isUploading }))
              }}
            />

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Цуцлах
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {loading
                  ? "Хадгалж байна..."
                  : uploading.coverImage || uploading.video
                    ? "Файл хуулж байна..."
                    : movie
                      ? "Шинэчлэх"
                      : "Нэмэх"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
