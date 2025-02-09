import { Navigation } from "@/components/Navigation"
import { Reels } from "@/components/Reels"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function ReelsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mt-16">
          <Reels />
        </main>
      </div>
    </ProtectedRoute>
  )
}

