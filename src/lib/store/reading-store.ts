import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ReadingValue = string | boolean | null | Record<string, boolean>;
export interface ReadingPosition { top: number; anchor?: string; offset?: number; }
export interface ReadingView extends ReadingPosition { values: Record<string, ReadingValue>; }
interface ReadingStore {
  views: Record<string, ReadingView>;
  setPosition: (scope: string, position: ReadingPosition) => void;
  setValue: (scope: string, key: string, value: ReadingValue) => void;
}
const MAX_VIEWS = 80;
const safeKey = (key: string) => key.length <= 1000 && !["__proto__", "constructor", "prototype"].includes(key);
export function isReadingValue(value: unknown): value is ReadingValue {
  return value === null || typeof value === "boolean" || (typeof value === "string" && value.length <= 300) ||
    (!!value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length <= 80 && Object.entries(value).every(([key, item]) => safeKey(key) && typeof item === "boolean"));
}
function position(value: Partial<ReadingPosition>): ReadingPosition {
  return { anchor: undefined, offset: undefined, top: Number.isFinite(value.top) ? Math.max(0, Math.min(2_000_000, value.top!)) : 0,
    ...(typeof value.anchor === "string" && value.anchor.length <= 500 && Number.isFinite(value.offset) ? { anchor: value.anchor, offset: Math.max(-2_000_000, Math.min(2_000_000, value.offset!)) } : {}) };
}
export function sanitizeReadingViews(value: unknown): Record<string, ReadingView> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([scope, view]) => safeKey(scope) && view && typeof view === "object" && !Array.isArray(view)).slice(-MAX_VIEWS).map(([scope, raw]) => {
    const view = raw as Partial<ReadingView>;
    const values = view.values && typeof view.values === "object" && !Array.isArray(view.values) ? Object.fromEntries(Object.entries(view.values).filter(([key, item]) => safeKey(key) && isReadingValue(item)).slice(-80)) : {};
    return [scope, { ...position(view), values }];
  }));
}
function updateView(views: ReadingStore["views"], scope: string, change: Partial<ReadingView>) {
  const next = { ...views };
  const previous = next[scope] || { top: 0, values: {} };
  delete next[scope]; // Keep the most recently used views at the end of the session cache.
  next[scope] = { ...previous, ...change };
  return Object.fromEntries(Object.entries(next).slice(-MAX_VIEWS));
}

/** Temporary reading preferences only. No baby records or cloud requests. */
export const useReadingStore = create<ReadingStore>()(persist((set, get) => ({
  views: {},
  setPosition: (scope, value) => {
    if (safeKey(scope)) set({ views: updateView(get().views, scope, position(value)) });
  },
  setValue: (scope, key, value) => {
    if (!safeKey(scope) || !safeKey(key) || !isReadingValue(value)) return;
    const values = Object.fromEntries(Object.entries({ ...get().views[scope]?.values, [key]: value }).slice(-80));
    set({ views: updateView(get().views, scope, { values }) });
  },
}), {
  name: "infantpedia-reading-session-v1",
  storage: createJSONStorage(() => ({
    getItem: key => { try { return sessionStorage.getItem(key); } catch { return null; } },
    setItem: (key, value) => { try { sessionStorage.setItem(key, value); } catch { /* Memory-only reading still works when storage is full or blocked. */ } },
    removeItem: key => { try { sessionStorage.removeItem(key); } catch { /* Optional session cache. */ } },
  })),
  partialize: state => ({ views: state.views }),
  merge: (persisted, current) => ({ ...current, views: sanitizeReadingViews((persisted as Partial<ReadingStore> | undefined)?.views) }),
}));
