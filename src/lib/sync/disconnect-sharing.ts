import { useSyncStore } from "@/lib/store/sync-store";
import { useBackupStore } from "@/lib/store/backup-store";
import { useBabyStore } from "@/lib/store/baby-store";

// Only forget this browser's connection. Never edit a profile or record store.
export function disconnectSharing(localBabyId: string, sharedBabyId: string): boolean {
  if (useBabyStore.getState().profile?.id !== localBabyId) return false;
  if (!useSyncStore.getState().removeMappingIfMatches(localBabyId, sharedBabyId)) return false;
  const pending = useBackupStore.getState().byBaby[localBabyId];
  if (pending?.sharedBabyId === sharedBabyId) {
    useBackupStore.getState().cancel(localBabyId, pending.token);
  }
  return true;
}
