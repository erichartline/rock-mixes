import prisma from "../lib/prisma"
import playlistsData from "../data/playlists.json"

const formatDuration = (duration: string) => {
  const splitDuration = duration.split(":")
  const mins2secs = +splitDuration[0] * 60
  const totalSeconds = mins2secs + +splitDuration[1]
  return totalSeconds.toString()
}

const run = async () => {
  // Do I want to add artists first?
  // Need to explore connect option
  await Promise.all(
    playlistsData.map(async (playlist) => {
      return prisma.playlist.upsert({
        where: { name: playlist.name },
        update: {},
        create: {
          name: playlist.name,
          date: playlist.date,
          duration: formatDuration(playlist.duration),
          spotifyURL: playlist.spotifyURL,
          notes: playlist.notes,
          songs: {
            create: playlist.songs.map((song) => ({
              name: song.name,
              artists: [],
              duration: song.duration,
              year: song.year,
              spotifyURL: song.spotifyURL,
              album: {},
            })),
          },
        },
      })
      // return prisma.playlist.upsert({})
    }),
  )

  // await Promise.all(
  //   artistsData.map(async (artist) => {
  //     return prisma.artist.upsert({
  //       where: { name: artist.name },
  //       update: {},
  //       create: {
  //         name: artist.name,
  //         songs: {
  //           create: artist.songs.map((song) => ({
  //             name: song.name,
  //             duration: song.duration,
  //             url: song.url,
  //           })),
  //         },
  //       },
  //     })
  //   }),
  // )
  // const songs = await prisma.song.findMany({})
  // await Promise.all(
  //   new Array(10).fill(1).map(async (_, index) => {
  //     return prisma.playlist.create({
  //       data: {
  //         name: `Playlist #${index + 1}`,
  //         user: {
  //           connect: { id: user.id },
  //         },
  //         songs: {
  //           connect: songs.map((song) => ({
  //             id: song.id,
  //           })),
  //         },
  //       },
  //     })
  //   }),
  // )
}

run()
