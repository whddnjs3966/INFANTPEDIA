import "@/lib/sync/local-restore-journal";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useBabyStore } from './baby-store';
import { recordsForBaby } from '../utils/baby-records';
import { getCalendarMonthsOld } from '../utils/date';
import { recordDateError } from '../utils/record-date';

export interface Measurement { id: string; babyId?: string; month: number; date: string; height?: number; weight?: number; headCircumference?: number; memo?: string; }
interface MeasurementStore {
  measurements: Measurement[];
  addMeasurement: (m: Omit<Measurement, 'id' | 'babyId'>, expectedBabyId?: string) => boolean;
  updateMeasurement: (id: string, m: Partial<Omit<Measurement, 'id' | 'babyId'>>, expectedBabyId?: string) => boolean;
  deleteMeasurement: (id: string, expectedBabyId?: string) => boolean;
  clearAll: () => void;
  getMeasurementsByMonth: (month: number) => Measurement[];
  getLatestByMonth: () => Map<number, Measurement>;
}
function filterByActiveBaby(measurements: Measurement[]): Measurement[] {
  const { profile, babies, legacyOwnerId } = useBabyStore.getState();
  return recordsForBaby(measurements, profile?.id, babies.length, legacyOwnerId);
}
export const useMeasurementStore = create<MeasurementStore>()(persist((set, get) => ({
  measurements: [],
  addMeasurement: (m, expectedBabyId) => {
    const profile = useBabyStore.getState().profile;
    if (!profile || (expectedBabyId && expectedBabyId !== profile.id) || recordDateError(m.date, profile.birthdate, '측정일')) return false;
    set(state => ({ measurements: [...state.measurements, { ...m, month: Math.min(12, getCalendarMonthsOld(profile.birthdate, m.date)), id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, babyId: profile.id }] }));
    return true;
  },
  updateMeasurement: (id, updates, expectedBabyId) => {
    const profile = useBabyStore.getState().profile;
    const record = filterByActiveBaby(get().measurements).find(item => item.id === id);
    if (!profile || !record || (expectedBabyId && expectedBabyId !== profile.id) || 'id' in updates || 'babyId' in updates) return false;
    const date = updates.date ?? record.date;
    if (recordDateError(date, profile.birthdate, '측정일')) return false;
    set(state => ({ measurements: state.measurements.map(item => item === record ? { ...item, ...updates, month: Math.min(12, getCalendarMonthsOld(profile.birthdate, date)) } : item) }));
    return true;
  },
  deleteMeasurement: (id, expectedBabyId) => {
    const profile = useBabyStore.getState().profile;
    const record = filterByActiveBaby(get().measurements).find(item => item.id === id);
    if (!profile || !record || (expectedBabyId && expectedBabyId !== profile.id)) return false;
    set(state => ({ measurements: state.measurements.filter(item => item !== record) }));
    return true;
  },
  clearAll: () => set({ measurements: [] }),
  getMeasurementsByMonth: month => filterByActiveBaby(get().measurements).filter(item => item.month === month),
  getLatestByMonth: () => {
    const result = new Map<number, Measurement>();
    for (const item of [...filterByActiveBaby(get().measurements)].sort((a,b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))) if (!result.has(item.month)) result.set(item.month, item);
    return result;
  },
}), { name: 'baby-measurements' }));
