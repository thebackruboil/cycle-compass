import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Plus, Bookmark, ChevronDown, RefreshCw, ShoppingCart } from "lucide-react";
import { MapView } from "@/components/MapView";
import { BottomNav } from "@/components/BottomNav";
import { PlacePhoto } from "@/components/PlacePhoto";
import {
  CATEGORIES,
  DESTINATIONS,
  HOME,
  SUGGESTIONS,
  cyclingMinutes,
  distanceKm,
  type Category,
  type Destination,
  type Suggestion,
} from "@/lib/destinations";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cycle Explorer — rides from your door" },
      {
        name: "description",
        content:
          "Find interesting destinations within cycling distance of home. Build short rides without overplanning.",
      },
      { property: "og:title", content: "Cycle Explorer" },
      {
        property: "og:description",
        content: "Find interesting destinations within cycling distance of home.",
      },
    ],
  }),
  component: Index,
});

const RADII = [3, 5, 10] as const;
const SHEET_DRAG_THRESHOLD = 56;
const ADVENTURE_ROTATION_KEY = "cycle-explorer-adventure-rotation";
const EXPLORER_VIEW_KEY = "cycle-explorer-view";
const EXPLORER_RADIUS_KEY = "cycle-explorer-radius";
const LAST_SUPERMARKET_KEY = "cycle-explorer-last-supermarket";

interface ExplorerView {
  radius: number;
  activeCategories: Category[];
  showVisited: boolean;
  sheetOpen: boolean;
}

function buildAdventures(visitedIds: string[], rotation: number): Suggestion[] {
  const visited = new Set(visitedIds);
  const used = new Set<string>();
  const available = DESTINATIONS.filter(
    (destination) => !visited.has(destination.id) && distanceKm(HOME, destination) <= 15,
  );

  return SUGGESTIONS.map((suggestion, suggestionIndex) => {
    const templates = suggestion.destinationIds
      .map((id) => DESTINATIONS.find((destination) => destination.id === id))
      .filter((destination): destination is Destination => Boolean(destination));
    const stops: Destination[] = [];

    templates.forEach((template, stopIndex) => {
      const candidates = available
        .filter(
          (destination) =>
            destination.category === template.category &&
            !used.has(destination.id) &&
            !stops.some((stop) => stop.id === destination.id),
        )
        .sort((a, b) => distanceKm(HOME, a) - distanceKm(HOME, b));

      if (candidates.length === 0) return;

      const nearbyPool = candidates.slice(0, 6);
      const candidateIndex = (rotation + suggestionIndex * 5 + stopIndex * 3) % nearbyPool.length;
      const chosen = nearbyPool[candidateIndex];
      stops.push(chosen);
      used.add(chosen.id);
    });

    return { ...suggestion, destinationIds: stops.map((stop) => stop.id) };
  }).filter((suggestion) => suggestion.destinationIds.length >= 2);
}

