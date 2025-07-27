# Chart Components

This directory contains interactive chart components built with Recharts for the Rock Mixes analytics dashboard.

## Components

### ArtistFrequencyChart

- **Type**: Horizontal Bar Chart
- **Purpose**: Displays the most featured artists in the collection
- **Features**:
  - Interactive tooltips showing artist name, track count, and percentage
  - Hover effects with opacity transitions
  - Click handlers (optional)
  - Responsive design
  - Uses CSS custom properties for theming

### GenreDistributionChart

- **Type**: Donut/Pie Chart
- **Purpose**: Shows the distribution of musical genres
- **Features**:
  - Interactive tooltips with genre details
  - Custom legend with clickable items
  - Color-coded segments using predefined color palette
  - Click handlers (optional)
  - Responsive design

### TimelineChart

- **Type**: Area Chart (default) or Line Chart
- **Purpose**: Visualizes playlist creation timeline
- **Features**:
  - Dual data series (playlists and total tracks)
  - Interactive tooltips
  - Chart variant selection (area/line)
  - Click handlers (optional)
  - Responsive design

## Usage

```tsx
import { ArtistFrequencyChart, GenreDistributionChart, TimelineChart } from '@/components/charts'

// Basic usage (Server Component compatible)
<ArtistFrequencyChart data={artistData} />
<GenreDistributionChart data={genreData} />
<TimelineChart data={timelineData} variant="area" />

// With click handlers (Client Component only)
<ArtistFrequencyChart
  data={artistData}
  onArtistClick={(artist) => handleArtistClick(artist)}
/>
```

## Implementation Notes

- All components are Client Components (`"use client"`)
- Event handlers cannot be passed from Server Components in Next.js 13+
- For interactive features, wrap in a Client Component or use client-side data fetching
- Charts are fully responsive and use CSS custom properties for theming
- Follow the user's preference for simple color schemes and dense information display

## Data Formats

### ArtistFrequencyData

```typescript
interface ArtistFrequencyData {
  name: string
  count: number
  percentage: number
}
```

### GenreDistributionData

```typescript
interface GenreDistributionData {
  name: string
  count: number
  percentage: number
  fill: string // Color for the chart segment
}
```

### TimelineData

```typescript
interface TimelineData {
  period: string
  playlists: number
  songs: number
}
```
