"use client"

import { useState } from "react"
import { Navigation } from "@/components/Navigation"
import { UserSettings } from "@/components/UserSettings"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { updateUserPrivacySettings } from "@/lib/appwrite"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false)
  const [showActivityStatus, setShowActivityStatus] = useState(user?.showActivityStatus || true)
  const [allowTagging, setAllowTagging] = useState(user?.allowTagging || true)

  const handlePrivacySettingsUpdate = async () => {
    try {
      await updateUserPrivacySettings(user.$id, {
        isPrivate,
        showActivityStatus,
        allowTagging,
      })
      toast({ title: "Privacy settings updated successfully" })
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      toast({ title: "Error updating privacy settings", variant: "destructive" })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">User Settings</h2>
              <UserSettings />
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4">Privacy Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="private-account">Private Account</Label>
                  <Switch id="private-account" checked={isPrivate} onCheckedChange={setIsPrivate} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="activity-status">Show Activity Status</Label>
                  <Switch id="activity-status" checked={showActivityStatus} onCheckedChange={setShowActivityStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-tagging">Allow Tagging</Label>
                  <Switch id="allow-tagging" checked={allowTagging} onCheckedChange={setAllowTagging} />
                </div>
                <Button onClick={handlePrivacySettingsUpdate}>Save Privacy Settings</Button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

