"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { getCurrentUser, type User as AppwriteUser } from "@/lib/appwrite"
import type { Models } from "appwrite"

type User = AppwriteUser & Models.User<Models.Preferences>

type AuthContextType = {
  user: User | null
  loading: boolean
  setUser: (newUser: User | null | ((prevUser: User | null) => User | null)) => void
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, setUser: () => {} })

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const setUserWrapper = (newUser: User | null | ((prevUser: User | null) => User | null)) => {
    if (typeof newUser === "function") {
      setUser(newUser)
    } else {
      setUser(() => newUser)
    }
  }
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

  return <AuthContext.Provider value={{ user, loading, setUser: setUserWrapper }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

