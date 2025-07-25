import { NextRequest, NextResponse } from "next/server"
import prisma from "../../../lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          error: "Query must be at least 2 characters long",
        },
        { status: 400 },
      )
    }

    const searchTerm = query.toLowerCase().trim()

    let results: any = {}

    if (type === "all" || type === "playlists") {
      results.playlists = await prisma.playlist.findMany({
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
        take: limit,
      })
    }

    if (type === "all" || type === "songs") {
      results.songs = await prisma.song.findMany({
        where: {
          name: {
            contains: searchTerm,
          },
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
        take: limit,
      })
    }

    if (type === "all" || type === "artists") {
      results.artists = await prisma.artist.findMany({
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
        take: limit,
      })
    }

    return NextResponse.json(results)
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
