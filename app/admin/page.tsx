"use client"

import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { AdminLogin } from "@/components/admin-login"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { MovieListAdmin } from "@/components/movie-list-admin"
import { MovieFormAdmin } from "@/components/movie-form-admin"
import { UserManagement } from "@/components/user-management"
import { onAuthStateChange, isAdmin } from "@/lib/auth-service"
import type { Movie } from "@/lib/movie-service"

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("movies")
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (activeTab === "add-movie") {
      handleAddMovie()
    }
  }, [activeTab])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Ачааллаж байна...</div>
      </div>
    )
  }

  if (!user || !isAdmin(user)) {
    return <AdminLogin onLogin={() => {}} />
  }

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie)
    setShowForm(true)
  }

  const handleAddMovie = () => {
    setEditingMovie(null)
    setShowForm(true)
  }

  const handleBackToList = () => {
    setShowForm(false)
    setEditingMovie(null)
    setActiveTab("movies")
  }

  const handleSaveMovie = () => {
    setShowForm(false)
    setEditingMovie(null)
    setActiveTab("movies")
  }

  const renderContent = () => {
    if (showForm) {
      return <MovieFormAdmin movie={editingMovie} onBack={handleBackToList} onSave={handleSaveMovie} />
    }

    switch (activeTab) {
      case "movies":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Кинонуудын жагсаалт</h2>
            <MovieListAdmin onEditMovie={handleEditMovie} />
          </div>
        )
      case "user-management":
        return <UserManagement currentUserEmail={user.email || ""} />
      case "stats":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Статистик</h2>
            <p className="text-muted-foreground">Статистикийн мэдээлэл энд байрлана</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader userEmail={user.email || ""} />
      <div className="flex">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 md:ml-64 p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
