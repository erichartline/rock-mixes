import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Music,
  Play,
  User,
  Disc,
  ExternalLink,
  Share2,
} from "lucide-react"
import { SpotifyLink } from "@/components/spotify-link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import prisma from "../../../lib/prisma"
import { formatDate, formatDuration } from "@/lib/utils"

interface PlaylistPageProps {
  params: {
    id: string
  }
}

async function getPlaylist(id: number) {
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      songs: {
        include: {
          artist: true,
          album: true,
          genre: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  })
  return playlist
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const id = parseInt(params.id)

  if (isNaN(id)) {
    notFound()
  }

  const playlist = await getPlaylist(id)

  if (!playlist) {
    notFound()
  }

  // Calculate total duration
  const totalDuration = playlist.songs.reduce((sum, song) => {
    const duration =
      typeof song.duration === "string"
        ? parseInt(song.duration) || 0
        : song.duration || 0
    return sum + duration
  }, 0)

  const uniqueArtists = Array.from(
    new Set(playlist.songs.map((song) => song.artist.name)),
  )

  const uniqueGenres = Array.from(
    new Set(playlist.songs.map((song) => song.genre?.name).filter(Boolean)),
  )

  return (
    <div className="min-h-screen">
      {/* Compact Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold gradient-text">
                  {playlist.name}
                </h1>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{playlist.songs.length} tracks</span>
                  <span>{uniqueArtists.length} artists</span>
                  <span>{formatDuration(totalDuration)}</span>
                  {playlist.date && <span>{formatDate(playlist.date)}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {playlist.url && (
                <SpotifyLink url={playlist.url} size="sm" variant="outline">
                  Spotify
                </SpotifyLink>
              )}
              <Button size="sm" className="bg-primary text-white h-7">
                <Play className="w-3 h-3 mr-1" fill="currentColor" />
                Play
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-3 py-2">
        <div className="flex gap-4">
          {/* Main Track List - Takes most of the space */}
          <div className="flex-1">
            {/* Compact table-like header */}
            <div className="flex items-center text-xs text-muted-foreground font-medium py-1 px-2 border-b mb-1">
              <div className="w-8">#</div>
              <div className="flex-1">Track</div>
              <div className="w-32">Artist</div>
              <div className="w-32">Album</div>
              <div className="w-20">Genre</div>
              <div className="w-16 text-right">Time</div>
              <div className="w-8"></div>
            </div>

            {/* Compact track rows */}
            <div className="space-y-0">
              {playlist.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="group px-2 py-1 rounded text-sm hover:bg-muted/30 transition-colors flex items-center">
                  {/* Track Number */}
                  <div className="w-8 text-center">
                    <span className="text-xs text-muted-foreground group-hover:hidden">
                      {index + 1}
                    </span>
                    <Play
                      className="w-3 h-3 text-primary hidden group-hover:block"
                      fill="currentColor"
                    />
                  </div>

                  {/* Track Name */}
                  <div className="flex-1 min-w-0 font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {song.name}
                  </div>

                  {/* Artist */}
                  <div className="w-32 text-muted-foreground truncate">
                    {song.artist.name}
                  </div>

                  {/* Album */}
                  <div className="w-32 text-muted-foreground truncate">
                    {song.album?.name || "-"}
                  </div>

                  {/* Genre */}
                  <div className="w-20 text-primary text-xs truncate">
                    {song.genre?.name || "-"}
                  </div>

                  {/* Duration */}
                  <div className="w-16 text-right text-muted-foreground text-xs tabular-nums">
                    {typeof song.duration === "string"
                      ? formatDuration(parseInt(song.duration) || 0)
                      : formatDuration(song.duration || 0)}
                  </div>

                  {/* Spotify Link */}
                  <div className="w-8">
                    {song.url && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <SpotifyLink
                          url={song.url}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6">
                          <ExternalLink className="w-3 h-3" />
                        </SpotifyLink>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Sidebar */}
          <div className="w-64 space-y-2">
            {/* Artists */}
            <div className="bg-card border rounded p-2">
              <h3 className="font-medium text-xs mb-1 text-muted-foreground uppercase tracking-wide">
                Artists ({uniqueArtists.length})
              </h3>
              <div className="space-y-0">
                {uniqueArtists.slice(0, 12).map((artist) => (
                  <div
                    key={artist}
                    className="text-xs text-foreground hover:text-primary transition-colors cursor-pointer py-0.5 truncate">
                    {artist}
                  </div>
                ))}
                {uniqueArtists.length > 12 && (
                  <div className="text-xs text-muted-foreground pt-1">
                    +{uniqueArtists.length - 12} more
                  </div>
                )}
              </div>
            </div>

            {/* Genres */}
            {uniqueGenres.length > 0 && (
              <div className="bg-card border rounded p-2">
                <h3 className="font-medium text-xs mb-1 text-muted-foreground uppercase tracking-wide">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueGenres.map((genre) => (
                    <span
                      key={genre}
                      className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compact Stats */}
            <div className="bg-card border rounded p-2">
              <h3 className="font-medium text-xs mb-1 text-muted-foreground uppercase tracking-wide">
                Stats
              </h3>
              <div className="space-y-0 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg track:</span>
                  <span className="font-medium">
                    {Math.round(totalDuration / playlist.songs.length) || 0}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracks/artist:</span>
                  <span className="font-medium">
                    {Math.round(
                      (playlist.songs.length / uniqueArtists.length) * 10,
                    ) / 10 || 0}
                  </span>
                </div>
                {playlist.date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(playlist.date).getFullYear()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
