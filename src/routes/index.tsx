import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Bookmark, ChevronUp } from "lucide-react";
import { MapView } from "@/components/MapView";
import { BottomNav } from "@/components/BottomNav";
import { RoutePreview } from "@/components/RoutePreview";
import {
  CATEGORIES, DESTINATIONS, HOME, SUGGESTIONS,
  cyclingMinutes, distanceKm, type Category,
} from "@/lib/destinations";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cycle Explorer — rides from your door" },
      { name: "description", content: "Find interesting destinations within cycling distance of home. Build short rides without overplanning." },
      { property: "og:title", content: "Cycle Explorer" },
      { property: "og:description", content: "Find interesting destinations within cycling distance of home." },
    ],
  }),
  component: Index,
});

const RADII = [5, 10, 15] as const;

function Index() {
  const navigate = useNavigate();
  const [radius, setRadius] = useState<number>(10);
  const [active, setActive] = useState<Set<Category>>(new Set());
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(true);
  const saved = useStore((s) => s.saved);
  const ride = useStore((s) => s.ride);

  const visible = useMemo(() => {
    return DESTINATIONS.map((d) => ({ ...d, km: distanceKm(HOME, d) }))
      .filter((d) => d.km <= radius)
      .filter((d) => (active.size === 0 ? true : active.has(d.category)))
      .filter((d) => (query ? d.name.toLowerCase().includes(query.toLowerCase()) : true))
      .sort((a, b) => a.km - b.km);
  }, [radius, active, query]);

  const toggleCat = (c: Category) => {
    const next = new Set(active);
    next.has(c) ? next.delete(c) : next.add(c);
    setActive(next);
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">
      {/* Map */}
      <div className="absolute inset-0">
        <MapView
          radiusKm={radius}
          destinations={visible}
          onSelect={(id) => navigate({ to: "/destination/$id", params: { id } })}
        />
      </div>

      {/* Top overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] bg-gradient-to-b from-background/95 via-background/70 to-transparent pb-6 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <div className="pointer-events-auto mx-auto max-w-md px-4">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Where to today?"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <Link to="/saved" className="rounded-full bg-secondary p-1.5 text-secondary-foreground">
              <Bookmark className="h-4 w-4" />
            </Link>
          </div>

          {/* Radius selector */}
          <div className="mt-3 inline-flex rounded-full bg-card p-1 shadow-[var(--shadow-card)]">
            {RADII.map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  radius === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {CATEGORIES.map((c) => {
              const on = active.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCat(c.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 z-[1000] mx-auto max-w-md transition-transform duration-300 ${
          sheetOpen ? "translate-y-0" : "translate-y-[calc(100%-7rem)]"
        }`}
        style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" }}
      >
        <div className="rounded-t-3xl bg-card shadow-[var(--shadow-sheet)]">
          <button
            onClick={() => setSheetOpen((v) => !v)}
            className="flex w-full flex-col items-center pt-3 pb-1"
            aria-label="Toggle sheet"
          >
            <div className="h-1.5 w-10 rounded-full bg-border" />
          </button>

          <div className="max-h-[55dvh] overflow-y-auto px-5 pb-6">
            {/* Suggestions */}
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Smart rides</h2>
              <span className="text-xs text-muted-foreground">{visible.length} places nearby</span>
            </div>

            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-4">
              {SUGGESTIONS.map((s) => {
                const stops = s.destinationIds.map((id) => DESTINATIONS.find((d) => d.id === id)!).filter(Boolean);
                const totalKm = stops.reduce((acc, d, i) => {
                  const prev = i === 0 ? HOME : stops[i - 1];
                  return acc + distanceKm(prev, d);
                }, 0) + distanceKm(stops[stops.length - 1], HOME);
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      actions.clearRide();
                      stops.forEach((d) => actions.addToRide(d.id));
                      navigate({ to: "/ride" });
                    }}
                    className="group w-56 shrink-0 overflow-hidden rounded-2xl border border-border bg-background text-left transition-shadow hover:shadow-[var(--shadow-card)]"
                  >
                    <div className="relative h-24 bg-muted">
                      <RoutePreview stops={stops} className="absolute inset-0 h-full w-full" />
                      <div className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-xs backdrop-blur">
                        {s.emoji} {stops.length} stops
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-display text-base font-semibold leading-tight">{s.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{s.blurb}</div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{totalKm.toFixed(1)} km</span>
                        <span>·</span>
                        <span>{cyclingMinutes(totalKm)} min</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Destinations list */}
            <h2 className="mt-2 mb-3 text-lg font-semibold">Nearby destinations</h2>
            <ul className="space-y-2">
              {visible.map((d) => {
                const cat = CATEGORIES.find((c) => c.id === d.category)!;
                const onRide = ride.includes(d.id);
                const isSaved = saved.includes(d.id);
                return (
                  <li key={d.id}>
                    <Link
                      to="/destination/$id"
                      params={{ id: d.id }}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                        {cat.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {d.km.toFixed(1)} km · {cyclingMinutes(d.km)} min · {cat.label}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); actions.addToRide(d.id); }}
                        className={`shrink-0 rounded-full p-2 transition-colors ${
                          onRide ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        }`}
                        aria-label="Add to ride"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </Link>
                  </li>
                );
              })}
              {visible.length === 0 && (
                <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nothing matches yet — widen the radius or clear filters.
                </li>
              )}
            </ul>
          </div>
        </div>

        {!sheetOpen && (
          <button
            onClick={() => setSheetOpen(true)}
            className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow"
          >
            <ChevronUp className="inline h-3 w-3" /> Show places
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
