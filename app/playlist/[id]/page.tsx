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
import prisma from "../../../lib/prisma"
import { Metadata } from "next"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const playlist = await getPlaylist(params.id)
  return {
    title: `${playlist.name} | Rock Mixes`,
    description: `Details for playlist ${playlist.name}`,
  }
}

async function getPlaylist(id: string) {
  const playlist = await prisma.playlist.findUnique({
    where: {
      id: Number(id),
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
    ...playlist,
    date: playlist.date ? playlist.date.toString() : null,
    songs: playlist.songs.map((song) => ({
      title: song.name,
      artist: song.artist.name,
      trackNumber: song.track,
    })),
  }
}

export async function generateStaticParams() {
  const playlists = await prisma.playlist.findMany({
    select: {
      id: true,
    },
  })

  return playlists.map((playlist) => ({
    id: String(playlist.id),
  }))
}

export default async function PlaylistPage({ params }: Props) {
  const playlist = await getPlaylist(params.id)

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