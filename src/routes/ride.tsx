import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation2,
  Route as RouteIcon,
  Trash2,
  X,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { RoutePreview } from "@/components/RoutePreview";
import { CATEGORIES, DESTINATIONS, HOME, cyclingMinutes, distanceKm } from "@/lib/destinations";
import { actions, useStore } from "@/lib/store";

function googleMapsDirectionsUrl(stops: typeof DESTINATIONS) {
  const params = new URLSearchParams({
    api: "1",
    origin: `${HOME.lat},${HOME.lng}`,
    destination: `${HOME.lat},${HOME.lng}`,
    travelmode: "bicycling",
    waypoints: stops.map((stop) => `${stop.lat},${stop.lng}`).join("|"),
    dir_action: "navigate",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export const Route = createFileRoute("/ride")({
  head: () => ({
    meta: [
      { title: "Ride Builder — Cycle Explorer" },
      {
        name: "description",
        content: "Combine stops into a circular ride starting and ending at home.",
      },
    ],
  }),
  component: RidePage,
});

function RidePage() {
  const navigate = useNavigate();
  const rideIds = useStore((s) => s.ride);
  const stops = rideIds.map((id) => DESTINATIONS.find((d) => d.id === id)!).filter(Boolean);

  const legs = stops.map((d, i) => {
    const prev = i === 0 ? HOME : stops[i - 1];
    return distanceKm(prev, d);
  });
  const closing = stops.length ? distanceKm(stops[stops.length - 1], HOME) : 0;
  const totalKm = legs.reduce((a, b) => a + b, 0) + closing;

  const navUrl = stops.length ? googleMapsDirectionsUrl(stops) : "#";

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="px-5 pb-4 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Ride builder</p>
        <h1 className="mt-1 text-3xl">Today's loop</h1>
      </header>

      {stops.length === 0 ? (
        <div className="mx-5 rounded-3xl border border-dashed border-border p-10 text-center">
          <div className="text-4xl">🚲</div>
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing in your ride yet. Add stops from the map and they'll loop back home.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Explore the map
          </Link>
        </div>
      ) : (
        <>
          <div className="mx-5 overflow-hidden rounded-[1.75rem] border border-border/80 bg-card shadow-card">
            <RoutePreview stops={stops} className="aspect-[16/7] min-h-40 w-full" />
            <div className="grid grid-cols-3 gap-1 border-t border-border/70 p-2">
              <Stat icon={RouteIcon} label="Distance" value={`${totalKm.toFixed(1)} km`} />
              <Stat icon={Clock3} label="Ride time" value={`${cyclingMinutes(totalKm)} min`} />
              <Stat icon={MapPin} label="Stops" value={`${stops.length}`} />
            </div>
          </div>

          <ol className="mt-6 space-y-2 px-5">
            <Leg index={0} label="Home" sublabel="Start" home />
            {stops.map((d, i) => {
              const cat = CATEGORIES.find((c) => c.id === d.category)!;
              return (
                <Leg
                  key={d.id}
                  index={i + 1}
                  label={d.name}
                  sublabel={`${legs[i].toFixed(1)} km · ${cat.label}`}
                  icon={cat.icon}
                  onRemove={() => actions.removeFromRide(d.id)}
                />
              );
            })}
            <Leg
              index={stops.length + 1}
              label="Home"
              sublabel={`${closing.toFixed(1)} km back`}
              home
            />
          </ol>

          <div className="mt-6 flex gap-2 px-5">
            <a
              href={navUrl}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Navigation2 className="h-4 w-4" /> Start ride
            </a>
            <button
              onClick={() => {
                actions.markVisitedMany(rideIds);
                actions.clearRide();
                navigate({ to: "/" });
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" /> Complete
            </button>
            <button
              onClick={actions.clearRide}
              className="flex items-center justify-center rounded-2xl border border-border bg-card p-3 text-muted-foreground"
              aria-label="Clear ride"
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof RouteIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl px-2 py-2.5 text-center">
      <Icon className="mx-auto mb-1.5 h-3.5 w-3.5 text-primary/70" strokeWidth={1.8} />
      <div className="text-[15px] font-semibold tracking-tight">{value}</div>
      <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Leg({
  index,
  label,
  sublabel,
  icon,
  home,
  onRemove,
}: {
  index: number;
  label: string;
  sublabel: string;
  icon?: string;
  home?: boolean;
  onRemove?: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${home ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
      >
        {home ? "⌂" : (icon ?? index)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sublabel}</div>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}
