import { NextRequest, NextResponse } from "next/server"
import {
  getArtistFrequency,
  getGenreDistribution,
  getTimelineData,
  getDurationStats,
  getDecadeDistribution,
  getPlaylistStats,
} from "../../../lib/analytics"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"
    const limit = parseInt(searchParams.get("limit") || "20")

    let results: any = {}

    switch (type) {
      case "artists":
        results = await getArtistFrequency(limit)
        break

      case "genres":
        results = await getGenreDistribution()
        break

      case "timeline":
        results = await getTimelineData()
        break

      case "duration":
        results = await getDurationStats()
        break

      case "decades":
        results = await getDecadeDistribution()
        break

      case "stats":
        results = await getPlaylistStats()
        break

      case "all":
      default:
        results = {
          artists: await getArtistFrequency(limit),
          genres: await getGenreDistribution(),
          timeline: await getTimelineData(),
          duration: await getDurationStats(),
          decades: await getDecadeDistribution(),
          stats: await getPlaylistStats(),
        }
        break
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
