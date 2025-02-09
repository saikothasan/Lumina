"use client"

import { useState, useEffect, useRef } from "react"
import { getReels } from "@/lib/appwrite"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share } from "lucide-react"
import { appwriteConfig, storage } from "@/lib/appwrite"

export function Reels() {
  const [reels, setReels] = useState([])
  const [currentReelIndex, setCurrentReelIndex] = useState(0)
  const videoRef = useRef(null)

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const fetchedReels = await getReels()
        setReels(fetchedReels.documents)
      } catch (error) {
        console.error("Error fetching reels:", error)
      }
    }

    fetchReels()
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [videoRef]) //Fixed unnecessary dependency

  const handleNextReel = () => {
    setCurrentReelIndex((prevIndex) => (prevIndex + 1) % reels.length)
  }

  const handlePrevReel = () => {
    setCurrentReelIndex((prevIndex) => (prevIndex - 1 + reels.length) % reels.length)
  }

  if (reels.length === 0) {
    return <div>Loading reels...</div>
  }

  const currentReel = reels[currentReelIndex]

  return (
    <div className="relative h-[calc(100vh-4rem)] bg-black">
      <video
        ref={videoRef}
        src={storage.getFileView(appwriteConfig.bucketId, currentReel.videoFileId)}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://avatar.vercel.sh/${currentReel.userId}`} />
            <AvatarFallback>{currentReel.userId.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-white">{currentReel.userId}</p>
            <p className="text-sm text-gray-300">{currentReel.caption}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <Button variant="ghost" size="icon">
            <Heart className="w-6 h-6 text-white" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 left-4 transform -translate-y-1/2"
        onClick={handlePrevReel}
      >
        ←
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-4 transform -translate-y-1/2"
        onClick={handleNextReel}
      >
        →
      </Button>
    </div>
  )
}

