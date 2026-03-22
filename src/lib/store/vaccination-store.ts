import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useBabyStore } from './baby-store';

export interface VaccinationRecord {
  babyId?: string; // links to BabyProfile.id
  vaccineId: string;
  doseNumber: number;
  completedDate: string; // ISO date
}

interface VaccinationStore {
  records: VaccinationRecord[];
  toggleVaccination: (vaccineId: string, doseNumber: number, date?: string) => void;
  isCompleted: (vaccineId: string, doseNumber: number) => boolean;
  getRecord: (vaccineId: string, doseNumber: number) => VaccinationRecord | undefined;
  getCompletedCount: () => number;
  clearAll: () => void;
}

/** Get records filtered by active baby (backward-compat: include records without babyId) */
function filterByActiveBaby(records: VaccinationRecord[]): VaccinationRecord[] {
  const activeBabyId = useBabyStore.getState().activeBabyId;
  if (!activeBabyId) return records;
  return records.filter((r) => !r.babyId || r.babyId === activeBabyId);
}

export const useVaccinationStore = create<VaccinationStore>()(
  persist(
    (set, get) => ({
      records: [],
      toggleVaccination: (vaccineId, doseNumber, date) => {
        const activeBabyId = useBabyStore.getState().activeBabyId;
        const filtered = filterByActiveBaby(get().records);
        const existing = filtered.find(
          (r) => r.vaccineId === vaccineId && r.doseNumber === doseNumber
        );
        if (existing) {
          set((s) => ({
            records: s.records.filter(
              (r) =>
                !(
                  r.vaccineId === vaccineId &&
                  r.doseNumber === doseNumber &&
                  (!r.babyId || r.babyId === activeBabyId)
                )
            ),
          }));
        } else {
          set((s) => ({
            records: [
              ...s.records,
              {
                babyId: activeBabyId || undefined,
                vaccineId,
                doseNumber,
                completedDate: date || new Date().toISOString().split('T')[0],
              },
            ],
          }));
        }
      },
      isCompleted: (vaccineId, doseNumber) =>
        filterByActiveBaby(get().records).some(
          (r) => r.vaccineId === vaccineId && r.doseNumber === doseNumber
        ),
      getRecord: (vaccineId, doseNumber) =>
        filterByActiveBaby(get().records).find(
          (r) => r.vaccineId === vaccineId && r.doseNumber === doseNumber
        ),
      getCompletedCount: () => filterByActiveBaby(get().records).length,
      clearAll: () => set({ records: [] }),
    }),
    { name: 'baby-vaccinations' }
  )
);
