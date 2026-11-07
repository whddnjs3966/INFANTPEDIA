import type { DailySchedule } from "@/lib/data/daily-schedule-data";

export const clockMinutes = (clock: string): number | null => {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(clock)) return null;
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
};

export const schedulePeriods = [
  { key: "morning", label: "오전", range: "06–12시" },
  { key: "afternoon", label: "오후", range: "12–18시" },
  { key: "evening", label: "저녁", range: "18–24시" },
  { key: "night", label: "새벽", range: "00–06시" },
] as const;

export type SchedulePeriod = typeof schedulePeriods[number]["key"];

// Group example timestamps only; these buckets do not prescribe a baby's routine.
export function schedulePeriodForTime(time: string): SchedulePeriod | null {
  const minutes = clockMinutes(time);
  if (minutes === null) return null;
  if (minutes < 360) return "night";
  if (minutes < 720) return "morning";
  if (minutes < 1080) return "afternoon";
  return "evening";
}

export interface ScheduleSegment {
  index: number;
  type: string;
  start: number;
  minEnd: number;
  maxEnd: number;
}

// Never infer duration from the next activity, or from bedtime until morning.
export function scheduleSegments(schedule: DailySchedule): ScheduleSegment[] {
  if (schedule.mode === "responsive") return [];
  return schedule.items.flatMap((item, index) => {
    const start = clockMinutes(item.time), range = item.durationMinutes;
    if (start === null || !range || item.type === "sleep" || !Number.isFinite(range.min) || !Number.isFinite(range.max) || range.min <= 0 || range.max < range.min || range.max > 1440) return [];
    return [{ index, type: item.type, start, minEnd: start + range.min, maxEnd: start + range.max }];
  });
}

export function splitAtMidnight(start: number, end: number): { start: number; end: number }[] {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= 1440 || end <= start || end - start > 1440) return [];
  return end <= 1440 ? [{ start, end }] : [{ start, end: 1440 }, { start: 0, end: end - 1440 }];
}

export function nightWindows(schedule: DailySchedule) {
  const wake = clockMinutes(schedule.wakeUp), bed = clockMinutes(schedule.bedtime);
  if (schedule.mode === "responsive" || wake === null || bed === null || wake >= bed) return [];
  return [{ start: 0, end: wake }, { start: bed, end: 1440 }];
}
