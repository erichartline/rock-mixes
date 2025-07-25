import Link from "next/link"
import { SearchWrapper } from "@/components/search-wrapper"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import prisma from "../lib/prisma"
import { formatDate, formatDuration } from "@/lib/utils"

interface Playlist {
  id: number
  name: string
  date: Date | null
  duration: string | null
}

async function getPlaylists(): Promise<Playlist[]> {
  const playlists = await prisma.playlist.findMany({
    orderBy: {
      date: "desc",
    },
  })
  return playlists
}

export default async function HomePage() {
  const playlists = await getPlaylists()

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Rock Mixes
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse and discover your rock music playlists
          </p>
        </div>

        <SearchWrapper className="w-full max-w-md" />

        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playlists.map((playlist) => (
                <TableRow key={playlist.id}>
                  <TableCell>
                    <Link
                      href={`/playlist/${playlist.id}`}
                      className="font-medium text-primary hover:underline">
                      {playlist.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {playlist.date ? formatDate(playlist.date) : "Unknown"}
                  </TableCell>
                  <TableCell>{playlist.duration || "Unknown"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
