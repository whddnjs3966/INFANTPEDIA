import "@/lib/sync/local-restore-journal";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useBabyStore } from './baby-store';
import { recordsForBaby } from '../utils/baby-records';
import { getKoreaDate } from '../utils/date';
import { recordDateError, type RecordMutationResult } from '../utils/record-date';
import { vaccinations } from '../data/growth-data';
import { INFLUENZA_VACCINE_ID, influenzaSeason, vaccinationRecordKey } from '@/lib/utils/vaccination-season';

export interface VaccinationRecord { babyId?: string; vaccineId: string; doseNumber: number; completedDate: string; }
interface VaccinationStore {
  records: VaccinationRecord[];
  saveVaccination: (vaccineId: string, doseNumber: number, date: string, expectedBabyId: string, season?: number) => RecordMutationResult;
  removeVaccination: (vaccineId: string, doseNumber: number, expectedBabyId: string, season?: number) => RecordMutationResult;
  toggleVaccination: (vaccineId: string, doseNumber: number, date?: string) => void;
  isCompleted: (vaccineId: string, doseNumber: number, season?: number) => boolean;
  getRecord: (vaccineId: string, doseNumber: number, season?: number) => VaccinationRecord | undefined;
  getCompletedCount: () => number;
  clearAll: () => void;
}
function filterByActiveBaby(records: VaccinationRecord[]): VaccinationRecord[] {
  const { profile, babies, legacyOwnerId } = useBabyStore.getState();
  return recordsForBaby(records, profile?.id, babies.length, legacyOwnerId);
}

function matchesDose(record: VaccinationRecord, vaccineId: string, doseNumber: number, season?: number) {
  return record.vaccineId === vaccineId && record.doseNumber === doseNumber && (
    vaccineId !== INFLUENZA_VACCINE_ID || influenzaSeason(record.completedDate) === season
  );
}
export const useVaccinationStore = create<VaccinationStore>()(persist((set, get) => ({
  records: [],
  saveVaccination: (vaccineId, doseNumber, date, expectedBabyId, season) => {
    const profile = useBabyStore.getState().profile;
    if (!profile || expectedBabyId !== profile.id) return { ok: false, error: '현재 아기가 바뀌었어요. 아기를 확인한 뒤 다시 기록해 주세요.' };
    if (!vaccinations.find(vaccine => vaccine.id === vaccineId)?.doses.some(dose => dose.doseNumber === doseNumber)) return { ok: false, error: '백신과 접종 차수를 확인해 주세요.' };
    const error = recordDateError(date, profile.birthdate, '접종일');
    if (error) return { ok: false, error };
    if (vaccineId === INFLUENZA_VACCINE_ID && season !== undefined && influenzaSeason(date) !== season) return { ok: false, error: '선택한 절기에 포함되는 접종일을 입력해 주세요.' };
    const next = { babyId: profile.id, vaccineId, doseNumber, completedDate: date };
    const key = vaccinationRecordKey(next);
    const matching = filterByActiveBaby(get().records).filter(record => vaccinationRecordKey(record) === key);
    set(state => ({ records: [...state.records.filter(record => !matching.includes(record)), next] }));
    return { ok: true };
  },
  removeVaccination: (vaccineId, doseNumber, expectedBabyId, season = influenzaSeason(getKoreaDate())) => {
    const profile = useBabyStore.getState().profile;
    if (!profile || expectedBabyId !== profile.id) return { ok: false, error: '현재 아기가 바뀌었어요. 아기를 확인한 뒤 다시 시도해 주세요.' };
    const matching = filterByActiveBaby(get().records).filter(record => matchesDose(record, vaccineId, doseNumber, season));
    if (!matching.length) return { ok: false, error: '이 접종 기록을 찾을 수 없어요.' };
    set(state => ({ records: state.records.filter(record => !matching.includes(record)) }));
    return { ok: true };
  },
  toggleVaccination: (vaccineId, doseNumber, date) => {
    const babyId = useBabyStore.getState().profile?.id;
    if (!babyId) return;
    const completedDate = date || getKoreaDate();
    const season = influenzaSeason(completedDate);
    if (get().isCompleted(vaccineId, doseNumber, season)) get().removeVaccination(vaccineId, doseNumber, babyId, season);
    else get().saveVaccination(vaccineId, doseNumber, completedDate, babyId, season);
  },
  isCompleted: (vaccineId, doseNumber, season) => get().getRecord(vaccineId, doseNumber, season) !== undefined,
  getRecord: (vaccineId, doseNumber, season = influenzaSeason(getKoreaDate())) => filterByActiveBaby(get().records).find(record => matchesDose(record, vaccineId, doseNumber, season)),
  getCompletedCount: () => filterByActiveBaby(get().records).length,
  clearAll: () => set({ records: [] }),
}), { name: 'baby-vaccinations' }));
