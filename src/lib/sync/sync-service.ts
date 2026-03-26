import { supabase } from '@/lib/supabase';
import type { BabyProfile } from '@/lib/store/baby-store';
import type { Measurement } from '@/lib/store/measurement-store';
import type { VaccinationRecord } from '@/lib/store/vaccination-store';

// Generate a 6-character alphanumeric invite code (cryptographically secure)
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join('');
}

// Generate unique IDs for synced records
function syncId(): string {
  return crypto.randomUUID();
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

// Helper: map DB rows to local types
function mapMeasurements(rows: Record<string, unknown>[]): Measurement[] {
  return rows.map((m) => ({
    id: syncId(),
    month: m.month as number,
    date: m.date as string,
    height: (m.height as number) || undefined,
    weight: (m.weight as number) || undefined,
    headCircumference: (m.head_circumference as number) || undefined,
  }));
}

function mapVaccinations(rows: Record<string, unknown>[]): VaccinationRecord[] {
  return rows.map((v) => ({
    vaccineId: v.vaccine_id as string,
    doseNumber: v.dose_number as number,
    completedDate: v.completed_date as string,
  }));
}

// ─── Share baby (create invite code) ───
export async function shareBaby(
  baby: BabyProfile,
  measurements: Measurement[],
  vaccinations: VaccinationRecord[]
): Promise<{ code: string; sharedBabyId: string } | { error: string }> {
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
export async function joinByInviteCode(
  code: string
): Promise<{
  baby: { id: string; name: string; birthdate: string; gender: string };
  measurements: Measurement[];
  vaccinations: VaccinationRecord[];
} | { error: string }> {
  const normalized = code.toUpperCase().trim();
  if (!isValidInviteCode(normalized)) {
    return { error: '초대코드는 6자리 영문/숫자입니다' };
  }

  const deviceId = getDeviceId();

  const { data: sharedBaby, error: lookupErr } = await supabase
    .from('shared_babies')
    .select('*')
    .eq('invite_code', normalized)
    .single();

  if (lookupErr || !sharedBaby) {
    return { error: '유효하지 않은 초대코드입니다' };
  }

  const babyId = sharedBaby.id;

  // Register device (ignore duplicate)
  await supabase.from('shared_devices').upsert(
    { baby_id: babyId, device_id: deviceId, role: 'parent' },
    { onConflict: 'baby_id,device_id' }
  );

  // Fetch all data (handle individual errors gracefully)
  const [measRes, vacRes] = await Promise.all([
    supabase.from('shared_measurements').select('*').eq('baby_id', babyId),
    supabase.from('shared_vaccinations').select('*').eq('baby_id', babyId),
  ]);

  return {
    baby: {
      id: babyId,
      name: sharedBaby.name,
      birthdate: sharedBaby.birthdate,
      gender: sharedBaby.gender,
    },
    measurements: mapMeasurements(measRes.data || []),
    vaccinations: mapVaccinations(vacRes.data || []),
  };
}

// ─── Sync: push local changes to cloud ───
export async function pushToCloud(
  sharedBabyId: string,
  baby: BabyProfile,
  measurements: Measurement[],
  vaccinations: VaccinationRecord[]
): Promise<{ error?: string }> {
  try {
    // Update baby profile
    const { error: profileErr } = await supabase
      .from('shared_babies')
      .update({
        name: baby.name,
        birthdate: baby.birthdate,
        gender: baby.gender,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sharedBabyId);

    if (profileErr) {
      return { error: `프로필 업로드 실패: ${profileErr.message}` };
    }

    // Replace measurements
    await supabase.from('shared_measurements').delete().eq('baby_id', sharedBabyId);
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
    await supabase.from('shared_vaccinations').delete().eq('baby_id', sharedBabyId);
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
export async function pullFromCloud(
  sharedBabyId: string
): Promise<{
  baby: { name: string; birthdate: string; gender: string };
  measurements: Measurement[];
  vaccinations: VaccinationRecord[];
} | { error: string }> {
  try {
    const { data: sharedBaby, error } = await supabase
      .from('shared_babies')
      .select('*')
      .eq('id', sharedBabyId)
      .single();

    if (error || !sharedBaby) {
      return { error: '공유 데이터를 불러올 수 없습니다' };
    }

    const [measRes, vacRes] = await Promise.all([
      supabase.from('shared_measurements').select('*').eq('baby_id', sharedBabyId),
      supabase.from('shared_vaccinations').select('*').eq('baby_id', sharedBabyId),
    ]);

    return {
      baby: {
        name: sharedBaby.name,
        birthdate: sharedBaby.birthdate,
        gender: sharedBaby.gender,
      },
      measurements: mapMeasurements(measRes.data || []),
      vaccinations: mapVaccinations(vacRes.data || []),
    };
  } catch (e: unknown) {
    return { error: `데이터 불러오기 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}` };
  }
}
