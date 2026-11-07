"use client";

import { createContext, useCallback, useContext, useState, type ReactNode, type SetStateAction } from "react";
import { useReadingStore, type ReadingValue } from "@/lib/store/reading-store";

const Context = createContext<string | null>(null);
export default function ReadingScope({ scope, children }: { scope: string; children: ReactNode }) {
  return <Context.Provider value={scope}>{children}</Context.Provider>;
}
function compatible(value: ReadingValue | undefined, fallback: ReadingValue) {
  if (value === undefined) return false;
  if (fallback === null) return value === null || typeof value === "string";
  return typeof fallback === typeof value && (typeof fallback !== "object" || value !== null);
}
export function useReadingValue<T extends ReadingValue>(key: string, initial: T): [T, (next: SetStateAction<T>) => void] {
  const scope = useContext(Context);
  const stored = useReadingStore(state => scope ? state.views[scope]?.values[key] : undefined);
  const [local, setLocal] = useState(initial);
  const value = compatible(stored, initial) ? stored as T : local;
  const update = useCallback((next: SetStateAction<T>) => {
    if (!scope) { setLocal(next); return; }
    const store = useReadingStore.getState();
    const saved = store.views[scope]?.values[key];
    const previous = compatible(saved, initial) ? saved as T : initial;
    store.setValue(scope, key, typeof next === "function" ? (next as (value: T) => T)(previous) : next);
  }, [scope, key, initial]);
  return [value, update];
}
