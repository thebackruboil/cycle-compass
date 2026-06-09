import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HOME, type Destination } from "@/lib/destinations";

interface Props {
  radiusKm: number;
  destinations: Destination[];
  highlightIds?: string[];
  onSelect?: (id: string) => void;
}

const categoryEmoji: Record<string, string> = {
  cafe: "☕",
  bakery: "🥐",
  park: "🌳",
  lake: "🏞️",
  viewpoint: "🌄",
  market: "🧺",
  museum: "🏛️",
  palace: "🏰",
  church: "⛪",
  supermarket: "🛒",
  gem: "💎",
};

const MAP_VIEW_KEY = "cycle-explorer-map-view-v4";
const DEFAULT_MAP_ZOOM = 14;

interface StoredMapView {
  lat: number;
  lng: number;
  zoom: number;
  radiusKm: number;
}

function readStoredMapView(): StoredMapView | null {
  try {
    const raw = sessionStorage.getItem(MAP_VIEW_KEY);
    if (!raw) return null;

    const view = JSON.parse(raw) as Partial<StoredMapView>;
    if (
      typeof view.lat !== "number" ||
      typeof view.lng !== "number" ||
      typeof view.zoom !== "number" ||
      typeof view.radiusKm !== "number"
    ) {
      return null;
    }

    return view as StoredMapView;
  } catch {
    return null;
  }
}

export function MapView({ radiusKm, destinations, highlightIds, onSelect }: Props) {
  const [leaflet, setLeaflet] = useState<typeof L | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const restoredRadiusRef = useRef<number | null>(null);
  const radiusRef = useRef(radiusKm);
  radiusRef.current = radiusKm;

  useEffect(() => {
    let cancelled = false;

    void import("leaflet").then(({ default: leafletModule }) => {
      if (!cancelled) setLeaflet(leafletModule);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!leaflet || !containerRef.current || mapRef.current) return;
    const storedView = readStoredMapView();
    const map = leaflet.map(containerRef.current, {
      center: storedView ? [storedView.lat, storedView.lng] : [HOME.lat, HOME.lng],
      zoom: storedView?.zoom ?? DEFAULT_MAP_ZOOM,
      zoomSnap: 0.25,
      zoomControl: false,
      attributionControl: true,
    });
    restoredRadiusRef.current = storedView?.radiusKm ?? null;

    const saveView = () => {
      const center = map.getCenter();
      try {
        sessionStorage.setItem(
          MAP_VIEW_KEY,
          JSON.stringify({
            lat: center.lat,
            lng: center.lng,
            zoom: map.getZoom(),
            radiusKm: radiusRef.current,
          } satisfies StoredMapView),
        );
      } catch {
        // Navigation still works when session storage is unavailable.
      }
    };
    map.on("moveend", saveView);

    leaflet
      .tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      })
      .addTo(map);

    leaflet
      .marker([HOME.lat, HOME.lng], {
        icon: leaflet.divIcon({ className: "home-marker", iconSize: [18, 18] }),
      })
      .addTo(map)
      .bindTooltip("Home", { direction: "top", offset: [0, -8] });

    layerRef.current = leaflet.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      saveView();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      circleRef.current = null;
    };
  }, [leaflet]);

  // radius circle
  const circleRef = useRef<L.Circle | null>(null);
  useEffect(() => {
    if (!leaflet || !mapRef.current) return;
    if (circleRef.current) circleRef.current.remove();
    circleRef.current = leaflet
      .circle([HOME.lat, HOME.lng], {
        radius: radiusKm * 1000,
        color: "#3f6b56",
        fillColor: "#3f6b56",
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: "6 6",
      })
      .addTo(mapRef.current);
    if (restoredRadiusRef.current === radiusKm) {
      restoredRadiusRef.current = null;
      return;
    }
    restoredRadiusRef.current = null;
    mapRef.current.fitBounds(circleRef.current.getBounds(), { padding: [30, 30] });
  }, [leaflet, radiusKm]);

  // pins
  useEffect(() => {
    if (!leaflet || !mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();
    destinations.forEach((d) => {
      const isHi = highlightIds?.includes(d.id);
      const marker = leaflet.marker([d.lat, d.lng], {
        icon: leaflet.divIcon({
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
  }, [destinations, highlightIds, leaflet, onSelect]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
