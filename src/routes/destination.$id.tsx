import {
  createFileRoute,
  Link,
  notFound,
  useCanGoBack,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Navigation2, Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PlacePhoto } from "@/components/PlacePhoto";
import { CATEGORIES, DESTINATIONS, HOME, cyclingMinutes, distanceKm } from "@/lib/destinations";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/destination/$id")({
  head: ({ params }) => {
    const d = DESTINATIONS.find((x) => x.id === params.id);
    const title = d ? `${d.name} — Cycle Explorer` : "Destination";
    const desc = d?.description ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(d?.photo ? [{ property: "og:image", content: d.photo }] : []),
      ],
    };
  },
  loader: ({ params }) => {
    const d = DESTINATIONS.find((x) => x.id === params.id);
    if (!d) throw notFound();
    return { destination: d };
  },
  component: DestinationPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center text-muted-foreground">
      Destination not found.{" "}
      <Link to="/" className="ml-2 text-primary underline">
        Back to map
      </Link>
    </div>
  ),
});

function DestinationPage() {
  const { destination: d } = Route.useLoaderData();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  const km = distanceKm(HOME, d);
  const cat = CATEGORIES.find((c) => c.id === d.category)!;
  const saved = useStore((s) => s.saved.includes(d.id));
  const onRide = useStore((s) => s.ride.includes(d.id));
  const note = useStore((s) => s.notes[d.id] ?? "");

  return (
    <div className="min-h-[100dvh] bg-background pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {/* Photo */}
      <div className="relative h-72 w-full">
        <PlacePhoto destination={d} className="h-full w-full" showLabel />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />
        <button
          onClick={() => {
            if (canGoBack) {
              router.history.back();
            } else {
              navigate({ to: "/" });
            }
          }}
          className="ios-material ios-pressed ios-control absolute left-4 top-[max(env(safe-area-inset-top),1rem)] flex items-center justify-center rounded-full"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => actions.toggleSave(d.id)}
          className={`ios-material ios-pressed ios-control absolute right-4 top-[max(env(safe-area-inset-top),1rem)] flex items-center justify-center rounded-full ${
            saved ? "bg-primary text-primary-foreground" : "bg-card/90"
          }`}
          aria-label={saved ? `Remove ${d.name} from saved places` : `Save ${d.name}`}
          aria-pressed={saved}
        >
          <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mx-auto -mt-6 max-w-md rounded-t-3xl bg-background px-5 pt-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </div>
        <h1 className="ios-large-title mt-1">{d.name}</h1>

        <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card text-center">
          <Stat label="From home" value={`${km.toFixed(1)} km`} />
          <Stat label="By bike" value={`${cyclingMinutes(km)} min`} />
          <Stat label="One way" value="easy" />
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-foreground/85">{d.description}</p>
        {d.photoSourceUrl && (
          <a
            href={d.photoSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="ios-control mt-1 inline-flex items-center text-[11px] text-muted-foreground underline decoration-muted-foreground/40 underline-offset-2"
          >
            {d.photoKind === "area" ? "Nearby area photo" : "Place photo"}
            {d.photoAuthor ? ` by ${d.photoAuthor}` : ""}
            {d.photoLicense ? ` · ${d.photoLicense}` : ""} · Wikimedia Commons
          </a>
        )}

        {d.nearby && d.nearby.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold">Nearby</h3>
            <div className="flex flex-wrap gap-2">
              {d.nearby.map((n: string) => (
                <span
                  key={n}
                  className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold">Your note</h3>
          <textarea
            value={note}
            onChange={(e) => actions.setNote(d.id, e.target.value)}
            placeholder="A memory, a tip, what to bring next time…"
            className="min-h-24 w-full resize-none rounded-xl border border-border bg-card p-3 text-[16px] leading-6 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="mt-6 flex gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}&travelmode=bicycling`}
            target="_blank"
            rel="noreferrer"
            className="ios-pressed ios-control flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-semibold text-primary-foreground"
          >
            <Navigation2 className="h-4 w-4" /> Navigate
          </a>
          <button
            onClick={() => actions.addToRide(d.id)}
            className={`ios-pressed ios-control flex flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold ${
              onRide ? "bg-accent text-accent-foreground" : "border border-border bg-card"
            }`}
          >
            <Plus className="h-4 w-4" /> {onRide ? "On ride" : "Add to ride"}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-3">
      <div className="text-sm font-semibold">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
