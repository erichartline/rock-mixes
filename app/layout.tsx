import "./globals.css"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import { Navigation } from "@/components/navigation"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "Rock Mixes",
  description:
    "A Next.js web application for browsing and managing rock music playlists with enhanced search, analytics, and Spotify integration.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Navigation />
          <main className="pb-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
