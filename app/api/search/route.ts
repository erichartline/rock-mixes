import { NextRequest, NextResponse } from "next/server"
import {
  searchAll,
  searchPlaylists,
  searchSongs,
  searchArtists,
  validateSearchQuery,
  getSearchSuggestions,
} from "../../../lib/search"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const limit = parseInt(searchParams.get("limit") || "10")
    const suggestions = searchParams.get("suggestions") === "true"

    // Validate query
    if (!query) {
      return NextResponse.json(
        {
          error: "Query parameter 'q' is required",
        },
        { status: 400 },
      )
    }

    const validation = validateSearchQuery(query)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.error,
        },
        { status: 400 },
      )
    }

    // Handle search suggestions
    if (suggestions) {
      const suggestionResults = await getSearchSuggestions(query, limit)
      return NextResponse.json({ suggestions: suggestionResults })
    }

    let results: any = {}

    // Perform search based on type
    switch (type) {
      case "playlists":
        results.playlists = await searchPlaylists(query, limit)
        break

      case "songs":
        results.songs = await searchSongs(query, limit)
        break

      case "artists":
        results.artists = await searchArtists(query, limit)
        break

      case "all":
      default:
        results = await searchAll(query, {
          playlists: limit,
          songs: limit,
          artists: limit,
        })
        break
    }

    // Add metadata about the search
    const response = {
      ...results,
      metadata: {
        query: validation.sanitized,
        type,
        limit,
        totalResults:
          (results.playlists?.length || 0) +
          (results.songs?.length || 0) +
          (results.artists?.length || 0),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
