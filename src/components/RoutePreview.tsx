import { HOME, type Destination } from "@/lib/destinations";
import { cn } from "@/lib/utils";

interface Props {
  stops: Destination[];
  className?: string;
}

export function RoutePreview({ stops, className }: Props) {
  const pts = [HOME, ...stops, HOME];
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = Math.max(maxLat - minLat, 0.01);
  const lngRange = Math.max(maxLng - minLng, 0.01);
  const latPad = latRange * 0.28;
  const lngPad = lngRange * 0.18;
  const w = 320;
  const h = 176;
  const plotTop = 46;
  const plotBottom = 14;

  const proj = (lng: number, lat: number) => {
    const x = ((lng - (minLng - lngPad)) / (lngRange + lngPad * 2)) * w;
    const normalizedY = (lat - (minLat - latPad)) / (latRange + latPad * 2);
    const y = plotTop + (1 - normalizedY) * (h - plotTop - plotBottom);
    return [x, y];
  };

  const path = pts
    .map((p, i) => {
      const [x, y] = proj(p.lng, p.lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const [hx, hy] = proj(HOME.lng, HOME.lat);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-[color-mix(in_oklab,var(--color-secondary)_54%,var(--color-background))]",
        className,
      )}
    >
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <span className="rounded-full bg-card/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
          Loop route
        </span>
        <span className="rounded-full bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
          Home + {stops.length} {stops.length === 1 ? "stop" : "stops"}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Circular ride with ${stops.length} stops`}
      >
        <defs>
          <filter id="route-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.16" />
          </filter>
          <linearGradient id="route-wash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-secondary)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--color-sand)" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        <rect width={w} height={h} fill="url(#route-wash)" />
        <g fill="none" stroke="var(--color-primary)" strokeOpacity="0.09" strokeWidth="1">
          <path d="M-30 58 C38 20 88 34 137 65 S244 102 355 48" />
          <path d="M-24 72 C43 36 87 49 132 78 S241 118 350 65" />
          <path d="M-18 91 C36 62 78 67 120 95 S223 137 342 91" />
          <path d="M14 151 C75 117 137 129 183 151 S276 181 336 142" />
        </g>

        <path
          d={path}
          fill="none"
          stroke="var(--color-card)"
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#route-shadow)"
        />

        {stops.map((stop, index) => {
          const [x, y] = proj(stop.lng, stop.lat);
          return (
            <g key={stop.id} transform={`translate(${x} ${y})`}>
              <circle r="9" fill="var(--color-card)" opacity="0.96" />
              <circle r="6.5" fill="var(--color-accent)" />
              <text
                y="0.5"
                fill="var(--color-accent-foreground)"
                fontSize="7"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {index + 1}
              </text>
            </g>
          );
        })}

        <g transform={`translate(${hx} ${hy})`}>
          <circle r="11" fill="var(--color-card)" opacity="0.96" />
          <circle r="8" fill="var(--color-primary)" />
          <path
            d="M-3.6 0 L0 -3.2 L3.6 0 V4 H1 V1.3 H-1 V4 H-3.6 Z"
            fill="var(--color-primary-foreground)"
          />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/35 to-transparent" />
    </div>
  );
}
