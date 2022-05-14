import { PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
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
  await prisma.mix.deleteMany({});
  console.log("successfully cleared mix table...");
  await prisma.song.deleteMany({});
  console.log("successfully cleared song table...");
  await prisma.artist.deleteMany({});
  console.log("successfully cleared artist table...");
};

const seedTracks = async () => {
  let artists: ArtistMap = {};

  return new Promise((resolve, reject) => {
    createReadStream("data/tracks.csv")
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
                      connect: { name: item.mix },
                    },
                  })),
                },
                mixes: {
                  connect: value.map((item) => ({
                    name: item.mix,
                  })),
                },
              },
              include: {
                songs: {
                  include: {
                    mixes: true,
                  },
                },
                mixes: true,
              },
            });
          }
          console.log("successfully loaded artists and songs...");
          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
          process.exit(1);
        } finally {
          await prisma.$disconnect();
        }
      });
  });
};

const seedMixes = async () => {
  let mixes: MixRow[] = [];

  return new Promise((resolve, reject) => {
    createReadStream("data/mixes.csv")
      .pipe(csv.parse({ headers: true }))
      .on("data", (row: MixRow) => {
        mixes.push(row);
      })
      .on("end", async () => {
        try {
          for (const mix of mixes) {
            await prisma.mix.create({
              data: {
                name: mix["Title"],
                date: mix["Date"],
                length: mix["Length"],
              },
            });
          }
          console.log("successfully loaded mixes...");
          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
          process.exit(1);
        } finally {
          await prisma.$disconnect();
        }
      });
  });
};

const run = async () => {
  await clearTables();
  await seedMixes();
  await seedTracks();
};

run();
