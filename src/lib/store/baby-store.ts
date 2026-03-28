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
  profile: BabyProfile | null;
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
  return { ...state, profile: getActiveProfile(state.babies, state.activeBabyId) };
}

export const useBabyStore = create<BabyStore>()(
  persist(
    (set, get) => ({
      babies: [],
      activeBabyId: null,
      profile: null,
      babyPhotos: {},

      addBaby: (baby) => {
        const id = generateId();
        set((s) => {
          const newBabies = [...s.babies, { ...baby, id }];
          return withProfile({ babies: newBabies, activeBabyId: id });
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
          const { [id]: _, ...restPhotos } = s.babyPhotos;
          return { ...withProfile({ babies: newBabies, activeBabyId: newActive }), babyPhotos: restPhotos };
        }),

      setActiveBaby: (id) =>
        set((s) => withProfile({ babies: s.babies, activeBabyId: id })),

      setBabyPhoto: (id, dataUrl) =>
        set((s) => ({ babyPhotos: { ...s.babyPhotos, [id]: dataUrl } })),

      removeBabyPhoto: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.babyPhotos;
          return { babyPhotos: rest };
        }),

      clearAll: () => set({ babies: [], activeBabyId: null, profile: null, babyPhotos: {} }),

      // Legacy compat: setProfile adds or updates the first baby
      setProfile: (profile) => {
        const state = get();
        if (state.babies.length === 0) {
          const id = generateId();
          const babies = [{ ...profile, id }];
          set(withProfile({ babies, activeBabyId: id }));
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
        if (!profile) return 0;
        // KST 정오(12:00) 기준으로 일수 계산
        // KST = UTC+9, 정오 = UTC 03:00
        const KST_OFFSET = 9 * 60; // minutes
        const now = new Date();
        const kstNow = new Date(now.getTime() + (KST_OFFSET + now.getTimezoneOffset()) * 60000);
        // KST 정오를 기준일의 시작으로 삼음: 정오 전이면 전날로 취급
        if (kstNow.getHours() < 12) {
          kstNow.setDate(kstNow.getDate() - 1);
        }
        const kstToday = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate());
        const birth = new Date(profile.birthdate + 'T00:00:00');
        const birthDate = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
        return Math.floor(
          (kstToday.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      },

      getMonthsOld: () => {
        const days = get().getDaysOld();
        // 일수 기반 월령 계산 (30일 = 1개월)
        return Math.min(Math.floor(days / 30), 12);
      },

      getRealMonthsOld: () => {
        const days = get().getDaysOld();
        return Math.floor(days / 30);
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
        }
      },
    }
  )
);
