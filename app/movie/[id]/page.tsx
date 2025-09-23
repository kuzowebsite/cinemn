"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { VideoPlayer } from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { Play, Plus, Share } from "lucide-react"
import Link from "next/link"
import { getMovieById } from "@/lib/movie-service"

interface Movie {
  id: string
  title: string
  coverImage: string
  description: string
  director?: string
  cast?: string[]
  duration?: string
  videoUrl?: string
  detailImages?: string[]
}

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieData = await getMovieById(params.id)
        console.log("[v0] Fetched movie data:", {
          id: movieData?.id,
          title: movieData?.title,
          hasVideoUrl: !!movieData?.videoUrl,
          videoUrl: movieData?.videoUrl,
          videoUrlLength: movieData?.videoUrl?.length || 0,
        })
        setMovie(movieData)
      } catch (error) {
        console.error("Error fetching movie:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Кино ачаалж байна...</p>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Кино олдсонгүй</h1>
          <Link href="/">
            <Button>Нүүр хуудас руу буцах</Button>
          </Link>
        </div>
      </div>
    )
  }

  const backdropImage = movie.detailImages?.[0] || movie.coverImage

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20 md:pb-8">
        {/* Hero Section */}
        <div className="relative h-[60vh] overflow-hidden">
          <img src={backdropImage || "/placeholder.svg"} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <img
                  src={movie.coverImage || "/placeholder.svg"}
                  alt={movie.title}
                  className="w-48 h-72 object-cover rounded-lg shadow-2xl"
                />
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                  <div className="flex gap-3 mb-4">
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => {
                        console.log("[v0] Play button clicked for movie:", {
                          title: movie.title,
                          videoUrl: movie.videoUrl,
                          hasVideoUrl: !!movie.videoUrl,
                        })
                        setIsVideoPlayerOpen(true)
                      }}
                    >
                      <Play className="w-5 h-5" />
                      Тоглуулах
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                      <Plus className="w-5 h-5" />
                      Жагсаалтад нэмэх
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                      <Share className="w-5 h-5" />
                      Хуваалцах
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Details */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Тухай</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{movie.description}</p>
            </div>
            {(movie.director || movie.cast) && (
              <div>
                <h3 className="text-xl font-bold mb-4">Дэлгэрэнгүй</h3>
                <div className="space-y-3">
                  {movie.director && (
                    <div>
                      <span className="font-semibold">Найруулагч:</span>
                      <p className="text-muted-foreground">{movie.director}</p>
                    </div>
                  )}
                  {movie.cast && (
                    <div>
                      <span className="font-semibold">Жүжигчид:</span>
                      <p className="text-muted-foreground">{movie.cast.join(", ")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <MobileBottomNav />

      <VideoPlayer
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
        movieTitle={movie.title}
        videoUrl={movie.videoUrl}
      />
    </div>
  )
}
