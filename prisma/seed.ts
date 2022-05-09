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
  let data: Row[] = [];

  fs.createReadStream("data/tracks.csv")
    .pipe(csv.parse({ headers: true }))
    .on("data", (row: Row) => {
      data.push(row);
    })
    .on("end", async () => {
      const artists = data.map((item) => ({
        name: item["Artist"],
      }));
      const songs = data.map((item) => ({
        name: item["Song"],
      }));

      try {
        await clearTables();
        await prisma.artist.createMany({
          data: uniqueArray(artists),
          skipDuplicates: true,
        });
      } catch (error) {
        console.error(error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });
};

const seedMixes = async () => {
  let data: Row[] = [];

  fs.createReadStream("data/mixes.csv")
    .pipe(csv.parse({ headers: true }))
    .on("data", (row: Row) => {
      data.push(row);
    })
    .on("end", async () => {
      const mixes = data.map((item) => ({
        name: item["Title"],
      }));

      try {
        await clearTables();
        await prisma.mix.createMany({
          data: uniqueArray(mixes),
          skipDuplicates: true,
        });
      } catch (error) {
        console.error(error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });
};

seedMixes();
seedTracks();
