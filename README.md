# Rock Mixes

A Next.js web application for browsing and managing rock music playlists with enhanced search, analytics, and Spotify integration.

![Rock Mixes](https://via.placeholder.com/800x400?text=Rock+Mixes+Dashboard)

## 📋 Overview

Rock Mixes is a comprehensive catalog of rock music playlists with modern UI components, powerful search capabilities, and detailed analytics. The application allows users to browse collections of songs organized into playlists, search across all content, view analytics dashboards, and integrate with Spotify for enhanced music discovery.

## ✨ Features

### Core Features

- **Playlist Browsing**: View a list of all rock music playlists with their creation date and duration
- **Playlist Details**: Explore songs in each playlist with detailed information including albums, genres, and years
- **Advanced Search**: Full-text search across playlists, songs, and artists with categorized results
- **Analytics Dashboard**: Interactive charts and statistics showing:
  - Most featured artists with frequency analysis
  - Genre distribution across your collection
  - Playlist creation timeline
  - Duration statistics and analysis
  - Music by decade breakdown
  - Collection overview stats

### Spotify Integration

- **Direct Links**: Open songs and playlists directly in Spotify
- **Enhanced Metadata**: Automatic fetching of Spotify URLs, durations, and additional track data
- **Preview Support**: Access to Spotify preview URLs where available
- **Search Integration**: Find playlists and tracks on Spotify platform

### Modern UI/UX

- **shadcn/ui Components**: Beautiful, accessible components built on Radix UI
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Smooth Animations**: Polished interactions with Tailwind CSS animations
- **Search Bar**: Persistent search functionality in navigation

## 🛠️ Technologies

- **Frontend**:

  - [Next.js 13](https://nextjs.org/) - React framework with App Router
  - [React 18](https://reactjs.org/) - JavaScript library for building user interfaces
  - [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components built on Radix UI
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
  - [Lucide React](https://lucide.dev/) - Beautiful & consistent icon library
  - [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript

- **Backend**:

  - [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript
  - [SQLite](https://www.sqlite.org/) - Embedded relational database with indexes for performance

- **Integrations**:

  - [Spotify Web API](https://developer.spotify.com/documentation/web-api/) - Music metadata and links
  - [Last.fm API](https://www.last.fm/api) - Genre data and additional metadata

- **Development Tools**:
  - [ESLint](https://eslint.org/) - Linting utility for JavaScript and TypeScript
  - [Prettier](https://prettier.io/) - Code formatter

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm or yarn
- [Spotify Developer Account](https://developer.spotify.com/) (optional, for enhanced features)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/rock-mixes.git
   cd rock-mixes
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:

   ```
   DATABASE_URL="file:./dev.db"
   SPOTIFY_CLIENT_ID="your_spotify_client_id"
   SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"
   LASTFM_API_KEY="your_lastfm_api_key"
   ```

4. Initialize shadcn/ui:

   ```bash
   npm run ui:init
   # or
   yarn ui:init
   ```

5. Set up the database:

   ```bash
   npm run db:prepare
   # or
   yarn db:prepare
   ```

6. Seed the database with initial data:

   ```bash
   npm run db:seed
   # or
   yarn db:seed
   ```

7. (Optional) Enhance with Spotify data:
   ```bash
   node scripts/enhance-spotify-data.js
   ```

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📊 Database Schema

The application uses the following data models with performance indexes:

- **Playlist**: Collection of songs with name, date, duration, and Spotify URL
- **Artist**: Music artists with relationships to songs, albums, and genres
- **Song**: Individual tracks with track number, name, duration (milliseconds), Spotify URL, and relationships
- **Album**: Music albums with name, year, and artist
- **Genre**: Music genres with relationships to songs and artists

### Performance Optimizations

- Database indexes on frequently searched fields (`name` fields across all models)
- Relationship indexes for efficient joins (`artistId`, `genreId`, `playlistId`)
- Year-based indexing for timeline analytics

## 🧰 Available Scripts

### Development

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

### Database

- `npm run db:prepare` - Format Prisma schema, generate client, and push to database
- `npm run db:seed` - Seed the database with initial data
- `npm run studio` - Open Prisma Studio to view and edit database data

### UI Components

- `npm run ui:init` - Initialize shadcn/ui configuration
- `npm run ui:add` - Add new shadcn/ui components

### Data Enhancement

- `node scripts/enhance-spotify-data.js` - Enhance existing data with Spotify metadata
- `node scripts/spotify.js` - Run original Spotify data fetching
- `node scripts/lastfm-genres.js` - Fetch genre data from Last.fm
- `node scripts/durations.js` - Calculate and update song durations

## 🔍 API Endpoints

### Search API

- `GET /api/search?q=query&type=all&limit=10` - Search across playlists, songs, and artists
- Parameters:
  - `q`: Search query (required, minimum 2 characters)
  - `type`: Search type (`all`, `playlists`, `songs`, `artists`)
  - `limit`: Maximum results per category (default: 10)

### Analytics API

- `GET /api/analytics?type=all&limit=20` - Get analytics data
- Parameters:
  - `type`: Data type (`all`, `artists`, `genres`, `timeline`, `duration`, `decades`, `stats`)
  - `limit`: Maximum results for artist frequency (default: 20)

## 📱 Features in Detail

### Search Functionality

- **Real-time Search**: Search as you type with debounced input
- **Categorized Results**: Separate sections for playlists, songs, and artists
- **Search Suggestions**: Smart suggestions based on your collection
- **Result Highlighting**: Visual emphasis on matching terms

### Analytics Dashboard

- **Overview Cards**: Quick stats on total playlists, songs, artists, and albums
- **Artist Frequency Chart**: Bar chart showing most featured artists
- **Genre Distribution**: Visual breakdown of music genres in your collection
- **Timeline Analysis**: Track how your collection has grown over time
- **Duration Statistics**: Insights into song lengths and total listening time
- **Decade Analysis**: See the distribution of music across different eras

### Spotify Integration

- **Direct Playback**: Click to open songs directly in Spotify
- **Playlist Links**: Access entire playlists on Spotify platform
- **Metadata Enhancement**: Automatic fetching of accurate durations and URLs
- **Search Fallbacks**: Smart search URLs when direct links aren't available

## 🚀 Deployment

The application can be deployed to any platform that supports Next.js:

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on every push

### Other Platforms

- **Netlify**: Use the Next.js build command
- **Railway**: Direct deployment with database included
- **DigitalOcean App Platform**: Container-based deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 🎵 Acknowledgments

- Thanks to the Spotify Web API for music metadata
- Thanks to Last.fm for genre classification
- Built with love for rock music enthusiasts
