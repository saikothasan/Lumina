"use client"

import { useState, useEffect } from "react"
import { databases, storage, appwriteConfig } from "@/lib/appwrite"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Image from "next/image"
import { Query, type Models } from "appwrite"
import { toast } from "@/hooks/use-toast"

interface Story extends Models.Document {
  userId: string
  imageId: string
}

export function Stories() {
  const { user } = useAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true)
        const response = await databases.listDocuments<Story>(
          appwriteConfig.databaseId,
          appwriteConfig.storiesCollectionId,
          [Query.orderDesc("$createdAt"), Query.limit(10)],
        )
        setStories(response.documents)
      } catch (error) {
        console.error("Error fetching stories:", error)
        toast({
          title: "Error",
          description: "Failed to load stories. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  const handleCreateStory = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a story.",
        variant: "destructive",
      })
      return
    }

    try {
      const fileUpload = await storage.createFile(appwriteConfig.bucketId, "unique()", file)
      await databases.createDocument<Story>(appwriteConfig.databaseId, appwriteConfig.storiesCollectionId, "unique()", {
        userId: user.$id,
        imageId: fileUpload.$id,
      })
      toast({
        title: "Success",
        description: "Your story has been created.",
      })
      // Refetch stories
      const response = await databases.listDocuments<Story>(
        appwriteConfig.databaseId,
        appwriteConfig.storiesCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(10)],
      )
      setStories(response.documents)
    } catch (error) {
      console.error("Error creating story:", error)
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading stories...</div>
  }

  return (
    <div className="mb-8">
      <div className="flex space-x-4 overflow-x-auto p-4">
        <Button
          variant="outline"
          className="flex-shrink-0 w-20 h-20 rounded-full"
          onClick={() => document.getElementById("story-upload")?.click()}
        >
          <PlusCircle className="w-8 h-8" />
          <input
            id="story-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleCreateStory(e.target.files[0])}
          />
        </Button>
        {stories.map((story) => (
          <Avatar key={story.$id} className="w-20 h-20 cursor-pointer" onClick={() => setActiveStory(story)}>
            <AvatarImage src={`https://avatar.vercel.sh/${story.userId}`} />
            <AvatarFallback>{story.userId.slice(0, 2)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {activeStory && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-lg aspect-square">
            <Image
              src={storage.getFileView(appwriteConfig.bucketId, activeStory.imageId) || "/placeholder.svg"}
              alt="Story"
              layout="fill"
              objectFit="contain"
            />
            <Button variant="ghost" className="absolute top-4 right-4 text-white" onClick={() => setActiveStory(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

