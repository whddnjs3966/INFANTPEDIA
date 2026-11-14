import { decodeCloudSnapshot, type CloudSnapshot } from "@/lib/sync/cloud-snapshot";
import { supabase } from '@/lib/supabase';
import { isLegacySharingPaused, SHARING_PAUSED_MESSAGE } from '@/lib/sync/sharing-availability';
import type { BabyProfile } from '@/lib/store/baby-store';
import type { Measurement } from '@/lib/store/measurement-store';
import type { VaccinationRecord } from '@/lib/store/vaccination-store';

function legacyVaccinationKeysAreUnique(records: VaccinationRecord[]) {
  return new Set(records.map(record => `${record.vaccineId}:${record.doseNumber}`)).size === records.length;
}

const legacyVaccinationError = '이전 공유 방식으로는 절기별 접종 기록을 보낼 수 없어요. 기기 기록은 유지돼요.';

// Generate a 6-character alphanumeric invite code (cryptographically secure)
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join('');
}

// Validate invite code format: 6 chars, alphanumeric only
function isValidInviteCode(code: string): boolean {
  return /^[A-Z2-9]{6}$/.test(code);
}

// Get or create a device ID (cryptographically secure)
export function getDeviceId(): string {
  const key = 'infantpedia-device-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── Share baby (create invite code or auto-sync) ───
export async function shareBaby(
  baby: BabyProfile,
  measurements: Measurement[],
  vaccinations: VaccinationRecord[],
  creatorId?: string,
  creatorEmail?: string
): Promise<{ code: string; sharedBabyId: string } | { error: string }> {
  if (isLegacySharingPaused()) return { error: SHARING_PAUSED_MESSAGE };
  if (!legacyVaccinationKeysAreUnique(vaccinations)) return { error: legacyVaccinationError };
  const deviceId = getDeviceId();
  const MAX_RETRIES = 3;

  // Try generating a unique invite code (retry on duplicate)
  let sharedBaby: { id: string } | null = null;
  let inviteCode = '';

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    inviteCode = generateInviteCode();
    const { data, error } = await supabase
      .from('shared_babies')
      .insert({
        invite_code: inviteCode,
        name: baby.name,
        birthdate: baby.birthdate,
        gender: baby.gender,
        creator_id: creatorId || null,
        creator_email: creatorEmail || null,
      })
      .select('id')
      .single();

    if (data) {
      sharedBaby = data;
      break;
    }
    // Only retry on duplicate key, otherwise fail
    if (error?.code !== '23505') {
      return { error: error?.message || '공유 생성에 실패했습니다' };
    }
  }

  if (!sharedBaby) {
    return { error: '초대코드 생성에 실패했습니다. 다시 시도해주세요.' };
  }

  const babyId = sharedBaby.id;

  // Register this device
  const { error: deviceErr } = await supabase.from('shared_devices').insert({
    baby_id: babyId,
    device_id: deviceId,
    role: 'parent',
  });
  if (deviceErr) {
    console.error('Device registration failed:', deviceErr.message);
  }

  // Upload data (log errors but don't fail the whole operation)
  if (measurements.length > 0) {
    const { error } = await supabase.from('shared_measurements').insert(
      measurements.map((m) => ({
        baby_id: babyId,
        month: m.month,
        date: m.date,
        height: m.height || null,
        weight: m.weight || null,
        head_circumference: m.headCircumference || null,
      }))
    );
    if (error) console.error('Measurement upload failed:', error.message);
  }

  if (vaccinations.length > 0) {
    const { error } = await supabase.from('shared_vaccinations').insert(
      vaccinations.map((v) => ({
        baby_id: babyId,
        vaccine_id: v.vaccineId,
        dose_number: v.doseNumber,
        completed_date: v.completedDate,
      }))
    );
    if (error) console.error('Vaccination upload failed:', error.message);
  }

  return { code: inviteCode, sharedBabyId: babyId };
}

// ─── Join via invite code ───
async function readSnapshot(baby: { id: string }, expectedAccountId: string): Promise<CloudSnapshot | { error: string }> {
  const [meas, vac] = await Promise.all([
    supabase.from('shared_measurements').select('*', { count: 'exact' }).eq('baby_id', baby.id),
    supabase.from('shared_vaccinations').select('*', { count: 'exact' }).eq('baby_id', baby.id),
  ]);
  if (meas.error || vac.error || !Array.isArray(meas.data) || !Array.isArray(vac.data) || meas.count !== meas.data.length || vac.count !== vac.data.length) return { error: '기록 전체를 불러오지 못했어요. 기기의 기록은 유지됩니다.' };
  const auth = await supabase.auth.getUser();
  if (auth.error || auth.data.user?.id !== expectedAccountId) return { error: '로그인 계정이 바뀌었어요. 다시 로그인 상태를 확인해 주세요.' };
  return decodeCloudSnapshot(baby, meas.data, vac.data, baby.id);
}

