import Link from "next/link"
import { Search } from "lucide-react"
import { SearchWrapper } from "@/components/search-wrapper"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import prisma from "../../lib/prisma"
import { formatDate } from "@/lib/utils"

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

interface SearchResults {
  playlists: Array<{
    id: number
    name: string
    date: Date | null
    duration: string | null
  }>
  songs: Array<{
    id: number
    name: string
    artist: { name: string }
    album: { name: string } | null
    playlist: { id: number; name: string }
  }>
  artists: Array<{
    id: number
    name: string
    _count: { songs: number }
  }>
}

async function searchDatabase(query: string): Promise<SearchResults> {
  if (!query.trim()) {
    return { playlists: [], songs: [], artists: [] }
  }

  const searchTerm = query.toLowerCase()

  const [playlists, songs, artists] = await Promise.all([
    // Search playlists
    prisma.playlist.findMany({
      where: {
        name: {
          contains: searchTerm,
        },
      },
      take: 10,
    }),

    // Search songs
    prisma.song.findMany({
      where: {
        name: {
          contains: searchTerm,
        },
      },
      include: {
        artist: true,
        album: true,
        playlist: true,
      },
      take: 20,
    }),

    // Search artists
    prisma.artist.findMany({
      where: {
        name: {
          contains: searchTerm,
        },
      },
      include: {
        _count: {
          select: { songs: true },
        },
      },
      take: 10,
    }),
  ])

  return { playlists, songs, artists }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const results = await searchDatabase(query)

  const handleSearch = (newQuery: string) => {
    if (typeof window !== "undefined") {
      window.location.href = `/search?q=${encodeURIComponent(newQuery)}`
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Search Rock Mixes
          </h1>
          <SearchWrapper className="w-full max-w-md mx-auto" />
        </div>

        {query && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Results for &ldquo;{query}&rdquo;
            </h2>

            {/* Playlists Section */}
            {results.playlists.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Playlists ({results.playlists.length})
                </h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.playlists.map((playlist) => (
                        <TableRow key={playlist.id}>
                          <TableCell>
                            <Link
                              href={`/playlist/${playlist.id}`}
                              className="font-medium text-primary hover:underline">
                              {playlist.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {playlist.date
                              ? formatDate(playlist.date)
                              : "Unknown"}
                          </TableCell>
                          <TableCell>
                            {playlist.duration || "Unknown"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Songs Section */}
            {results.songs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Songs ({results.songs.length})
                </h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Song</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>Album</TableHead>
                        <TableHead>Playlist</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.songs.map((song) => (
                        <TableRow key={song.id}>
                          <TableCell className="font-medium">
                            {song.name}
                          </TableCell>
                          <TableCell>{song.artist.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {song.album?.name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/playlist/${song.playlist.id}`}
                              className="text-primary hover:underline">
                              {song.playlist.name}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Artists Section */}
            {results.artists.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Artists ({results.artists.length})
                </h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Artist</TableHead>
                        <TableHead>Song Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.artists.map((artist) => (
                        <TableRow key={artist.id}>
                          <TableCell className="font-medium">
                            {artist.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {artist._count.songs} songs
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* No Results */}
            {results.playlists.length === 0 &&
              results.songs.length === 0 &&
              results.artists.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    No results found for &ldquo;{query}&rdquo;
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Try searching with different keywords or check your
                    spelling.
                  </p>
                </div>
              )}
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Start your search
            </h3>
            <p className="text-muted-foreground mt-2">
              Search for playlists, songs, or artists to discover your music.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
