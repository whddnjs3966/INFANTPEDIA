import { getKoreaDate, isValidDateOnly } from "./date";

export interface RecordMutationResult { ok: boolean; error?: string; }
export function recordDateError(date: string, birthdate: string, label: string): string | null {
  if (!isValidDateOnly(birthdate) || birthdate > getKoreaDate()) return "아기 프로필의 생년월일을 먼저 확인해 주세요.";
  if (!isValidDateOnly(date)) return `${label}을 선택해 주세요.`;
  if (date > getKoreaDate()) return `${label}은 오늘보다 늦을 수 없어요.`;
  if (date < birthdate) return "아기가 태어난 날부터 오늘까지의 날짜를 선택해 주세요.";
  return null;
}
