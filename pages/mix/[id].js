import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Mix = ({ mix }) => {
  return (
    <div>
      <main>
        <h1>{mix.name}</h1>
        <div>Created on {mix.date ? mix.date : "Unknown"}</div>
        <div>Length: {mix.length}</div>
        <div>
          {mix.songs.map((song) => (
            <div key={song.title}>
              {song.trackNumber}) {song.artist} - {song.title}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export const getStaticPaths = async () => {
  const mixes = await prisma.mix.findMany({
    select: {
      id: true,
    },
  });

  const paths = mixes.map((mix) => ({
    params: { id: String(mix.id) },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const mix = await prisma.mix.findUnique({
    where: {
      id: Number(params.id),
    },
    include: {
      songs: {
        include: {
          artist: true,
        },
      },
    },
  });

  return {
    props: {
      mix: {
        ...mix,
        songs: mix.songs.map((song) => ({
          title: song.name,
          artist: song.artist.name,
          trackNumber: song.trackNumber,
        })),
      },
    },
  };
};

export default Mix;