function Index() {
  const navigate = useNavigate();
  const [radius, setRadius] = useState<number>(5);
  const [active, setActive] = useState<Set<Category>>(new Set());
  const [showVisited, setShowVisited] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [sheetDragY, setSheetDragY] = useState(0);
  const [adventureRotation, setAdventureRotation] = useState(0);
  const [viewRestored, setViewRestored] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetScrollRef = useRef<HTMLDivElement>(null);
  const sheetDragStartY = useRef<number | null>(null);
  const sheetWasDragged = useRef(false);
  const ride = useStore((s) => s.ride);
  const visited = useStore((s) => s.visited);

  useEffect(() => {
    try {
      const storedRadius = Number(localStorage.getItem(EXPLORER_RADIUS_KEY));
      if (RADII.includes(storedRadius as (typeof RADII)[number])) {
        setRadius(storedRadius);
      }
    } catch {
      // The default radius is used when persistent storage is unavailable.
    }

    try {
      const raw = sessionStorage.getItem(EXPLORER_VIEW_KEY);
      if (raw) {
        const view = JSON.parse(raw) as Partial<ExplorerView>;
        const validCategories = new Set(CATEGORIES.map((category) => category.id));

        if (RADII.includes(view.radius as (typeof RADII)[number])) {
          setRadius(view.radius!);
        }
        if (Array.isArray(view.activeCategories)) {
          setActive(
            new Set(
              view.activeCategories.filter((category): category is Category =>
                validCategories.has(category),
              ),
            ),
          );
        }
        if (typeof view.showVisited === "boolean") setShowVisited(view.showVisited);
        if (typeof view.sheetOpen === "boolean") setSheetOpen(view.sheetOpen);
      }
    } catch {
      // Invalid session data falls back to the default explorer view.
    }
    setViewRestored(true);
  }, []);

  useEffect(() => {
    if (!viewRestored) return;

    const view: ExplorerView = {
      radius,
      activeCategories: [...active],
      showVisited,
      sheetOpen,
    };
    try {
      sessionStorage.setItem(EXPLORER_VIEW_KEY, JSON.stringify(view));
    } catch {
      // The current page still retains the view when storage is unavailable.
    }
    try {
      localStorage.setItem(EXPLORER_RADIUS_KEY, String(radius));
    } catch {
      // The selected radius still works for the current page.
    }
  }, [active, radius, sheetOpen, showVisited, viewRestored]);

  useEffect(() => {
    try {
      const previous = Number(sessionStorage.getItem(ADVENTURE_ROTATION_KEY) ?? "0");
      const next = Number.isFinite(previous) ? previous + 1 : 1;
      sessionStorage.setItem(ADVENTURE_ROTATION_KEY, String(next));
      setAdventureRotation(next);
    } catch {
      setAdventureRotation(1);
    }
  }, []);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    let startX = 0;
    let startY: number | null = null;
    let dragActive = false;
    let startedInScrollArea = false;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      dragActive = false;
      sheetWasDragged.current = false;
      startedInScrollArea =
        event.target instanceof Node && Boolean(sheetScrollRef.current?.contains(event.target));
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (startY === null || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const movementY = touch.clientY - startY;
      const movementX = touch.clientX - startX;
      if (Math.abs(movementY) <= Math.abs(movementX)) return;

      if (sheetOpen) {
        if (movementY <= 0) return;
        if (startedInScrollArea && (sheetScrollRef.current?.scrollTop ?? 0) > 0) return;
      } else if (movementY >= 0) {
        return;
      }

      event.preventDefault();
      dragActive = true;
      sheetDragStartY.current = startY;
      sheetWasDragged.current ||= Math.abs(movementY) > 6;
      setSheetDragY(sheetOpen ? Math.max(0, movementY) : Math.min(0, movementY));
    };

    const finishTouchDrag = (event: TouchEvent) => {
      if (startY === null) return;

      const movement = event.changedTouches[0]?.clientY - startY;
      if (dragActive && Number.isFinite(movement)) {
        if (movement > SHEET_DRAG_THRESHOLD) {
          setSheetOpen(false);
        } else if (movement < -SHEET_DRAG_THRESHOLD) {
          setSheetOpen(true);
        }
      }

      startY = null;
      dragActive = false;
      sheetDragStartY.current = null;
      setSheetDragY(0);
    };

    const cancelTouchDrag = () => {
      startY = null;
      dragActive = false;
      sheetDragStartY.current = null;
      sheetWasDragged.current = false;
      setSheetDragY(0);
    };

    sheet.addEventListener("touchstart", handleTouchStart, { passive: true });
    sheet.addEventListener("touchmove", handleTouchMove, { passive: false });
    sheet.addEventListener("touchend", finishTouchDrag, { passive: true });
    sheet.addEventListener("touchcancel", cancelTouchDrag, { passive: true });

    return () => {
      sheet.removeEventListener("touchstart", handleTouchStart);
      sheet.removeEventListener("touchmove", handleTouchMove);
      sheet.removeEventListener("touchend", finishTouchDrag);
      sheet.removeEventListener("touchcancel", cancelTouchDrag);
    };
  }, [sheetOpen]);

  const visible = useMemo(() => {
    return DESTINATIONS.map((d) => ({ ...d, km: distanceKm(HOME, d) }))
      .filter((d) => d.km <= radius)
      .filter((d) => showVisited || !visited.includes(d.id))
      .filter((d) => (active.size === 0 ? true : active.has(d.category)))
      .sort((a, b) => a.km - b.km);
  }, [radius, active, showVisited, visited]);

  const adventures = useMemo(
    () => buildAdventures(visited, adventureRotation),
    [visited, adventureRotation],
  );

  const refreshAdventures = () => {
    setAdventureRotation((current) => {
      const next = current + 1;
      try {
        sessionStorage.setItem(ADVENTURE_ROTATION_KEY, String(next));
      } catch {
        // Rotation still works for the current page.
      }
      return next;
    });
  };

  const startSupermarketRun = () => {
    const supermarkets = DESTINATIONS.filter(
      (destination) => destination.category === "supermarket",
    ).sort((a, b) => distanceKm(HOME, a) - distanceKm(HOME, b));

    if (supermarkets.length === 0) return;

    let lastSupermarketId = "";
    try {
      lastSupermarketId = localStorage.getItem(LAST_SUPERMARKET_KEY) ?? "";
    } catch {
      // A fresh choice still works when storage is unavailable.
    }

    const choices = supermarkets.filter((destination) => destination.id !== lastSupermarketId);
    const pool = choices.length > 0 ? choices : supermarkets;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    try {
      localStorage.setItem(LAST_SUPERMARKET_KEY, chosen.id);
    } catch {
      // The run can still be created without remembering the previous choice.
    }

    actions.clearRide();
    actions.addToRide(chosen.id);
    navigate({ to: "/ride" });
  };

  const toggleCat = (c: Category) => {
    const next = new Set(active);
    if (next.has(c)) {
      next.delete(c);
    } else {
      next.add(c);
    }
    setActive(next);
  };

  const handleSheetPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;

    sheetDragStartY.current = event.clientY;
    sheetWasDragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    if (sheetDragStartY.current === null) return;

    const movement = event.clientY - sheetDragStartY.current;
    const nextDragY = sheetOpen ? Math.max(0, movement) : Math.min(0, movement);
    sheetWasDragged.current ||= Math.abs(movement) > 6;
    setSheetDragY(nextDragY);
  };

  const finishSheetDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    if (sheetDragStartY.current === null) return;

    const movement = event.clientY - sheetDragStartY.current;
    if (movement > SHEET_DRAG_THRESHOLD) {
      setSheetOpen(false);
    } else if (movement < -SHEET_DRAG_THRESHOLD) {
      setSheetOpen(true);
    }

    sheetDragStartY.current = null;
    setSheetDragY(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const cancelSheetDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    sheetDragStartY.current = null;
    sheetWasDragged.current = false;
    setSheetDragY(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const suppressClickAfterSheetDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!sheetWasDragged.current) return;

    event.preventDefault();
    event.stopPropagation();
    sheetWasDragged.current = false;
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">
      {/* Map */}
      <div className="absolute inset-0">
        {viewRestored && (
          <MapView
            radiusKm={radius}
            destinations={visible}
            onSelect={(id) => navigate({ to: "/destination/$id", params: { id } })}
          />
        )}
      </div>

      {/* Top overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] bg-gradient-to-b from-background/90 via-background/55 to-transparent pb-7 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <div className="pointer-events-auto mx-auto max-w-md px-4">
          <div className="flex items-center justify-between">
            {/* Radius selector */}
            <div
              className="ios-material inline-flex rounded-[1rem] p-1"
              role="group"
              aria-label="Map radius"
            >
              {RADII.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`ios-pressed ios-control rounded-xl px-4 text-[13px] font-semibold transition-colors ${
                    radius === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                  aria-pressed={radius === r}
                >
                  {r} km
                </button>
              ))}
            </div>
            <Link
              to="/saved"
              aria-label="View saved places"
              className="ios-material ios-pressed ios-control flex items-center justify-center rounded-full text-foreground"
            >
              <Bookmark className="h-5 w-5" />
            </Link>
          </div>

          {/* Category chips */}
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {visited.length > 0 && (
              <button
                onClick={() => setShowVisited((show) => !show)}
                className={`ios-pressed ios-control flex shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors ${
                  showVisited
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground"
                }`}
                aria-pressed={showVisited}
              >
                <span>{showVisited ? "Hide" : "Show"} explored</span>
                <span className="opacity-70">({visited.length})</span>
              </button>
            )}
            {CATEGORIES.map((c) => {
              const on = active.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCat(c.id)}
                  className={`ios-pressed ios-control flex shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors ${
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
        className={`absolute inset-x-0 bottom-0 z-[1000] mx-auto max-w-md px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] ${
          sheetDragStartY.current === null
            ? "transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            : ""
        }`}
        style={{
          height: sheetOpen
            ? `calc(100dvh - max(env(safe-area-inset-top), 0.5rem) - ${Math.max(0, sheetDragY)}px)`
            : `calc(16rem + ${Math.max(0, -sheetDragY)}px)`,
        }}
      >
        <div
          ref={sheetRef}
          onPointerDown={handleSheetPointerDown}
          onPointerMove={handleSheetPointerMove}
          onPointerUp={finishSheetDrag}
          onPointerCancel={cancelSheetDrag}
          onClickCapture={suppressClickAfterSheetDrag}
          className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/35 bg-background/88 shadow-[0_10px_40px_color-mix(in_oklab,var(--foreground)_22%,transparent)] backdrop-blur-2xl"
        >
          <div
            className="flex h-7 w-full shrink-0 touch-none cursor-grab flex-col items-center justify-center active:cursor-grabbing"
            aria-hidden="true"
          >
            <div className="h-1.5 w-9 rounded-full bg-muted-foreground/25" />
          </div>

          <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 pb-3">
            <div>
              <h2 className="text-[17px] font-semibold tracking-tight">
                {visible.length} {visible.length === 1 ? "place" : "places"} nearby
              </h2>
              <p className="ios-footnote">
                Within {radius} km
                {active.size > 0 ? ` · ${active.size} filters` : " · All categories"}
              </p>
            </div>
            <button
              onClick={() => setSheetOpen((open) => !open)}
              className="ios-pressed ios-control flex items-center justify-center rounded-full bg-secondary text-muted-foreground"
              aria-label={sheetOpen ? "Collapse places" : "Expand places"}
              aria-expanded={sheetOpen}
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${
                  sheetOpen ? "" : "rotate-180"
                }`}
              />
            </button>
          </div>

          <div ref={sheetScrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
            {/* Suggestions */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold">Suggested rides</h3>
                <span className="ios-footnote">
                  {visited.length > 0
                    ? `${visited.length} explored · only fresh stops shown`
                    : "Fresh adventures from your doorstep"}
                </span>
              </div>
              <button
                onClick={refreshAdventures}
                className="ios-pressed ios-control flex items-center gap-1.5 rounded-full bg-secondary px-3 text-[13px] font-semibold text-secondary-foreground"
                aria-label="Refresh smart rides"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Shuffle
              </button>
            </div>

            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-4">
              <button
                onClick={startSupermarketRun}
                className="ios-pressed group w-64 shrink-0 overflow-hidden rounded-[1.25rem] border border-border bg-background text-left transition-shadow hover:shadow-[var(--shadow-card)]"
              >
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-accent">
                  <ShoppingCart className="h-14 w-14 text-primary-foreground/90 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs backdrop-blur">
                    🛒 1 stop
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                    A different store each time
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-display text-base font-semibold leading-tight">
                    Supermarket run
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Pick another nearby grocery stop
                  </div>
                </div>
              </button>

              {adventures.map((s) => {
                const stops = s.destinationIds
                  .map((id) => DESTINATIONS.find((d) => d.id === id)!)
                  .filter(Boolean);
                const totalKm =
                  stops.reduce((acc, d, i) => {
                    const prev = i === 0 ? HOME : stops[i - 1];
                    return acc + distanceKm(prev, d);
                  }, 0) + distanceKm(stops[stops.length - 1], HOME);
                const photoStop = stops.find((stop) => stop.photo);
                return (
                  <button
                    key={`${s.id}-${adventureRotation}`}
                    onClick={() => {
                      actions.clearRide();
                      stops.forEach((d) => actions.addToRide(d.id));
                      navigate({ to: "/ride" });
                    }}
                    className="ios-pressed group w-64 shrink-0 overflow-hidden rounded-[1.25rem] border border-border bg-background text-left transition-shadow hover:shadow-[var(--shadow-card)]"
                  >
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary/35 via-accent/25 to-muted">
                      {photoStop && (
                        <PlacePhoto
                          destination={photoStop}
                          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/15" />
                      <div className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs backdrop-blur">
                        {s.emoji} {stops.length} stops
                      </div>
                      <div className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                        Route revealed on pick
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-display text-base font-semibold leading-tight">
                        {s.title}
                      </div>
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
              {adventures.length === 0 && (
                <div className="w-64 shrink-0 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  You have explored every matching adventure nearby. Individual destinations are
                  still available below.
                </div>
              )}
            </div>

            {/* Destinations list */}
            <div className="mb-2 mt-2 flex items-end justify-between">
              <h3 className="text-[15px] font-semibold">All nearby places</h3>
              <span className="text-[12px] text-muted-foreground">Nearest first</span>
            </div>
            <ul className="divide-y divide-border/70 overflow-hidden rounded-[1.25rem] bg-card">
              {visible.map((d) => {
                const cat = CATEGORIES.find((c) => c.id === d.category)!;
                const onRide = ride.includes(d.id);
                return (
                  <li key={d.id} className="flex min-h-[4.75rem] items-center">
                    <Link
                      to="/destination/$id"
                      params={{ id: d.id }}
                      className="ios-pressed flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-3 transition-colors hover:bg-secondary/50"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.85rem] bg-secondary">
                        <PlacePhoto destination={d} className="h-full w-full" />
                        <span className="absolute bottom-0.5 right-0.5 rounded-md bg-card/90 px-1 text-[12px] shadow-sm">
                          {cat.icon}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {d.km.toFixed(1)} km · {cyclingMinutes(d.km)} min · {cat.label}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => actions.addToRide(d.id)}
                      className={`ios-pressed ios-control mr-3 flex shrink-0 items-center justify-center rounded-full transition-colors ${
                        onRide
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                      aria-label={onRide ? `${d.name} is on your ride` : `Add ${d.name} to ride`}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </li>
                );
              })}
              {visible.length === 0 && (
                <li className="p-6 text-center text-sm text-muted-foreground">
                  Nothing matches yet — widen the radius or clear filters.
                </li>
              )}
            </ul>
          </div>
          <BottomNav embedded />
        </div>
      </div>
    </div>
  );
}
