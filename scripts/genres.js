import fs from "fs"
import csv from "csv-parser"
import axios from "axios"
import "dotenv/config"

const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY
const LAST_FM_URL = "http://ws.audioscrobbler.com/2.0/"

async function getGenresFromLastFM(songName, artistName) {
  try {
    const response = await axios.get(LAST_FM_URL, {
      params: {
        method: "track.getTopTags",
        api_key: LAST_FM_API_KEY,
        artist: artistName,
        track: songName,
        format: "json",
      },
    })
    const tags = response.data.toptags.tag
    return tags.map((tag) => tag.name)
  } catch (error) {
    console.error(
      `Failed to fetch genres for ${songName} by ${artistName}. Error: ${error.message}`,
    )
    return []
  }
}

const inputFile = "data/tracks.csv"
const outputFile = "updated_tracks.csv"

function updateCsvWithGenres() {
  const results = []

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      const writeStream = fs.createWriteStream(outputFile)
      writeStream.write(
        "Playlist Name,Track #,Artist,Song,Duration,Genre,URL,Album,Year\n",
      ) // headers

      for (const row of results) {
        const genres = await getGenresFromLastFM(row["Song"], row["Artist"])
        if (genres.length > 0) {
          console.log(`Fetched genres for ${row["Song"]}: ${genres.join(", ")}`)
          row["Genre"] = genres[0] // Taking the first genre for simplicity
        } else {
          console.log(
            `No genres found for ${row.name}. Defaulting to 'Unknown'.`,
          )
          row["Genre"] = "Unknown"
        }
        writeStream.write(Object.values(row).join(",") + "\n")
      }

      writeStream.end()
      console.log(`CSV updated and saved as ${outputFile}`)
    })
}

updateCsvWithGenres()
