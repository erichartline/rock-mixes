import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "MMM d, yyyy")
}

export function formatDuration(durationMs: number): string {
  if (!durationMs) return "Unknown"

  const totalSeconds = Math.floor(durationMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function parseDuration(durationString: string): number {
  if (!durationString) return 0

  // Handle MM:SS format
  const parts = durationString.split(":")
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10) || 0
    const seconds = parseInt(parts[1], 10) || 0
    return (minutes * 60 + seconds) * 1000
  }

  // Handle HH:MM:SS format
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10) || 0
    const minutes = parseInt(parts[1], 10) || 0
    const seconds = parseInt(parts[2], 10) || 0
    return (hours * 3600 + minutes * 60 + seconds) * 1000
  }

  return 0
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "gi")
  return text.replace(regex, "<mark>$1</mark>")
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}

export function calculatePlaylistDuration(
  songs: Array<{ duration?: number | null }>,
): number {
  return songs.reduce((total, song) => {
    return total + (song.duration || 0)
  }, 0)
}

export function getDecadeFromYear(year: number): string {
  if (!year) return "Unknown"
  const decade = Math.floor(year / 10) * 10
  return `${decade}s`
}

export function groupByProperty<T>(
  array: T[],
  property: keyof T,
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = String(item[property])
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    },
    {} as Record<string, T[]>,
  )
}
