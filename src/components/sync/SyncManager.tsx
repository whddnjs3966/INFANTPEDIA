"use client";

import { useEffect, useRef } from "react";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { pushToCloud } from "@/lib/sync/sync-service";
import { createClient } from "@/lib/supabase/client";
import { recordsForBaby } from "@/lib/utils/baby-records";
import { useAuth } from "@/hooks/useAuth";
import { useBackupStore } from "@/lib/store/backup-store";
import { runBackup } from "@/lib/sync/run-backup";
import { isLegacySharingPaused } from "@/lib/sync/sharing-availability";

export default function SyncManager() {
  const profile = useBabyStore((state) => state.profile);
  const babies = useBabyStore((state) => state.babies);
  const legacyOwnerId = useBabyStore((state) => state.legacyOwnerId);
  const measurements = useMeasurementStore((state) => state.measurements);
  const vaccinations = useVaccinationStore((state) => state.records);
  const mappings = useSyncStore((state) => state.mappings);
  const setLastSync = useSyncStore((state) => state.setLastSync);
  const { user, loading } = useAuth();
  const accountId = user?.id;
  const retry = useBackupStore(state => profile ? state.retries[profile.id] ?? 0 : 0);
  const queue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (isLegacySharingPaused()) return;
    if (!profile || loading || !accountId) return;
    const mapping = mappings.find((item) => item.localBabyId === profile.id);
    // Sharing is explicit: removing a mapping must not silently create a new share.
    if (!mapping) return;
    const backup = useBackupStore.getState();
    const token = backup.queue(profile.id, accountId, mapping.sharedBabyId);
    const timer = setTimeout(() => {
      queue.current = queue.current.catch(() => {}).then(async () => {
        const completed = await runBackup({
          babyId: profile.id, token,
          stillConnected: () => useSyncStore.getState().getMapping(profile.id)?.sharedBabyId === mapping.sharedBabyId,
          authenticate: async () => {
            const result = await createClient().auth.getUser();
            return !result.error && result.data.user?.id === accountId;
          },
          upload: () => pushToCloud(
            mapping.sharedBabyId,
            profile,
            recordsForBaby(measurements, profile.id, babies.length, legacyOwnerId),
            recordsForBaby(vaccinations, profile.id, babies.length, legacyOwnerId),
            accountId,
            user?.email
          ),
        });
        if (completed) setLastSync();
      });
    }, 3000);
    return () => { clearTimeout(timer); backup.cancel(profile.id, token); };
  }, [profile, babies.length, legacyOwnerId, measurements, vaccinations, mappings, setLastSync, loading, accountId, user?.email, retry]);

  return null;
}
