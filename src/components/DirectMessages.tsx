"use client"

import { useState, useEffect } from "react"
import { databases, appwriteConfig } from "@/lib/appwrite"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { Query } from "appwrite"

export function DirectMessages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    const fetchConversations = async () => {
      const response = await databases.listDocuments(appwriteConfig.databaseId, "conversations-collection-id", [
        Query.equal("participants", user.$id),
      ])
      setConversations(response.documents)
    }

    fetchConversations()
  }, [user.$id])

  useEffect(() => {
    if (activeConversation) {
      const fetchMessages = async () => {
        const response = await databases.listDocuments(appwriteConfig.databaseId, "messages-collection-id", [
          Query.equal("conversationId", activeConversation.$id),
          Query.orderDesc("$createdAt"),
        ])
        setMessages(response.documents)
      }

      fetchMessages()
    }
  }, [activeConversation])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    await databases.createDocument(appwriteConfig.databaseId, "messages-collection-id", "unique()", {
      conversationId: activeConversation.$id,
      senderId: user.$id,
      content: newMessage,
    })

    setNewMessage("")
    // Refetch messages
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/3 border-r border-border p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        {conversations.map((conversation) => (
          <div
            key={conversation.$id}
            className={`flex items-center p-2 cursor-pointer ${
              activeConversation?.$id === conversation.$id ? "bg-accent" : ""
            }`}
            onClick={() => setActiveConversation(conversation)}
          >
            <Avatar className="w-10 h-10 mr-3">
              <AvatarImage src={`https://avatar.vercel.sh/${conversation.participants.find((p) => p !== user.$id)}`} />
              <AvatarFallback>{conversation.participants.find((p) => p !== user.$id).slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span>{conversation.participants.find((p) => p !== user.$id)}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold">{activeConversation.participants.find((p) => p !== user.$id)}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.$id}
                  className={`flex ${message.senderId === user.$id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.senderId === user.$id ? "bg-primary text-primary-foreground" : "bg-accent"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-border flex">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow mr-2"
              />
              <Button type="submit" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

