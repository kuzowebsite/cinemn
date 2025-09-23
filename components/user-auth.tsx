"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signInUser } from "@/lib/auth-service"
import { submitRegistrationRequest, checkUserAccess } from "@/lib/user-service"

interface UserAuthProps {
  onLogin: () => void
}

export function UserAuth({ onLogin }: UserAuthProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [profileName, setProfileName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isRegistering) {
        await submitRegistrationRequest(email, displayName, profileName, password)
        setRegistrationSuccess(true)
        setEmail("")
        setPassword("")
        setDisplayName("")
        setProfileName("")
      } else {
        const user = await signInUser(email, password)
        const hasAccess = await checkUserAccess(user)

        if (!hasAccess) {
          setError("Таны бүртгэл хараахан зөвшөөрөгдөөгүй эсвэл хугацаа дууссан байна. Админтай холбогдоно уу.")
          return
        }

        onLogin()
      }
    } catch (err: any) {
      if (isRegistering) {
        setError(err.message || "Бүртгэлийн хүсэлт илгээхэд алдаа гарлаа")
      } else {
        setError(err.message || "Нэвтрэхэд алдаа гарлаа")
      }
    } finally {
      setLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Амжилттай илгээлээ!</CardTitle>
            <CardDescription>Таны бүртгэлийн хүсэлт админ рүү илгээгдлээ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Таны бүртгэлийг админ шалгаж зөвшөөрсний дараа нэвтрэх боломжтой болно. Энэ талаар танд мэдэгдэх болно.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => {
                setRegistrationSuccess(false)
                setIsRegistering(false)
              }}
              className="w-full"
            >
              Нэвтрэх хэсэг рүү буцах
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{isRegistering ? "Бүртгүүлэх хүсэлт" : "Нэвтрэх"}</CardTitle>
          <CardDescription>
            {isRegistering ? "Админ руу бүртгэлийн хүсэлт илгээх" : "Хэрэглэгчийн бүртгэлд нэвтрэх"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Нэр</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Таны нэр"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileName">Профайл нэр</Label>
                  <Input
                    id="profileName"
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Профайл нэр"
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">И-мэйл</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
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
                  ? "Хүсэлт илгээж байна..."
                  : "Нэвтэрч байна..."
                : isRegistering
                  ? "Бүртгэлийн хүсэлт илгээх"
                  : "Нэвтрэх"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Нэвтрэх хэсэг рүү буцах" : "Шинэ бүртгэлийн хүсэлт илгээх"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
