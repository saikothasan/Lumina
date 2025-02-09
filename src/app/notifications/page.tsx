import { Navigation } from "@/components/Navigation"
import { Notifications } from "@/components/Notifications"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <h1 className="text-2xl font-bold mb-4">Notifications</h1>
          <Notifications />
        </main>
      </div>
    </ProtectedRoute>
  )
}

