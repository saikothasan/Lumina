import { Navigation } from "@/components/Navigation"
import { DirectMessages } from "@/components/DirectMessages"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <DirectMessages />
        </main>
      </div>
    </ProtectedRoute>
  )
}

