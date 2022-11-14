import prisma from "../lib/prisma"
import playlistsData from "../data/playlists.json"

const formatDuration = (duration: string) => {
  if (duration === "") {
    return duration
  }

  const splitDuration = duration.split(":")
  const mins2secs = +splitDuration[0] * 60
  const totalSeconds = mins2secs + +splitDuration[1]
  return totalSeconds.toString()
}

const run = async () => {
  const songs = playlistsData.map((playlist) => [...playlist.songs]).flat()
  const artists = songs.map((song) => [...song.artists]).flat()
  const genres = artists.map((artist) => [...artist.genres]).flat()
  const albums = songs.map((song) => ({ ...song.album })).flat()

  await Promise.all(
    genres.map(async (genre) => {
      return prisma.genre.upsert({
        where: { name: genre.name },
        update: {},
        create: {
          name: genre.name,
        },
      })
    }),
  )

  await Promise.all(
    albums.map(async (album) => {
      if (album.name === "") {
        return
      }
      const albumCount = await prisma.album.count({
        where: {
          name: album.name,
        },
      })
      if (albumCount < 1) {
        return prisma.album.create({
          data: {
            name: album.name,
            year: album.year,
          },
        })
      }
    }),
  )

  await Promise.all(
    artists.map(async (artist) => {
      // artist.genres.forEach(async (genre) => {
      //   if (genre.name === "") {
      //     return
      //   }
      //   const genreCount = await prisma.genre.count({
      //     where: {
      //       name: genre.name,
      //     },
      //   })
      //   if (genreCount < 1) {
      //     return prisma.genre.create({
      //       data: {
      //         name: genre.name,
      //       },
      //     })
      //   }
      // })

      return prisma.artist.upsert({
        where: { name: artist.name },
        update: {},
        create: {
          name: artist.name,
          // genres: {
          //   connect: genres.map((genre) => ({
          //     name: genre.name,
          //   })),
          // },
        },
      })
    }),
  )

  // await Promise.all(
  //   songs.map(async (song) => {
  //     return prisma.song.create({
  //       data: {
  //         name: song.name,
  //         artists: {
  //           connect: song.artists.map((artist) => ({
  //             name: artist.name,
  //           })),
  //         },
  //         duration: formatDuration(song.duration),
  //         year: song.year,
  //         spotifyURL: song.spotifyURL,
  //         // album: {
  //         //   connect: { name: song.album.name },
  //         // },
  //       },
  //     })
  //   }),
  // )

  // await Promise.all(
  //   playlistsData.map(async (playlist) => {
  //     return prisma.playlist.upsert({
  //       where: { name: playlist.name },
  //       update: {},
  //       create: {
  //         name: playlist.name,
  //         date: playlist.date,
  //         duration: formatDuration(playlist.duration),
  //         spotifyURL: playlist.spotifyURL,
  //         notes: playlist.notes,
  //         songs: {
  //           create: playlist.songs.map((song) => ({
  //             name: song.name,
  //             artists: {
  //               create: song.artists.map((artist) => ({
  //                 name: artist.name,
  //                 genres: {
  //                   create: artist.genres.map((genre) => ({
  //                     name: genre.name,
  //                   })),
  //                 },
  //               })),
  //             },
  //             duration: formatDuration(song.duration),
  //             year: song.year,
  //             spotifyURL: song.spotifyURL,
  //             album: {},
  //           })),
  //         },
  //       },
  //     })
  //   }),
  // )

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
