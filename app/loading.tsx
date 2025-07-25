import { Center, Flex, Heading, Spinner } from "@chakra-ui/react"

export default function Loading() {
  return (
    <Center py="10">
      <Flex direction="column" justify="center" align="center" gap={4}>
        <Heading as="h2" size="xl">
          Loading...
        </Heading>
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