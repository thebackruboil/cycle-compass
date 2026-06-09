import { DESTINATION_PHOTOS } from "./destination-photos.ts";

export type Category =
  | "supermarket"
  | "bakery"
  | "cafe"
  | "park"
  | "lake"
  | "viewpoint"
  | "church"
  | "museum"
  | "palace"
  | "market"
  | "gem";

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "cafe", label: "Cafes", icon: "☕" },
  { id: "bakery", label: "Bakeries", icon: "🥐" },
  { id: "park", label: "Parks", icon: "🌳" },
  { id: "lake", label: "Lakes", icon: "🏞️" },
  { id: "viewpoint", label: "Viewpoints", icon: "🌄" },
  { id: "market", label: "Markets", icon: "🧺" },
  { id: "museum", label: "Museums", icon: "🏛️" },
  { id: "palace", label: "Palaces", icon: "🏰" },
  { id: "church", label: "Churches", icon: "⛪" },
  { id: "supermarket", label: "Supermarkets", icon: "🛒" },
  { id: "gem", label: "Hidden gems", icon: "💎" },
];

export const HOME = {
  lat: 48.20671891199729,
  lng: 11.600185017590116,
  label: "Home · North Munich",
};

export interface Destination {
  id: string;
  name: string;
  category: Category;
  lat: number;
  lng: number;
  description: string;
  photo?: string;
  photoSourceUrl?: string;
  photoTitle?: string;
  photoKind?: "place" | "area";
  photoAuthor?: string;
  photoLicense?: string;
  nearby?: string[];
}

function place(
  id: string,
  name: string,
  category: Category,
  lat: number,
  lng: number,
  description: string,
): Destination {
  const photo = DESTINATION_PHOTOS[id];
  return {
    id,
    name,
    category,
    lat,
    lng,
    description,
    photo: photo?.url,
    photoSourceUrl: photo?.sourceUrl,
    photoTitle: photo?.title,
    photoKind: photo ? (photo.kind ?? "place") : undefined,
    photoAuthor: photo?.author,
    photoLicense: photo?.license,
  };
}

