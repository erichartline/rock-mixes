import Head from "next/head"
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

const Homepage = ({ mixes }) => {
  return (
    <>
      <Head>
        <title>Rock Mixes</title>
        <meta name="description" content="List of rock mixes" />
      </Head>
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
                {mixes.map((mix) => (
                  <Tr key={mix.id}>
                    <Td>
                      <Link href={`/mix/${mix.id}`}>{mix.name}</Link>
                    </Td>
                    <Td>{mix.date}</Td>
                    <Td>{mix.length}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Center>
    </>
  )
}

export const getServerSideProps = async () => {
  const mixes = await prisma.playlist.findMany()

  return {
    props: { mixes },
  }
}

export default Homepage
