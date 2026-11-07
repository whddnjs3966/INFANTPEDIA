import { createClient } from "@/lib/supabase/client";
import { decodeCloudSnapshot, type CloudSnapshot } from "@/lib/sync/cloud-snapshot";

export type AtomicBackupError = { error: string; kind: "conflict" | "permission" | "unavailable" | "invalid" | "network" };
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const uuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const revision = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2147483647;
function failure(code?: string): AtomicBackupError {
  if (code === "40001") return { kind: "conflict", error: "다른 기기에서 먼저 수정한 기록이 있어요. 최신 기록을 확인하기 전에는 덮어쓰지 않습니다." };
  if (code === "42501") return { kind: "permission", error: "이 아기의 백업에 접근할 권한을 확인해 주세요." };
  if (["42883", "PGRST202", "P0002"].includes(code ?? "")) return { kind: "unavailable", error: "새 백업 경로가 아직 준비되지 않았어요. 기기의 기록은 유지됩니다." };
  if (code?.startsWith("22") || code?.startsWith("23")) return { kind: "invalid", error: "백업 데이터 또는 요청을 확인하지 못했어요." };
  return { kind: "network", error: "온라인 백업 결과를 확인하지 못했어요. 기기의 기록은 유지됩니다." };
}
export async function readAtomicBackup(sharedBabyId: string): Promise<{ snapshot: CloudSnapshot; revision: number } | AtomicBackupError> {
  if (!uuid(sharedBabyId)) return failure("22023");
  sharedBabyId = sharedBabyId.toLowerCase();
  try {
    const { data, error } = await createClient().rpc("read_backup_snapshot", { p_baby_id: sharedBabyId });
    if (error) return failure(error.code);
    if (!object(data) || data.baby_id !== sharedBabyId || !revision(data.revision) || !object(data.payload)) return failure("22023");
    const snapshot = decodeCloudSnapshot(data.payload.baby, data.payload.measurements, data.payload.vaccinations, sharedBabyId);
    return "error" in snapshot ? failure("22023") : { snapshot, revision: data.revision };
  } catch { return failure(); }
}
// A caller creates stable baby/request UUIDs once and retains the unchanged snapshot for retries.
// This receipt does not imply that revision 0 is still current; read/accept a baseline separately.
export async function createAtomicBackup(sharedBabyId: string, requestId: string, snapshot: CloudSnapshot, expectedAccountId?: string): Promise<{ sharedBabyId: string; requestId: string } | AtomicBackupError> {
  if (!uuid(sharedBabyId) || !uuid(requestId) || (expectedAccountId !== undefined && !uuid(expectedAccountId))) return failure("22023");
  sharedBabyId = sharedBabyId.toLowerCase();
  requestId = requestId.toLowerCase();
  const payload = encodeSnapshot(sharedBabyId, snapshot);
  if (snapshot.baby.id.toLowerCase() !== sharedBabyId || "error" in decodeCloudSnapshot(payload.baby,payload.measurements,payload.vaccinations,sharedBabyId)) return failure("22023");
  try {
    const { data, error } = await createClient().rpc("create_backup_snapshot", { p_baby_id: sharedBabyId, p_request_id: requestId, p_payload: payload, ...(expectedAccountId ? {p_expected_user_id:expectedAccountId.toLowerCase()} : {}) });
    if (error) return failure(error.code);
    if (!object(data) || data.baby_id !== sharedBabyId || data.request_id !== requestId) return failure("22023");
    return { sharedBabyId, requestId };
  } catch { return failure(); }
}

function encodeSnapshot(sharedBabyId: string, snapshot: CloudSnapshot) {
  return {
    baby: { id: sharedBabyId, name: snapshot.baby.name, birthdate: snapshot.baby.birthdate, gender: snapshot.baby.gender },
    measurements: snapshot.measurements.map(m => ({ id: m.id, baby_id: sharedBabyId, month: m.month, date: m.date, height: m.height ?? null, weight: m.weight ?? null, head_circumference: m.headCircumference ?? null })),
    vaccinations: snapshot.vaccinations.map(v => ({ baby_id: sharedBabyId, vaccine_id: v.vaccineId, dose_number: v.doseNumber, completed_date: v.completedDate })),
  };
}

// Caller must supply the revision of an explicitly accepted snapshot, never fetch-and-overwrite.
// A retry after an uncertain response must reuse the same requestId and unchanged payload.
export async function writeAtomicBackup(sharedBabyId: string, expectedRevision: number, requestId: string, snapshot: CloudSnapshot, expectedAccountId?: string): Promise<{ revision: number } | AtomicBackupError> {
  if (!uuid(sharedBabyId) || !uuid(requestId) || !revision(expectedRevision) || expectedRevision === 2147483647 || (expectedAccountId !== undefined && !uuid(expectedAccountId))) return failure("22023");
  sharedBabyId = sharedBabyId.toLowerCase();
  requestId = requestId.toLowerCase();
  const payload = encodeSnapshot(sharedBabyId, snapshot);
  if (snapshot.baby.id.toLowerCase() !== sharedBabyId || "error" in decodeCloudSnapshot(payload.baby,payload.measurements,payload.vaccinations,sharedBabyId)) return failure("22023");
  try {
    const { data, error } = await createClient().rpc(expectedAccountId ? "write_backup_snapshot_for_account" : "write_backup_snapshot", { p_baby_id: sharedBabyId, p_expected_revision: expectedRevision, p_request_id: requestId, p_payload: payload, ...(expectedAccountId ? {p_expected_user_id:expectedAccountId.toLowerCase()} : {}) });
    if (error) return failure(error.code);
    if (!object(data) || data.baby_id !== sharedBabyId || data.request_id !== requestId || data.revision !== expectedRevision + 1) return failure("22023");
    return { revision: data.revision as number };
  } catch { return failure(); }
}
