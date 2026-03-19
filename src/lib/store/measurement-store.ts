import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Measurement {
  id: string;
  month: number;
  date: string; // ISO date
  height?: number; // cm
  weight?: number; // kg
  headCircumference?: number; // cm
}

interface MeasurementStore {
  measurements: Measurement[];
  addMeasurement: (m: Omit<Measurement, 'id'>) => void;
  updateMeasurement: (id: string, m: Partial<Measurement>) => void;
  deleteMeasurement: (id: string) => void;
  clearAll: () => void;
  getMeasurementsByMonth: (month: number) => Measurement[];
  getLatestByMonth: () => Map<number, Measurement>;
}

export const useMeasurementStore = create<MeasurementStore>()(
  persist(
    (set, get) => ({
      measurements: [],
      addMeasurement: (m) =>
        set((s) => ({
          measurements: [
            ...s.measurements,
            { ...m, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
          ],
        })),
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
        get().measurements.filter((m) => m.month === month),
      getLatestByMonth: () => {
        const map = new Map<number, Measurement>();
        const sorted = [...get().measurements].sort(
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
