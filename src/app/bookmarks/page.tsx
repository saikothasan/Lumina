"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { Post } from "@/components/Post"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { getBookmarkedPosts } from "@/lib/appwrite"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"

export default function BookmarksPage() {
  const { user } = useAuth()
  const [bookmarkedPosts, setBookmarkedPosts] = useState([])

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        if (user) {
          const posts = await getBookmarkedPosts(user.$id)
          setBookmarkedPosts(posts.documents)
        }
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error)
        toast({ title: "Error fetching bookmarked posts", variant: "destructive" })
      }
    }

    fetchBookmarkedPosts()
  }, [user])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <h1 className="text-3xl font-bold mb-8">Bookmarked Posts</h1>
          <div className="space-y-8">
            {bookmarkedPosts.map((post) => (
              <Post key={post.$id} post={post} />
            ))}
          </div>
          {bookmarkedPosts.length === 0 && (
            <p className="text-center text-muted-foreground">No bookmarked posts yet.</p>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

