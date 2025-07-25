"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SpotifyLinkProps {
  url?: string | null
  children?: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function SpotifyLink({
  url,
  children = "Open in Spotify",
  className,
  variant = "outline",
  size = "sm",
}: SpotifyLinkProps) {
  if (!url) {
    return null
  }

  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn("gap-2", className)}>
      <ExternalLink className="h-4 w-4" />
      {children}
    </Button>
  )
}
