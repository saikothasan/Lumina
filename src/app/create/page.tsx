"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage, appwriteConfig, createPost } from "@/lib/appwrite"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Navigation } from "@/components/Navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { toast } from "@/hooks/use-toast"

const filters = [
  { name: "Normal", filter: "" },
  { name: "Grayscale", filter: "grayscale(100%)" },
  { name: "Sepia", filter: "sepia(100%)" },
  { name: "Invert", filter: "invert(100%)" },
  { name: "Blur", filter: "blur(5px)" },
]

export default function CreatePost() {
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState(filters[0])
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (image) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(image)
    }
  }, [image])

  useEffect(() => {
    if (previewUrl && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0, img.width, img.height)
        applyFilters()
      }
      img.src = previewUrl
    }
  }, [previewUrl]) // Removed unnecessary dependencies: selectedFilter, brightness, contrast

  const applyFilters = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      ctx?.filter = `${selectedFilter.filter} brightness(${brightness}%) contrast(${contrast}%)`
      const img = new Image()
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = previewUrl!
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image || !canvasRef.current) return

    try {
      // Convert canvas to Blob
      const blob = await new Promise<Blob>((resolve) => canvasRef.current!.toBlob((blob) => resolve(blob!)))

      // Create a new File object from the Blob
      const editedImage = new File([blob], image.name, { type: "image/jpeg" })

      // Upload the edited image
      const fileUpload = await storage.createFile(appwriteConfig.bucketId, "unique()", editedImage)

      // Create post
      await createPost(caption, fileUpload.$id)

      toast({ title: "Post created successfully" })
      router.push("/")
    } catch (error) {
      console.error("Error creating post:", error)
      toast({ title: "Error creating post", variant: "destructive" })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 mt-16">
          <h1 className="text-2xl font-bold mb-4">Create Post</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} required />
            {previewUrl && (
              <div>
                <canvas ref={canvasRef} className="max-w-full h-auto" />
                <div className="mt-4 space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Filter</label>
                    <div className="flex space-x-2">
                      {filters.map((filter) => (
                        <Button
                          key={filter.name}
                          onClick={() => setSelectedFilter(filter)}
                          variant={selectedFilter.name === filter.name ? "default" : "outline"}
                        >
                          {filter.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brightness</label>
                    <Slider
                      min={0}
                      max={200}
                      step={1}
                      value={[brightness]}
                      onValueChange={(value) => setBrightness(value[0])}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contrast</label>
                    <Slider
                      min={0}
                      max={200}
                      step={1}
                      value={[contrast]}
                      onValueChange={(value) => setContrast(value[0])}
                    />
                  </div>
                </div>
              </div>
            )}
            <Textarea
              placeholder="Write a caption... (Use # for hashtags)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
            <Button type="submit">Create Post</Button>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  )
}

