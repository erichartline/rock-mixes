import prisma from "./prisma"
import { getDecadeFromYear, groupByProperty, parseDuration } from "./utils"

export interface ArtistFrequencyData {
  name: string
  count: number
  percentage: number
}

export interface GenreDistributionData {
  name: string
  count: number
  percentage: number
  fill: string
}

export interface TimelineData {
  period: string
  playlists: number
  songs: number
}

export interface DurationStats {
  averageDuration: number
  totalDuration: number
  shortestSong: number
  longestSong: number
}

export interface DecadeData {
  decade: string
  count: number
  percentage: number
}

export async function getArtistFrequency(
  limit: number = 20,
): Promise<ArtistFrequencyData[]> {
  const artistCounts = await prisma.song.groupBy({
    by: ["artistId"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: limit,
  })

  const totalSongs = await prisma.song.count()

  const artistsWithNames = await Promise.all(
    artistCounts.map(async (item) => {
      const artist = await prisma.artist.findUnique({
        where: { id: item.artistId },
        select: { name: true },
      })
      return {
        name: artist?.name || "Unknown",
        count: item._count.id,
        percentage: Math.round((item._count.id / totalSongs) * 100 * 100) / 100,
      }
    }),
  )

  return artistsWithNames
}

export async function getGenreDistribution(): Promise<GenreDistributionData[]> {
  const genreCounts = await prisma.song.groupBy({
    by: ["genreId"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
  })

  const totalSongs = await prisma.song.count()
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
    "#8dd1e1",
    "#d084d0",
    "#ffb347",
    "#87ceeb",
    "#dda0dd",
    "#98fb98",
  ]

  const genresWithNames = await Promise.all(
    genreCounts.map(async (item, index) => {
      const genre = await prisma.genre.findUnique({
        where: { id: item.genreId },
        select: { name: true },
      })
      return {
        name: genre?.name || "Unknown",
        count: item._count.id,
        percentage: Math.round((item._count.id / totalSongs) * 100 * 100) / 100,
        fill: colors[index % colors.length],
      }
    }),
  )

  return genresWithNames
}

export async function getTimelineData(): Promise<TimelineData[]> {
  const playlists = await prisma.playlist.findMany({
    select: {
      date: true,
      _count: {
        select: { songs: true },
      },
    },
    where: {
      date: {
        not: null,
      },
    },
  })

  const groupedByYear = groupByProperty(
    playlists.map((p) => ({
      year: p.date?.getFullYear() || 0,
      playlistCount: 1,
      songCount: p._count.songs,
    })),
    "year",
  )

  const timelineData: TimelineData[] = Object.entries(groupedByYear)
    .map(([year, data]) => ({
      period: year,
      playlists: data.length,
      songs: data.reduce((sum, item) => sum + item.songCount, 0),
    }))
    .sort((a, b) => a.period.localeCompare(b.period))

  return timelineData
}

export async function getDurationStats(): Promise<DurationStats> {
  const songs = await prisma.song.findMany({
    select: { duration: true },
    where: {
      duration: {
        not: "",
      },
    },
  })

  const durations = songs
    .map((s) => parseDuration(s.duration || ""))
    .filter((d): d is number => d > 0)

  if (durations.length === 0) {
    return {
      averageDuration: 0,
      totalDuration: 0,
      shortestSong: 0,
      longestSong: 0,
    }
  }

  const totalDuration = durations.reduce((sum, d) => sum + d, 0)
  const averageDuration = Math.round(totalDuration / durations.length)
  const shortestSong = Math.min(...durations)
  const longestSong = Math.max(...durations)

  return {
    averageDuration,
    totalDuration,
    shortestSong,
    longestSong,
  }
}

export async function getDecadeDistribution(): Promise<DecadeData[]> {
  const albums = await prisma.album.findMany({
    select: { year: true },
    where: {
      year: {
        not: null,
      },
    },
  })

  const decades = albums
    .map((album) => getDecadeFromYear(album.year || 0))
    .filter((decade) => decade !== "Unknown")

  const decadeCounts = decades.reduce(
    (acc, decade) => {
      acc[decade] = (acc[decade] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const total = Object.values(decadeCounts).reduce(
    (sum, count) => sum + count,
    0,
  )

  const decadeData: DecadeData[] = Object.entries(decadeCounts)
    .map(([decade, count]) => ({
      decade,
      count,
      percentage: Math.round((count / total) * 100 * 100) / 100,
    }))
    .sort((a, b) => a.decade.localeCompare(b.decade))

  return decadeData
}

export async function getPlaylistStats() {
  const [totalPlaylists, totalSongs, totalArtists, totalAlbums] =
    await Promise.all([
      prisma.playlist.count(),
      prisma.song.count(),
      prisma.artist.count(),
      prisma.album.count(),
    ])

  return {
    totalPlaylists,
    totalSongs,
    totalArtists,
    totalAlbums,
  }
}
