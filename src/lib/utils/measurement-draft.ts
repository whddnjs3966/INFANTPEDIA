import type { Measurement } from '../store/measurement-store';

export interface MeasurementDraft { date: string; height: string; weight: string; head: string; memo: string; }
const storageKey = 'infantpedia-measurement-drafts-v1';
let cache: Record<string, MeasurementDraft> | undefined;
function valid(value: unknown): value is MeasurementDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as MeasurementDraft;
  return ['date', 'height', 'weight', 'head', 'memo'].every(key => typeof draft[key as keyof MeasurementDraft] === 'string') && draft.date.length <= 10 && draft.height.length <= 30 && draft.weight.length <= 30 && draft.head.length <= 30 && draft.memo.length <= 5000;
}
function drafts() {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
    cache = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? Object.fromEntries(Object.entries(parsed).filter(([key, value]) => key.startsWith('measurement:') && key.length < 2000 && valid(value)).slice(-20)) : {};
  } catch { cache = {}; }
  return cache;
}
function persist() {
  try { if (Object.keys(drafts()).length) sessionStorage.setItem(storageKey, JSON.stringify(drafts())); else sessionStorage.removeItem(storageKey); }
  catch { /* A blocked/full session store must not interrupt entering a measurement. */ }
}
export function measurementDraftKey(babyId: string, original?: Measurement): string {
  // A changed saved record gets a separate draft; stale input cannot replace a newer base.
  return 'measurement:' + JSON.stringify([babyId, original?.id || 'new', original ? [original.date, original.height, original.weight, original.headCircumference, original.memo] : null]);
}
export function readMeasurementDraft(key: string): MeasurementDraft | undefined { return drafts()[key]; }
export function writeMeasurementDraft(key: string, value: MeasurementDraft) {
  if (!key.startsWith('measurement:') || !valid(value)) return;
  const next = { ...drafts() }; delete next[key]; next[key] = { ...value };
  cache = Object.fromEntries(Object.entries(next).slice(-20)); persist();
}
export function clearMeasurementDraft(key: string) {
  if (!drafts()[key]) return;
  delete drafts()[key]; persist();
}
