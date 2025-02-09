"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Send, Bookmark, Share2, BarChart2 } from "lucide-react"
import {
  storage,
  likePost,
  unlikePost,
  addComment,
  getComments,
  appwriteConfig,
  bookmarkPost,
  unbookmarkPost,
  sharePost,
  getPostAnalytics,
  type Post as PostType,
  type Comment,
  type PostAnalytics,
} from "@/lib/appwrite"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface PostProps {
  post: PostType
}

export function Post({ post }: PostProps) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareUsername, setShareUsername] = useState("")
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null)

  useEffect(() => {
    const fetchComments = async () => {
      const fetchedComments = await getComments(post.$id)
      setComments(fetchedComments.documents)
    }

    fetchComments()
  }, [post.$id])

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikePost(post.$id)
        setLikesCount((prev) => prev - 1)
      } else {
        await likePost(post.$id)
        setLikesCount((prev) => prev + 1)
      }
      setLiked(!liked)
    } catch (error) {
      console.error("Error liking/unliking post:", error)
      toast({ title: "Error updating like status", variant: "destructive" })
    }
  }

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await unbookmarkPost(post.$id)
      } else {
        await bookmarkPost(post.$id)
      }
      setBookmarked(!bookmarked)
      toast({ title: bookmarked ? "Post unbookmarked" : "Post bookmarked" })
    } catch (error) {
      console.error("Error bookmarking/unbookmarking post:", error)
      toast({ title: "Error updating bookmark status", variant: "destructive" })
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const comment = await addComment(post.$id, newComment)
      setComments((prev) => [comment, ...prev])
      setNewComment("")
      toast({ title: "Comment added successfully" })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({ title: "Error adding comment", variant: "destructive" })
    }
  }

  const handleShare = async () => {
    if (!shareUsername.trim()) return

    try {
      await sharePost(post.$id, shareUsername)
      setShowShareDialog(false)
      setShareUsername("")
      toast({ title: "Post shared successfully" })
    } catch (error) {
      console.error("Error sharing post:", error)
      toast({ title: "Error sharing post", variant: "destructive" })
    }
  }

  const handleShowAnalytics = async () => {
    try {
      const postAnalytics = await getPostAnalytics(post.$id)
      setAnalytics(postAnalytics)
      setShowAnalyticsDialog(true)
    } catch (error) {
      console.error("Error fetching post analytics:", error)
      toast({ title: "Error fetching post analytics", variant: "destructive" })
    }
  }

  return (
    <div className="bg-card shadow-md rounded-lg overflow-hidden">
      <div className="p-4 flex items-center">
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage src={`https://avatar.vercel.sh/${post.userId}`} />
          <AvatarFallback>{post.userId.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold">{post.userId}</span>
      </div>
      <div className="relative aspect-square">
        <Image
          src={storage.getFileView(appwriteConfig.bucketId, post.imageId) || "/placeholder.svg"}
          alt={post.caption}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={handleLike}>
            <Heart className={`w-6 h-6 ${liked ? "text-red-500 fill-red-500" : ""}`} />
          </Button>
          <span className="ml-2">{likesCount} likes</span>
          <Button variant="ghost" size="icon" className="ml-4">
            <MessageCircle className="w-6 h-6" />
          </Button>
          <span className="ml-2">{comments.length} comments</span>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={handleBookmark}>
            <Bookmark className={`w-6 h-6 ${bookmarked ? "text-yellow-500 fill-yellow-500" : ""}`} />
          </Button>
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Share2 className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Post</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Enter username to share with"
                value={shareUsername}
                onChange={(e) => setShareUsername(e.target.value)}
              />
              <Button onClick={handleShare}>Share</Button>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" onClick={handleShowAnalytics}>
            <BarChart2 className="w-6 h-6" />
          </Button>
        </div>
        <p className="mb-2">{post.caption}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {formatDistanceToNow(new Date(post.$createdAt), { addSuffix: true })}
        </p>
        <div className="space-y-2">
          {comments.slice(0, 3).map((comment) => (
            <div key={comment.$id} className="flex items-start">
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage src={`https://avatar.vercel.sh/${comment.userId}`} />
                <AvatarFallback>{comment.userId.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-semibold mr-2">{comment.userId}</span>
                <span>{comment.content}</span>
              </div>
            </div>
          ))}
          {comments.length > 3 && (
            <Button variant="link" className="p-0">
              View all {comments.length} comments
            </Button>
          )}
        </div>
        <form onSubmit={handleComment} className="mt-4 flex">
          <Input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow mr-2"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Analytics</DialogTitle>
          </DialogHeader>
          {analytics && (
            <div className="space-y-2">
              <p>Likes: {analytics.likes}</p>
              <p>Comments: {analytics.comments}</p>
              <p>Shares: {analytics.shares}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

