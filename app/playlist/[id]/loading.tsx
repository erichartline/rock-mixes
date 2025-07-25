import { Center, Flex, Heading, Spinner, Text } from "@chakra-ui/react"

export default function PlaylistLoading() {
  return (
    <Center py="10">
      <Flex direction="column" justify="center" align="center" gap={4}>
        <Heading as="h2" size="xl">
          Loading Playlist...
        </Heading>
        <Text>Please wait while we fetch the playlist details</Text>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Flex>
    </Center>
  )
}