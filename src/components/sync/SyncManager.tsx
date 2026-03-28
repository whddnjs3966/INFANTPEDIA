"use client";

import { useEffect, useRef } from "react";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { shareBaby, pushToCloud } from "@/lib/sync/sync-service";
import { createClient } from "@/lib/supabase/client";

export default function SyncManager() {
  const profile = useBabyStore((s) => s.profile);
  const babies = useBabyStore((s) => s.babies);
  const measurements = useMeasurementStore((s) => s.measurements);
  const vaccinations = useVaccinationStore((s) => s.records);
  
  const mappings = useSyncStore((s) => s.mappings);
  const addMapping = useSyncStore((s) => s.addMapping);
  const setLastSync = useSyncStore((s) => s.setLastSync);

  // Use refs to avoid triggering effects on every single render if not needed,
  // but we want to sync when data changes.
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!profile) return; // No baby to sync

    const currentBaby = babies.find((b) => b.id === profile.id) || profile;
    const mapping = mappings.find((m) => m.localBabyId === currentBaby.id);

    const performSync = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!mapping) {
          // Auto-register baby to cloud for the first time
          const result = await shareBaby(
            currentBaby,
            measurements,
            vaccinations,
            user?.id,
            user?.email
          );

          if (!("error" in result)) {
            addMapping({
              localBabyId: currentBaby.id,
              sharedBabyId: result.sharedBabyId,
              inviteCode: result.code,
            });
            setLastSync();
          }
        } else {
          // Push updates to existing cloud record
          const result = await pushToCloud(
            mapping.sharedBabyId,
            currentBaby,
            measurements,
            vaccinations,
            user?.id,
            user?.email
          );

          if (!result.error) {
            setLastSync();
          }
        }
      } catch (error) {
        console.error("Auto-sync failed:", error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Debounce the sync operation by 3 seconds to batch rapid local changes
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(performSync, 3000);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [profile, babies, measurements, vaccinations, mappings, addMapping, setLastSync]);

  // SyncManager is functionally invisible
  return null;
}
