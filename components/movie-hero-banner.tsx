"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Info } from "lucide-react"

const banners = [
  {
    id: 1,
    title: "Дундад дэлхийн Эзэн",
    description: "Эпик адал явдалт кино. Хоббит Фродо болон түүний найзууд дэлхийг аврахын тулд аянд гарна.",
    image: "/epic-fantasy-movie-scene-with-mountains-and-heroes.jpg",
    year: "2023",
    rating: "9.2",
  },
  {
    id: 2,
    title: "Сансрын Дайчин",
    description: "Ирээдүйн сансарт болох тулалдааны тухай шинэ кино. Технологи болон хүний сэтгэлийн тухай.",
    image: "/futuristic-space-battle-with-spaceships-and-stars.jpg",
    year: "2024",
    rating: "8.8",
  },
  {
    id: 3,
    title: "Нууцлаг Хот",
    description: "Нууцлаг хотод болох гэмт хэргийн тухай сэтгэл хөдөлгөм кино. Нууц тайлагдах хүртэл.",
    image: "/mysterious-dark-city-at-night-with-neon-lights.jpg",
    year: "2024",
    rating: "8.5",
  },
]

export function MovieHeroBanner() {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const banner = banners[currentBanner]

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${banner.image})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 flex items-center h-full px-6 md:px-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded">
              {banner.year}
            </span>
            <span className="flex items-center gap-1 text-yellow-400">⭐ {banner.rating}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">{banner.title}</h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">{banner.description}</p>

          <div className="flex gap-4">
            <Button size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Үзэх
            </Button>
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              <Info className="w-5 h-5" />
              Дэлгэрэнгүй
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentBanner ? "bg-primary w-8" : "bg-white/50"
            }`}
            onClick={() => setCurrentBanner(index)}
          />
        ))}
      </div>
    </div>
  )
}
