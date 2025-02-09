"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { updateUser, storage, appwriteConfig, databases } from "@/lib/appwrite"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export function UserSettings() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        const userDetails = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          user.$id,
        )
        setBio(userDetails.bio || "")
        setWebsite(userDetails.website || "")
      }
    }
    fetchUserDetails()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      let avatarId = user.avatar
      if (avatar) {
        const uploadedFile = await storage.createFile(appwriteConfig.bucketId, "unique()", avatar)
        avatarId = uploadedFile.$id
      }

      const updatedUser = await updateUser(user.$id, { name, bio, website, avatar: avatarId })
      setUser({ ...user, ...updatedUser })
      toast({ title: "Profile updated successfully" })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({ title: "Error updating profile", variant: "destructive" })
    }
  }

  if (!user) return null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.avatar ? storage.getFileView(appwriteConfig.bucketId, user.avatar) : undefined} />
          <AvatarFallback>{user.name?.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <Input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
      </div>
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      <Input placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
      <Button type="submit">Save Profile</Button>
    </form>
  )
}

