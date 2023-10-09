import fs from "fs"
import csv from "csv-parser"
import axios from "axios"
import qs from "querystring"
import "dotenv/config"

const inputFile = "data/tracks_v3.csv"
const outputFile = "updated_tracks.csv"

async function getAccessToken() {
  const credentials = {
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    grant_type: "client_credentials",
  }

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    qs.stringify(credentials),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${credentials.client_id}:${credentials.client_secret}`,
        ).toString("base64")}`,
      },
    },
  )

  return response.data.access_token
}

async function getSpotifyData(accessToken, song, artist) {
  const apiUrl = `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(
    song,
  )}%20artist:${encodeURIComponent(artist)}&type=track&limit=1`

  const response = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.data.tracks.items[0]) {
    const track = response.data.tracks.items[0]
    const { album, external_urls } = track
    const year = album.release_date.split("-")[0]

    return {
      album: album.name,
      year,
      url: external_urls.spotify,
    }
  } else {
    return {
      album: "N/A",
      year: "N/A",
      url: "N/A",
    }
  }
}

;(async () => {
  const accessToken = await getAccessToken()
  const results = []

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async (row) => {
      const writeStream = fs.createWriteStream(outputFile)
      writeStream.write(
        "Playlist Name,Track #,Artist,Song,Duration,Genre,URL,Album,Year\n",
      ) // headers

      for (const row of results) {
        const { album, year, url } = await getSpotifyData(
          accessToken,
          row["Song"],
          row["Artist"],
        )
        console.log(`Song: ${row["Song"]}, Album: ${album}, Year: ${year}`)
        row["Album"] = album
        row["Year"] = year
        row["URL"] = url
        writeStream.write(Object.values(row).join(",") + "\n")
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1-second delay
      }

      writeStream.end()
      console.log(`CSV updated and saved as ${outputFile}`)
    })
})()
