import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function Mix({ mix }) {
  console.log(mix);
  return (
    <div>
      <main>
        <h1>{mix.name}</h1>
        <div>
          {/* {mixes.map((mix) => (
            <div key={mix.id}>
              <Link href={`/mix/${mix.id}`}>{mix.name}</Link>
            </div>
          ))} */}
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  // Fetch existing posts from the database
  const mixes = await prisma.mix.findMany({
    select: {
      id: true,
    },
  });

  // Get the paths we want to pre-render based on posts
  const paths = mixes.map((mix) => ({
    params: { id: String(mix.id) },
  }));

  return {
    paths,
    // If an ID is requested that isn't defined here, fallback will incrementally generate the page
    fallback: true,
  };
}
export async function getStaticProps({ params }) {
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
    props: { mix },
  };
}
