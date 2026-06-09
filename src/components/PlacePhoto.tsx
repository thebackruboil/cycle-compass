import { CATEGORIES, type Destination } from "@/lib/destinations";
import { cn } from "@/lib/utils";

interface PlacePhotoProps {
  destination: Destination;
  className?: string;
  showLabel?: boolean;
}

export function PlacePhoto({ destination, className, showLabel = false }: PlacePhotoProps) {
  if (destination.photo) {
    return (
      <img
        src={destination.photo}
        alt={destination.name}
        className={cn("object-cover", className)}
      />
    );
  }

  const category = CATEGORIES.find((item) => item.id === destination.category);
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-primary/25 via-accent/20 to-secondary text-center",
        className,
      )}
      role="img"
      aria-label={`No verified photo available for ${destination.name}`}
    >
      <div>
        <div className="text-3xl">{category?.icon ?? "📍"}</div>
        {showLabel && (
          <div className="mt-2 text-xs font-medium text-foreground/65">No verified photo yet</div>
        )}
      </div>
    </div>
  );
}
