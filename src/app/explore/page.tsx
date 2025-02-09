import { Navigation } from "@/components/Navigation"
import { Explore } from "@/components/Explore"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function ExplorePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <h1 className="text-3xl font-bold mb-8">Explore</h1>
          <Explore />
        </main>
      </div>
    </ProtectedRoute>
  )
}

