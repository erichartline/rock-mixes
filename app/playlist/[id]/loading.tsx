import { Loader2 } from "lucide-react"

export default function PlaylistLoading() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Loading Playlist...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we fetch the playlist details
        </p>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  )
}
