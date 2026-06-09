# Cycle Compass

Get out of the house, pick somewhere worth cycling to, and turn an ordinary
errand into a small adventure.

Cycle Compass is a personal, mobile-first cycling companion built around
northern Munich. It helps me choose a destination, build a simple loop from
home, and start riding without planning an entire day.

## Why I Built This

I made Cycle Compass because I wanted a gentle reason to get out of the house
and cycle more often.

I already have places and routines I enjoy, especially going to supermarkets.
The app turns those familiar habits into ride prompts: it can pick a different
nearby supermarket, suggest a few stops, or surface somewhere new when I do not
know where to go.

The goal is not to optimize every ride. It is to make starting one easier.

## Current Features

- Browse 91 curated destinations across 11 categories around Munich
- Filter the map by category, a 5, 10, or 15 km radius, and explored status
- Shuffle suggested multi-stop rides that avoid already visited places
- Start a supermarket run that chooses a different nearby store
- Swipe through destinations to save or pass on them
- Build a multi-stop loop that starts and ends at home
- See approximate distance and cycling time before leaving
- Save places, mark visits, and write personal notes
- Open a destination or complete loop in Google Maps for bicycle navigation
- Keep personal data in browser `localStorage`
- Install the app as a mobile-friendly PWA

## Tech Stack

- [React 19](https://react.dev/)
- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [Leaflet](https://leafletjs.com/) and
  [React Leaflet](https://react-leaflet.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Bun](https://bun.sh/)

## Getting Started

### Prerequisites

Install [Bun](https://bun.sh/docs/installation).

### Installation

```bash
git clone <repository-url>
cd cycle-compass
bun install
bun run dev
```

Open the local URL shown in the terminal.

No API keys or environment variables are required for the current demo.

## Available Scripts

```bash
bun run dev        # Start the development server
bun run build      # Create a production build
bun run preview    # Preview the production build
bun run lint       # Run ESLint
bun run format     # Format the project with Prettier
bun run deploy     # Build and deploy to Cloudflare Workers
bun run deploy:dry # Validate a Cloudflare deployment
bun run photos:refresh # Refresh the destination photo catalog
```

## Project Structure

```text
src/
├── components/    # Map, navigation, route preview, and UI components
├── hooks/         # Reusable React hooks
├── lib/           # Destination data, local state, and utilities
├── routes/        # File-based application routes
├── router.tsx     # Router configuration
├── server.ts      # TanStack Start server entry
└── styles.css     # Global styles and design tokens
scripts/
└── fetch-destination-photos.ts # Wikimedia/OpenStreetMap photo catalog tool
public/
├── manifest.webmanifest        # PWA metadata
└── sw.js                       # Service worker
```

## Current Scope

The app currently uses:

- A curated, static catalog of 91 destinations around Munich
- A fixed home location in northern Munich
- Straight-line distances and approximate cycling times
- Browser `localStorage` for saved places, rides, visits, and notes
- External map tiles from CARTO and OpenStreetMap data
- Google Maps for actual bicycle directions

It is a personal discovery prototype rather than a turn-by-turn routing
engine. Suggested loops are assembled from curated stops and are not optimized
against the street or cycle-path network. Venue details and coordinates should
be revalidated before a public launch.

## Roadmap

- Make the home location configurable
- Add real bicycle-route distance, elevation, and surface data
- Personalize suggestions using routines, preferences, and ride history
- Reorder stops and optimize loops against real cycling routes
- Sync saved places and ride history across devices
- Expand the destination catalog beyond Munich

## Acknowledgements

Map data is provided by
[OpenStreetMap contributors](https://www.openstreetmap.org/copyright), with map
tiles from [CARTO](https://carto.com/). Destination imagery is sourced from
[Wikimedia Commons](https://commons.wikimedia.org/), using exact image links
from OpenStreetMap where available. Clearly labeled nearby-area photos fill
gaps when no exact place image exists.
