"use client"

import { useState, useEffect, useCallback } from "react"
import { getPosts, getTrendingHashtags, appwriteConfig, type Post as PostType, type Hashtag } from "@/lib/appwrite"
import { Navigation } from "@/components/Navigation"
import { Post } from "@/components/Post"
import { Stories } from "@/components/Stories"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Client } from "appwrite"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const newPosts = await getPosts(10, posts.length)
      setPosts((prevPosts) => [...prevPosts, ...newPosts.documents])
      setHasMore(newPosts.documents.length === 10)
    } catch (error) {
      console.error("Error loading posts:", error)
      toast({ title: "Error loading posts", description: "Please try again later.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, posts.length])

  useEffect(() => {
    loadPosts()

    const fetchTrendingHashtags = async () => {
      try {
        const hashtags = await getTrendingHashtags(5)
        setTrendingHashtags(hashtags.documents)
      } catch (error) {
        console.error("Error fetching trending hashtags:", error)
        // Log more details about the error
        if (error instanceof Error) {
          console.error("Error name:", error.name)
          console.error("Error message:", error.message)
          console.error("Error stack:", error.stack)
        }
        toast({
          title: "Error fetching trending hashtags",
          description: "Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchTrendingHashtags()

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.postsCollectionId}.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          setPosts((prevPosts) => [response.payload as PostType, ...prevPosts])
        }
      },
    )

    return () => {
      unsubscribe()
    }
  }, [loadPosts])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-3/4 md:pr-8">
              <Stories />
              <div className="space-y-8">
                {posts.map((post) => (
                  <Post key={post.$id} post={post} />
                ))}
                {loading && <p className="text-center">Loading more posts...</p>}
                {!loading && hasMore && (
                  <Button onClick={loadPosts} className="w-full">
                    Load More
                  </Button>
                )}
              </div>
            </div>
            <div className="w-full md:w-1/4 mt-8 md:mt-0">
              <h2 className="text-xl font-bold mb-4">Trending Hashtags</h2>
              <div className="space-y-2">
                {trendingHashtags.map((hashtag) => (
                  <Link key={hashtag.$id} href={`/hashtag/${hashtag.name}`}>
                    <Button variant="outline" className="w-full text-left">
                      #{hashtag.name}
                    </Button>
                  </Link>
                ))}
                {trendingHashtags.length === 0 && (
                  <p className="text-muted-foreground">No trending hashtags at the moment.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

