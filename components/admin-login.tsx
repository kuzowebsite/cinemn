"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signInAdmin, registerAdmin } from "@/lib/auth-service"

interface AdminLoginProps {
  onLogin: () => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isRegistering) {
        await registerAdmin(email, password)
        setIsRegistering(false)
        setError("")
        alert("Админ бүртгэл амжилттай үүслээ! Одоо нэвтэрнэ үү.")
      } else {
        await signInAdmin(email, password)
        onLogin()
      }
    } catch (err: any) {
      setError(err.message || (isRegistering ? "Бүртгэхэд алдаа гарлаа" : "Нэвтрэхэд алдаа гарлаа"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{isRegistering ? "Админ бүртгүүлэх" : "Админ нэвтрэх"}</CardTitle>
          <CardDescription>
            {isRegistering ? "Шинэ админ бүртгэл үүсгэх" : "Кино удирдлагын системд нэвтрэх"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">И-мэйл</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexora.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Нууц үг</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isRegistering
                  ? "Бүртгэж байна..."
                  : "Нэвтэрч байна..."
                : isRegistering
                  ? "Бүртгүүлэх"
                  : "Нэвтрэх"}
            </Button>
            
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
