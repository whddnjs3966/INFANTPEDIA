import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BabyProfile {
  name: string;
  birthdate: string; // ISO date string
}

interface BabyStore {
  profile: BabyProfile | null;
  setProfile: (profile: BabyProfile) => void;
  clearProfile: () => void;
  getDaysOld: () => number;
  getMonthsOld: () => number;
}

export const useBabyStore = create<BabyStore>()(
  persist(
    (set, get) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
      getDaysOld: () => {
        const profile = get().profile;
        if (!profile) return 0;
        const birth = new Date(profile.birthdate);
        const today = new Date();
        return Math.floor(
          (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
        );
      },
      getMonthsOld: () => {
        const profile = get().profile;
        if (!profile) return 0;
        const birth = new Date(profile.birthdate);
        const today = new Date();
        const months =
          (today.getFullYear() - birth.getFullYear()) * 12 +
          (today.getMonth() - birth.getMonth());
        return Math.min(Math.max(months, 0), 12);
      },
    }),
    { name: 'baby-profile' }
  )
);
