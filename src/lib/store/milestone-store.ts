import "@/lib/sync/local-restore-journal";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMilestonesForMonth } from '@/lib/data/milestone-data';
import { useBabyStore } from './baby-store';
import { getKoreaDate } from '../utils/date';
import { recordDateError, type RecordMutationResult } from '../utils/record-date';

interface MilestoneProgress {
  completedMilestones: Record<string, boolean>;
  completedDates: Record<string, string>;
}
interface MilestoneStore extends MilestoneProgress {
  byBaby: Record<string, MilestoneProgress>;
  saveObservation: (id: string, date: string, expectedBabyId: string) => RecordMutationResult;
  removeObservation: (id: string, expectedBabyId: string) => RecordMutationResult;
  toggleMilestone: (id: string) => void;
  isCompleted: (id: string) => boolean;
  getCompletionRate: (month: number) => number;
  getCompletedCountForMonth: (month: number) => { completed: number; total: number };
  resetMonth: (month: number, expectedBabyId?: string) => void;
  clearAll: () => void;
}
const EMPTY: MilestoneProgress = { completedMilestones: {}, completedDates: {} };
export function activeMilestoneProgress(state: MilestoneStore): MilestoneProgress {
  const { profile, legacyOwnerId } = useBabyStore.getState();
  if (!profile) return EMPTY;
  return state.byBaby[profile.id] ?? (legacyOwnerId === profile.id ? { completedMilestones: state.completedMilestones, completedDates: state.completedDates } : EMPTY);
}
function knownMilestone(id: string) {
  const month = Number(id.split('_')[0]);
  return Number.isInteger(month) && month >= 0 && month <= 12 && !!getMilestonesForMonth(month)?.milestones.some(item => item.id === id);
}
export const useMilestoneStore = create<MilestoneStore>()(
  persist((set, get) => ({
    completedMilestones: {}, completedDates: {}, byBaby: {},
    saveObservation: (id, date, expectedBabyId) => {
      const profile = useBabyStore.getState().profile;
      if (!profile || profile.id !== expectedBabyId) return { ok: false, error: '현재 아기가 바뀌었어요. 아기를 확인한 뒤 다시 기록해 주세요.' };
      if (!knownMilestone(id)) return { ok: false, error: '이 관찰 항목을 찾을 수 없어요.' };
      const error = recordDateError(date, profile.birthdate, '관찰일');
      if (error) return { ok: false, error };
      const current = activeMilestoneProgress(get());
      set(state => ({ byBaby: { ...state.byBaby, [profile.id]: {
        completedMilestones: { ...current.completedMilestones, [id]: true },
        completedDates: { ...current.completedDates, [id]: date },
      } } }));
      return { ok: true };
    },
    removeObservation: (id, expectedBabyId) => {
      const profile = useBabyStore.getState().profile;
      if (!profile || profile.id !== expectedBabyId) return { ok: false, error: '현재 아기가 바뀌었어요. 아기를 확인한 뒤 다시 시도해 주세요.' };
      const current = activeMilestoneProgress(get());
      if (!current.completedMilestones[id]) return { ok: false, error: '이 관찰 기록을 찾을 수 없어요.' };
      const completedMilestones = { ...current.completedMilestones };
      const completedDates = { ...current.completedDates };
      delete completedMilestones[id]; delete completedDates[id];
      set(state => ({ byBaby: { ...state.byBaby, [profile.id]: { completedMilestones, completedDates } } }));
      return { ok: true };
    },
    toggleMilestone: id => {
      const babyId = useBabyStore.getState().profile?.id;
      if (!babyId) return;
      if (get().isCompleted(id)) get().removeObservation(id, babyId);
      else get().saveObservation(id, getKoreaDate(), babyId);
    },
    isCompleted: id => !!activeMilestoneProgress(get()).completedMilestones[id],
    getCompletionRate: month => { const { completed, total } = get().getCompletedCountForMonth(month); return total ? Math.round(completed / total * 100) : 0; },
    getCompletedCountForMonth: month => {
      const items = getMilestonesForMonth(month)?.milestones ?? [];
      const progress = activeMilestoneProgress(get());
      return { completed: items.filter(item => progress.completedMilestones[item.id]).length, total: items.length };
    },
    resetMonth: (month, expectedBabyId) => {
      const babyId = useBabyStore.getState().profile?.id;
      if (!babyId || (expectedBabyId && expectedBabyId !== babyId)) return;
      const current = activeMilestoneProgress(get());
      const completedMilestones = { ...current.completedMilestones };
      const completedDates = { ...current.completedDates };
      for (const item of getMilestonesForMonth(month)?.milestones ?? []) { delete completedMilestones[item.id]; delete completedDates[item.id]; }
      set(state => ({ byBaby: { ...state.byBaby, [babyId]: { completedMilestones, completedDates } } }));
    },
    clearAll: () => set({ completedMilestones: {}, completedDates: {}, byBaby: {} }),
  }), { name: 'infantpedia-milestones' })
);
