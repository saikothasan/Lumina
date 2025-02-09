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

interface Filter {
  name: string
  filter: string
}

const filters: Filter[] = [
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
  const [selectedFilter, setSelectedFilter] = useState<Filter>(filters[0])
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
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        applyFilters(ctx, img)
      }
      img.src = previewUrl
    }
  }, [previewUrl])

  const applyFilters = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    // Clear the canvas first
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Create a temporary canvas for applying filters
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCanvas.width = img.width
    tempCanvas.height = img.height

    // Set the filter on the temporary context
    tempCtx.filter = `${selectedFilter.filter} brightness(${brightness}%) contrast(${contrast}%)`

    // Draw the image with filters on the temporary canvas
    tempCtx.drawImage(img, 0, 0, img.width, img.height)

    // Draw the filtered image onto the main canvas
    ctx.drawImage(tempCanvas, 0, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image || !canvasRef.current) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      })
      return
    }

    try {
      // Convert canvas to Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to convert canvas to blob"))
          }
        }, "image/jpeg")
      })

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
      toast({
        title: "Error creating post",
        description: "Please try again later",
        variant: "destructive",
      })
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
              <div className="space-y-4">
                <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg border border-border" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Filter</label>
                    <div className="flex flex-wrap gap-2">
                      {filters.map((filter) => (
                        <Button
                          key={filter.name}
                          onClick={() => setSelectedFilter(filter)}
                          variant={selectedFilter.name === filter.name ? "default" : "outline"}
                          type="button"
                        >
                          {filter.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Brightness</label>
                    <Slider
                      min={0}
                      max={200}
                      step={1}
                      value={[brightness]}
                      onValueChange={(value) => setBrightness(value[0])}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contrast</label>
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
              className="min-h-[100px]"
            />
            <Button type="submit" className="w-full">
              Create Post
            </Button>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  )
}

