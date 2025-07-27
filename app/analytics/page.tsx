import Link from "next/link"
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Music,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "../../lib/analytics"
import {
  ArtistFrequencyChart,
  GenreDistributionChart,
  TimelineChart,
} from "@/components/charts"

export default async function AnalyticsPage() {
  const [
    artistFrequency,
    genreDistribution,
    timelineData,
    durationStats,
    decadeDistribution,
    playlistStats,
  ] = await Promise.all([
    getArtistFrequency(),
    getGenreDistribution(),
    getTimelineData(),
    getDurationStats(),
    getDecadeDistribution(),
    getPlaylistStats(),
  ])

  const topDecades = decadeDistribution.slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-pink-500/5 to-background" />

        <div className="relative container mx-auto px-4 py-12">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Page Header */}
          <div className="max-w-3xl">
            <div className="mb-8">
              <Badge variant="outline" className="mb-4">
                <BarChart3 className="w-3 h-3 mr-1" />
                Analytics Dashboard
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold font-outfit mb-4">
                <span className="gradient-text">Music Insights</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover patterns, trends, and insights from your rock music
                collection
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary mb-1">
                  {playlistStats.totalPlaylists}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Playlists
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary mb-1">
                  {playlistStats.totalSongs}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Tracks
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary mb-1">
                  {playlistStats.totalArtists}
                </div>
                <div className="text-sm text-muted-foreground">
                  Unique Artists
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary mb-1">
                  {Math.round(
                    playlistStats.totalSongs / playlistStats.totalPlaylists,
                  ) || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg per Playlist
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Top Artists */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-3xl font-bold font-outfit">
                    <Users className="w-6 h-6 text-primary" />
                    Top Artists
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Most featured artists in your collection
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Users className="w-3 h-3" />
                  {artistFrequency.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ArtistFrequencyChart data={artistFrequency.slice(0, 10)} />
            </CardContent>
          </Card>

          {/* Genres & Timeline */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Genre Distribution */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Genre Distribution
                    </CardTitle>
                    <CardDescription>
                      Musical styles in your collection
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {genreDistribution.length} genres
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <GenreDistributionChart data={genreDistribution} />
              </CardContent>
            </Card>

            {/* Timeline Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Collection Timeline
                </CardTitle>
                <CardDescription>Playlist creation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <TimelineChart data={timelineData} variant="area" />
              </CardContent>
            </Card>
          </div>

          {/* Duration Stats & Decades */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Duration Statistics */}
            <Card className="bg-gradient-to-br from-primary/5 to-pink-500/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Clock className="w-5 h-5" />
                  Duration Insights
                </CardTitle>
                <CardDescription>Track length statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {Math.round(durationStats.averageDuration)}s
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Length
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {durationStats.longestSong}s
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Longest Track
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {durationStats.shortestSong}s
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Shortest Track
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {Math.round(durationStats.totalDuration / 3600)}h
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Hours
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Music by Decade
                </CardTitle>
                <CardDescription>
                  Era distribution of your music
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topDecades.map((decade) => (
                  <div key={decade.decade} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {decade.decade}s
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {decade.count} albums
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (decade.count / topDecades[0].count) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Collection Overview */}
          <Card className="bg-gradient-to-r from-primary/10 to-pink-500/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Music className="w-5 h-5" />
                Collection Overview
              </CardTitle>
              <CardDescription>
                Your rock music library at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {genreDistribution.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Unique Genres
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {playlistStats.totalAlbums}
                  </div>
                  <div className="text-sm text-muted-foreground">Albums</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {Math.round(
                      playlistStats.totalSongs / playlistStats.totalPlaylists,
                    ) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Songs/Playlist
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {Math.round(
                      durationStats.totalDuration /
                        60 /
                        playlistStats.totalPlaylists,
                    )}
                    m
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Playlist Length
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/search">
              <Card className="card-hover group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        Explore Your Music
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Search and discover tracks in your collection
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/">
              <Card className="card-hover group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        Browse Playlists
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        View all your curated music collections
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
