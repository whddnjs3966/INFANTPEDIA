import { supabase } from '@/lib/supabase';
import type { BabyProfile } from '@/lib/store/baby-store';
import type { Measurement } from '@/lib/store/measurement-store';
import type { VaccinationRecord } from '@/lib/store/vaccination-store';
import type { LogEntry } from '@/lib/store/daily-log-store';

// Generate a 6-character alphanumeric invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Get or create a device ID
export function getDeviceId(): string {
  const key = 'infantpedia-device-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── Share baby (create invite code) ───
export async function shareBaby(
  baby: BabyProfile,
  measurements: Measurement[],
  vaccinations: VaccinationRecord[],
  dailyLogs: LogEntry[]
): Promise<{ code: string; sharedBabyId: string } | { error: string }> {
  const inviteCode = generateInviteCode();
  const deviceId = getDeviceId();

  // Insert shared baby
  const { data: sharedBaby, error: babyErr } = await supabase
    .from('shared_babies')
    .insert({
      invite_code: inviteCode,
      name: baby.name,
      birthdate: baby.birthdate,
      gender: baby.gender,
    })
    .select('id')
    .single();

  if (babyErr || !sharedBaby) {
    // Retry with new code if duplicate
    if (babyErr?.code === '23505') {
      return shareBaby(baby, measurements, vaccinations, dailyLogs);
    }
    return { error: babyErr?.message || '공유 생성에 실패했습니다' };
  }

  const babyId = sharedBaby.id;

  // Register this device
  await supabase.from('shared_devices').insert({
    baby_id: babyId,
    device_id: deviceId,
    role: 'parent',
  });

  // Upload measurements
  if (measurements.length > 0) {
    await supabase.from('shared_measurements').insert(
      measurements.map((m) => ({
        baby_id: babyId,
        month: m.month,
        date: m.date,
        height: m.height || null,
        weight: m.weight || null,
        head_circumference: m.headCircumference || null,
      }))
    );
  }

  // Upload vaccinations
  if (vaccinations.length > 0) {
    await supabase.from('shared_vaccinations').insert(
      vaccinations.map((v) => ({
        baby_id: babyId,
        vaccine_id: v.vaccineId,
        dose_number: v.doseNumber,
        completed_date: v.completedDate,
      }))
    );
  }

  // Upload daily logs
  if (dailyLogs.length > 0) {
    await supabase.from('shared_daily_logs').insert(
      dailyLogs.map((l) => ({
        baby_id: babyId,
        date: l.date,
        time: l.time,
        end_time: l.endTime || null,
        category: l.category,
        amount: l.amount || null,
        duration: l.duration || null,
        side: l.side || null,
        menu: l.menu || null,
        color: l.color || null,
        consistency: l.consistency || null,
        temperature: l.temperature || null,
        note: l.note || null,
      }))
    );
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
  dailyLogs: LogEntry[];
} | { error: string }> {
  const deviceId = getDeviceId();

  // Look up baby by invite code
  const { data: sharedBaby, error: lookupErr } = await supabase
    .from('shared_babies')
    .select('*')
    .eq('invite_code', code.toUpperCase().trim())
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

  // Fetch all data
  const [measRes, vacRes, logRes] = await Promise.all([
    supabase.from('shared_measurements').select('*').eq('baby_id', babyId),
    supabase.from('shared_vaccinations').select('*').eq('baby_id', babyId),
    supabase.from('shared_daily_logs').select('*').eq('baby_id', babyId),
  ]);

  const measurements: Measurement[] = (measRes.data || []).map((m: Record<string, unknown>, i: number) => ({
    id: `sync-m-${i}-${Date.now()}`,
    month: m.month as number,
    date: m.date as string,
    height: m.height as number | undefined,
    weight: m.weight as number | undefined,
    headCircumference: m.head_circumference as number | undefined,
  }));

  const vaccinations: VaccinationRecord[] = (vacRes.data || []).map((v: Record<string, unknown>) => ({
    vaccineId: v.vaccine_id as string,
    doseNumber: v.dose_number as number,
    completedDate: v.completed_date as string,
  }));

  const dailyLogs: LogEntry[] = (logRes.data || []).map((l: Record<string, unknown>, i: number) => ({
    id: `sync-l-${i}-${Date.now()}`,
    date: l.date as string,
    time: l.time as string,
    endTime: l.end_time as string | undefined,
    category: l.category as LogEntry['category'],
    amount: l.amount as number | undefined,
    duration: l.duration as number | undefined,
    side: l.side as LogEntry['side'],
    menu: l.menu as string | undefined,
    color: l.color as string | undefined,
    consistency: l.consistency as string | undefined,
    temperature: l.temperature as number | undefined,
    note: l.note as string | undefined,
  }));

  return {
    baby: {
      id: babyId,
      name: sharedBaby.name,
      birthdate: sharedBaby.birthdate,
      gender: sharedBaby.gender,
    },
    measurements,
    vaccinations,
    dailyLogs,
  };
}

// ─── Sync: push local changes to cloud ───
export async function pushToCloud(
  sharedBabyId: string,
  baby: BabyProfile,
  measurements: Measurement[],
  vaccinations: VaccinationRecord[],
  dailyLogs: LogEntry[]
): Promise<{ error?: string }> {
  // Update baby profile
  await supabase
    .from('shared_babies')
    .update({
      name: baby.name,
      birthdate: baby.birthdate,
      gender: baby.gender,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sharedBabyId);

  // Replace measurements (delete + re-insert for simplicity)
  await supabase.from('shared_measurements').delete().eq('baby_id', sharedBabyId);
  if (measurements.length > 0) {
    await supabase.from('shared_measurements').insert(
      measurements.map((m) => ({
        baby_id: sharedBabyId,
        month: m.month,
        date: m.date,
        height: m.height || null,
        weight: m.weight || null,
        head_circumference: m.headCircumference || null,
      }))
    );
  }

  // Replace vaccinations
  await supabase.from('shared_vaccinations').delete().eq('baby_id', sharedBabyId);
  if (vaccinations.length > 0) {
    await supabase.from('shared_vaccinations').insert(
      vaccinations.map((v) => ({
        baby_id: sharedBabyId,
        vaccine_id: v.vaccineId,
        dose_number: v.doseNumber,
        completed_date: v.completedDate,
      }))
    );
  }

  // Replace daily logs
  await supabase.from('shared_daily_logs').delete().eq('baby_id', sharedBabyId);
  if (dailyLogs.length > 0) {
    await supabase.from('shared_daily_logs').insert(
      dailyLogs.map((l) => ({
        baby_id: sharedBabyId,
        date: l.date,
        time: l.time,
        end_time: l.endTime || null,
        category: l.category,
        amount: l.amount || null,
        duration: l.duration || null,
        side: l.side || null,
        menu: l.menu || null,
        color: l.color || null,
        consistency: l.consistency || null,
        temperature: l.temperature || null,
        note: l.note || null,
      }))
    );
  }

  return {};
}

// ─── Sync: pull cloud data to local ───
export async function pullFromCloud(
  sharedBabyId: string
): Promise<{
  baby: { name: string; birthdate: string; gender: string };
  measurements: Measurement[];
  vaccinations: VaccinationRecord[];
  dailyLogs: LogEntry[];
} | { error: string }> {
  const { data: sharedBaby, error } = await supabase
    .from('shared_babies')
    .select('*')
    .eq('id', sharedBabyId)
    .single();

  if (error || !sharedBaby) {
    return { error: '공유 데이터를 불러올 수 없습니다' };
  }

  const [measRes, vacRes, logRes] = await Promise.all([
    supabase.from('shared_measurements').select('*').eq('baby_id', sharedBabyId),
    supabase.from('shared_vaccinations').select('*').eq('baby_id', sharedBabyId),
    supabase.from('shared_daily_logs').select('*').eq('baby_id', sharedBabyId),
  ]);

  const measurements: Measurement[] = (measRes.data || []).map((m: Record<string, unknown>, i: number) => ({
    id: `sync-m-${i}-${Date.now()}`,
    month: m.month as number,
    date: m.date as string,
    height: m.height as number | undefined,
    weight: m.weight as number | undefined,
    headCircumference: m.head_circumference as number | undefined,
  }));

  const vaccinations: VaccinationRecord[] = (vacRes.data || []).map((v: Record<string, unknown>) => ({
    vaccineId: v.vaccine_id as string,
    doseNumber: v.dose_number as number,
    completedDate: v.completed_date as string,
  }));

  const dailyLogs: LogEntry[] = (logRes.data || []).map((l: Record<string, unknown>, i: number) => ({
    id: `sync-l-${i}-${Date.now()}`,
    date: l.date as string,
    time: l.time as string,
    endTime: l.end_time as string | undefined,
    category: l.category as LogEntry['category'],
    amount: l.amount as number | undefined,
    duration: l.duration as number | undefined,
    side: l.side as LogEntry['side'],
    menu: l.menu as string | undefined,
    color: l.color as string | undefined,
    consistency: l.consistency as string | undefined,
    temperature: l.temperature as number | undefined,
    note: l.note as string | undefined,
  }));

  return {
    baby: {
      name: sharedBaby.name,
      birthdate: sharedBaby.birthdate,
      gender: sharedBaby.gender,
    },
    measurements,
    vaccinations,
    dailyLogs,
  };
}
