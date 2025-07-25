import Link from "next/link"
import {
  Search,
  Music,
  User,
  Disc,
  Filter,
  Sparkles,
  BarChart3,
  Play,
} from "lucide-react"
import { SearchWrapper } from "@/components/search-wrapper"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

  const totalResults =
    results.playlists.length + results.songs.length + results.artists.length

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Search Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-pink-500/5 to-background" />

        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-outfit mb-4">
                <span className="gradient-text">Discover Music</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Search through your entire rock collection - playlists, tracks,
                and artists
              </p>
            </div>

            <SearchWrapper className="w-full mb-6" />

            {query && (
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>
                  Searching for:{" "}
                  <strong className="text-foreground">
                    &ldquo;{query}&rdquo;
                  </strong>
                </span>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  {totalResults} results
                </Badge>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-3 py-4">
        {query ? (
          <div className="space-y-6">
            {/* Playlists Results */}
            {results.playlists.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded bg-primary/10">
                    <Disc className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold">
                    Playlists
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({results.playlists.length})
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {results.playlists.map((playlist) => (
                    <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                      <div className="group relative rounded bg-card border border-border hover:bg-muted/30 transition-colors">
                        <div className="p-2 flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Music className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate text-sm">
                              {playlist.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{playlist.duration || "Unknown"}</span>
                              {playlist.date && (
                                <span>{formatDate(playlist.date)}</span>
                              )}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play
                              className="w-3 h-3 text-primary"
                              fill="currentColor"
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Songs Results */}
            {results.songs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-outfit">
                    Tracks
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({results.songs.length})
                    </span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {results.songs.map((song) => (
                    <Link key={song.id} href={`/playlist/${song.playlist.id}`}>
                      <Card className="card-hover group">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                              <Music className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {song.name}
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {song.artist.name}
                                </span>
                                {song.album && (
                                  <span className="flex items-center gap-1">
                                    <Disc className="w-3 h-3" />
                                    {song.album.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs">
                                {song.playlist.name}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Artists Results */}
            {results.artists.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-outfit">
                    Artists
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({results.artists.length})
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.artists.map((artist) => (
                    <Card key={artist.id} className="card-hover group">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {artist.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {artist._count.songs} tracks
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {totalResults === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  No results found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                  Try searching with different keywords or check your spelling.
                </p>
                <Button asChild>
                  <Link href="/">Browse All Playlists</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center">
              <Search className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Start your musical journey
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Search for playlists, tracks, or artists to discover your perfect
              rock soundtrack. Your entire collection is just a search away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">
                  <Music className="w-4 h-4 mr-2" />
                  Browse Playlists
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
