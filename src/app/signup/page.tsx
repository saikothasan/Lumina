"use client"

import { useState } from "react"
import { account } from "@/lib/appwrite"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type React from "react" // Added import for React

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await account.create("unique()", email, password, name)
      await account.createEmailSession(email, password)
      router.push("/")
    } catch (error) {
      console.error("Sign up failed", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Sign Up</h1>
      <form onSubmit={handleSignUp} className="w-full max-w-md space-y-4">
        <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
    </div>
  )
}

