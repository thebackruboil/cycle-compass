export type Category =
  | "supermarket"
  | "bakery"
  | "cafe"
  | "park"
  | "lake"
  | "viewpoint"
  | "church"
  | "museum"
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
  { id: "church", label: "Churches", icon: "⛪" },
  { id: "supermarket", label: "Supermarkets", icon: "🛒" },
  { id: "gem", label: "Hidden gems", icon: "💎" },
];

export const HOME = { lat: 52.5200, lng: 13.4050, label: "Home · Mitte" };

export interface Destination {
  id: string;
  name: string;
  category: Category;
  lat: number;
  lng: number;
  description: string;
  photo: string;
  nearby?: string[];
}

// Mock destinations around Berlin home
export const DESTINATIONS: Destination[] = [
  { id: "d1", name: "Bonanza Coffee Roasters", category: "cafe", lat: 52.534, lng: 13.412, description: "Cult roastery hidden in a Prenzlauer Berg courtyard. Pour-overs and quiet mornings.", photo: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=70", nearby: ["Mauerpark", "Kollwitzplatz"] },
  { id: "d2", name: "Domberger Brot-Werk", category: "bakery", lat: 52.546, lng: 13.380, description: "Sourdough loaves and butter-laminated pastries. Worth the detour.", photo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=70" },
  { id: "d3", name: "Tempelhofer Feld", category: "park", lat: 52.474, lng: 13.402, description: "A former airport turned vast open field. Endless horizon, kite flyers, urban gardens.", photo: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=70", nearby: ["Schillerkiez", "Hasenheide"] },
  { id: "d4", name: "Schlachtensee", category: "lake", lat: 52.438, lng: 13.218, description: "Clear, calm lake ringed by a shaded forest path. Perfect summer swim.", photo: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=70" },
  { id: "d5", name: "Teufelsberg Viewpoint", category: "viewpoint", lat: 52.497, lng: 13.241, description: "Cold War listening station on top of a rubble hill. The whole city unfolds below.", photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=70" },
  { id: "d6", name: "Markthalle Neun", category: "market", lat: 52.502, lng: 13.432, description: "Indoor market with regional producers. Street food Thursdays.", photo: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=70" },
  { id: "d7", name: "Hamburger Bahnhof", category: "museum", lat: 52.530, lng: 13.371, description: "Contemporary art inside a former railway station. Big spaces, big ideas.", photo: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=70" },
  { id: "d8", name: "Berliner Dom", category: "church", lat: 52.519, lng: 13.401, description: "Baroque dome on the Spree. Climb to the cupola for a river view.", photo: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=70" },
  { id: "d9", name: "Bio Company Mitte", category: "supermarket", lat: 52.525, lng: 13.395, description: "Organic groceries, quick stop on the way home.", photo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=70" },
  { id: "d10", name: "Klunkerkranich", category: "gem", lat: 52.479, lng: 13.441, description: "Rooftop garden bar above a shopping mall. Sunset crowd, no signs.", photo: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=70" },
  { id: "d11", name: "Café Einstein Stammhaus", category: "cafe", lat: 52.500, lng: 13.351, description: "Viennese coffeehouse. Marble tables, apple strudel.", photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=70" },
  { id: "d12", name: "Volkspark Friedrichshain", category: "park", lat: 52.527, lng: 13.434, description: "Hills, fairytale fountain, shady ride loops.", photo: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=70" },
  { id: "d13", name: "Weissensee", category: "lake", lat: 52.557, lng: 13.467, description: "Northern lake with a wooden swim platform and a sleepy beer garden.", photo: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=70" },
  { id: "d14", name: "Boxhagener Markt", category: "market", lat: 52.512, lng: 13.461, description: "Saturday neighborhood market — flowers, produce, fresh bread.", photo: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=70" },
  { id: "d15", name: "Zionskirche", category: "church", lat: 52.532, lng: 13.401, description: "Quiet 19th-century church on a leafy square.", photo: "https://images.unsplash.com/photo-1548276145-69a9521f0499?w=800&q=70" },
];

// Haversine distance in km
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
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
  { id: "s1", title: "Coffee Ride", blurb: "Two roasters, one bakery stop", emoji: "☕", destinationIds: ["d1", "d11", "d2"] },
  { id: "s2", title: "Sunday Market Ride", blurb: "Browse stalls and grab brunch", emoji: "🧺", destinationIds: ["d6", "d14"] },
  { id: "s3", title: "Lake Loop", blurb: "Two lakes, forest paths between", emoji: "🏞️", destinationIds: ["d4", "d13"] },
  { id: "s4", title: "Nature Escape", blurb: "Open field then hilltop view", emoji: "🌳", destinationIds: ["d3", "d5"] },
  { id: "s5", title: "Quick Grocery Ride", blurb: "Fresh bread, organic basics", emoji: "🛒", destinationIds: ["d2", "d9"] },
];
