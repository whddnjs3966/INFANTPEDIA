const DAY_MS = 86_400_000;

export function getKoreaDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function parseDate(value: string): { year: number; month: number; day: number; stamp: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return { year, month, day, stamp };
}

export function getDaysSinceBirth(birthdate: string, referenceDate = getKoreaDate()): number {
  const birth = parseDate(birthdate);
  const current = parseDate(referenceDate);
  if (!birth || !current) return 0;
  return Math.max(0, Math.floor((current.stamp - birth.stamp) / DAY_MS));
}

export function getCalendarMonthsOld(birthdate: string, referenceDate = getKoreaDate()): number {
  const birth = parseDate(birthdate);
  const current = parseDate(referenceDate);
  if (!birth || !current || current.stamp < birth.stamp) return 0;
  let months = (current.year - birth.year) * 12 + current.month - birth.month;
  const lastDay = new Date(Date.UTC(current.year, current.month, 0)).getUTCDate();
  if (current.day < Math.min(birth.day, lastDay)) months -= 1;
  return Math.max(0, months);
}

export function isValidDateOnly(value: string): boolean {
  return parseDate(value) !== null;
}