// Editorial launch catalog centered on northern Munich, with durable public
// landmarks filling the 10 km coverage toward the city center, west and east.
// Venue details should be revalidated before launch.
export const DESTINATIONS: Destination[] = [
  place(
    "north-cafe-01",
    "Cafe Kieferngarten",
    "cafe",
    48.2030909,
    11.6134229,
    "A close neighborhood cafe and an easy first stop for a short ride through Freimann.",
  ),
  place(
    "north-cafe-02",
    "Haidcafé",
    "cafe",
    48.2102139,
    11.614984,
    "A community-minded cafe beside the new neighborhood and Fröttmaninger heathland.",
  ),
  place(
    "north-cafe-03",
    "Backhaus Cafe",
    "cafe",
    48.1918365,
    11.5876155,
    "Straightforward local bakery-cafe for coffee and a quick breakfast stop.",
  ),
  place(
    "north-cafe-04",
    "Cafe Bar Karl",
    "cafe",
    48.1994378,
    11.6269295,
    "Casual cafe east of Freimann, useful on an Isar or Poschinger Weiher loop.",
  ),
  place(
    "north-cafe-05",
    "QuMa's Eatery",
    "cafe",
    48.1877105,
    11.5870425,
    "Modern neighborhood stop near Domagkpark for brunch, coffee and a longer pause.",
  ),
  place(
    "north-cafe-06",
    "TribüHne",
    "cafe",
    48.1840879,
    11.6105174,
    "Relaxed cafe near the sports grounds and the northern end of the English Garden.",
  ),
  place(
    "north-cafe-07",
    "Cafe Amadeus",
    "cafe",
    48.2089799,
    11.5545924,
    "Local Hasenbergl cafe that fits naturally into a Feldmoching lakes ride.",
  ),
  place(
    "north-cafe-08",
    "BeerenCafé Feldmoching",
    "cafe",
    48.2202855,
    11.5319193,
    "Seasonal farm cafe for berries, cake and a rural-feeling stop near old Feldmoching.",
  ),
  place(
    "north-cafe-09",
    "Cellino Cafè",
    "cafe",
    48.2140281,
    11.5400535,
    "Small cafe in Feldmoching, well placed between the village center and the lakes.",
  ),
  place(
    "north-cafe-10",
    "Café Novumon",
    "cafe",
    48.267788,
    11.6658537,
    "Campus cafe near Garching research center, best suited to a longer weekday ride.",
  ),

  place(
    "north-bakery-01",
    "NP Bäckerei & Café",
    "bakery",
    48.1944254,
    11.5971216,
    "Nearby bakery counter for a low-effort breakfast or provision run.",
  ),
  place(
    "north-bakery-02",
    "PrivatBäckerei Wimmer",
    "bakery",
    48.1955608,
    11.583707,
    "Dependable Munich bakery stop between Am Hart and Harthof.",
  ),
  place(
    "north-bakery-03",
    "Brotladen Freimann",
    "bakery",
    48.1830159,
    11.6125717,
    "Small local bread shop on the way toward the northern English Garden.",
  ),
  place(
    "north-bakery-04",
    "Bäckerei Seidl",
    "bakery",
    48.204244,
    11.5587306,
    "Neighborhood bakery near Dülferstraße for bread, pastries and ride snacks.",
  ),
  place(
    "north-bakery-05",
    "Lerchenauer Backstube",
    "bakery",
    48.1958296,
    11.5465009,
    "Convenient bakery before circling Lerchenauer See or continuing to Fasaneriesee.",
  ),
  place(
    "north-bakery-06",
    "Bäckerei Kistenpfennig",
    "bakery",
    48.1689626,
    11.5865286,
    "A useful southern turnaround stop near Schwabing and Luitpoldpark.",
  ),
  place(
    "north-bakery-07",
    "Bäckerei Riedmair Garching",
    "bakery",
    48.2538636,
    11.6230247,
    "Bakery stop in Garching for refueling on a campus or Garchinger See ride.",
  ),

  place(
    "north-park-01",
    "Südliche Fröttmaninger Heide",
    "park",
    48.21822,
    11.6045012,
    "Open protected heathland immediately north of home, with broad skies and quiet paths.",
  ),
  place(
    "north-park-02",
    "Campuspark",
    "park",
    48.2200939,
    11.5923616,
    "Modern green corridor connecting the neighborhood toward Panzerwiese.",
  ),
  place(
    "north-park-03",
    "Harthofanger",
    "park",
    48.2046285,
    11.5697784,
    "Long local green space suited to an easy after-work spin.",
  ),
  place(
    "north-park-04",
    "Panzerwiese and Hartelholz",
    "park",
    48.219954,
    11.5748616,
    "Rare dry grassland and woodland that make northern Munich feel unexpectedly wild.",
  ),
  place(
    "north-park-05",
    "Domagkpark",
    "park",
    48.1853584,
    11.5957608,
    "Young neighborhood park with art, community spaces and easy links south.",
  ),
  place(
    "north-park-06",
    "Naherholungsgebiet Garching-Hochbrück",
    "park",
    48.2454213,
    11.6075369,
    "Green recreation area that breaks up the ride between Fröttmaning and Garching.",
  ),
  place(
    "north-park-07",
    "Schwarzhölzl",
    "park",
    48.2431009,
    11.5045609,
    "Protected woodland and moor landscape beyond Feldmochinger See.",
  ),
  place(
    "north-park-08",
    "Hofgarten Schleißheim",
    "park",
    48.2488161,
    11.5625264,
    "Long baroque canals and formal gardens connecting the Schleißheim palaces.",
  ),
  place(
    "north-park-09",
    "Mallertshofer Holz mit Heiden",
    "park",
    48.2702809,
    11.6207529,
    "Quiet woodland and heath reserve between Garching and Oberschleißheim.",
  ),
  place(
    "north-park-10",
    "Garchinger Heide",
    "park",
    48.2916179,
    11.6526653,
    "Botanically important heathland and a rewarding longer ride beyond Garching.",
  ),

  place(
    "north-lake-01",
    "Poschinger Weiher",
    "lake",
    48.2009603,
    11.6433438,
    "Small Isar-side swimming lake, close enough for a spontaneous warm-evening ride.",
  ),
  place(
    "north-lake-02",
    "Weiher in den Isarauen",
    "lake",
    48.2043673,
    11.6477027,
    "Quiet water among the Isar floodplain woods east of Freimann.",
  ),
  place(
    "north-lake-03",
    "Lerchenauer See",
    "lake",
    48.1972057,
    11.5373157,
    "Compact urban lake with lawns, a playground and easy evening access.",
  ),
  place(
    "north-lake-04",
    "Fasaneriesee",
    "lake",
    48.2041505,
    11.529298,
    "Family-friendly swimming lake with winding paths and generous green shores.",
  ),
  place(
    "north-lake-05",
    "Feringasee",
    "lake",
    48.1945815,
    11.6709816,
    "Large recreation lake east of the Isar, ideal for a medium-distance summer ride.",
  ),
  place(
    "north-lake-06",
    "Mallertshofer See",
    "lake",
    48.2645296,
    11.6008847,
    "Small northern lake paired naturally with the Mallertshofer heath and woods.",
  ),
  place(
    "north-lake-07",
    "Feldmochinger See",
    "lake",
    48.2133641,
    11.5139273,
    "Munich's largest city lake and the anchor of a classic northern three-lake loop.",
  ),
  place(
    "north-lake-08",
    "Garchinger See",
    "lake",
    48.2602299,
    11.6388394,
    "Green-edged swimming lake near Garching, reachable through mostly open northern terrain.",
  ),
  place(
    "north-lake-09",
    "Regattasee",
    "lake",
    48.2421171,
    11.5217632,
    "Lake beside the 1972 Olympic rowing course, with long views and strong geometry.",
  ),
  place(
    "north-lake-10",
    "Unterschleißheimer See",
    "lake",
    48.2872351,
    11.5555632,
    "A longer northern destination with lawns, swimming and plenty of space.",
  ),

  place(
    "north-view-01",
    "Heideblick",
    "viewpoint",
    48.215216,
    11.6100643,
    "Nearby overlook across Fröttmaninger heath, perfect for a very short sunset ride.",
  ),
  place(
    "north-view-02",
    "Flakhügel",
    "viewpoint",
    48.2228305,
    11.6110543,
    "Low historic hill offering open views over the heath and northern skyline.",
  ),
  place(
    "north-view-03",
    "Fröttmaninger Berg",
    "viewpoint",
    48.21418,
    11.6304476,
    "Renatured former landfill with views toward Munich, Allianz Arena and the Alps.",
  ),
  place(
    "north-view-04",
    "Damit alles fließt",
    "viewpoint",
    48.207729,
    11.6443223,
    "Small Isar-side viewpoint and artwork overlooking the water infrastructure.",
  ),
  place(
    "north-view-05",
    "Olympiaberg",
    "viewpoint",
    48.1698523,
    11.5516289,
    "The best substantial climb nearby, with stadium, skyline and Alpine views.",
  ),
  place(
    "north-view-06",
    "Schleißheim Canal Axis",
    "viewpoint",
    48.24877,
    11.5696223,
    "A striking long perspective through the palace gardens toward Schloss Lustheim.",
  ),

  place(
    "north-market-01",
    "Heidemarkt",
    "market",
    48.2014032,
    11.6066554,
    "The closest weekly market and a genuinely practical ride-from-home destination.",
  ),
  place(
    "north-market-02",
    "Wochenmarkt DomagKasino",
    "market",
    48.1841403,
    11.5969875,
    "Small neighborhood market beside Domagkpark with regional produce.",
  ),
  place(
    "north-market-03",
    "Bauernmarkt bei wagnisART",
    "market",
    48.1837524,
    11.5978879,
    "Community farmers' market surrounded by the distinctive wagnisART housing project.",
  ),
  place(
    "north-market-04",
    "Wochenmarkt Milbertshofen",
    "market",
    48.1814942,
    11.5672765,
    "Local weekly market that pairs well with Petuelpark or the Olympic grounds.",
  ),
  place(
    "north-market-05",
    "Wochenmarkt Lerchenauer See",
    "market",
    48.1971245,
    11.5355869,
    "Neighborhood market close to the lake, ideal for picnic supplies.",
  ),
  place(
    "north-market-06",
    "Garchinger Bauernmarkt",
    "market",
    48.2514941,
    11.650404,
    "Regional farmers' market and a useful goal for a longer ride into Garching.",
  ),

  place(
    "north-shop-01",
    "Nahkauf Kieferngarten",
    "supermarket",
    48.2041572,
    11.5994922,
    "The closest practical grocery stop for a quick everyday bike errand.",
  ),
  place(
    "north-shop-02",
    "Edeka Freimann",
    "supermarket",
    48.2019497,
    11.6064852,
    "Nearby full-size grocery option beside the Heidemarkt area.",
  ),
  place(
    "north-shop-03",
    "Alnatura Am Hart",
    "supermarket",
    48.2032845,
    11.5877184,
    "Organic grocery stop that fits a short westbound errands loop.",
  ),
  place(
    "north-shop-04",
    "Asiamarkt Freimann",
    "supermarket",
    48.191389,
    11.6208662,
    "A more interesting provisions stop for Asian groceries east of Freimann.",
  ),

  place(
    "north-museum-01",
    "FC Bayern Museum",
    "museum",
    48.2198752,
    11.6246429,
    "Club history inside Allianz Arena, close enough to be a casual local destination.",
  ),
  place(
    "north-museum-02",
    "DomagkAteliers Exhibition Hall",
    "museum",
    48.1827884,
    11.5996874,
    "Artist-run exhibitions in Munich's largest studio complex.",
  ),
  place(
    "north-museum-03",
    "BMW Museum",
    "museum",
    48.1767463,
    11.5590792,
    "Design and engineering history beside the Olympic grounds.",
  ),
  place(
    "north-museum-04",
    "Meissen Collection at Schloss Lustheim",
    "museum",
    48.2485633,
    11.575884,
    "Exceptional porcelain collection inside the small baroque hunting palace.",
  ),
  place(
    "north-museum-05",
    "Flugwerft Schleißheim",
    "museum",
    48.2453129,
    11.5558571,
    "Historic aircraft and aviation technology on one of Germany's oldest airfields.",
  ),
  place(
    "north-museum-06",
    "Schleißheim State Gallery",
    "museum",
    48.2484932,
    11.5609378,
    "Baroque painting displayed in the grand rooms of Neues Schloss.",
  ),
  place(
    "north-museum-07",
    "ESO Supernova",
    "museum",
    48.2594356,
    11.6701756,
    "Free astronomy center and planetarium on the Garching research campus.",
  ),
  place(
    "north-museum-08",
    "Stadtmuseum Unterschleißheim",
    "museum",
    48.2729332,
    11.5701206,
    "Compact local-history museum for a quieter northern cultural ride.",
  ),

  place(
    "north-palace-01",
    "Neues Schloss Schleißheim",
    "palace",
    48.2484932,
    11.5609378,
    "Monumental baroque palace with a grand staircase, state rooms and a long garden axis.",
  ),
  place(
    "north-palace-02",
    "Altes Schloss Schleißheim",
    "palace",
    48.248687,
    11.557655,
    "The older palace of the Schleißheim complex, arranged around a calm Renaissance courtyard.",
  ),
  place(
    "north-palace-03",
    "Schloss Lustheim",
    "palace",
    48.2485633,
    11.575884,
    "Small Italianate hunting palace at the far end of the canal, built for court festivities.",
  ),

  place(
    "north-church-01",
    "Heilig-Kreuz-Kirche Fröttmaning",
    "church",
    48.2177367,
    11.6303316,
    "Munich's oldest preserved church, standing alone where the old village disappeared.",
  ),
  place(
    "north-church-02",
    "St. Nikolaus Hasenbergl",
    "church",
    48.2162552,
    11.5541188,
    "Bold postwar-modern church designed as a strong civic marker for Hasenbergl.",
  ),
  place(
    "north-church-03",
    "St. Peter und Paul Feldmoching",
    "church",
    48.2160756,
    11.5282008,
    "Historic village church with a medieval core in old Feldmoching.",
  ),
  place(
    "north-church-04",
    "Bethanienkirche Feldmoching",
    "church",
    48.2144328,
    11.5331285,
    "Quiet Protestant church near the village center and Feldmoching lakes route.",
  ),
  place(
    "north-church-05",
    "St. Wilhelm Oberschleißheim",
    "church",
    48.2543991,
    11.5534719,
    "Distinctive parish church close to the palace and aviation museum cluster.",
  ),
  place(
    "north-church-06",
    "St. Korbinian Lohhof",
    "church",
    48.2823983,
    11.5764493,
    "Northern parish landmark that can anchor an Unterschleißheim loop.",
  ),
  place(
    "north-church-07",
    "Ost-West-Friedenskirche",
    "church",
    48.1670365,
    11.5483402,
    "Hand-built peace church and garden created by the remarkable hermit Timofei.",
  ),

  place(
    "north-gem-01",
    "HeideHaus Fröttmaning",
    "gem",
    48.211131,
    11.6149183,
    "Environmental center at the entrance to the heath, practically on the doorstep.",
  ),
  place(
    "north-gem-02",
    "Versunkenes Dorf",
    "gem",
    48.2160782,
    11.6305278,
    "A half-buried concrete copy of the old Fröttmaning church on the former landfill.",
  ),
  place(
    "north-gem-03",
    "Bell UH-1D Memorial",
    "gem",
    48.2088159,
    11.5833835,
    "Unexpected preserved rescue helicopter beside the Bundeswehr medical academy.",
  ),
  place(
    "north-gem-04",
    "Allianz Arena Esplanade",
    "gem",
    48.2187901,
    11.6236227,
    "The stadium's huge patterned shell and broad approach are dramatic even without a match.",
  ),
  place(
    "north-gem-05",
    "Olympic Regatta Course",
    "gem",
    48.2398287,
    11.5110764,
    "Monumental 1972 rowing course with a two-kilometer line of water and sky.",
  ),
  place(
    "north-gem-06",
    "Old Feldmoching Village",
    "gem",
    48.2165,
    11.529,
    "Farmhouses, inns and village scale survive inside Munich's northern boundary.",
  ),
  place(
    "north-gem-07",
    "Schleißheim Palace Canal",
    "gem",
    48.2487,
    11.568,
    "A long, ruler-straight baroque water axis that makes an unusually cinematic ride.",
  ),
  place(
    "north-gem-08",
    "Garching Research Campus",
    "gem",
    48.2635,
    11.6685,
    "Science campus of unusual architecture, experiments and the ESO astronomy center.",
  ),

  place(
    "west-gem-01",
    "Borstei",
    "gem",
    48.1700496,
    11.5339595,
    "A distinctive 1920s housing estate with courtyards, gardens and carefully integrated art.",
  ),
  place(
    "west-park-01",
    "Botanischer Garten München-Nymphenburg",
    "park",
    48.1632652,
    11.4998294,
    "Extensive botanical collections and glasshouses beside the Nymphenburg palace park.",
  ),
  place(
    "west-palace-01",
    "Schloss Nymphenburg",
    "palace",
    48.1582569,
    11.5032967,
    "A grand summer palace and park that make a rewarding western turnaround point.",
  ),
  place(
    "central-gem-01",
    "Königsplatz",
    "gem",
    48.1462995,
    11.5656312,
    "Monumental neoclassical square at the heart of Munich's museum quarter.",
  ),
  place(
    "central-museum-01",
    "Alte Pinakothek",
    "museum",
    48.1482838,
    11.5699796,
    "One of Europe's major Old Master collections in a landmark museum building.",
  ),
  place(
    "central-view-01",
    "Monopteros",
    "viewpoint",
    48.1498803,
    11.5909208,
    "Hilltop temple with a classic view across the English Garden toward the old town.",
  ),
  place(
    "central-gem-02",
    "Chinesischer Turm",
    "gem",
    48.1525525,
    11.5920973,
    "The English Garden's iconic wooden pagoda and a lively landmark for a park ride.",
  ),
  place(
    "east-view-01",
    "Friedensengel",
    "viewpoint",
    48.1413447,
    11.5969959,
    "A gilded city landmark above the Isar terraces with a broad westward view.",
  ),
  place(
    "east-park-01",
    "Denninger Anger",
    "park",
    48.1471146,
    11.6232615,
    "A long green corridor through Bogenhausen that works well as an eastbound cycling link.",
  ),
  place(
    "east-park-02",
    "Zamilapark",
    "park",
    48.1416941,
    11.6462836,
    "A neighborhood park and green destination that fills the quieter eastern side of the radius.",
  ),
  place(
    "central-museum-02",
    "Deutsches Museum",
    "museum",
    48.1300409,
    11.582909,
    "Major science and technology museum on its own island in the Isar.",
  ),
  place(
    "central-market-01",
    "Viktualienmarkt",
    "market",
    48.1352917,
    11.5751078,
    "Munich's central food market and a practical destination for a city ride.",
  ),
];

