"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Film, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { submitRegistrationRequest } from "@/lib/user-service"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    profileName: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Нууц үг таарахгүй байна")
      return
    }

    if (formData.password.length < 6) {
      alert("Нууц үг дор хаяж 6 тэмдэгт байх ёстой")
      return
    }

    try {
      setLoading(true)
      await submitRegistrationRequest(formData.email, formData.displayName, formData.profileName, formData.password)
      setSubmitted(true)
    } catch (error) {
      console.error("[v0] Registration error:", error)
      alert("Бүртгэлийн хүсэлт илгээхэд алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Film className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Хүсэлт илгээгдлээ</CardTitle>
            <CardDescription>
              Таны бүртгэлийн хүсэлт амжилттай илгээгдлээ. Админ зөвшөөрсний дараа та нэвтрэх боломжтой болно.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Нүүр хуудас руу буцах
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Film className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Бүртгүүлэх</CardTitle>
          <CardDescription>Бүртгэлийн хүсэлт илгээж, админаас зөвшөөрөл авна уу</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Профайл нэр</Label>
              <Input
                id="profileName"
                name="profileName"
                type="text"
                placeholder="Жишээ: Батбаяр"
                value={formData.profileName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Нэвтрэх нэр</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Жишээ: batbayar123"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">И-мэйл хаяг</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Нууц үг</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Дор хаяж 6 тэмдэгт"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Нууц үг давтах</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Нууц үгээ дахин оруулна уу"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Илгээж байна..." : "Бүртгэлийн хүсэлт илгээх"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Нүүр хуудас руу буцах
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
