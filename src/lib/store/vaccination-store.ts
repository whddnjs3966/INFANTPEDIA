import "@/lib/sync/local-restore-journal";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useBabyStore } from './baby-store';
import { recordsForBaby } from '../utils/baby-records';
import { getKoreaDate } from '../utils/date';
import { recordDateError, type RecordMutationResult } from '../utils/record-date';
import { vaccinations } from '../data/growth-data';

export interface VaccinationRecord { babyId?: string; vaccineId: string; doseNumber: number; completedDate: string; }
interface VaccinationStore {
  records: VaccinationRecord[];
  saveVaccination: (vaccineId: string, doseNumber: number, date: string, expectedBabyId: string) => RecordMutationResult;
  removeVaccination: (vaccineId: string, doseNumber: number, expectedBabyId: string) => RecordMutationResult;
  toggleVaccination: (vaccineId: string, doseNumber: number, date?: string) => void;
  isCompleted: (vaccineId: string, doseNumber: number) => boolean;
  getRecord: (vaccineId: string, doseNumber: number) => VaccinationRecord | undefined;
  getCompletedCount: () => number;
  clearAll: () => void;
}
function filterByActiveBaby(records: VaccinationRecord[]): VaccinationRecord[] {
  const { profile, babies, legacyOwnerId } = useBabyStore.getState();
  return recordsForBaby(records, profile?.id, babies.length, legacyOwnerId);
}
export const useVaccinationStore = create<VaccinationStore>()(persist((set, get) => ({
  records: [],
  saveVaccination: (vaccineId, doseNumber, date, expectedBabyId) => {
    const profile = useBabyStore.getState().profile;
    if (!profile || expectedBabyId !== profile.id) return { ok: false, error: '현재 아기가 바뀌었어요. 아기를 확인한 뒤 다시 기록해 주세요.' };
    if (!vaccinations.find(vaccine => vaccine.id === vaccineId)?.doses.some(dose => dose.doseNumber === doseNumber)) return { ok: false, error: '백신과 접종 차수를 확인해 주세요.' };
    const error = recordDateError(date, profile.birthdate, '접종일');
    if (error) return { ok: false, error };
    const matching = filterByActiveBaby(get().records).filter(record => record.vaccineId === vaccineId && record.doseNumber === doseNumber);
    set(state => ({ records: [...state.records.filter(record => !matching.includes(record)), { babyId: profile.id, vaccineId, doseNumber, completedDate: date }] }));
    return { ok: true };
  },
  removeVaccination: (vaccineId, doseNumber, expectedBabyId) => {
    const profile = useBabyStore.getState().profile;
    if (!profile || expectedBabyId !== profile.id) return { ok: false, error: '현재 아기가 바뀌었어요. 아기를 확인한 뒤 다시 시도해 주세요.' };
    const matching = filterByActiveBaby(get().records).filter(record => record.vaccineId === vaccineId && record.doseNumber === doseNumber);
    if (!matching.length) return { ok: false, error: '이 접종 기록을 찾을 수 없어요.' };
    set(state => ({ records: state.records.filter(record => !matching.includes(record)) }));
    return { ok: true };
  },
  toggleVaccination: (vaccineId, doseNumber, date) => {
    const babyId = useBabyStore.getState().profile?.id;
    if (!babyId) return;
    if (get().isCompleted(vaccineId, doseNumber)) get().removeVaccination(vaccineId, doseNumber, babyId);
    else get().saveVaccination(vaccineId, doseNumber, date || getKoreaDate(), babyId);
  },
  isCompleted: (vaccineId, doseNumber) => filterByActiveBaby(get().records).some(record => record.vaccineId === vaccineId && record.doseNumber === doseNumber),
  getRecord: (vaccineId, doseNumber) => filterByActiveBaby(get().records).find(record => record.vaccineId === vaccineId && record.doseNumber === doseNumber),
  getCompletedCount: () => filterByActiveBaby(get().records).length,
  clearAll: () => set({ records: [] }),
}), { name: 'baby-vaccinations' }));
