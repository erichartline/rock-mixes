const { PrismaClient } = require("@prisma/client")
const axios = require("axios")
require("dotenv").config()

const prisma = new PrismaClient()

// Enhanced Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

// Rate limiting
let requestCount = 0
const MAX_REQUESTS_PER_SECOND = 5
const BATCH_SIZE = 50

async function getSpotifyAccessToken() {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
          ).toString("base64")}`,
        },
      },
    )
    return response.data.access_token
  } catch (error) {
    console.error("Error getting Spotify access token:", error.message)
    throw error
  }
}

async function searchSpotifyTrack(accessToken, artist, track, album = null) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200)) // Rate limiting

    let query = `artist:"${artist}" track:"${track}"`
    if (album) {
      query += ` album:"${album}"`
    }

    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: "track",
        limit: 1,
        market: "US",
      },
    })

    const tracks = response.data.tracks.items
    if (tracks.length > 0) {
      const track = tracks[0]
      return {
        spotifyUrl: track.external_urls.spotify,
        previewUrl: track.preview_url,
        spotifyId: track.id,
        albumImageUrl: track.album.images[0]?.url,
        popularity: track.popularity,
        durationMs: track.duration_ms,
        explicit: track.explicit,
      }
    }
    return null
  } catch (error) {
    console.error(`Error searching for ${artist} - ${track}:`, error.message)
    return null
  }
}

async function getSpotifyAlbumData(accessToken, artist, album) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: `artist:"${artist}" album:"${album}"`,
        type: "album",
        limit: 1,
        market: "US",
      },
    })

    const albums = response.data.albums.items
    if (albums.length > 0) {
      const albumData = albums[0]
      return {
        spotifyUrl: albumData.external_urls.spotify,
        imageUrl: albumData.images[0]?.url,
        releaseDate: albumData.release_date,
        totalTracks: albumData.total_tracks,
        albumType: albumData.album_type,
      }
    }
    return null
  } catch (error) {
    console.error(
      `Error searching for album ${artist} - ${album}:`,
      error.message,
    )
    return null
  }
}

async function createSpotifyPlaylist(accessToken, playlistName, trackUris) {
  // This would require user authentication and playlist creation permissions
  // For now, we'll just return the search URL for the playlist
  const searchQuery = encodeURIComponent(playlistName)
  return `https://open.spotify.com/search/${searchQuery}`
}

async function enhancePlaylistData() {
  try {
    console.log("Getting Spotify access token...")
    const accessToken = await getSpotifyAccessToken()

    console.log("Fetching playlists from database...")
    const playlists = await prisma.playlist.findMany({
      include: {
        songs: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
    })

    console.log(`Found ${playlists.length} playlists to enhance`)

    for (const playlist of playlists) {
      console.log(`\nProcessing playlist: ${playlist.name}`)

      // Create a search URL for the playlist if it doesn't have one
      if (!playlist.url) {
        const playlistSearchUrl = `https://open.spotify.com/search/${encodeURIComponent(
          playlist.name,
        )}`
        await prisma.playlist.update({
          where: { id: playlist.id },
          data: { url: playlistSearchUrl },
        })
        console.log(`  Added search URL for playlist`)
      }

      // Process songs in batches
      for (let i = 0; i < playlist.songs.length; i += BATCH_SIZE) {
        const batch = playlist.songs.slice(i, i + BATCH_SIZE)
        console.log(
          `  Processing songs ${i + 1}-${Math.min(
            i + BATCH_SIZE,
            playlist.songs.length,
          )}`,
        )

        for (const song of batch) {
          if (!song.url) {
            const spotifyData = await searchSpotifyTrack(
              accessToken,
              song.artist.name,
              song.name,
              song.album?.name,
            )

            if (spotifyData) {
              await prisma.song.update({
                where: { id: song.id },
                data: {
                  url: spotifyData.spotifyUrl,
                  duration: spotifyData.durationMs,
                },
              })
              console.log(`    Enhanced: ${song.artist.name} - ${song.name}`)
            } else {
              console.log(`    Not found: ${song.artist.name} - ${song.name}`)
            }
          }
        }

        // Rate limiting between batches
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log("\nEnhancing album data...")
    const albums = await prisma.album.findMany({
      include: {
        artist: true,
      },
    })

    for (const album of albums) {
      if (!album.imageUrl) {
        const albumData = await getSpotifyAlbumData(
          accessToken,
          album.artist.name,
          album.name,
        )

        if (albumData) {
          // Note: We'd need to add imageUrl field to Album model
          console.log(`Enhanced album: ${album.artist.name} - ${album.name}`)
        }
      }
    }

    console.log("\nSpotify data enhancement completed!")
  } catch (error) {
    console.error("Error enhancing Spotify data:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the enhancement
if (require.main === module) {
  enhancePlaylistData()
    .then(() => {
      console.log("Enhancement process finished")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Enhancement process failed:", error)
      process.exit(1)
    })
}

module.exports = {
  enhancePlaylistData,
  searchSpotifyTrack,
  getSpotifyAlbumData,
}
