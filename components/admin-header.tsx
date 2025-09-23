"use client"

import { Button } from "@/components/ui/button"
import { signOutAdmin } from "@/lib/auth-service"
import { LogOut, Film } from "lucide-react"

interface AdminHeaderProps {
  userEmail: string
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const handleSignOut = async () => {
    try {
      await signOutAdmin()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6" />
          <h1 className="text-xl font-bold">Кино удирдлагын систем</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Гарах
          </Button>
        </div>
      </div>
    </header>
  )
}
