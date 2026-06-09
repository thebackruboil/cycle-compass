import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PlacePhoto } from "@/components/PlacePhoto";
import { CATEGORIES, DESTINATIONS, HOME, cyclingMinutes, distanceKm } from "@/lib/destinations";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved places — Cycle Explorer" },
      {
        name: "description",
        content: "Your favorite destinations, visited spots, and personal notes.",
      },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [tab, setTab] = useState<"saved" | "visited">("saved");
  const saved = useStore((s) => s.saved);
  const visited = useStore((s) => s.visited);
  const notes = useStore((s) => s.notes);

  const ids = tab === "saved" ? saved : visited;
  const items = ids.map((id) => DESTINATIONS.find((d) => d.id === id)!).filter(Boolean);

  return (
    <div className="min-h-[100dvh] bg-background pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <header className="px-5 pb-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <p className="ios-footnote font-medium">Your Places</p>
        <h1 className="ios-large-title mt-1">Saved</h1>

        <div
          className="mt-4 grid w-full grid-cols-2 rounded-xl bg-secondary p-0.5"
          role="group"
          aria-label="Saved places view"
        >
          {(["saved", "visited"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`ios-pressed ios-control rounded-[0.625rem] px-4 text-[13px] font-semibold capitalize transition-colors ${
                tab === t ? "bg-card shadow-[var(--shadow-card)]" : "text-muted-foreground"
              }`}
              aria-pressed={tab === t}
            >
              {t} {t === "saved" ? `(${saved.length})` : `(${visited.length})`}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-2 px-5">
        {items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {tab === "saved"
              ? "Bookmark places you want to come back to."
              : "Places you've ridden to will show up here."}
          </div>
        )}
        {items.map((d) => {
          const cat = CATEGORIES.find((c) => c.id === d.category)!;
          const km = distanceKm(HOME, d);
          return (
            <Link
              key={d.id}
              to="/destination/$id"
              params={{ id: d.id }}
              className="ios-pressed flex min-h-24 gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2"
            >
              <PlacePhoto destination={d} className="h-20 w-20 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 py-1">
                <div className="text-xs text-muted-foreground">
                  {cat.icon} {cat.label}
                </div>
                <div className="truncate font-medium">{d.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {km.toFixed(1)} km · {cyclingMinutes(km)} min
                </div>
                {notes[d.id] && (
                  <div className="mt-1 line-clamp-1 text-xs italic text-foreground/70">
                    "{notes[d.id]}"
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        {tab === "saved" && items.length > 0 && (
          <button
            onClick={() => actions.markVisitedMany(saved)}
            className="ios-pressed ios-control mt-2 w-full rounded-xl border border-dashed border-border px-3 text-[13px] font-medium text-muted-foreground"
          >
            Mark all as visited
          </button>
        )}
        {tab === "visited" && items.length > 0 && (
          <button
            onClick={actions.clearVisited}
            className="ios-pressed ios-control mt-2 w-full rounded-xl border border-dashed border-border px-3 text-[13px] font-medium text-muted-foreground"
          >
            Reset explored history
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
