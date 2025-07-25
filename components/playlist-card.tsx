import Link from "next/link"
import { Calendar, Clock, Music, Play } from "lucide-react"
import {
  formatDate,
  calculatePlaylistDuration,
  formatDuration,
} from "@/lib/utils"

interface PlaylistCardProps {
  id: number
  name: string
  date: Date | null
  duration: string | null
  songCount?: number
  className?: string
}

export function PlaylistCard({
  id,
  name,
  date,
  duration,
  songCount = 0,
  className,
}: PlaylistCardProps) {
  return (
    <Link href={`/playlist/${id}`}>
      <div
        className={`group relative rounded bg-card border border-border hover:bg-muted/30 card-hover ${className}`}>
        <div className="p-2 flex items-center gap-2">
          {/* Compact Icon */}
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Music className="w-4 h-4 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate text-sm">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {songCount > 0 && <span>{songCount} tracks</span>}
              {duration && <span>{duration}</span>}
              {date && <span>{formatDate(date)}</span>}
            </div>
          </div>

          {/* Compact play indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-3 h-3 text-primary" fill="currentColor" />
          </div>
        </div>
      </div>
    </Link>
  )
}
