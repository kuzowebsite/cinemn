"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserAuth } from "@/components/user-auth"
import { onAuthStateChange, isAdmin } from "@/lib/auth-service"
import { checkUserAccess } from "@/lib/user-service"

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        if (isAdmin(user)) {
          setIsLoggedIn(true)
          router.push("/admin")
        } else {
          const hasAccess = await checkUserAccess(user)
          if (hasAccess) {
            setIsLoggedIn(true)
            router.push("/")
          }
        }
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogin = () => {
    setIsLoggedIn(true)
    router.push("/")
  }

  if (isLoggedIn) {
    return null
  }

  return <UserAuth onLogin={handleLogin} />
}
