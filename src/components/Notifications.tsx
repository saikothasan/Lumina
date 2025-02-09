"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getNotifications } from "@/lib/appwrite"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        const response = await getNotifications(user.$id)
        setNotifications(response.documents)
      }
    }

    fetchNotifications()
  }, [user])

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.$id} className="flex items-center space-x-4 p-4 bg-card rounded-lg shadow">
          <Avatar className="w-10 h-10">
            <AvatarImage src={`https://avatar.vercel.sh/${notification.userId}`} />
            <AvatarFallback>{notification.userId.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm">
              {notification.type === "like" && "liked your post"}
              {notification.type === "comment" && "commented on your post"}
              {notification.type === "follow" && "started following you"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          </div>
          {notification.postId && (
            <Link href={`/post/${notification.postId}`} className="text-primary">
              View Post
            </Link>
          )}
        </div>
      ))}
      {notifications.length === 0 && <p className="text-center text-muted-foreground">No notifications yet</p>}
    </div>
  )
}

