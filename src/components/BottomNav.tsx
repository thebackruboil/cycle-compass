import { Link } from "@tanstack/react-router";
import { Map, Bookmark, Route as RouteIcon } from "lucide-react";

export function BottomNav() {
  const items = [
    { to: "/", label: "Explore", icon: Map },
    { to: "/ride", label: "Ride", icon: RouteIcon },
    { to: "/saved", label: "Saved", icon: Bookmark },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-md grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-1 py-3 text-muted-foreground transition-colors data-[status=active]:text-primary"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
