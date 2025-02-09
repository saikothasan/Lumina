"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import { Post } from "@/components/Post"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { getBookmarkedPosts, type Post as PostType } from "@/lib/appwrite"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"

export default function BookmarksPage() {
  const { user } = useAuth()
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)

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
      } finally {
        setLoading(false)
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
          {loading ? (
            <p className="text-center">Loading bookmarked posts...</p>
          ) : (
            <div className="space-y-8">
              {bookmarkedPosts.length > 0 ? (
                bookmarkedPosts.map((post) => <Post key={post.$id} post={post} />)
              ) : (
                <p className="text-center text-muted-foreground">No bookmarked posts yet.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

