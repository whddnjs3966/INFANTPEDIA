import { isValidDateOnly } from "@/lib/utils/date";

export const INFLUENZA_VACCINE_ID = "flu";

// This is a grouping rule for records. The vaccination program's dates are published separately.
export function influenzaSeason(date: string): number | undefined {
  if (!isValidDateOnly(date)) return undefined;
  const year = Number(date.slice(0, 4));
  return Number(date.slice(5, 7)) >= 9 ? year : year - 1;
}

export function influenzaSeasonLabel(season: number): string {
  return `${season}–${season + 1} 절기`;
}

export function vaccinationRecordKey(record: { vaccineId: string; doseNumber: number; completedDate: string }): string {
  const key = `${record.vaccineId}:${record.doseNumber}`;
  return record.vaccineId === INFLUENZA_VACCINE_ID ? `${key}:${influenzaSeason(record.completedDate) ?? ""}` : key;
}

export function vaccinationSeasonSuffix(record: { vaccineId: string; completedDate: string }): string {
  const season = record.vaccineId === INFLUENZA_VACCINE_ID ? influenzaSeason(record.completedDate) : undefined;
  return season === undefined ? "" : ` · ${influenzaSeasonLabel(season)}`;
}
