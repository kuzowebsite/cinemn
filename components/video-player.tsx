"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react"

interface VideoPlayerProps {
  isOpen: boolean
  onClose: () => void
  movieTitle: string
  videoUrl?: string
}

export function VideoPlayer({ isOpen, onClose, movieTitle, videoUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const actualVideoUrl = videoUrl && videoUrl.trim() !== "" ? videoUrl : null
  const sampleVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  const finalVideoUrl = actualVideoUrl || sampleVideoUrl

  console.log("[v0] VideoPlayer opened with:", {
    movieTitle,
    providedVideoUrl: videoUrl,
    actualVideoUrl,
    finalVideoUrl,
    isOpen,
  })

  useEffect(() => {
    if (isOpen) {
      setHasError(false)
      setErrorMessage("")
      setIsPlaying(false)
      setCurrentTime(0)

      // Reset video to beginning when opened
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }

    // Cleanup function to pause video when component unmounts or closes
    return () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [isOpen])

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
          console.log("[v0] Video paused")
        } else {
          console.log("[v0] Attempting to play video:", finalVideoUrl)
          await videoRef.current.play()
          setIsPlaying(true)
          console.log("[v0] Video playing successfully")
        }
      } catch (error) {
        console.log("[v0] Video play/pause error:", error)
        setIsPlaying(false)
        setHasError(true)
        setErrorMessage("Видео тоглуулахад алдаа гарлаа")
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      console.log("[v0] Video metadata loaded, duration:", videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleClose = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause()
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setHasError(false)
    setErrorMessage("")
    onClose()
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget
    const error = video.error

    console.log("[v0] Video loading error:", {
      error: error?.message || "Unknown error",
      code: error?.code,
      videoUrl: finalVideoUrl,
      networkState: video.networkState,
      readyState: video.readyState,
    })

    setIsPlaying(false)
    setHasError(true)

    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          setErrorMessage("Видео ачаалалт цуцлагдлаа")
          break
        case MediaError.MEDIA_ERR_NETWORK:
          setErrorMessage("Сүлжээний алдаа гарлаа")
          break
        case MediaError.MEDIA_ERR_DECODE:
          setErrorMessage("Видео задлах алдаа гарлаа")
          break
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          setErrorMessage("Видео формат дэмжигдэхгүй байна")
          break
        default:
          setErrorMessage("Видео ачаалахад алдаа гарлаа")
      }
    } else {
      setErrorMessage("Видео ачаалахад алдаа гарлаа")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full">
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center text-white p-6">
              <h3 className="text-xl font-bold mb-2">Алдаа гарлаа</h3>
              <p className="mb-4">{errorMessage}</p>
              {!actualVideoUrl && (
                <p className="text-sm text-gray-300 mb-4">
                  Энэ киноны видео файл байхгүй байна. Жишээ видео ашиглаж байна.
                </p>
              )}
              <Button
                onClick={() => {
                  setHasError(false)
                  setErrorMessage("")
                }}
              >
                Дахин оролдох
              </Button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={handleVideoError}
          preload="metadata"
        >
          <source src={finalVideoUrl} type="video/mp4" />
          Таны хөтөч видео тоглуулахыг дэмжихгүй байна.
        </video>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={handleClose}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-white text-sm">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-sm">{formatTime(duration)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold">{movieTitle}</h3>
            <p className="text-white/70 text-sm">{actualVideoUrl ? "Киноны видео" : "Жишээ видео"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