// Haversine distance in km
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// Estimated cycling time at 16 km/h
export function cyclingMinutes(km: number) {
  return Math.round((km / 16) * 60);
}

export interface Suggestion {
  id: string;
  title: string;
  blurb: string;
  emoji: string;
  destinationIds: string[];
}

export const SUGGESTIONS: Suggestion[] = [
  {
    id: "north-ride-01",
    title: "Doorstep Heath",
    blurb: "A short green escape with a curious local landmark",
    emoji: "🌳",
    destinationIds: ["north-gem-01", "north-view-01", "north-church-01"],
  },
  {
    id: "north-ride-02",
    title: "Coffee & Market",
    blurb: "A quick neighborhood provisions loop",
    emoji: "☕",
    destinationIds: ["north-market-01", "north-cafe-01", "north-cafe-02"],
  },
  {
    id: "north-ride-03",
    title: "Three Lakes",
    blurb: "A waterside loop through Munich's north",
    emoji: "🏞️",
    destinationIds: ["north-lake-03", "north-lake-04", "north-lake-07"],
  },
  {
    id: "north-ride-04",
    title: "Arena & Isar",
    blurb: "Architecture, hidden corners and waterside paths",
    emoji: "💎",
    destinationIds: ["north-gem-04", "north-gem-02", "north-lake-01"],
  },
  {
    id: "north-ride-05",
    title: "Palaces & Planes",
    blurb: "Aviation, baroque gardens and royal architecture",
    emoji: "🏰",
    destinationIds: ["north-museum-05", "north-palace-01", "north-palace-03"],
  },
  {
    id: "north-ride-06",
    title: "Campus & Cosmos",
    blurb: "A longer science-and-landscape adventure",
    emoji: "🌄",
    destinationIds: ["north-lake-08", "north-gem-08", "north-museum-07"],
  },
];
