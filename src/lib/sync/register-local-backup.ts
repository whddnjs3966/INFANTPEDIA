import { createClient } from "@/lib/supabase/client";
import { createAtomicBackup, readAtomicBackup } from "@/lib/sync/atomic-backup";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { useAtomicConnectionStore, ATOMIC_CONNECTION_KEY, type Registration } from "@/lib/store/atomic-connection-store";
import { recordsForBaby } from "@/lib/utils/baby-records";
import type { CloudSnapshot } from "@/lib/sync/cloud-snapshot";
import { isLocalRestoreInProgress } from "@/lib/sync/local-restore-journal";

// Opt-in for a separately validated environment. Legacy sharing always remains closed.
export function isAtomicRegistrationEnabled() {
  return process.env.NEXT_PUBLIC_ATOMIC_REGISTRATION_ENABLED === "true" && !isLocalRestoreInProgress();
}
export function localBackupSnapshot(localBabyId: string, sharedBabyId: string): CloudSnapshot | null {
  const { profile, babies, legacyOwnerId } = useBabyStore.getState();
  if (profile?.id !== localBabyId) return null;
  return {
    baby: { id: sharedBabyId, name: profile.name, birthdate: profile.birthdate, gender: profile.gender },
    measurements: recordsForBaby(useMeasurementStore.getState().measurements, localBabyId, babies.length, legacyOwnerId).map(m => ({id:m.id, date:m.date, month:m.month, height:m.height, weight:m.weight, headCircumference:m.headCircumference})),
    vaccinations: recordsForBaby(useVaccinationStore.getState().records, localBabyId, babies.length, legacyOwnerId).map(v => ({vaccineId:v.vaccineId, doseNumber:v.doseNumber, completedDate:v.completedDate})),
  };
}
export function snapshotSignature(snapshot: CloudSnapshot) {
  return JSON.stringify({ baby:snapshot.baby,
    measurements:[...snapshot.measurements].sort((a,b)=>a.id.localeCompare(b.id)).map(m=>[m.id,m.date,m.height??null,m.weight??null,m.headCircumference??null]),
    vaccinations:[...snapshot.vaccinations].sort((a,b)=>a.vaccineId.localeCompare(b.vaccineId)||a.doseNumber-b.doseNumber).map(v=>[v.vaccineId,v.doseNumber,v.completedDate]),
  });
}
// Verify persistence before sending: a quota/storage failure must never lose retry identity.
export function durableRegistration(registration: Registration, accepted = false) {
  const state = JSON.parse(localStorage.getItem(ATOMIC_CONNECTION_KEY) ?? "null")?.state;
  return (accepted ? state?.connections : state?.pending)?.some((item: Registration) => JSON.stringify(item.snapshot) === JSON.stringify(registration.snapshot) && item.requestId === registration.requestId && item.accountId === registration.accountId && item.localBabyId === registration.localBabyId && item.sharedBabyId === registration.sharedBabyId) === true;
}
export const registrationOperations = new Set<string>();
export async function registerLocalBackup(accountId: string, localBabyId: string): Promise<{error?: string}> {
  if (!isAtomicRegistrationEnabled()) return {error:"온라인 등록은 아직 준비 중이에요. 기기의 기록은 유지돼요."};
  const key = `${accountId}:${localBabyId}`;
  if (registrationOperations.has(key)) return {error:"등록 요청을 확인하고 있어요. 잠시 기다려 주세요."};
  registrationOperations.add(key);
  try {
    const authenticate = async () => {
      const auth = await createClient().auth.getUser();
      return !auth.error && auth.data.user?.id === accountId;
    };
    if (!await authenticate()) return {error:"로그인 계정이 바뀌었어요. 계정을 확인해 주세요."};
    const store = useAtomicConnectionStore.getState();
    if(store.detached.some(item=>item.connection.accountId===accountId&&item.connection.localBabyId===localBabyId))return{error:"이전에 연결한 백업이 있어요. 새로 등록하지 말고 이전 백업을 다시 확인해 주세요."};
    if (store.connections.some(item=>item.accountId===accountId&&item.localBabyId===localBabyId)) return {error:"이미 등록한 아기예요. 자동 백업 연결은 아직 준비 중이에요."};
    if (useSyncStore.getState().getMapping(localBabyId)) return {error:"이전 공유 연결을 먼저 해제해 주세요. 기기의 기록은 유지돼요."};
    let registration = store.pending.find(item=>item.accountId===accountId&&item.localBabyId===localBabyId);
    if (!registration) {
      const sharedBabyId = crypto.randomUUID();
      const snapshot = localBackupSnapshot(localBabyId,sharedBabyId);
      if (!snapshot) return {error:"현재 선택한 아기를 다시 확인해 주세요."};
      registration = store.prepare({accountId,localBabyId,sharedBabyId,requestId:crypto.randomUUID(),snapshot});
    }
    const request = registration;
    const unchanged = () => {
      const current = localBackupSnapshot(localBabyId,request.sharedBabyId);
      return isAtomicRegistrationEnabled() && current && snapshotSignature(current) === snapshotSignature(request.snapshot)
        && !useSyncStore.getState().getMapping(localBabyId)
        && useAtomicConnectionStore.getState().pending.some(item=>item.requestId===request.requestId&&item.accountId===accountId&&item.localBabyId===localBabyId);
    };
    if (!durableRegistration(request)) {
      // A previous failed persist may have left the request in memory only.
      useAtomicConnectionStore.setState({pending:[...useAtomicConnectionStore.getState().pending]});
      if (!durableRegistration(request)) return {error:"등록 요청을 기기에 보관하지 못했어요. 저장 공간을 확인해 주세요. 온라인 전송은 시작하지 않았어요."};
    }
    if (!unchanged()) return {error:"등록 대기 중 기기 기록이 바뀌었어요. 중복 등록을 막기 위해 기존 요청을 보관했어요. 기록 비교가 필요해요."};
    if (!await authenticate() || !unchanged()) return {error:"계정이나 아기 기록이 바뀌었어요. 기존 등록 요청은 보관돼요."};
    const created = await createAtomicBackup(request.sharedBabyId,request.requestId,request.snapshot,accountId);
    if ("error" in created) return created;
    if (!await authenticate() || !unchanged()) return {error:"등록 후 계정이나 기기 기록이 바뀌었어요. 연결은 반영하지 않았으며 같은 요청으로 확인할 수 있어요."};
    const baseline = await readAtomicBackup(request.sharedBabyId);
    if ("error" in baseline) return baseline;
    if (!await authenticate() || !unchanged()) return {error:"확인 중 계정이나 기기 기록이 바뀌었어요. 기기의 기록은 유지돼요."};
    if (snapshotSignature(baseline.snapshot)!==snapshotSignature(request.snapshot)) return {error:"서버 기록과 등록 요청이 달라요. 덮어쓰지 않고 요청을 보관했어요. 기록 비교가 필요해요."};
    const before = useAtomicConnectionStore.getState();
    try {
      if (!store.accept(request,baseline.revision) || !durableRegistration(request,true)) throw new Error("PERSISTENCE_FAILED");
    } catch {
      // Keep the original retry identity even if persist changed memory before throwing.
      try { useAtomicConnectionStore.setState({pending:before.pending,connections:before.connections}); } catch { /* memory was restored before the storage error */ }
      return {error:"서버 등록은 확인했지만 연결 정보 저장을 확인하지 못했어요. 같은 요청으로 다시 확인해 주세요."};
    }
    return {};
  } catch { return {error:"등록 결과를 확인하지 못했어요. 기기 기록과 같은 등록 요청을 보관해 다시 확인해요."}; }
  finally { registrationOperations.delete(key); }
}
