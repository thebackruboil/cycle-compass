import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HOME, type Destination } from "@/lib/destinations";

interface Props {
  radiusKm: number;
  destinations: Destination[];
  highlightIds?: string[];
  onSelect?: (id: string) => void;
}

const categoryEmoji: Record<string, string> = {
  cafe: "☕", bakery: "🥐", park: "🌳", lake: "🏞️", viewpoint: "🌄",
  market: "🧺", museum: "🏛️", church: "⛪", supermarket: "🛒", gem: "💎",
};

export function MapView({ radiusKm, destinations, highlightIds, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [HOME.lat, HOME.lng],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { attribution: "© OpenStreetMap © CARTO", maxZoom: 19 },
    ).addTo(map);

    L.marker([HOME.lat, HOME.lng], {
      icon: L.divIcon({ className: "home-marker", iconSize: [18, 18] }),
    }).addTo(map).bindTooltip("Home", { direction: "top", offset: [0, -8] });

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // radius circle
  const circleRef = useRef<L.Circle | null>(null);
  useEffect(() => {
    if (!mapRef.current) return;
    if (circleRef.current) circleRef.current.remove();
    circleRef.current = L.circle([HOME.lat, HOME.lng], {
      radius: radiusKm * 1000,
      color: "#3f6b56",
      fillColor: "#3f6b56",
      fillOpacity: 0.06,
      weight: 1.5,
      dashArray: "6 6",
    }).addTo(mapRef.current);
    mapRef.current.fitBounds(circleRef.current.getBounds(), { padding: [30, 30] });
  }, [radiusKm]);

  // pins
  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();
    destinations.forEach((d) => {
      const isHi = highlightIds?.includes(d.id);
      const marker = L.marker([d.lat, d.lng], {
        icon: L.divIcon({
          className: "pin-marker",
          html: `<span>${categoryEmoji[d.category] ?? "📍"}</span>`,
          iconSize: [28, 28],
        }),
        zIndexOffset: isHi ? 1000 : 0,
      });
      marker.on("click", () => onSelect?.(d.id));
      marker.bindTooltip(d.name, { direction: "top", offset: [0, -14] });
      marker.addTo(layerRef.current!);
    });
  }, [destinations, highlightIds, onSelect]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
