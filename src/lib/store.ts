import { useEffect, useState, useSyncExternalStore } from "react";

type State = {
  saved: string[];
  visited: string[];
  ride: string[];
  notes: Record<string, string>;
};

const KEY = "cycle-explorer-state";
const initial: State = { saved: [], visited: [], ride: [], notes: {} };

let state: State = initial;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {}
}
load();

function set(updater: (s: State) => State) {
  state = updater(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useStore<T>(selector: (s: State) => T): T {
  // SSR-safe
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const value = useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initial),
  );
  return mounted ? value : selector(initial);
}

export const actions = {
  toggleSave: (id: string) =>
    set((s) => ({ ...s, saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
  addToRide: (id: string) =>
    set((s) => (s.ride.includes(id) ? s : { ...s, ride: [...s.ride, id] })),
  removeFromRide: (id: string) =>
    set((s) => ({ ...s, ride: s.ride.filter((x) => x !== id) })),
  clearRide: () => set((s) => ({ ...s, ride: [] })),
  markVisited: (id: string) =>
    set((s) => (s.visited.includes(id) ? s : { ...s, visited: [...s.visited, id] })),
  setNote: (id: string, note: string) =>
    set((s) => ({ ...s, notes: { ...s.notes, [id]: note } })),
};
