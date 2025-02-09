"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { getCurrentUser } from "@/lib/appwrite"
import type { Models } from "appwrite"

type AuthContextType = {
  user: Models.User<Models.Preferences> | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

