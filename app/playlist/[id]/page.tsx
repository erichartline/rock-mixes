import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SpotifyLink } from "@/components/spotify-link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import prisma from "../../../lib/prisma"
import { Metadata } from "next"
import { formatDate, formatDuration } from "@/lib/utils"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const playlist = await getPlaylist(params.id)
  return {
    title: `${playlist?.name || "Playlist"} | Rock Mixes`,
    description: `Details for playlist ${playlist?.name || "Unknown"}`,
  }
}

async function getPlaylist(id: string) {
  const playlist = await prisma.playlist.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      songs: {
        include: {
          artist: true,
          album: true,
          genre: true,
        },
        orderBy: {
          track: "asc",
        },
      },
    },
  })

  if (!playlist) return null

  return {
    ...playlist,
    songs: playlist.songs.map((song) => ({
      id: song.id,
      title: song.name,
      artist: song.artist.name,
      album: song.album?.name || null,
      genre: song.genre?.name || null,
      trackNumber: song.track,
      duration: song.duration,
      url: song.url,
      year: song.album?.year || null,
    })),
  }
}

export async function generateStaticParams() {
  const playlists = await prisma.playlist.findMany({
    select: {
      id: true,
    },
  })

  return playlists.map((playlist) => ({
    id: String(playlist.id),
  }))
}

export default async function PlaylistPage({ params }: Props) {
  const playlist = await getPlaylist(params.id)

  if (!playlist) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Playlist not found
          </h1>
          <Link href="/">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalDuration = playlist.songs.reduce((total, song) => {
    const duration =
      typeof song.duration === "string"
        ? parseInt(song.duration) || 0
        : song.duration || 0
    return total + duration
  }, 0)

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          {playlist.url && (
            <SpotifyLink url={playlist.url} size="sm">
              Open Playlist in Spotify
            </SpotifyLink>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{playlist.name}</h1>
          <div className="flex gap-4 text-muted-foreground">
            <span>
              Created: {playlist.date ? formatDate(playlist.date) : "Unknown"}
            </span>
            <span>•</span>
            <span>{playlist.songs.length} tracks</span>
            {totalDuration > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(totalDuration)}</span>
              </>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Song</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Album</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="w-32">Spotify</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playlist.songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="font-medium">
                    {song.trackNumber}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{song.title}</div>
                  </TableCell>
                  <TableCell>{song.artist}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.album || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.genre || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.year || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.duration
                      ? formatDuration(
                          typeof song.duration === "string"
                            ? parseInt(song.duration) || 0
                            : song.duration,
                        )
                      : "Unknown"}
                  </TableCell>
                  <TableCell>
                    <SpotifyLink url={song.url} size="sm" variant="ghost">
                      Play
                    </SpotifyLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
