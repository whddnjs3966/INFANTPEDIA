import { create } from "zustand";

export interface BackupState {
  token: number;
  accountId: string;
  sharedBabyId: string;
  phase: "queued" | "syncing" | "success" | "error" | "idle";
  error?: string;
  lastSuccessAt?: string;
}
interface BackupStore {
  byBaby: Record<string, BackupState>;
  retries: Record<string, number>;
  queue: (babyId: string, accountId: string, sharedBabyId: string) => number;
  start: (babyId: string, token: number) => boolean;
  finish: (babyId: string, token: number, error?: string) => boolean;
  cancel: (babyId: string, token: number) => void;
  retry: (babyId: string, accountId: string) => void;
}
let sequence = 0;
// Runtime acknowledgements only: a fresh session must not inherit "backup complete".
export const useBackupStore = create<BackupStore>((set, get) => ({
  byBaby: {}, retries: {},
  queue: (babyId, accountId, sharedBabyId) => {
    const token = ++sequence;
    const previous = get().byBaby[babyId];
    set(state => ({ byBaby: { ...state.byBaby, [babyId]: { token, accountId, sharedBabyId, phase: "queued", lastSuccessAt: previous?.accountId === accountId && previous.sharedBabyId === sharedBabyId ? previous.lastSuccessAt : undefined } } }));
    return token;
  },
  start: (babyId, token) => {
    const current = get().byBaby[babyId];
    if (current?.token !== token || current.phase !== "queued") return false;
    set(state => ({ byBaby: { ...state.byBaby, [babyId]: { ...current, phase: "syncing" } } }));
    return true;
  },
  finish: (babyId, token, error) => {
    const current = get().byBaby[babyId];
    if (current?.token !== token || current.phase !== "syncing") return false;
    set(state => ({ byBaby: { ...state.byBaby, [babyId]: { ...current, phase: error ? "error" : "success", error, lastSuccessAt: error ? current.lastSuccessAt : new Date().toISOString() } } }));
    return true;
  },
  cancel: (babyId, token) => {
    const current = get().byBaby[babyId];
    if (current?.token !== token) return;
    set(state => ({ byBaby: { ...state.byBaby, [babyId]: { ...current, token: ++sequence, phase: "idle", error: undefined } } }));
  },
  retry: (babyId, accountId) => {
    const current = get().byBaby[babyId];
    if (current?.accountId !== accountId || !["error", "idle"].includes(current.phase)) return;
    set(state => ({ retries: { ...state.retries, [babyId]: (state.retries[babyId] ?? 0) + 1 } }));
  },
}));
