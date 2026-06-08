## Problem

On `/` the Leaflet map covers the search bar, radius selector, category chips and bottom sheet. Leaflet's internal panes use z-index 200–700, but the overlays in `src/routes/index.tsx` are set to `z-40`, so the map paints on top of them.

## Fix

Edit `src/routes/index.tsx` only (presentation-only change):

1. Top overlay wrapper: change `z-40` → `z-[1000]`.
2. Bottom sheet wrapper: change `z-40` → `z-[1000]`.
3. `BottomNav` at the bottom of the page: ensure it sits above the map too (give its root `z-[1000]` if it isn't already — verify in `src/components/BottomNav.tsx` and bump if needed).
4. Keep the Leaflet map container at its default stacking (no change to `MapView.tsx`).

No logic, data, or styling-token changes. Just z-index bumps so UI chrome stacks above Leaflet's panes.

## Verification

- Reload `/` at mobile viewport: search bar, radius pills, category chips visible at top; bottom sheet visible at bottom; map fills the area between.
- Drag/zoom the map: overlays stay on top, tooltips and markers stay below overlays.
