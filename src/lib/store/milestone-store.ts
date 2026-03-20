import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getMilestonesForMonth } from '@/lib/data/milestone-data';

interface MilestoneStore {
  completedMilestones: Record<string, boolean>; // milestone id -> completed
  completedDates: Record<string, string>; // milestone id -> date string (ISO)
  toggleMilestone: (id: string) => void;
  isCompleted: (id: string) => boolean;
  getCompletionRate: (month: number) => number; // 0-100 percentage
  getCompletedCountForMonth: (month: number) => { completed: number; total: number };
  resetMonth: (month: number) => void;
}

export const useMilestoneStore = create<MilestoneStore>()(
  persist(
    (set, get) => ({
      completedMilestones: {},
      completedDates: {},

      toggleMilestone: (id: string) => {
        const isCurrentlyCompleted = get().completedMilestones[id];
        if (isCurrentlyCompleted) {
          set((s) => {
            const { [id]: _removed, ...restMilestones } = s.completedMilestones;
            const { [id]: _removedDate, ...restDates } = s.completedDates;
            return {
              completedMilestones: restMilestones,
              completedDates: restDates,
            };
          });
        } else {
          set((s) => ({
            completedMilestones: {
              ...s.completedMilestones,
              [id]: true,
            },
            completedDates: {
              ...s.completedDates,
              [id]: new Date().toISOString().split('T')[0],
            },
          }));
        }
      },

      isCompleted: (id: string) => !!get().completedMilestones[id],

      getCompletionRate: (month: number) => {
        const monthData = getMilestonesForMonth(month);
        if (!monthData || monthData.milestones.length === 0) return 0;

        const completed = monthData.milestones.filter(
          (m) => get().completedMilestones[m.id]
        ).length;

        return Math.round((completed / monthData.milestones.length) * 100);
      },

      getCompletedCountForMonth: (month: number) => {
        const monthData = getMilestonesForMonth(month);
        if (!monthData) return { completed: 0, total: 0 };

        const completed = monthData.milestones.filter(
          (m) => get().completedMilestones[m.id]
        ).length;

        return { completed, total: monthData.milestones.length };
      },

      resetMonth: (month: number) => {
        const monthData = getMilestonesForMonth(month);
        if (!monthData) return;

        const idsToRemove = new Set(monthData.milestones.map((m) => m.id));

        set((s) => {
          const newCompleted: Record<string, boolean> = {};
          const newDates: Record<string, string> = {};

          for (const [key, value] of Object.entries(s.completedMilestones)) {
            if (!idsToRemove.has(key)) {
              newCompleted[key] = value;
            }
          }
          for (const [key, value] of Object.entries(s.completedDates)) {
            if (!idsToRemove.has(key)) {
              newDates[key] = value;
            }
          }

          return {
            completedMilestones: newCompleted,
            completedDates: newDates,
          };
        });
      },
    }),
    {
      name: 'infantpedia-milestones',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
