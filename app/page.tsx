import {
  Center,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react"
import Link from "next/link"
import prisma from "../lib/prisma"

async function getPlaylists() {
  const playlists = await prisma.playlist.findMany()
  return playlists.map((list) => ({
    ...list,
    date: list.date ? list.date.toString() : "",
  }))
}

export default async function HomePage() {
  const playlists = await getPlaylists()

  return (
    <Center py="10">
      <Flex direction="column" justify="center" align="center">
        <Heading as="h1" size="xl">
          Rock Mixes
        </Heading>
        <TableContainer>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Date</Th>
                <Th>Length</Th>
              </Tr>
            </Thead>
            <Tbody>
              {playlists.map((playlist) => (
                <Tr key={playlist.id}>
                  <Td>
                    <Link href={`/playlist/${playlist.id}`}>
                      {playlist.name}
                    </Link>
                  </Td>
                  <Td>
                    {playlist.date
                      ? new Date(playlist.date).getFullYear()
                      : "???"}
                  </Td>
                  <Td>{playlist.duration}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Center>
  )
}