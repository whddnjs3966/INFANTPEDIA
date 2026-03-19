import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VaccinationRecord {
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
}

export const useVaccinationStore = create<VaccinationStore>()(
  persist(
    (set, get) => ({
      records: [],
      toggleVaccination: (vaccineId, doseNumber, date) => {
        const existing = get().records.find(
          (r) => r.vaccineId === vaccineId && r.doseNumber === doseNumber
        );
        if (existing) {
          set((s) => ({
            records: s.records.filter(
              (r) => !(r.vaccineId === vaccineId && r.doseNumber === doseNumber)
            ),
          }));
        } else {
          set((s) => ({
            records: [
              ...s.records,
              {
                vaccineId,
                doseNumber,
                completedDate: date || new Date().toISOString().split('T')[0],
              },
            ],
          }));
        }
      },
      isCompleted: (vaccineId, doseNumber) =>
        get().records.some(
          (r) => r.vaccineId === vaccineId && r.doseNumber === doseNumber
        ),
      getRecord: (vaccineId, doseNumber) =>
        get().records.find(
          (r) => r.vaccineId === vaccineId && r.doseNumber === doseNumber
        ),
      getCompletedCount: () => get().records.length,
    }),
    { name: 'baby-vaccinations' }
  )
);
