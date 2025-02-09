"use client"

import { useState } from "react"
import { searchUsers, searchPosts } from "@/lib/appwrite"
import { Navigation } from "@/components/Navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import { appwriteConfig, storage } from "@/lib/appwrite"

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userResults, setUserResults] = useState([])
  const [postResults, setPostResults] = useState([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    try {
      const users = await searchUsers(searchTerm)
      setUserResults(users.documents)

      const posts = await searchPosts(searchTerm)
      setPostResults(posts.documents)
    } catch (error) {
      console.error("Error searching:", error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <h1 className="text-2xl font-bold mb-4">Search</h1>
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex">
              <Input
                type="text"
                placeholder="Search users or posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow mr-2"
              />
              <Button type="submit">Search</Button>
            </div>
          </form>
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="space-y-4">
                {userResults.map((user) => (
                  <Link
                    key={user.$id}
                    href={`/profile/${user.$id}`}
                    className="flex items-center p-2 hover:bg-accent rounded"
                  >
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.$id}`} />
                      <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Posts</h2>
              <div className="grid grid-cols-3 gap-4">
                {postResults.map((post) => (
                  <Link key={post.$id} href={`/post/${post.$id}`} className="aspect-square overflow-hidden rounded">
                    <Image
                      src={storage.getFileView(appwriteConfig.bucketId, post.imageId) || "/placeholder.svg"}
                      alt={post.caption}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

