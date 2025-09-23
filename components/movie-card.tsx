import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"
import Link from "next/link"

interface MovieCardProps {
  id: number
  title: string
  image: string
}

export function MovieCard({ id, title, image }: MovieCardProps) {
  return (
    <Link href={`/movie/${id}`}>
      <Card className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer h-full">
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
            <h3 className="font-semibold text-white text-sm line-clamp-2">{title}</h3>
          </div>
        </div>
      </Card>
    </Link>
  )
}
