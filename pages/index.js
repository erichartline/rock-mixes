import Head from "next/head";
import { PrismaClient } from "@prisma/client";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Home({ mixes }) {
  console.log(mixes);
  return (
    <div className={styles.container}>
      <Head>
        <title>Rock Mixes</title>
        <meta name="description" content="List of rock mixes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Rock Mixes</h1>
        <div>
          {mixes.map((mix) => (
            <div key={mix.id}>
              <Link href={`/mix/${mix.id}`}>{mix.name}</Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const prisma = new PrismaClient();

  const mixes = await prisma.mix.findMany();

  return {
    props: { mixes },
  };
}
