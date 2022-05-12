import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as csv from "fast-csv";

const prisma = new PrismaClient();

type Row = {
  Title: string;
  Track: string;
  Artist: string;
  Song: string;
};

type SongWithMix = {
  mix: string;
  song: string;
};

type ArtistMap = {
  // key = artist, value = list of songs
  [key: string]: SongWithMix[];
};

type MixRow = {
  Title: string;
  Date: string;
  Length: string;
  URL: string;
  Notes: string;
};

const clearTables = async () => {
  await prisma.artist.deleteMany({});
  await prisma.song.deleteMany({});
  await prisma.mix.deleteMany({});
};

const uniqueArray = (list) =>
  list.filter(
    (val, idx, arr) => arr.findIndex((t) => t.name === val.name) === idx
  );

const seedTracks = async () => {
  let artists: ArtistMap = {};

  fs.createReadStream("data/tracks.csv")
    .pipe(csv.parse({ headers: true }))
    .on("data", async (row: Row) => {
      if (artists[row["Artist"]]) {
        artists[row["Artist"]].push({ mix: row["Title"], song: row["Song"] });
      } else {
        artists[row["Artist"]] = [{ mix: row["Title"], song: row["Song"] }];
      }
    })
    .on("end", async () => {
      try {
        for (const [key, value] of Object.entries(artists)) {
          await prisma.artist.create({
            data: {
              name: key,
              songs: {
                create: value.map((item) => ({
                  name: item.song,
                  mixes: {
                    create: [
                      {
                        name: item.mix,
                      },
                    ],
                  },
                })),
              },
            },
            include: {
              songs: {
                include: {
                  mixes: true,
                },
              },
            },
          });
        }
      } catch (error) {
        console.error(error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });
};

const seedMixes = async () => {
  let data: MixRow[] = [];

  fs.createReadStream("data/mixes.csv")
    .pipe(csv.parse({ headers: true }))
    .on("data", (row: MixRow) => {
      data.push(row);
    })
    .on("end", async () => {
      try {
        data.forEach(async (mix) => {
          await prisma.mix.create({
            data: {
              name: mix["Title"],
              date: mix["Date"],
              length: mix["Length"],
            },
          });
        });
      } catch (error) {
        console.error(error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });
};

clearTables();
seedMixes();
seedTracks();
