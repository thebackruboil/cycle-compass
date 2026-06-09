# Cycle Compass

Discover nearby destinations, build scenic cycling loops, and save memorable
places around my home in Munich.

Cycle Compass is a mobile-first cycling discovery app for finding places worth
riding to without planning an entire day. Browse an interactive map, filter
destinations by distance and category, combine stops into a loop, and open the
finished ride in Google Maps.

## Features

- Explore cafes, bakeries, parks, lakes, viewpoints, museums, markets, and
  hidden gems around Munich
- Filter destinations by a 5, 10, or 15 km radius
- Search and browse places on an interactive Leaflet map
- Start with curated multi-stop ride suggestions
- Build a circular ride that begins and ends at home
- View estimated distance and cycling time
- Save places, track visited destinations, and add personal notes
- Keep ride and saved-place data locally in the browser
- Open destinations and complete rides in Google Maps for bicycle navigation

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
```

## Current Scope

The app currently uses:

- A curated, static catalog of destinations around Munich
- A fixed demo home location in northern Munich
- Straight-line distances and approximate cycling times
- Browser `localStorage` for saved places, rides, visits, and notes
- External map tiles from CARTO and OpenStreetMap data

It is a discovery prototype rather than a turn-by-turn routing engine. Venue
details and coordinates should be revalidated before a public launch.

## Roadmap

- Use the rider's current location or a configurable home address
- Add real bicycle-route distance, elevation, and surface data
- Generate personalized ride suggestions
- Reorder stops and optimize complete loops
- Sync saved places and ride history across devices
- Expand the destination catalog beyond Munich

## Acknowledgements

Map data is provided by
[OpenStreetMap contributors](https://www.openstreetmap.org/copyright), with map
tiles from [CARTO](https://carto.com/). Destination imagery is sourced from
[Unsplash](https://unsplash.com/).
