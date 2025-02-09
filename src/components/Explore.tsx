"use client"

import { useState, useEffect } from "react"
import { getPosts, getTrendingHashtags, searchUsers } from "@/lib/appwrite"
import { Post } from "@/components/Post"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Explore() {
  const [trendingPosts, setTrendingPosts] = useState([])
  const [trendingHashtags, setTrendingHashtags] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const posts = await getPosts(9) // Get 9 trending posts
        setTrendingPosts(posts.documents)

        const hashtags = await getTrendingHashtags(5)
        setTrendingHashtags(hashtags.documents)

        // For suggested users, we'll use a random search term. In a real app, this would be based on user interests.
        const users = await searchUsers("a")
        setSuggestedUsers(users.documents.slice(0, 5))
      } catch (error) {
        console.error("Error fetching explore data:", error)
      }
    }

    fetchExploreData()
  }, [])

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Trending Posts</h2>
        <div className="grid grid-cols-3 gap-4">
          {trendingPosts.map((post) => (
            <Post key={post.$id} post={post} />
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
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
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

