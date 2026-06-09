import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Compass, Info, RotateCcw, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BottomNav } from "@/components/BottomNav";
import { PlacePhoto } from "@/components/PlacePhoto";
import {
  CATEGORIES,
  DESTINATIONS,
  HOME,
  cyclingMinutes,
  distanceKm,
  type Destination,
} from "@/lib/destinations";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Cycle Explorer" },
      {
        name: "description",
        content: "Swipe through cycling destinations and save your favorites.",
      },
    ],
  }),
  component: DiscoverPage,
});

const SWIPE_THRESHOLD = 90;
const EXIT_DISTANCE = 520;

function DiscoverPage() {
  const saved = useStore((s) => s.saved);
  const visited = useStore((s) => s.visited);
  const passed = useStore((s) => s.discoveryPassed);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  const cards = useMemo(() => {
    const unavailable = new Set([...saved, ...visited, ...passed]);
    return DESTINATIONS.filter((destination) => !unavailable.has(destination.id)).sort(
      (a, b) => distanceKm(HOME, a) - distanceKm(HOME, b),
    );
  }, [passed, saved, visited]);

  const current = cards[0];

  const decide = useCallback(
    (direction: "left" | "right") => {
      if (!current || leaving) return;
      setLeaving(direction);
      setDragX(direction === "right" ? EXIT_DISTANCE : -EXIT_DISTANCE);
      setDragY(-24);

      window.setTimeout(() => {
        if (direction === "right") actions.toggleSave(current.id);
        else actions.passDiscovery(current.id);
        setLeaving(null);
        setDragX(0);
        setDragY(0);
      }, 240);
    },
    [current, leaving],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") decide("left");
      if (event.key === "ArrowRight") decide("right");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [decide]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!current || leaving) return;
    dragging.current = true;
    dragStart.current = { x: event.clientX - dragX, y: event.clientY - dragY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || leaving) return;
    setDragX(event.clientX - dragStart.current.x);
    setDragY((event.clientY - dragStart.current.y) * 0.35);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (dragX > SWIPE_THRESHOLD) decide("right");
    else if (dragX < -SWIPE_THRESHOLD) decide("left");
    else {
      setDragX(0);
      setDragY(0);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden bg-background pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <header className="mx-auto w-full max-w-md px-5 pb-3 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <p className="ios-footnote font-medium">Find your next stop</p>
        <div className="flex items-end justify-between">
          <h1 className="ios-large-title mt-1">Discover</h1>
          {current && (
            <span className="pb-1 text-xs font-medium text-muted-foreground">
              {cards.length} nearby
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
        {current ? (
          <>
            <div className="relative min-h-0 flex-1">
              {cards
                .slice(0, 3)
                .reverse()
                .map((destination, reverseIndex) => {
                  const index = Math.min(cards.length, 3) - reverseIndex - 1;
                  const isTop = index === 0;
                  return (
                    <DiscoverCard
                      key={destination.id}
                      destination={destination}
                      index={index}
                      dragX={isTop ? dragX : 0}
                      dragY={isTop ? dragY : 0}
                      leaving={isTop ? leaving : null}
                      onPointerDown={isTop ? onPointerDown : undefined}
                      onPointerMove={isTop ? onPointerMove : undefined}
                      onPointerUp={isTop ? finishDrag : undefined}
                      onPointerCancel={isTop ? finishDrag : undefined}
                    />
                  );
                })}
            </div>

            <div className="flex shrink-0 items-center justify-center gap-5 py-4">
              <button
                onClick={() => decide("left")}
                className="ios-pressed flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-destructive shadow-card"
                aria-label={`Pass on ${current.name}`}
              >
                <X className="h-7 w-7" strokeWidth={2.4} />
              </button>
              <Link
                to="/destination/$id"
                params={{ id: current.id }}
                className="ios-pressed flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                aria-label={`View details for ${current.name}`}
              >
                <Info className="h-5 w-5" />
              </Link>
              <button
                onClick={() => decide("right")}
                className="ios-pressed flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card"
                aria-label={`Save ${current.name}`}
              >
                <Bookmark className="h-6 w-6" fill="currentColor" />
              </button>
            </div>
            <p className="pb-1 text-center text-[11px] font-medium text-muted-foreground">
              Swipe left to pass · right to save
            </p>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center pb-12">
            <div className="w-full rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center">
              <Compass className="mx-auto h-10 w-10 text-primary" strokeWidth={1.7} />
              <h2 className="mt-4 text-xl font-semibold">You’ve seen the whole deck</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Saved places are waiting in Saved. Shuffle the passed places back in whenever you’re
                ready.
              </p>
              <button
                onClick={actions.resetDiscovery}
                className="ios-pressed ios-control mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-semibold text-primary-foreground"
              >
                <RotateCcw className="h-4 w-4" /> Start again
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function DiscoverCard({
  destination,
  index,
  dragX,
  dragY,
  leaving,
  ...pointerHandlers
}: {
  destination: Destination;
  index: number;
  dragX: number;
  dragY: number;
  leaving: "left" | "right" | null;
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  const category = CATEGORIES.find((item) => item.id === destination.category)!;
  const km = distanceKm(HOME, destination);
  const saveOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1);
  const passOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);
  const scale = 1 - index * 0.035;
  const stackY = index * 11;
  const rotation = dragX / 18;

  return (
    <div
      {...pointerHandlers}
      className={`absolute inset-x-0 top-0 mx-auto h-full max-h-[38rem] min-h-[25rem] select-none overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-[0_18px_50px_-18px_rgba(0,0,0,0.45)] ${
        index === 0 ? "cursor-grab touch-none active:cursor-grabbing" : "pointer-events-none"
      } ${leaving || (index === 0 && dragX === 0) ? "transition-transform duration-200 ease-out" : ""}`}
      style={{
        zIndex: 10 - index,
        transform: `translate3d(${dragX}px, ${dragY + stackY}px, 0) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "50% 90%",
      }}
    >
      <PlacePhoto destination={destination} className="h-full w-full" showLabel />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/15" />

      {index === 0 && (
        <>
          <div
            className="absolute left-5 top-6 -rotate-12 rounded-lg border-[3px] border-emerald-300 px-3 py-1 text-2xl font-black uppercase tracking-wider text-emerald-200"
            style={{ opacity: saveOpacity }}
          >
            Save
          </div>
          <div
            className="absolute right-5 top-6 rotate-12 rounded-lg border-[3px] border-rose-300 px-3 py-1 text-2xl font-black uppercase tracking-wider text-rose-200"
            style={{ opacity: passOpacity }}
          >
            Pass
          </div>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <div className="mb-2 inline-flex items-center rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-xs font-medium backdrop-blur">
          {category.icon} {category.label}
        </div>
        <h2 className="text-[2rem] font-bold leading-[1.05] tracking-tight">{destination.name}</h2>
        <div className="mt-2 text-sm font-medium text-white/80">
          {km.toFixed(1)} km away · {cyclingMinutes(km)} min by bike
        </div>
        <p className="mt-3 line-clamp-3 text-[15px] leading-snug text-white/90">
          {destination.description}
        </p>
      </div>
    </div>
  );
}
