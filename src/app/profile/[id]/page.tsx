"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  databases,
  storage,
  appwriteConfig,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  type User,
  type Post,
  type Follow,
} from "@/lib/appwrite"
import { Navigation } from "@/components/Navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Query } from "appwrite"
import { toast } from "@/hooks/use-toast"

export const runtime = "edge"

export default function Profile() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        if (typeof id !== "string") {
          throw new Error("Invalid user ID")
        }

        const userData = await databases.getDocument<User>(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          id,
        )
        setUser(userData)

        const postsData = await databases.listDocuments<Post>(
          appwriteConfig.databaseId,
          appwriteConfig.postsCollectionId,
          [Query.equal("userId", id)],
        )
        setPosts(postsData.documents)

        const followers = await getFollowers(id)
        setFollowersCount(followers.total)

        const following = await getFollowing(id)
        setFollowingCount(following.total)

        if (currentUser) {
          const isFollowingResponse = await databases.listDocuments<Follow>(
            appwriteConfig.databaseId,
            appwriteConfig.followsCollectionId,
            [Query.equal("followerId", currentUser.$id), Query.equal("followedId", id)],
          )
          setIsFollowing(isFollowingResponse.total > 0)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndPosts()
  }, [id, currentUser])

  const handleFollowToggle = async () => {
    if (!currentUser || !user) return

    try {
      if (isFollowing) {
        await unfollowUser(currentUser.$id, user.$id)
        setFollowersCount((prev) => prev - 1)
      } else {
        await followUser(currentUser.$id, user.$id)
        setFollowersCount((prev) => prev + 1)
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Error toggling follow:", error)
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">User not found</div>
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage src={user.avatar ? storage.getFileView(appwriteConfig.bucketId, user.avatar) : undefined} />
              <AvatarFallback>{user.name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
            <p className="text-muted-foreground mb-4">{user.bio}</p>
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary mb-4">
                {user.website}
              </a>
            )}
            <div className="flex space-x-4 mb-4">
              <span>{posts.length} posts</span>
              <span>{followersCount} followers</span>
              <span>{followingCount} following</span>
            </div>
            {currentUser && currentUser.$id !== user.$id && (
              <Button onClick={handleFollowToggle}>{isFollowing ? "Unfollow" : "Follow"}</Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post) => (
              <div key={post.$id} className="aspect-square overflow-hidden">
                <Image
                  src={storage.getFileView(appwriteConfig.bucketId, post.imageId) || "/placeholder.svg"}
                  alt={post.caption}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

