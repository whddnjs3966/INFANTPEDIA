import "@/lib/sync/local-restore-journal";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SyncMapping {
  localBabyId: string;   // local baby-store id
  sharedBabyId: string;  // supabase shared_babies.id
  inviteCode: string;
}

interface SyncStore {
  mappings: SyncMapping[];
  lastSyncAt: string | null;
  // Actions
  addMapping: (mapping: SyncMapping) => void;
  removeMapping: (localBabyId: string) => void;
  removeMappingIfMatches: (localBabyId: string, sharedBabyId: string) => boolean;
  getMapping: (localBabyId: string) => SyncMapping | undefined;
  getMappingBySharedId: (sharedBabyId: string) => SyncMapping | undefined;
  setLastSync: () => void;
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      mappings: [],
      lastSyncAt: null,

      addMapping: (mapping) =>
        set((s) => ({
          mappings: [
            ...s.mappings.filter((m) => m.localBabyId !== mapping.localBabyId),
            mapping,
          ],
        })),

      removeMapping: (localBabyId) =>
        set((s) => ({
          mappings: s.mappings.filter((m) => m.localBabyId !== localBabyId),
        })),

      getMapping: (localBabyId) =>
        get().mappings.find((m) => m.localBabyId === localBabyId),

      getMappingBySharedId: (sharedBabyId) =>
        get().mappings.find((m) => m.sharedBabyId === sharedBabyId),

      removeMappingIfMatches: (localBabyId, sharedBabyId) => {
        if (get().getMapping(localBabyId)?.sharedBabyId !== sharedBabyId) return false;
        set((s) => ({
          mappings: s.mappings.filter((m) => m.localBabyId !== localBabyId),
          lastSyncAt: null,
        }));
        return true;
      },

      setLastSync: () =>
        set({ lastSyncAt: new Date().toISOString() }),
    }),
    { name: 'baby-sync' }
  )
);
