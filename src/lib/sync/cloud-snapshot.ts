import type { BabyGender } from "@/lib/store/baby-store";
import type { Measurement } from "@/lib/store/measurement-store";
import type { VaccinationRecord } from "@/lib/store/vaccination-store";
import { vaccinations as schedule } from "@/lib/data/growth-data";
import { getCalendarMonthsOld, getKoreaDate, isValidDateOnly } from "@/lib/utils/date";

export interface CloudSnapshot {
  baby: { id: string; name: string; birthdate: string; gender: BabyGender };
  measurements: Measurement[];
  vaccinations: VaccinationRecord[];
}
const row = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
export function decodeCloudSnapshot(baby: unknown, measurements: unknown, vaccinations: unknown, expectedId?: string): CloudSnapshot | { error: string } {
  const fail = { error: "공유 기록을 검증하지 못했어요. 기기의 기록은 바꾸지 않았습니다." };
  if (!row(baby) || !text(baby.id) || (expectedId && baby.id !== expectedId) || !text(baby.name) || typeof baby.birthdate !== "string" || !isValidDateOnly(baby.birthdate) || baby.birthdate > getKoreaDate() || !["male", "female"].includes(String(baby.gender)) || !Array.isArray(measurements) || !Array.isArray(vaccinations)) return fail;
  const birthdate = baby.birthdate;
  const validDate = (value: unknown): value is string => typeof value === "string" && isValidDateOnly(value) && value >= birthdate && value <= getKoreaDate();
  const ids = new Set<string>();
  const decodedMeasurements: Measurement[] = [];
  for (const m of measurements) {
    if (!row(m) || m.baby_id !== baby.id || !text(m.id) || ids.has(m.id) || !validDate(m.date)) return fail;
    const values = [m.height, m.weight, m.head_circumference];
    if (!values.some(value => value != null) || values.some(value => value != null && (typeof value !== "number" || !Number.isFinite(value) || value <= 0))) return fail;
    ids.add(m.id);
    decodedMeasurements.push({ id: m.id, date: m.date, month: Math.min(12, getCalendarMonthsOld(birthdate, m.date)), height: m.height == null ? undefined : m.height as number, weight: m.weight == null ? undefined : m.weight as number, headCircumference: m.head_circumference == null ? undefined : m.head_circumference as number });
  }
  const doses = new Set<string>();
  const decodedVaccinations: VaccinationRecord[] = [];
  for (const v of vaccinations) {
    if (!row(v) || v.baby_id !== baby.id || !text(v.vaccine_id) || !Number.isInteger(v.dose_number) || !validDate(v.completed_date) || !schedule.find(item => item.id === v.vaccine_id)?.doses.some(dose => dose.doseNumber === v.dose_number)) return fail;
    const key = `${v.vaccine_id}:${v.dose_number}`;
    if (doses.has(key)) return fail;
    doses.add(key);
    decodedVaccinations.push({ vaccineId: v.vaccine_id, doseNumber: v.dose_number as number, completedDate: v.completed_date });
  }
  return { baby: { id: baby.id, name: baby.name, birthdate, gender: baby.gender as BabyGender }, measurements: decodedMeasurements, vaccinations: decodedVaccinations };
}
