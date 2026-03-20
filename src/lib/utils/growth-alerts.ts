import { type Measurement } from '@/lib/store/measurement-store';
import { growthData, growthRanges } from '@/lib/data/growth-data';
import { type BabyGender } from '@/lib/store/baby-store';

export interface GrowthAlert {
  type: 'rapid_growth' | 'plateau' | 'no_data';
  metric: 'height' | 'weight' | 'head' | 'general';
  metricLabel: string;
  message: string;
  emoji: string;
  severity: 'info' | 'warning';
}

const metricLabels: Record<string, string> = {
  height: '키',
  weight: '체중',
  head: '머리둘레',
  general: '성장 기록',
};

/**
 * Get expected month-over-month growth from WHO 50th percentile data.
 * Returns the expected increase for a given metric between two consecutive months.
 */
function getExpectedGrowth(
  fromMonth: number,
  toMonth: number,
  metric: 'height' | 'weight' | 'head',
  gender: BabyGender
): number | null {
  const fromData = growthData.find((d) => d.month === fromMonth);
  const toData = growthData.find((d) => d.month === toMonth);
  if (!fromData || !toData) return null;

  const key = gender === 'male'
    ? metric === 'height' ? 'maleHeight' : metric === 'weight' ? 'maleWeight' : 'maleHead'
    : metric === 'height' ? 'femaleHeight' : metric === 'weight' ? 'femaleWeight' : 'femaleHead';

  return toData[key] - fromData[key];
}

/**
 * Get the normal range spread (p97 - p3) for a given month/metric/gender.
 * Used to determine what counts as "rapid" growth.
 */
function getRangeSpread(
  month: number,
  metric: 'height' | 'weight' | 'head',
  gender: BabyGender
): number | null {
  const genderKey = gender;
  const metricKey = metric;
  const ranges = growthRanges[genderKey]?.[metricKey];
  if (!ranges) return null;
  const entry = ranges.find((r) => r.month === month);
  if (!entry) return null;
  return entry.p97 - entry.p3;
}

/**
 * Analyze measurements and return growth alerts for the home dashboard.
 */
export function getGrowthAlerts(
  months: number,
  measurements: Measurement[],
  gender: BabyGender
): GrowthAlert[] {
  const alerts: GrowthAlert[] = [];

  // Case 1: No measurements at all
  if (measurements.length === 0) {
    alerts.push({
      type: 'no_data',
      metric: 'general',
      metricLabel: metricLabels.general,
      message: '아직 성장 기록이 없어요. 아기의 키, 체중을 기록해보세요!',
      emoji: '\ud83d\udcdd',
      severity: 'info',
    });
    return alerts;
  }

  // Build a map of latest measurement per month
  const byMonth = new Map<number, Measurement>();
  const sorted = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (const m of sorted) {
    if (!byMonth.has(m.month)) byMonth.set(m.month, m);
  }

  // Case 2: Check for plateau (no measurements in last 2+ months)
  const recordedMonths = [...byMonth.keys()].sort((a, b) => b - a);
  const latestRecordedMonth = recordedMonths[0];

  if (latestRecordedMonth !== undefined && months - latestRecordedMonth >= 2) {
    alerts.push({
      type: 'plateau',
      metric: 'general',
      metricLabel: metricLabels.general,
      message: `${months - latestRecordedMonth}개월간 새 기록이 없어요. 최근 성장을 기록해주세요!`,
      emoji: '\ud83d\udcc5',
      severity: 'warning',
    });
  }

  // Case 3: Check for rapid growth between consecutive recorded months
  const metrics: ('height' | 'weight' | 'head')[] = ['height', 'weight', 'head'];
  const metricFieldMap: Record<string, keyof Measurement> = {
    height: 'height',
    weight: 'weight',
    head: 'headCircumference',
  };

  for (const metric of metrics) {
    const field = metricFieldMap[metric];

    // Find pairs of consecutive months with data for this metric
    const monthsWithData = recordedMonths
      .filter((m) => {
        const meas = byMonth.get(m);
        return meas && meas[field] != null;
      })
      .sort((a, b) => a - b);

    if (monthsWithData.length < 2) continue;

    // Check the most recent pair
    const prevMonth = monthsWithData[monthsWithData.length - 2];
    const currMonth = monthsWithData[monthsWithData.length - 1];
    const prevMeas = byMonth.get(prevMonth)!;
    const currMeas = byMonth.get(currMonth)!;

    const prevVal = prevMeas[field] as number | undefined;
    const currVal = currMeas[field] as number | undefined;
    if (prevVal == null || currVal == null) continue;

    const actualGrowth = currVal - prevVal;
    const monthSpan = currMonth - prevMonth;
    if (monthSpan <= 0) continue;

    // Calculate expected growth across the month span
    let expectedGrowth = 0;
    let valid = true;
    for (let m = prevMonth; m < currMonth; m++) {
      const eg = getExpectedGrowth(m, m + 1, metric, gender);
      if (eg == null) { valid = false; break; }
      expectedGrowth += eg;
    }
    if (!valid || expectedGrowth <= 0) continue;

    // Get the range spread at the current month to determine threshold
    const spread = getRangeSpread(currMonth, metric, gender);
    if (spread == null) continue;

    // Rapid growth: actual growth exceeds expected by more than 50% of the p3-p97 spread
    const threshold = expectedGrowth + spread * 0.3;

    if (actualGrowth > threshold) {
      const unit = metric === 'weight' ? 'kg' : 'cm';
      alerts.push({
        type: 'rapid_growth',
        metric,
        metricLabel: metricLabels[metric],
        message: `${metricLabels[metric]}이 빠르게 성장 중이에요! (${prevMonth}→${currMonth}개월: +${actualGrowth.toFixed(1)}${unit})`,
        emoji: '\ud83d\ude80',
        severity: 'info',
      });
    }
  }

  return alerts;
}
