import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { recordsForBaby } from "@/lib/utils/baby-records";
import type { CloudSnapshot } from "@/lib/sync/cloud-snapshot";

function localRecords(id: string) {
  const { babies, legacyOwnerId } = useBabyStore.getState();
  return {
    measurements: recordsForBaby(useMeasurementStore.getState().measurements, id, babies.length, legacyOwnerId),
    vaccinations: recordsForBaby(useVaccinationStore.getState().records, id, babies.length, legacyOwnerId),
  };
}
export function importFingerprint(id: string) {
  return JSON.stringify({ baby: useBabyStore.getState().babies.find(baby => baby.id === id), ...localRecords(id), mapping: useSyncStore.getState().getMapping(id) });
}
export function importGuard(id: string, before: string, snapshot: CloudSnapshot): string | null {
  if (useBabyStore.getState().profile?.id !== id || importFingerprint(id) !== before) return "가져오는 동안 아기나 기록이 바뀌었어요. 기기 기록을 유지했습니다. 대상을 확인하고 다시 시도해 주세요.";
  const current = localRecords(id);
  if ((!snapshot.measurements.length && current.measurements.length) || (!snapshot.vaccinations.length && current.vaccinations.length)) return "서버 기록이 비어 있어 기존 기록을 교체하지 않았어요. 공유 대상과 조회 권한을 먼저 확인해 주세요.";
  return null;
}
