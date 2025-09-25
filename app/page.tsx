"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { MovieHeroBanner } from "@/components/movie-hero-banner"
import { MovieSection } from "@/components/movie-section"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { getAllMovies } from "@/lib/movie-service"
import { useAuth } from "@/components/auth-context"

interface Movie {
  id: string
  title: string
  coverImage: string
  description: string
  videoUrl?: string
  detailImages?: string[]
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading, isApproved } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isApproved) {
        router.push("/login")
        return
      }
    }
  }, [user, isApproved, authLoading, router])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const moviesData = await getAllMovies()
        setMovies(moviesData)
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user && isApproved) {
      fetchMovies()
    }
  }, [user, isApproved])

  const convertToDisplayFormat = (movies: Movie[]) => {
    return movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      image: movie.coverImage,
    }))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Ачаалж байна...</p>
        </div>
      </div>
    )
  }

  if (!user || !isApproved) {
    return null
  }

  const recentlyWatched = convertToDisplayFormat(movies.slice(0, 4))
  const popularMovies = convertToDisplayFormat(movies.slice(4, 10))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20 md:pb-8">
        <MovieHeroBanner />
        <MovieSection title="Саяхан үзсэн" movies={recentlyWatched} />
        <MovieSection title="Алдартай кинонууд" movies={popularMovies} />
      </main>
      <MobileBottomNav />
    </div>
  )
}
