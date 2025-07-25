import Link from "next/link"
import { PlaylistCard } from "@/components/playlist-card"
import { SearchWrapper } from "@/components/search-wrapper"
import { Button } from "@/components/ui/button"
import { BarChart3, Music, Search, TrendingUp } from "lucide-react"
import prisma from "../lib/prisma"
import { formatDate } from "@/lib/utils"

interface Playlist {
  id: number
  name: string
  date: Date | null
  duration: string | null
  _count?: {
    songs: number
  }
}

async function getPlaylists(): Promise<Playlist[]> {
  const playlists = await prisma.playlist.findMany({
    include: {
      _count: {
        select: { songs: true },
      },
    },
    orderBy: {
      date: "desc",
    },
  })
  return playlists
}

async function getStats() {
  const [totalPlaylists, totalSongs, totalArtists] = await Promise.all([
    prisma.playlist.count(),
    prisma.song.count(),
    prisma.artist.count(),
  ])
  return { totalPlaylists, totalSongs, totalArtists }
}

export default async function HomePage() {
  const [playlists, stats] = await Promise.all([getPlaylists(), getStats()])

  const recentPlaylists = playlists.slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Rock Mixes</h1>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
                <span>{stats.totalPlaylists} playlists</span>
                <span>{stats.totalSongs} tracks</span>
                <span>{stats.totalArtists} artists</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchWrapper className="w-80" placeholder="Search..." />
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* All Playlists */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">All Playlists</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                id={playlist.id}
                name={playlist.name}
                date={playlist.date}
                duration={playlist.duration}
                songCount={playlist._count?.songs || 0}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {recentPlaylists.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Recently Added</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {recentPlaylists.map((playlist) => (
                <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                  <div className="group p-3 rounded border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate text-sm">
                          {playlist.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {playlist.date
                            ? formatDate(playlist.date)
                            : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
