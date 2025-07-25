// @ts-nocheck
import { PrismaClient } from "@prisma/client"
import { createReadStream } from "fs"
import { createInterface } from "readline"

function parseCSVLine(line: string): string[] {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"' && (i === 0 || line[i - 1] === ",")) {
      inQuotes = true
    } else if (
      char === '"' &&
      inQuotes &&
      (i === line.length - 1 || line[i + 1] === ",")
    ) {
      inQuotes = false
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

async function processCSVRobust(filePath: string) {
  return new Promise<any[]>((resolve, reject) => {
    const items = []
    let headers: string[] = []
    let lineCount = 0
    let pendingLine = ""
    let skippedCount = 0

    const rl = createInterface({
      input: createReadStream(filePath),
      crlfDelay: Infinity,
    })

    rl.on("line", (line) => {
      lineCount++

      // Combine with any pending line from previous iteration
      const fullLine = pendingLine + line

      // Simple heuristic: if line doesn't end with a year (4 digits), it might be incomplete
      const endsWithYear = /,\d{4}$/.test(fullLine.trim())

      if (endsWithYear || lineCount === 1) {
        // Process this line
        const values = parseCSVLine(fullLine)

        if (lineCount === 1) {
          headers = values
        } else if (values.length === headers.length) {
          const record = {}
          headers.forEach((header, index) => {
            record[header] = values[index] || ""
          })
          items.push(record)

          if (items.length % 200 === 0) {
            console.log(`  Processed ${items.length} records...`)
          }
        } else {
          skippedCount++
        }

        pendingLine = ""
      } else {
        // This line appears incomplete, save it for next iteration
        pendingLine = fullLine + " "
      }
    })

    rl.on("close", () => {
      console.log(
        `CSV processing completed. Read ${items.length} records, skipped ${skippedCount} malformed lines.`,
      )
      resolve(items)
    })

    rl.on("error", (error) => {
      console.error("CSV parsing error:", error)
      reject(error)
    })
  })
}

const prisma = new PrismaClient()

async function populateDatabase(tracksPath: string) {
  console.log("Starting to populate database...")

  // Get all tracks from CSV using robust parser
  console.log("Reading tracks from CSV...")
  const tracks = await processCSVRobust(tracksPath)
  console.log(`Loaded ${tracks.length} tracks from CSV`)

  // Extract unique playlist names
  console.log("Extracting unique playlist names...")
  const playlistNames = tracks
    .map((track) => track["Playlist Name"])
    .filter((name) => name && name.trim() && name !== "Playlist Name")

  // Get unique playlist names
  const uniquePlaylists = []
  for (const name of playlistNames) {
    if (!uniquePlaylists.includes(name)) {
      uniquePlaylists.push(name)
    }
  }
  console.log(
    `Found ${uniquePlaylists.length} unique playlists (${playlistNames.length} total tracks)`,
  )

  if (uniquePlaylists.length === 0) {
    console.error("No playlists found! Exiting...")
    return
  }

  // Create playlists first
  console.log("Creating playlists...")
  for (const playlistName of uniquePlaylists) {
    try {
      await prisma.playlist.upsert({
        where: { name: playlistName },
        update: {},
        create: {
          name: playlistName,
          duration: "0:00",
          notes: "",
          url: "",
        },
      })
    } catch (error) {
      console.error(
        `✗ Error creating playlist "${playlistName}":`,
        error.message,
      )
      throw error
    }
  }

  console.log(`✓ Created ${uniquePlaylists.length} playlists`)

  // Create songs
  console.log("Creating songs...")
  let successCount = 0
  let errorCount = 0

  for (const track of tracks) {
    try {
      // Skip if no playlist name or it's the header
      if (
        !track["Playlist Name"] ||
        !track["Playlist Name"].trim() ||
        track["Playlist Name"] === "Playlist Name"
      ) {
        continue
      }

      // Ensure the artist exists
      let artist = await prisma.artist.findFirst({
        where: { name: track.Artist },
      })

      if (!artist) {
        artist = await prisma.artist.create({
          data: { name: track.Artist },
        })
      }

      // Create the song with all relationships
      await prisma.song.create({
        data: {
          track: parseInt(track["Track #"]),
          name: track.Song,
          duration: track.Duration,
          url: track.URL || "",
          artist: {
            connectOrCreate: {
              where: { name: track.Artist },
              create: { name: track.Artist },
            },
          },
          genre: {
            connectOrCreate: {
              where: { name: track.Genre },
              create: { name: track.Genre },
            },
          },
          playlist: {
            connect: {
              name: track["Playlist Name"],
            },
          },
          album: {
            connectOrCreate: {
              where: {
                name_artistId: {
                  name: track.Album,
                  artistId: artist.id,
                },
              },
              create: {
                name: track.Album,
                year: track.Year ? parseInt(track.Year) : null,
                artist: {
                  connect: {
                    id: artist.id,
                  },
                },
              },
            },
          },
        },
      })
      successCount++

      if (successCount % 200 === 0) {
        console.log(`✓ Created ${successCount} songs so far...`)
      }
    } catch (error) {
      console.error(
        `✗ Error creating song "${track.Song}" by ${track.Artist}:`,
        error.message,
      )
      errorCount++
    }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`✓ Successfully created: ${successCount} songs`)
  console.log(`✓ Created: ${uniquePlaylists.length} playlists`)
  console.log(`✗ Errors: ${errorCount} songs`)
  console.log(`📊 Total processed: ${tracks.length} tracks`)

  await prisma.$disconnect()
  console.log("Database population completed!")
}

const tracksPath = "data/tracks_v4.csv"
populateDatabase(tracksPath).catch((error) => {
  console.error("Failed to populate database:", error)
  process.exit(1)
})
