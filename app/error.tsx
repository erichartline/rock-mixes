'use client'

import { Button, Center, Flex, Heading, Text } from "@chakra-ui/react"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <Center py="10">
      <Flex direction="column" justify="center" align="center" gap={4}>
        <Heading as="h2" size="xl">
          Something went wrong!
        </Heading>
        <Text>An error occurred while loading this page.</Text>
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
      </Flex>
    </Center>
  )
}