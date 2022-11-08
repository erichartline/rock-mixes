import Link from "next/link";
import {
  Button,
  Center,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Text,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Mix = ({ mix }) => {
  return (
    <Center py="10">
      <Flex direction="column" justify="center" align="center">
        <Flex justify="center" align="center">
          <Link href="/">
            <Button size="sm">Back</Button>
          </Link>
          <Heading as="h1" size="xl">
            {mix.name}
          </Heading>
        </Flex>
        <Text>Created on {mix.date ? mix.date : "???"}</Text>
        <Text>Length: {mix.length}</Text>
        <TableContainer>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th isNumeric>Track Number</Th>
                <Th>Artist</Th>
                <Th>Song</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mix.songs.map((song) => (
                <Tr key={song.title}>
                  <Td>{song.trackNumber}</Td>
                  <Td>{song.artist}</Td>
                  <Td>{song.title}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Center>
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
