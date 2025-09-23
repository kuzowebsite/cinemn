import { MovieCard } from "./movie-card"

interface Movie {
  id: number
  title: string
  image: string
}

interface MovieSectionProps {
  title: string
  movies: Movie[]
}

export function MovieSection({ title, movies }: MovieSectionProps) {
  return (
    <section className="px-6 md:px-12 py-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} id={movie.id} title={movie.title} image={movie.image} />
        ))}
      </div>
    </section>
  )
}
