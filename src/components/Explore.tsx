"use client"

import { useState, useEffect } from "react"
import { getPosts, getTrendingHashtags, searchUsers, appwriteConfig, storage } from "@/lib/appwrite"
import type { Post, Hashtag, User } from "@/lib/appwrite"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"

export function Explore() {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExploreData = async () => {
      setLoading(true)
      try {
        const [posts, hashtags, users] = await Promise.all([getPosts(9), getTrendingHashtags(5), searchUsers("a")])
        setTrendingPosts(posts.documents)
        setTrendingHashtags(hashtags.documents)
        setSuggestedUsers(users.documents.slice(0, 5))
      } catch (error) {
        console.error("Error fetching explore data:", error)
        toast({
          title: "Error",
          description: "Failed to load explore data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExploreData()
  }, [])

  if (loading) {
    return <div>Loading explore data...</div>
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Trending Posts</h2>
        <div className="grid grid-cols-3 gap-4">
          {trendingPosts.map((post) => (
            <Link key={post.$id} href={`/post/${post.$id}`} className="block">
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image
                  src={storage.getFileView(appwriteConfig.bucketId, post.imageId) || "/placeholder.svg"}
                  alt={post.caption}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Trending Hashtags</h2>
        <div className="flex flex-wrap gap-2">
          {trendingHashtags.map((hashtag) => (
            <Link key={hashtag.$id} href={`/hashtag/${hashtag.name}`}>
              <Button variant="outline">#{hashtag.name}</Button>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Suggested Users</h2>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <Link key={user.$id} href={`/profile/${user.$id}`} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${user.$id}`} />
                <AvatarFallback>{user.name?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" className="ml-auto">
                Follow
              </Button>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

