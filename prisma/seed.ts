import { PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import * as csv from "fast-csv";

const prisma = new PrismaClient();

type TracksRow = {
  Title: string;
  Track: string;
  Artist: string;
  Song: string;
};

type MixMap = {
  /** mix name */
  [name: string]: {
    /** track number */
    [trackNumber: number]: {
      /** artist: song */
      [artist: string]: string;
    };
  };
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
  let mixes: MixMap = {};

  return new Promise((resolve, reject) => {
    createReadStream("data/tracks.csv")
      .pipe(csv.parse({ headers: true }))
      .on("data", async (row: TracksRow) => {
        const title = row["Title"];
        const track = row["Track"];
        const artist = row["Artist"];
        const song = row["Song"];
        if (mixes[title]) {
          mixes[title][track] = {
            [artist]: song,
          };
        } else {
          mixes[title] = {
            [track]: {
              [artist]: song,
            },
          };
        }
      })
      .on("end", async () => {
        try {
          for (const [key, value] of Object.entries(mixes)) {
            const mixName = key;
            for (const [trackKey, trackValue] of Object.entries(value)) {
              await prisma.song.create({
                data: {
                  name: Object.values(trackValue)[0],
                  trackNumber: Number(trackKey),
                  mixes: {
                    connect: { name: mixName },
                  },
                  artist: {
                    connectOrCreate: {
                      where: {
                        name: Object.keys(trackValue)[0],
                      },
                      create: {
                        name: Object.keys(trackValue)[0],
                      },
                    },
                  },
                },
                include: {
                  mixes: {
                    include: {
                      artists: true,
                    },
                  },
                  artist: true,
                },
              });
            }
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
