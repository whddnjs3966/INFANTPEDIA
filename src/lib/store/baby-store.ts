import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BabyGender = 'male' | 'female';

export interface BabyProfile {
  id: string;
  name: string;
  birthdate: string; // ISO date string
  gender: BabyGender;
}

interface BabyStore {
  babies: BabyProfile[];
  activeBabyId: string | null;
  // Computed - current active profile (for backward compat)
  profile: BabyProfile | null;
  // Actions
  addBaby: (baby: Omit<BabyProfile, 'id'>) => void;
  updateBaby: (id: string, updates: Partial<Omit<BabyProfile, 'id'>>) => void;
  removeBaby: (id: string) => void;
  setActiveBaby: (id: string) => void;
  clearAll: () => void;
  // Legacy compat
  setProfile: (profile: Omit<BabyProfile, 'id'>) => void;
  clearProfile: () => void;
  // Getters
  getDaysOld: () => number;
  getMonthsOld: () => number;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getActiveProfile(babies: BabyProfile[], activeBabyId: string | null): BabyProfile | null {
  if (babies.length === 0) return null;
  if (activeBabyId) {
    const found = babies.find((b) => b.id === activeBabyId);
    if (found) return found;
  }
  return babies[0];
}

export const useBabyStore = create<BabyStore>()(
  persist(
    (set, get) => ({
      babies: [],
      activeBabyId: null,
      get profile() {
        return getActiveProfile(get().babies, get().activeBabyId);
      },

      addBaby: (baby) => {
        const id = generateId();
        set((s) => {
          const newBabies = [...s.babies, { ...baby, id }];
          return { babies: newBabies, activeBabyId: id };
        });
      },

      updateBaby: (id, updates) =>
        set((s) => ({
          babies: s.babies.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      removeBaby: (id) =>
        set((s) => {
          const newBabies = s.babies.filter((b) => b.id !== id);
          const newActive =
            s.activeBabyId === id
              ? newBabies[0]?.id || null
              : s.activeBabyId;
          return { babies: newBabies, activeBabyId: newActive };
        }),

      setActiveBaby: (id) => set({ activeBabyId: id }),

      clearAll: () => set({ babies: [], activeBabyId: null }),

      // Legacy compat: setProfile adds or updates the first baby
      setProfile: (profile) => {
        const state = get();
        if (state.babies.length === 0) {
          const id = generateId();
          set({ babies: [{ ...profile, id }], activeBabyId: id });
        } else {
          const active = getActiveProfile(state.babies, state.activeBabyId);
          if (active) {
            set((s) => ({
              babies: s.babies.map((b) =>
                b.id === active.id ? { ...b, ...profile } : b
              ),
            }));
          }
        }
      },

      clearProfile: () => set({ babies: [], activeBabyId: null }),

      getDaysOld: () => {
        const profile = getActiveProfile(get().babies, get().activeBabyId);
        if (!profile) return 0;
        const birth = new Date(profile.birthdate);
        const today = new Date();
        return Math.floor(
          (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
        );
      },

      getMonthsOld: () => {
        const profile = getActiveProfile(get().babies, get().activeBabyId);
        if (!profile) return 0;
        const birth = new Date(profile.birthdate);
        const today = new Date();
        const months =
          (today.getFullYear() - birth.getFullYear()) * 12 +
          (today.getMonth() - birth.getMonth());
        return Math.min(Math.max(months, 0), 12);
      },
    }),
    {
      name: 'baby-profile',
      // Migration: convert old single-profile format to new multi-baby format
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown>;
        // Old format had { profile: { name, birthdate } }
        if (state && state.profile && !state.babies) {
          const old = state.profile as { name: string; birthdate: string; gender?: BabyGender };
          const id = generateId();
          return {
            babies: [{ id, name: old.name, birthdate: old.birthdate, gender: old.gender || 'male' }],
            activeBabyId: id,
          };
        }
        return state;
      },
      version: 1,
    }
  )
);
