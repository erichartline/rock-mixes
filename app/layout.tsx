import { ChakraProvider } from "@chakra-ui/react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rock Mixes',
  description: 'A Next.js web application for browsing and managing rock music playlists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  )
}