export async function joinByInviteCode(code: string, expectedAccountId?: string): Promise<CloudSnapshot | { error: string }> {
  if (isLegacySharingPaused()) return { error: SHARING_PAUSED_MESSAGE };
  const normalized = code.toUpperCase().trim();
  if (!isValidInviteCode(normalized)) return { error: '초대코드는 6자리 영문/숫자입니다' };
  try {
    const auth = await supabase.auth.getUser();
    const accountId = auth.data.user?.id;
    if (auth.error || !accountId || (expectedAccountId && expectedAccountId !== accountId)) return { error: '가족 공유를 가져오려면 먼저 로그인해 주세요.' };
    const { data: baby, error } = await supabase.from('shared_babies').select('*').eq('invite_code', normalized).single();
    if (error || !baby || typeof baby.id !== 'string') return { error: '초대코드 또는 조회 권한을 확인해 주세요.' };
    const profileCheck = decodeCloudSnapshot(baby, [], [], baby.id);
    if ('error' in profileCheck) return profileCheck;
    const device = await supabase.from('shared_devices').upsert({ baby_id: baby.id, device_id: getDeviceId(), role: 'parent' }, { onConflict: 'baby_id,device_id' });
    if (device.error) return { error: '공유 연결을 확인하지 못했어요. 기기 기록은 유지됩니다.' };
    return await readSnapshot(baby, accountId);
  } catch { return { error: '공유 정보를 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.' }; }
}

// ─── Sync: push local changes to cloud ───
export async function pushToCloud(
  sharedBabyId: string,
  baby: BabyProfile,
  measurements: Measurement[],
  vaccinations: VaccinationRecord[],
  creatorId?: string,
  creatorEmail?: string
): Promise<{ error?: string }> {
  if (isLegacySharingPaused()) return { error: SHARING_PAUSED_MESSAGE };
  if (!legacyVaccinationKeysAreUnique(vaccinations)) return { error: legacyVaccinationError };
  try {
    // Update baby profile
    const { data: savedProfile, error: profileErr } = await supabase
      .from('shared_babies')
      .update({
        name: baby.name,
        birthdate: baby.birthdate,
        gender: baby.gender,
        updated_at: new Date().toISOString(),
        ...(creatorId ? { creator_id: creatorId } : {}),
        ...(creatorEmail ? { creator_email: creatorEmail } : {}),
      })
      .eq('id', sharedBabyId).select('id').single();

    if (profileErr || savedProfile?.id !== sharedBabyId) {
      return { error: '프로필 업로드를 확인하지 못했어요.' };
    }

    // Replace measurements
    const { error: measurementDeleteError } = await supabase.from('shared_measurements').delete().eq('baby_id', sharedBabyId);
    if (measurementDeleteError) return { error: '기존 측정 데이터 갱신에 실패했어요.' };
    if (measurements.length > 0) {
      const { error } = await supabase.from('shared_measurements').insert(
        measurements.map((m) => ({
          baby_id: sharedBabyId,
          month: m.month,
          date: m.date,
          height: m.height || null,
          weight: m.weight || null,
          head_circumference: m.headCircumference || null,
        }))
      );
      if (error) return { error: `측정 데이터 업로드 실패: ${error.message}` };
    }

    // Replace vaccinations
    const { error: vaccinationDeleteError } = await supabase.from('shared_vaccinations').delete().eq('baby_id', sharedBabyId);
    if (vaccinationDeleteError) return { error: '기존 접종 데이터 갱신에 실패했어요.' };
    if (vaccinations.length > 0) {
      const { error } = await supabase.from('shared_vaccinations').insert(
        vaccinations.map((v) => ({
          baby_id: sharedBabyId,
          vaccine_id: v.vaccineId,
          dose_number: v.doseNumber,
          completed_date: v.completedDate,
        }))
      );
      if (error) return { error: `예방접종 업로드 실패: ${error.message}` };
    }

    return {};
  } catch (e: unknown) {
    return { error: `동기화 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}` };
  }
}

// ─── Sync: pull cloud data to local ───
export async function pullFromCloud(sharedBabyId: string): Promise<CloudSnapshot | { error: string }> {
  if (isLegacySharingPaused()) return { error: SHARING_PAUSED_MESSAGE };
  try {
    const auth = await supabase.auth.getUser();
    if (auth.error || !auth.data.user) return { error: '먼저 로그인 상태를 확인해 주세요.' };
    const { data: baby, error } = await supabase.from('shared_babies').select('*').eq('id', sharedBabyId).single();
    if (error || !baby || baby.id !== sharedBabyId) return { error: '공유 프로필을 확인하지 못했어요.' };
    return await readSnapshot(baby, auth.data.user.id);
  } catch { return { error: '기록을 불러오지 못했어요. 기기 기록은 유지됩니다.' }; }
}
