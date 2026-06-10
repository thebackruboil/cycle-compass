# Cycle Compass

A small cycling app I built to help me get out of the house more often.

The idea is simple: pick somewhere nearby, create a simple loop from home, and just start riding.

It is mainly built around northern Munich, where I usually cycle. I often ride to supermarkets or familiar places, so the app uses that habit as a starting point. It can suggest a different supermarket, add a few nearby stops, or give me somewhere new to go when I do not want to think too much.

I did not build this to optimize every ride. I built it to make starting easier.

## Current Features

- Browse 91 curated destinations across 11 categories around Munich
- Filter the map by category, a 3, 5, or 10 km radius, and explored status
- Shuffle suggested multi-stop rides that avoid already visited places
- Start a supermarket run that chooses a different nearby store
- Swipe through destinations to save or pass on them a la Tinder
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

## Demo
https://cycle-compass.edwin-rs.workers.dev/

## Roadmap (if ever I touch it)

- Make the home location configurable
- Add real bicycle-route distance, elevation, and surface data
- Personalize suggestions using routines, preferences, and ride history
- Use real photos that you supply yourself
- Reorder stops and optimize loops against real cycling routes
- Sync saved places and ride history across devices
- Expand the destination catalog beyond Munich
- Make interaction like hunting Pokemons

## Acknowledgements

Map data is provided by
[OpenStreetMap contributors](https://www.openstreetmap.org/copyright), with map
tiles from [CARTO](https://carto.com/). Destination imagery is sourced from
[Wikimedia Commons](https://commons.wikimedia.org/), using exact image links
from OpenStreetMap where available. Clearly labeled nearby-area photos fill
gaps when no exact place image exists.
