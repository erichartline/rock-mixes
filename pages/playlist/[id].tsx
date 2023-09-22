import Link from "next/link"
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
} from "@chakra-ui/react"
import prisma from "../../lib/prisma"
import { Playlist, Song } from "@prisma/client"
import { GetStaticProps } from "next"

type Props = {
  playlist: Playlist & {
    date: string
    songs: {
      title: string
      artist: string
      trackNumber: number
    }[]
  }
}

const Playlist = ({ playlist }: Props) => {
  if (!playlist) {
    return null
  }

  return (
    <Center py="10">
      <Flex direction="column" justify="center" align="center">
        <Link href="/">
          <Button size="sm">Back</Button>
        </Link>
        <Flex justify="center" align="center">
          <Heading as="h1" size="xl">
            {playlist.name}
          </Heading>
        </Flex>
        <Text>
          Created on{" "}
          {playlist.date ? new Date(playlist.date).getFullYear() : "???"}
        </Text>
        <Text>Length: {playlist.duration}</Text>
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
              {playlist.songs.map((song) => (
                <Tr key={`${song.trackNumber}-${song.title}`}>
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
  )
}

export const getStaticPaths = async () => {
  const playlistes = await prisma.playlist.findMany({
    select: {
      id: true,
    },
  })

  const paths = playlistes.map((playlist) => ({
    params: { id: String(playlist.id) },
  }))

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const playlist = await prisma.playlist.findUnique({
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
  })

  return {
    props: {
      playlist: {
        ...playlist,
        date: playlist.date ? playlist.date.toString() : null,
        songs: playlist.songs.map((song) => ({
          title: song.name,
          artist: song.artist.name,
          trackNumber: song.track,
        })),
      },
    },
  }
}

export default Playlist
