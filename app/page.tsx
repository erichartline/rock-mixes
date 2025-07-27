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
  duration: number | null
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

  const recentPlaylists = playlists.slice(0, 6)

  return (
    <div className="min-h-screen">
      {/* Compact Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold gradient-text">Rock Mixes</h1>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                <span>{stats.totalPlaylists} playlists</span>
                <span>{stats.totalSongs} tracks</span>
                <span>{stats.totalArtists} artists</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchWrapper className="w-72" placeholder="Search..." />
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="h-8">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Content */}
      <div className="max-w-7xl mx-auto px-3 py-3">
        {/* Recent Activity - Compact horizontal layout */}
        {recentPlaylists.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Recently Added
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {recentPlaylists.map((playlist) => (
                <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                  <div className="group p-2 rounded border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Music className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate text-xs">
                          {playlist.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {playlist._count?.songs || 0} tracks
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Playlists - Dense grid layout */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            All Playlists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                id={playlist.id}
                name={playlist.name}
                date={playlist.date}
                duration={playlist.duration}
                songCount={playlist._count?.songs || 0}
                className="h-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
