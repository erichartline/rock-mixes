import fs from "fs"
import csv from "csv-parser"
import axios from "axios"
import "dotenv/config"

const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY
const LAST_FM_URL = "http://ws.audioscrobbler.com/2.0/"

async function getSongDurationFromLastFM(songName, artistName) {
  try {
    const response = await axios.get(LAST_FM_URL, {
      params: {
        method: "track.getInfo",
        api_key: LAST_FM_API_KEY,
        artist: artistName,
        track: songName,
        format: "json",
      },
    })

    if (response.data.track && response.data.track.duration) {
      const durationMs = parseInt(response.data.track.duration, 10)
      const minutes = Math.floor(durationMs / 60000)
      const seconds = ((durationMs % 60000) / 1000).toFixed(0)

      return `${minutes}:${seconds.padStart(2, "0")}`
    } else {
      return "N/A"
    }
  } catch (error) {
    console.error(
      `Failed to fetch data for ${songName} by ${artistName}. Error: ${error.message}`,
    )
    return { tags: [], durationFormatted: "Unknown" }
  }
}

const inputFile = "data/tracks.csv"
const outputFile = "updated_tracks.csv"

function updateCsvWithDuration() {
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
        const duration = await getSongDurationFromLastFM(
          row["Song"],
          row["Artist"],
        )
        console.log(`Song: ${row["Song"]}, Duration: ${duration}`)
        row["Duration"] = duration
        writeStream.write(Object.values(row).join(",") + "\n")
      }

      writeStream.end()
      console.log(`CSV updated and saved as ${outputFile}`)
    })
}

updateCsvWithDuration()
