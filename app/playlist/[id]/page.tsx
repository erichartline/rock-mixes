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
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold gradient-text">
                  {playlist.name}
                </h1>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
              <Button size="sm" className="bg-primary text-white">
                <Play className="w-3 h-3 mr-1" fill="currentColor" />
                Play
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Track List */}
          <div className="xl:col-span-3">
            <div className="space-y-1">
              {playlist.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="group p-2 rounded hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Track Number */}
                    <div className="w-6 text-center">
                      <span className="text-xs text-muted-foreground group-hover:hidden">
                        {index + 1}
                      </span>
                      <Play
                        className="w-3 h-3 text-primary hidden group-hover:block"
                        fill="currentColor"
                      />
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {song.name}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{song.artist.name}</span>
                        {song.album && <span>{song.album.name}</span>}
                        {song.genre && (
                          <span className="text-primary">
                            {song.genre.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Duration & Actions */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {typeof song.duration === "string"
                          ? formatDuration(parseInt(song.duration) || 0)
                          : formatDuration(song.duration || 0)}
                      </span>
                      {song.url && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <SpotifyLink
                            url={song.url}
                            size="icon"
                            variant="ghost">
                            <ExternalLink className="w-3 h-3" />
                          </SpotifyLink>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Artists */}
            <div className="bg-card border rounded-lg p-3">
              <h3 className="font-medium text-sm mb-2">
                Artists ({uniqueArtists.length})
              </h3>
              <div className="space-y-1">
                {uniqueArtists.slice(0, 10).map((artist) => (
                  <div
                    key={artist}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {artist}
                  </div>
                ))}
                {uniqueArtists.length > 10 && (
                  <div className="text-xs text-muted-foreground">
                    +{uniqueArtists.length - 10} more
                  </div>
                )}
              </div>
            </div>

            {/* Genres */}
            {uniqueGenres.length > 0 && (
              <div className="bg-card border rounded-lg p-3">
                <h3 className="font-medium text-sm mb-2">Genres</h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueGenres.map((genre) => (
                    <span
                      key={genre}
                      className="text-xs bg-muted px-2 py-1 rounded">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-card border rounded-lg p-3">
              <h3 className="font-medium text-sm mb-2">Stats</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>
                  Avg track:{" "}
                  {Math.round(totalDuration / playlist.songs.length) || 0}s
                </div>
                <div>
                  Tracks/artist:{" "}
                  {Math.round(
                    (playlist.songs.length / uniqueArtists.length) * 10,
                  ) / 10 || 0}
                </div>
                {playlist.date && (
                  <div>Created: {new Date(playlist.date).getFullYear()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
