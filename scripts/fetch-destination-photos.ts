import { writeFile } from "node:fs/promises";
import { format } from "prettier";
import { DESTINATIONS } from "../src/lib/destinations.ts";

interface CommonsImageInfo {
  thumburl: string;
  descriptionurl: string;
  extmetadata?: {
    Artist?: { value?: string };
    Credit?: { value?: string };
    LicenseShortName?: { value?: string };
  };
}

interface CommonsPage {
  pageid: number;
  title: string;
  index?: number;
  coordinates?: { lat: number; lon: number }[];
  imageinfo?: CommonsImageInfo[];
}

interface CommonsResponse {
  query?: {
    pages?: Record<string, CommonsPage>;
  };
}

interface OsmElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    alt_name?: string;
    wikimedia_commons?: string;
    image?: string;
  };
}

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const OVERPASS_API = "https://overpass-api.de/api/interpreter";
const OUTPUT_PATH = new URL("../src/lib/destination-photos.ts", import.meta.url);
const UNSUITABLE_PHOTO =
  /\b(DOP\d*|CIR\d*|Bayerische Vermessungsverwaltung|Mapillary|U-Bahnhof|interior U\d|floor plan|lageplan|karte|map)\b/i;
const VENUE_CATEGORIES = new Set(["bakery", "cafe", "market", "supermarket"]);
const GENERIC_NAME_TOKENS = new Set([
  "am",
  "an",
  "bakery",
  "backhaus",
  "bar",
  "bei",
  "cafe",
  "der",
  "die",
  "im",
  "markt",
  "museum",
  "park",
  "restaurant",
  "see",
  "the",
  "und",
  "von",
]);

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/^file:/, "")
    .replace(/[_()[\].,'’&+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulTokens(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !GENERIC_NAME_TOKENS.has(token));
}

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadius = 6_371_000;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const lat1 = radians(a.lat);
  const lat2 = radians(b.lat);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(value));
}

