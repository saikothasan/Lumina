"use client"

import { useState, useEffect } from "react"
import { databases, storage, appwriteConfig } from "@/lib/appwrite"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Image from "next/image"
import { Query } from "appwrite" // Import Query

export function Stories() {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [activeStory, setActiveStory] = useState(null)

  useEffect(() => {
    const fetchStories = async () => {
      const response = await databases.listDocuments(appwriteConfig.databaseId, "stories-collection-id", [
        Query.orderDesc("$createdAt"),
        Query.limit(10),
      ])
      setStories(response.documents)
    }

    fetchStories()
  }, [])

  const handleCreateStory = async (file) => {
    const fileUpload = await storage.createFile(appwriteConfig.bucketId, "unique()", file)
    await databases.createDocument(appwriteConfig.databaseId, "stories-collection-id", "unique()", {
      userId: user.$id,
      imageId: fileUpload.$id,
    })
    // Refetch stories
  }

  return (
    <div className="mb-8">
      <div className="flex space-x-4 overflow-x-auto p-4">
        <Button
          variant="outline"
          className="flex-shrink-0 w-20 h-20 rounded-full"
          onClick={() => document.getElementById("story-upload").click()}
        >
          <PlusCircle className="w-8 h-8" />
          <input
            id="story-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleCreateStory(e.target.files[0])}
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

