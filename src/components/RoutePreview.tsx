import { HOME, type Destination } from "@/lib/destinations";

interface Props { stops: Destination[]; className?: string }

export function RoutePreview({ stops, className }: Props) {
  const pts = [HOME, ...stops, HOME];
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const pad = 0.01;
  const w = 200, h = 120;
  const proj = (lng: number, lat: number) => {
    const x = ((lng - (minLng - pad)) / ((maxLng + pad) - (minLng - pad))) * w;
    const y = h - ((lat - (minLat - pad)) / ((maxLat + pad) - (minLat - pad))) * h;
    return [x, y];
  };
  const path = pts.map((p, i) => {
    const [x, y] = proj(p.lng, p.lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const [hx, hy] = proj(HOME.lng, HOME.lat);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <rect width={w} height={h} fill="var(--color-muted)" />
      <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="3 3" />
      {stops.map((s, i) => {
        const [x, y] = proj(s.lng, s.lat);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--color-accent)" stroke="white" strokeWidth="1.5" />;
      })}
      <circle cx={hx} cy={hy} r="4.5" fill="var(--color-primary)" stroke="white" strokeWidth="2" />
    </svg>
  );
}
