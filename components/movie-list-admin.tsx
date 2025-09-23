"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2 } from "lucide-react"
import { type Movie, getMovies, deleteMovie } from "@/lib/movie-service"
import { toast } from "@/hooks/use-toast"

interface MovieListAdminProps {
  onEditMovie: (movie: Movie) => void
}

export function MovieListAdmin({ onEditMovie }: MovieListAdminProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  const loadMovies = async () => {
    try {
      const movieList = await getMovies()
      setMovies(movieList)
    } catch (error) {
      console.error("Error loading movies:", error)
      toast({
        title: "Алдаа",
        description: "Кинонуудыг ачааллахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMovies()
  }, [])

  const handleDeleteMovie = async (movieId: string) => {
    try {
      await deleteMovie(movieId)
      setMovies(movies.filter((movie) => movie.id !== movieId))
      toast({
        title: "Амжилттай",
        description: "Кино амжилттай устгагдлаа",
      })
    } catch (error) {
      console.error("Error deleting movie:", error)
      toast({
        title: "Алдаа",
        description: "Кино устгахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Кинонуудыг ачааллаж байна...</div>
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Одоогоор кино байхгүй байна</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie) => (
        <Card key={movie.id} className="overflow-hidden">
          <div className="aspect-[2/3] relative">
            <img
              src={movie.coverImage || "/placeholder.svg"}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{movie.title}</CardTitle>
            <CardDescription className="line-clamp-2">{movie.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onEditMovie(movie)}>
                <Edit className="h-4 w-4 mr-2" />
                Засах
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Кино устгах</AlertDialogTitle>
                    <AlertDialogDescription>
                      Та "{movie.title}" киног устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => movie.id && handleDeleteMovie(movie.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Устгах
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
