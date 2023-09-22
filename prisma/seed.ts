import { PrismaClient } from "@prisma/client"
import fs from "fs"
import csv from "csv-parser"

function formatDate(input: string) {
  const [month, day, year] = input.split("/")
  return new Date(`${year}-${month}-${day}`).toISOString()
}

async function processCSV(filePath: string, processFunction) {
  return new Promise<void>((resolve, reject) => {
    const items = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => items.push(data))
      .on("end", async () => {
        try {
          for (const item of items) {
            await processFunction(item)
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
  })
}

const prisma = new PrismaClient()

async function populateDatabase(mixesPath: string, tracksPath: string) {
  await processCSV(mixesPath, async (mix) => {
    const playlistData = {
      name: mix.Name,
      duration: mix.Duration,
      notes: mix.Notes,
      url: mix.URL,
    }

    if (mix.Date) {
      playlistData["date"] = formatDate(mix.Date)
    }

    const createdPlaylist = await prisma.playlist.create({
      data: playlistData,
    })
    console.log(`Created playlist: ${createdPlaylist.name}`)
  })

  await processCSV(tracksPath, async (track) => {
    // 1. Ensure the artist exists
    let artist = await prisma.artist.findFirst({
      where: { name: track.Artist },
    })

    // 2. If the artist doesn't exist, create it
    if (!artist) {
      artist = await prisma.artist.create({
        data: { name: track.Artist },
      })
    }

    const songData = {
      track: parseInt(track["Track #"]),
      name: track.Song,
      duration: track.Duration,
      url: track.URL,
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
              artistId: artist?.id, // Use the found artist's ID here
            },
          },
          create: {
            name: track.Album,
            artist: {
              connect: {
                name: track.Artist,
              },
            },
          },
        },
      },
    }
    console.log(
      `Creating song: ${track.Song} for playlist: ${track["Playlist Name"]}`,
    )
    await prisma.song.create({
      data: songData,
    })
  })

  await prisma.$disconnect()
}

const mixesPath = "data/mixes.csv"
const tracksPath = "data/tracks.csv"
populateDatabase(mixesPath, tracksPath)
