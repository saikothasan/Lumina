"use client"

import Link from "next/link"
import {
  Home,
  PlusSquare,
  User,
  Search,
  Bell,
  MessageCircle,
  Settings,
  Compass,
  Film,
  Bookmark,
  Sun,
  Moon,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-3 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="text-2xl font-bold hidden md:block">
          InstaClone
        </Link>
        <div className="flex justify-around items-center w-full md:w-auto md:gap-4">
          <Link href="/" className="text-foreground hover:text-primary">
            <Home className="w-6 h-6" />
          </Link>
          <Link href="/explore" className="text-foreground hover:text-primary">
            <Compass className="w-6 h-6" />
          </Link>
          <Link href="/reels" className="text-foreground hover:text-primary">
            <Film className="w-6 h-6" />
          </Link>
          <Link href="/search" className="text-foreground hover:text-primary">
            <Search className="w-6 h-6" />
          </Link>
          <Link href="/create" className="text-foreground hover:text-primary">
            <PlusSquare className="w-6 h-6" />
          </Link>
          <Link href="/notifications" className="text-foreground hover:text-primary">
            <Bell className="w-6 h-6" />
          </Link>
          <Link href="/messages" className="text-foreground hover:text-primary">
            <MessageCircle className="w-6 h-6" />
          </Link>
          <Link href="/bookmarks" className="text-foreground hover:text-primary">
            <Bookmark className="w-6 h-6" />
          </Link>
          <Link href={`/profile/${user.$id}`} className="text-foreground hover:text-primary">
            <User className="w-6 h-6" />
          </Link>
          <Link href="/settings" className="text-foreground hover:text-primary">
            <Settings className="w-6 h-6" />
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hidden md:flex"
        >
          <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </nav>
  )
}