function plainText(value?: string) {
  return value
    ?.replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function commonsQuery(params: URLSearchParams) {
  params.set("action", "query");
  params.set("format", "json");
  params.set("prop", "coordinates|imageinfo");
  params.set("iiprop", "url|extmetadata");
  params.set("iiurlwidth", "960");
  params.set("iilimit", "max");
  params.set("colimit", "max");

  let response: Response | undefined;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    response = await fetch(`${COMMONS_API}?${params}`, {
      headers: {
        "User-Agent": "CycleCompass/1.0 (destination photo catalog)",
      },
    });
    if (response.ok) break;
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`Commons returned ${response.status}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    await wait(
      Number.isFinite(retryAfter) ? retryAfter * 1000 : Math.min(30_000, 2000 * 2 ** attempt),
    );
  }

  if (!response?.ok) throw new Error(`Commons returned ${response?.status ?? "no response"}`);
  const data = (await response.json()) as CommonsResponse;
  return Object.values(data.query?.pages ?? {}).filter((page) => page.imageinfo?.[0]);
}

async function namedPhotos(name: string) {
  return commonsQuery(
    new URLSearchParams({
      generator: "search",
      gsrnamespace: "6",
      gsrlimit: "20",
      gsrsearch: `${name} Munich`,
    }),
  );
}

async function nearbyPhotos(lat: number, lng: number, radius: number) {
  return commonsQuery(
    new URLSearchParams({
      generator: "geosearch",
      ggsnamespace: "6",
      ggslimit: "20",
      ggsprimary: "all",
      ggsradius: String(radius),
      ggscoord: `${lat}|${lng}`,
    }),
  );
}

async function osmElementsWithCommonsLinks() {
  const latitudes = DESTINATIONS.map((destination) => destination.lat);
  const longitudes = DESTINATIONS.map((destination) => destination.lng);
  const padding = 0.01;
  const bounds = [
    Math.min(...latitudes) - padding,
    Math.min(...longitudes) - padding,
    Math.max(...latitudes) + padding,
    Math.max(...longitudes) + padding,
  ].join(",");
  const query = `[out:json][timeout:60];(
    nwr["wikimedia_commons"](${bounds});
    nwr["image"~"^(File:|https?://commons.wikimedia.org)"](${bounds});
  );out center tags;`;

  try {
    const response = await fetch(OVERPASS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "CycleCompass/1.0 (destination photo catalog)",
      },
      body: new URLSearchParams({ data: query }),
    });
    if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
    const data = (await response.json()) as { elements?: OsmElement[] };
    return data.elements ?? [];
  } catch (error) {
    console.warn(`OSM photo-link lookup failed: ${String(error)}`);
    return [];
  }
}

function commonsReference(element: OsmElement) {
  const value = element.tags?.wikimedia_commons ?? element.tags?.image;
  if (!value) return;
  if (value.startsWith("File:") || value.startsWith("Category:")) return value;

  const match = value.match(/commons\.wikimedia\.org\/wiki\/(File|Category):([^#?]+)/i);
  if (!match) return;
  return `${match[1]}:${decodeURIComponent(match[2]).replaceAll("_", " ")}`;
}

function matchingOsmReference(destination: (typeof DESTINATIONS)[number], elements: OsmElement[]) {
  const destinationTokens = meaningfulTokens(destination.name);
  const requiredCoverage = VENUE_CATEGORIES.has(destination.category) ? 1 : 0.67;

  return elements
    .map((element) => {
      const lat = element.lat ?? element.center?.lat;
      const lng = element.lon ?? element.center?.lon;
      const reference = commonsReference(element);
      if (lat === undefined || lng === undefined || !reference) return;

      const meters = distanceMeters(destination, { lat, lng });
      if (meters > 180) return;

      const osmName = [element.tags?.name, element.tags?.alt_name].filter(Boolean).join(" ");
      const osmTokens = new Set(meaningfulTokens(osmName));
      const matches = destinationTokens.filter((token) => osmTokens.has(token)).length;
      const coverage = destinationTokens.length > 0 ? matches / destinationTokens.length : 0;
      if (meters > 35 && coverage < requiredCoverage) return;
      return { reference, meters, coverage };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    .sort((a, b) => b.coverage - a.coverage || a.meters - b.meters)[0]?.reference;
}

async function photosFromCommonsReference(reference: string) {
  if (reference.startsWith("File:")) {
    return commonsQuery(new URLSearchParams({ titles: reference }));
  }

  return commonsQuery(
    new URLSearchParams({
      generator: "categorymembers",
      gcmtitle: reference,
      gcmtype: "file",
      gcmlimit: "20",
    }),
  );
}

const entries: string[] = [];
const osmElements = await osmElementsWithCommonsLinks();

for (const [index, destination] of DESTINATIONS.entries()) {
  const nameTokens = meaningfulTokens(destination.name);
  const normalizedName = normalize(destination.name);
  const osmReference = matchingOsmReference(destination, osmElements);
  const osmCandidates = osmReference
    ? (await photosFromCommonsReference(osmReference)).filter(
        (page) => !UNSUITABLE_PHOTO.test(page.title),
      )
    : [];
  const candidates = (osmCandidates.length > 0 ? [] : await namedPhotos(destination.name))
    .filter((page) => !UNSUITABLE_PHOTO.test(page.title))
    .filter((page) => {
      const title = normalize(page.title);
      if (destination.category === "lake" && /\b(church|kirche)\b/.test(title)) return false;
      if (
        destination.category === "park" &&
        /\b(studentenwohnung|studentenwohnungen)\b/.test(title)
      ) {
        return false;
      }
      return true;
    })
    .map((page) => {
      const title = normalize(page.title);
      const titleTokens = new Set(meaningfulTokens(page.title));
      const matches = nameTokens.filter((token) => titleTokens.has(token)).length;
      const coverage = nameTokens.length > 0 ? matches / nameTokens.length : 0;
      const exactName = title.includes(normalizedName);
      const requiredCoverage = VENUE_CATEGORIES.has(destination.category) ? 1 : 0.67;
      const coordinates = page.coordinates?.[0];
      const isNearby =
        coordinates &&
        distanceMeters(destination, { lat: coordinates.lat, lng: coordinates.lon }) <= 500;
      const nameMatches = exactName || (nameTokens.length > 0 && coverage >= requiredCoverage);
      const verified = VENUE_CATEGORIES.has(destination.category)
        ? Boolean(nameMatches && isNearby)
        : nameMatches;

      return { page, coverage, exactName, verified };
    })
    .filter((candidate) => candidate.verified)
    .sort((a, b) => Number(b.exactName) - Number(a.exactName) || b.coverage - a.coverage);
  let selected = osmCandidates[0]
    ? { page: osmCandidates[0], coverage: 1, exactName: true, verified: true }
    : candidates[0];
  let kind: "place" | "area" = "place";

  if (!selected) {
    const radius = VENUE_CATEGORIES.has(destination.category) ? 300 : 500;
    const nearby = (await nearbyPhotos(destination.lat, destination.lng, radius)).filter(
      (page) => !UNSUITABLE_PHOTO.test(page.title),
    );
    if (nearby[0]) {
      selected = { page: nearby[0], coverage: 0, exactName: false, verified: false };
      kind = "area";
    }
  }

  const page = selected?.page;
  const image = page?.imageinfo?.[0];

  if (!page || !image) {
    console.log(`[${index + 1}/${DESTINATIONS.length}] ${destination.name} (no photo)`);
    await wait(1500);
    continue;
  }

  const metadata = image.extmetadata;
  const photo = {
    url: image.thumburl,
    sourceUrl: image.descriptionurl,
    title: page.title.replace(/^File:/, ""),
    kind,
    author: plainText(metadata?.Artist?.value) || plainText(metadata?.Credit?.value),
    license: plainText(metadata?.LicenseShortName?.value),
  };
  entries.push(`  ${JSON.stringify(destination.id)}: ${JSON.stringify(photo)},`);
  console.log(`[${index + 1}/${DESTINATIONS.length}] ${destination.name} (${kind} photo)`);
  await wait(1500);
}

const output = `// Generated by scripts/fetch-destination-photos.ts.
// Photos are exact place matches or nearby-area images from Wikimedia Commons.
export interface DestinationPhoto {
  url: string;
  sourceUrl: string;
  title: string;
  kind: "place" | "area";
  author?: string;
  license?: string;
}

export const DESTINATION_PHOTOS: Record<string, DestinationPhoto> = {
${entries.join("\n")}
};
`;

await writeFile(OUTPUT_PATH, await format(output, { parser: "typescript", printWidth: 100 }));
