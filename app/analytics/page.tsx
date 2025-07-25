import Link from "next/link"
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getArtistFrequency,
  getGenreDistribution,
  getTimelineData,
  getDurationStats,
  getDecadeDistribution,
  getPlaylistStats,
} from "@/lib/analytics"
import { formatDuration } from "@/lib/utils"

export default async function AnalyticsPage() {
  const [
    artistData,
    genreData,
    timelineData,
    durationStats,
    decadeData,
    playlistStats,
  ] = await Promise.all([
    getArtistFrequency(15),
    getGenreDistribution(),
    getTimelineData(),
    getDurationStats(),
    getDecadeDistribution(),
    getPlaylistStats(),
  ])

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Insights and statistics about your rock music collection
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Playlists
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {playlistStats.totalPlaylists}
              </div>
              <p className="text-xs text-muted-foreground">
                Rock music collections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {playlistStats.totalSongs}
              </div>
              <p className="text-xs text-muted-foreground">
                Tracks in collection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Artists
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {playlistStats.totalArtists}
              </div>
              <p className="text-xs text-muted-foreground">Unique artists</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Albums
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {playlistStats.totalAlbums}
              </div>
              <p className="text-xs text-muted-foreground">Album releases</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Artists */}
          <Card>
            <CardHeader>
              <CardTitle>Most Featured Artists</CardTitle>
              <CardDescription>
                Artists with the most tracks in your playlists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {artistData.slice(0, 10).map((artist, index) => (
                  <div key={artist.name} className="flex items-center">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {index + 1}. {artist.name}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {artist.count} songs ({artist.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{
                            width: `${
                              (artist.count / artistData[0].count) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Genre Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Genre Distribution</CardTitle>
              <CardDescription>
                Breakdown of music genres in your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {genreData.slice(0, 8).map((genre) => (
                  <div key={genre.name} className="flex items-center">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {genre.name}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {genre.count} songs ({genre.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${
                              (genre.count / genreData[0].count) * 100
                            }%`,
                            backgroundColor: genre.fill,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Playlist Creation Timeline</CardTitle>
              <CardDescription>
                How your collection has grown over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timelineData.map((period) => (
                  <div
                    key={period.period}
                    className="flex items-center justify-between">
                    <span className="text-sm font-medium">{period.period}</span>
                    <div className="text-sm text-muted-foreground">
                      {period.playlists} playlists • {period.songs} songs
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Duration Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Duration Statistics</CardTitle>
              <CardDescription>
                Analysis of song lengths in your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Duration</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(durationStats.averageDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Duration</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(durationStats.totalDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Shortest Song</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(durationStats.shortestSong)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Longest Song</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(durationStats.longestSong)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Music by Decade</CardTitle>
            <CardDescription>
              Distribution of music across different decades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {decadeData.map((decade) => (
                <div key={decade.decade} className="text-center">
                  <div className="text-2xl font-bold">{decade.count}</div>
                  <div className="text-sm text-muted-foreground">
                    {decade.decade}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {decade.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
