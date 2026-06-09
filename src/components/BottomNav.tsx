import { Link } from "@tanstack/react-router";
import { Compass, Map, Bookmark, Route as RouteIcon } from "lucide-react";

interface BottomNavProps {
  embedded?: boolean;
}

export function BottomNav({ embedded = false }: BottomNavProps) {
  const items = [
    { to: "/", label: "Explore", icon: Map },
    { to: "/discover", label: "Discover", icon: Compass },
    { to: "/ride", label: "Ride", icon: RouteIcon },
    { to: "/saved", label: "Saved", icon: Bookmark },
  ] as const;

  return (
    <nav
      aria-label="Main navigation"
      className={
        embedded
          ? "shrink-0 border-t border-border/55 bg-card/55"
          : "fixed inset-x-0 bottom-0 z-[1000] border-t border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl"
      }
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-1 py-1">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="ios-pressed ios-control flex flex-col items-center justify-center gap-0.5 rounded-xl text-muted-foreground transition-colors data-[status=active]:text-primary"
          >
            <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={2.2} />
            <span className="text-[11px] font-medium leading-none">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
