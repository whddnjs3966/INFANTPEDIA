import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LogCategory =
  | 'breast_feed'
  | 'formula'
  | 'baby_food'
  | 'poop'
  | 'pee'
  | 'sleep'
  | 'temperature'
  | 'memo';

export interface LogEntry {
  id: string;
  category: LogCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime?: string; // HH:mm (for sleep)
  amount?: number; // ml (formula, baby food)
  duration?: number; // minutes (breast feed, sleep)
  side?: 'left' | 'right' | 'both'; // breast feed
  menu?: string; // baby food description
  color?: string; // poop color
  consistency?: string; // poop consistency
  temperature?: number; // body temp
  note?: string; // memo text
}

export const LOG_CATEGORY_CONFIG: Record<
  LogCategory,
  { label: string; emoji: string; color: string }
> = {
  breast_feed: { label: '모유수유', emoji: '🤱', color: 'pink' },
  formula: { label: '분유', emoji: '🍼', color: 'blue' },
  baby_food: { label: '이유식', emoji: '🥣', color: 'orange' },
  poop: { label: '대변', emoji: '💩', color: 'amber' },
  pee: { label: '소변', emoji: '💧', color: 'sky' },
  sleep: { label: '수면', emoji: '😴', color: 'purple' },
  temperature: { label: '체온', emoji: '🌡️', color: 'red' },
  memo: { label: '메모', emoji: '📝', color: 'gray' },
};

interface DailyLogStore {
  entries: LogEntry[];
  addEntry: (entry: Omit<LogEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<LogEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesByDate: (date: string) => LogEntry[];
  getEntriesByDateAndCategory: (date: string, category: LogCategory) => LogEntry[];
}

export const useDailyLogStore = create<DailyLogStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set((s) => ({
          entries: [
            ...s.entries,
            { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
          ],
        })),
      updateEntry: (id, updates) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      getEntriesByDate: (date) =>
        get()
          .entries.filter((e) => e.date === date)
          .sort((a, b) => b.time.localeCompare(a.time)),
      getEntriesByDateAndCategory: (date, category) =>
        get()
          .entries.filter((e) => e.date === date && e.category === category)
          .sort((a, b) => b.time.localeCompare(a.time)),
    }),
    { name: 'baby-daily-log' }
  )
);
