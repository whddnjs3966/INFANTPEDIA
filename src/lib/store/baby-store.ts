import "@/lib/sync/local-restore-journal";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDaysSinceBirth, getCalendarMonthsOld } from '../utils/date';

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
  profile: BabyProfile | null;
  legacyOwnerId: string | null;
  legacyOwnershipChecked: boolean;
  babyPhotos: Record<string, string>; // babyId -> base64 data URL
  // Actions
  addBaby: (baby: Omit<BabyProfile, 'id'>) => void;
  updateBaby: (id: string, updates: Partial<Omit<BabyProfile, 'id'>>) => void;
  removeBaby: (id: string) => void;
  setActiveBaby: (id: string) => void;
  setBabyPhoto: (id: string, dataUrl: string) => void;
  removeBabyPhoto: (id: string) => void;
  clearAll: () => void;
  // Legacy compat
  setProfile: (profile: Omit<BabyProfile, 'id'>) => void;
  clearProfile: () => void;
  // Getters
  getDaysOld: () => number;
  getMonthsOld: () => number;
  getRealMonthsOld: () => number;
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

// Helper: compute profile and include it in the returned state
function withProfile(state: { babies: BabyProfile[]; activeBabyId: string | null }) {
  const profile = getActiveProfile(state.babies, state.activeBabyId);
  return { ...state, activeBabyId: profile?.id ?? null, profile };
}

export const useBabyStore = create<BabyStore>()(
  persist(
    (set, get) => ({
      babies: [],
      activeBabyId: null,
      profile: null,
      babyPhotos: {},
      legacyOwnerId: null,
      legacyOwnershipChecked: false,

      addBaby: (baby) => {
        const id = generateId();
        set((s) => {
          const newBabies = [...s.babies, { ...baby, id }];
          return { ...withProfile({ babies: newBabies, activeBabyId: id }), legacyOwnerId: !s.legacyOwnershipChecked && s.babies.length === 0 ? id : s.legacyOwnerId, legacyOwnershipChecked: true };
        });
      },

      updateBaby: (id, updates) =>
        set((s) => {
          const babies = s.babies.map((b) => (b.id === id ? { ...b, ...updates } : b));
          return withProfile({ babies, activeBabyId: s.activeBabyId });
        }),

      removeBaby: (id) =>
        set((s) => {
          const newBabies = s.babies.filter((b) => b.id !== id);
          const newActive =
            s.activeBabyId === id
              ? newBabies[0]?.id || null
              : s.activeBabyId;
          const restPhotos = { ...s.babyPhotos };
          delete restPhotos[id];
          return { ...withProfile({ babies: newBabies, activeBabyId: newActive }), babyPhotos: restPhotos };
        }),

      setActiveBaby: (id) =>
        set((s) => withProfile({ babies: s.babies, activeBabyId: id })),

      setBabyPhoto: (id, dataUrl) =>
        set((s) => s.babies.some(baby => baby.id === id) ? { babyPhotos: { ...s.babyPhotos, [id]: dataUrl } } : s),

      removeBabyPhoto: (id) =>
        set((s) => {
          const rest = { ...s.babyPhotos };
          delete rest[id];
          return { babyPhotos: rest };
        }),

      clearAll: () => set({ babies: [], activeBabyId: null, profile: null, babyPhotos: {}, legacyOwnerId: null, legacyOwnershipChecked: false }),

      // Legacy compat: setProfile adds or updates the first baby
      setProfile: (profile) => {
        const state = get();
        if (state.babies.length === 0) {
          const id = generateId();
          const babies = [{ ...profile, id }];
          set({ ...withProfile({ babies, activeBabyId: id }), legacyOwnerId: id, legacyOwnershipChecked: true });
        } else {
          const active = getActiveProfile(state.babies, state.activeBabyId);
          if (active) {
            set((s) => {
              const babies = s.babies.map((b) =>
                b.id === active.id ? { ...b, ...profile } : b
              );
              return withProfile({ babies, activeBabyId: s.activeBabyId });
            });
          }
        }
      },

      clearProfile: () => set({ babies: [], activeBabyId: null, profile: null }),

      getDaysOld: () => {
        const profile = getActiveProfile(get().babies, get().activeBabyId);
        return profile ? getDaysSinceBirth(profile.birthdate) : 0;
      },
      getMonthsOld: () => {
        const profile = getActiveProfile(get().babies, get().activeBabyId);
        return profile ? Math.min(getCalendarMonthsOld(profile.birthdate), 12) : 0;
      },
      getRealMonthsOld: () => {
        const profile = getActiveProfile(get().babies, get().activeBabyId);
        return profile ? getCalendarMonthsOld(profile.birthdate) : 0;
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
          const babies = [{ id, name: old.name, birthdate: old.birthdate, gender: old.gender || 'male' }];
          return withProfile({ babies, activeBabyId: id });
        }
        // Rehydrate: recompute profile from babies/activeBabyId
        if (state && state.babies) {
          return withProfile({
            babies: state.babies as BabyProfile[],
            activeBabyId: state.activeBabyId as string | null,
          });
        }
        return state;
      },
      version: 1,
      // After rehydration, recompute profile from babies + activeBabyId
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.profile = getActiveProfile(state.babies, state.activeBabyId);
          state.activeBabyId = state.profile?.id ?? null;
          if (!state.legacyOwnershipChecked) {
            state.legacyOwnerId = state.babies.length === 1 ? state.babies[0].id : null;
            state.legacyOwnershipChecked = true;
          }
        }
      },
    }
  )
);
