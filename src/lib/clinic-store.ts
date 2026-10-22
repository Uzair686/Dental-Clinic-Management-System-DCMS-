import { useEffect, useState, useSyncExternalStore } from "react";
import { seedDb, type ClinicDb, type Staff } from "./clinic";

const DB_KEY = "dentcare-demo-db-v1";
const SESSION_KEY = "dentcare-demo-session";

let cache: ClinicDb | null = null;
const listeners = new Set<() => void>();

function load(): ClinicDb {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(DB_KEY);
    cache = raw ? (JSON.parse(raw) as ClinicDb) : seedDb();
  } catch {
    cache = seedDb();
  }
  return cache;
}

export function updateDb(fn: (db: ClinicDb) => ClinicDb) {
  cache = fn(load());
  localStorage.setItem(DB_KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

export function resetDemo() {
  cache = seedDb();
  localStorage.setItem(DB_KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// Only call from components rendered after hydration (inside AppShell).
export function useDb(): ClinicDb {
  return useSyncExternalStore(subscribe, load, load);
}

export function signIn(staffId: string) {
  localStorage.setItem(SESSION_KEY, staffId);
  listeners.forEach((l) => l());
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
  listeners.forEach((l) => l());
}

/** undefined = still loading, null = signed out */
export function useSession(): Staff | null | undefined {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const db = useSyncExternalStore(subscribe, () => (ready ? load() : null), () => null);
  if (!ready || !db) return undefined;
  const id = localStorage.getItem(SESSION_KEY);
  return db.staff.find((s) => s.id === id) ?? null;
}
