import prisma from "./prisma"

export interface SearchResult {
  id: number
  name: string
  type: "playlist" | "song" | "artist"
  score: number
  matchedFields: string[]
}

export interface DetailedSearchResults {
  playlists: Array<{
    id: number
    name: string
    date: Date | null
    duration: number | null
    score: number
    matchedFields: string[]
  }>
  songs: Array<{
    id: number
    name: string
    artist: { name: string }
    album: { name: string } | null
    playlist: { id: number; name: string }
    duration: number | null
    score: number
    matchedFields: string[]
  }>
  artists: Array<{
    id: number
    name: string
    _count: { songs: number }
    score: number
    matchedFields: string[]
  }>
}

export interface SearchSuggestion {
  text: string
  type: "playlist" | "song" | "artist" | "genre"
  count: number
}

/**
 * Sanitizes and normalizes search queries
 */
export function sanitizeQuery(query: string): string {
  if (!query || typeof query !== "string") {
    return ""
  }

  return (
    query
      .trim()
      .toLowerCase()
      // Remove special characters that could interfere with database queries
      .replace(/[^\w\s-&']/g, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      // Limit length to prevent overly long queries
      .slice(0, 100)
  )
}

/**
 * Validates search query and returns validation result
 */
export function validateSearchQuery(query: string): {
  isValid: boolean
  error?: string
  sanitized: string
} {
  const sanitized = sanitizeQuery(query)

  if (!sanitized) {
    return {
      isValid: false,
      error: "Search query cannot be empty",
      sanitized: "",
    }
  }

  if (sanitized.length < 2) {
    return {
      isValid: false,
      error: "Search query must be at least 2 characters long",
      sanitized,
    }
  }

  return {
    isValid: true,
    sanitized,
  }
}

/**
 * Calculates relevance score for search results
 */
function calculateRelevanceScore(
  searchTerm: string,
  targetText: string,
  fieldWeight: number = 1,
): number {
  const search = searchTerm.toLowerCase()
  const target = targetText.toLowerCase()

  let score = 0

  // Exact match gets highest score
  if (target === search) {
    score += 100 * fieldWeight
  }
  // Starts with search term
  else if (target.startsWith(search)) {
    score += 75 * fieldWeight
  }
  // Contains search term as whole word
  else if (new RegExp(`\\b${search}\\b`).test(target)) {
    score += 50 * fieldWeight
  }
  // Contains search term anywhere
  else if (target.includes(search)) {
    score += 25 * fieldWeight
  }

  // Bonus for shorter matches (more specific)
  if (score > 0) {
    const lengthBonus = Math.max(0, 50 - target.length) * 0.1
    score += lengthBonus * fieldWeight
  }

  return score
}

/**
 * Searches playlists with ranking and scoring
 */
export async function searchPlaylists(
  query: string,
  limit: number = 10,
): Promise<DetailedSearchResults["playlists"]> {
  const validation = validateSearchQuery(query)
  if (!validation.isValid) {
    return []
  }

  const searchTerm = validation.sanitized

  const playlists = await prisma.playlist.findMany({
    where: {
      name: {
        contains: searchTerm,
      },
    },
    select: {
      id: true,
      name: true,
      date: true,
      duration: true,
    },
    take: limit * 2, // Get more results for better ranking
  })

  return playlists
    .map((playlist) => {
      const nameScore = calculateRelevanceScore(searchTerm, playlist.name, 1.0)
      const matchedFields: string[] = []

      if (nameScore > 0) {
        matchedFields.push("name")
      }

      return {
        ...playlist,
        score: nameScore,
        matchedFields,
      }
    })
    .filter((playlist) => playlist.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Searches songs with ranking and scoring
 */
export async function searchSongs(
  query: string,
  limit: number = 20,
): Promise<DetailedSearchResults["songs"]> {
  const validation = validateSearchQuery(query)
  if (!validation.isValid) {
    return []
  }

  const searchTerm = validation.sanitized

  const songs = await prisma.song.findMany({
    where: {
      OR: [
        {
          name: {
            contains: searchTerm,
          },
        },
        {
          artist: {
            name: {
              contains: searchTerm,
            },
          },
        },
        {
          album: {
            name: {
              contains: searchTerm,
            },
          },
        },
      ],
    },
    include: {
      artist: {
        select: { name: true },
      },
      album: {
        select: { name: true },
      },
      playlist: {
        select: { id: true, name: true },
      },
    },
    take: limit * 2, // Get more results for better ranking
  })

  return songs
    .map((song) => {
      const nameScore = calculateRelevanceScore(searchTerm, song.name, 1.0)
      const artistScore = calculateRelevanceScore(
        searchTerm,
        song.artist.name,
        0.8,
      )
      const albumScore = song.album
        ? calculateRelevanceScore(searchTerm, song.album.name, 0.6)
        : 0

      const totalScore = nameScore + artistScore + albumScore
      const matchedFields: string[] = []

      if (nameScore > 0) matchedFields.push("name")
      if (artistScore > 0) matchedFields.push("artist")
      if (albumScore > 0) matchedFields.push("album")

      return {
        id: song.id,
        name: song.name,
        artist: song.artist,
        album: song.album,
        playlist: song.playlist,
        duration: song.duration,
        score: totalScore,
        matchedFields,
      }
    })
    .filter((song) => song.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Searches artists with ranking and scoring
 */
export async function searchArtists(
  query: string,
  limit: number = 10,
): Promise<DetailedSearchResults["artists"]> {
  const validation = validateSearchQuery(query)
  if (!validation.isValid) {
    return []
  }

  const searchTerm = validation.sanitized

  const artists = await prisma.artist.findMany({
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
    take: limit * 2, // Get more results for better ranking
  })

  return artists
    .map((artist) => {
      const nameScore = calculateRelevanceScore(searchTerm, artist.name, 1.0)
      const matchedFields: string[] = []

      if (nameScore > 0) {
        matchedFields.push("name")
      }

      // Bonus score for artists with more songs (popular artists)
      const popularityBonus = Math.min(artist._count.songs * 0.1, 5)

      return {
        id: artist.id,
        name: artist.name,
        _count: artist._count,
        score: nameScore + popularityBonus,
        matchedFields,
      }
    })
    .filter((artist) => artist.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Comprehensive search across all entity types
 */
export async function searchAll(
  query: string,
  limits: {
    playlists?: number
    songs?: number
    artists?: number
  } = {},
): Promise<DetailedSearchResults> {
  const validation = validateSearchQuery(query)
  if (!validation.isValid) {
    return {
      playlists: [],
      songs: [],
      artists: [],
    }
  }

  const [playlists, songs, artists] = await Promise.all([
    searchPlaylists(query, limits.playlists || 10),
    searchSongs(query, limits.songs || 20),
    searchArtists(query, limits.artists || 10),
  ])

  return {
    playlists,
    songs,
    artists,
  }
}

/**
 * Generates search suggestions based on existing data
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 10,
): Promise<SearchSuggestion[]> {
  const validation = validateSearchQuery(query)
  if (!validation.isValid) {
    return []
  }

  const searchTerm = validation.sanitized
  const suggestions: SearchSuggestion[] = []

  // Get playlist suggestions
  const playlists = await prisma.playlist.findMany({
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
    take: 5,
  })

  playlists.forEach((playlist) => {
    suggestions.push({
      text: playlist.name,
      type: "playlist",
      count: playlist._count.songs,
    })
  })

  // Get artist suggestions
  const artists = await prisma.artist.findMany({
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
    take: 5,
  })

  artists.forEach((artist) => {
    suggestions.push({
      text: artist.name,
      type: "artist",
      count: artist._count.songs,
    })
  })

  // Get genre suggestions
  const genres = await prisma.genre.findMany({
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
    take: 3,
  })

  genres.forEach((genre) => {
    suggestions.push({
      text: genre.name,
      type: "genre",
      count: genre._count.songs,
    })
  })

  // Sort by relevance and count
  return suggestions
    .sort((a, b) => {
      const aScore = calculateRelevanceScore(searchTerm, a.text)
      const bScore = calculateRelevanceScore(searchTerm, b.text)
      if (aScore !== bScore) {
        return bScore - aScore
      }
      return b.count - a.count
    })
    .slice(0, limit)
}

/**
 * Highlights matching text in search results
 */
export function highlightMatches(text: string, query: string): string {
  const validation = validateSearchQuery(query)
  if (!validation.isValid) {
    return text
  }

  const searchTerm = validation.sanitized
  const regex = new RegExp(`(${searchTerm})`, "gi")
  return text.replace(regex, "<mark>$1</mark>")
}

/**
 * Gets popular search terms based on existing data
 */
export async function getPopularSearchTerms(
  limit: number = 10,
): Promise<SearchSuggestion[]> {
  const [topArtists, topGenres] = await Promise.all([
    prisma.artist.findMany({
      select: {
        name: true,
        _count: {
          select: { songs: true },
        },
      },
      orderBy: {
        songs: {
          _count: "desc",
        },
      },
      take: 5,
    }),
    prisma.genre.findMany({
      select: {
        name: true,
        _count: {
          select: { songs: true },
        },
      },
      orderBy: {
        songs: {
          _count: "desc",
        },
      },
      take: 5,
    }),
  ])

  const suggestions: SearchSuggestion[] = []

  topArtists.forEach((artist) => {
    suggestions.push({
      text: artist.name,
      type: "artist",
      count: artist._count.songs,
    })
  })

  topGenres.forEach((genre) => {
    suggestions.push({
      text: genre.name,
      type: "genre",
      count: genre._count.songs,
    })
  })

  return suggestions.sort((a, b) => b.count - a.count).slice(0, limit)
}
