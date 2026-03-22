import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useBabyStore } from './baby-store';

export interface Measurement {
  id: string;
  babyId?: string; // links to BabyProfile.id
  month: number;
  date: string; // ISO date
  height?: number; // cm
  weight?: number; // kg
  headCircumference?: number; // cm
  memo?: string; // optional notes
}

interface MeasurementStore {
  measurements: Measurement[];
  addMeasurement: (m: Omit<Measurement, 'id' | 'babyId'>) => void;
  updateMeasurement: (id: string, m: Partial<Measurement>) => void;
  deleteMeasurement: (id: string) => void;
  clearAll: () => void;
  getMeasurementsByMonth: (month: number) => Measurement[];
  getLatestByMonth: () => Map<number, Measurement>;
}

/** Get measurements filtered by active baby (backward-compat: include records without babyId) */
function filterByActiveBaby(measurements: Measurement[]): Measurement[] {
  const activeBabyId = useBabyStore.getState().activeBabyId;
  if (!activeBabyId) return measurements;
  return measurements.filter((m) => !m.babyId || m.babyId === activeBabyId);
}

export const useMeasurementStore = create<MeasurementStore>()(
  persist(
    (set, get) => ({
      measurements: [],
      addMeasurement: (m) => {
        const activeBabyId = useBabyStore.getState().activeBabyId;
        set((s) => ({
          measurements: [
            ...s.measurements,
            {
              ...m,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              babyId: activeBabyId || undefined,
            },
          ],
        }));
      },
      updateMeasurement: (id, updates) =>
        set((s) => ({
          measurements: s.measurements.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      deleteMeasurement: (id) =>
        set((s) => ({
          measurements: s.measurements.filter((m) => m.id !== id),
        })),
      clearAll: () => set({ measurements: [] }),
      getMeasurementsByMonth: (month) =>
        filterByActiveBaby(get().measurements).filter((m) => m.month === month),
      getLatestByMonth: () => {
        const map = new Map<number, Measurement>();
        const filtered = filterByActiveBaby(get().measurements);
        const sorted = [...filtered].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        for (const m of sorted) {
          if (!map.has(m.month)) map.set(m.month, m);
        }
        return map;
      },
    }),
    { name: 'baby-measurements' }
  )
);
