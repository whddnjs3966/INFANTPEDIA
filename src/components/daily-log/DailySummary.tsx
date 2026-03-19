"use client";

import { useMemo } from "react";
import { type LogEntry, LOG_CATEGORY_CONFIG } from "@/lib/store/daily-log-store";

interface DailySummaryProps {
  entries: LogEntry[];
}

export default function DailySummary({ entries }: DailySummaryProps) {
  const summary = useMemo(() => {
    const formulaEntries = entries.filter((e) => e.category === "formula");
    const breastEntries = entries.filter((e) => e.category === "breast_feed");
    const babyFoodEntries = entries.filter((e) => e.category === "baby_food");
    const poopCount = entries.filter((e) => e.category === "poop").length;
    const peeCount = entries.filter((e) => e.category === "pee").length;
    const sleepEntries = entries.filter((e) => e.category === "sleep");

    const totalFormula = formulaEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalBabyFood = babyFoodEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalBreastMinutes = breastEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalSleepMinutes = sleepEntries.reduce((sum, e) => sum + (e.duration || 0), 0);

    return {
      formulaCount: formulaEntries.length,
      totalFormula,
      breastCount: breastEntries.length,
      totalBreastMinutes,
      babyFoodCount: babyFoodEntries.length,
      totalBabyFood,
      poopCount,
      peeCount,
      totalSleepMinutes,
      sleepCount: sleepEntries.length,
    };
  }, [entries]);

  if (entries.length === 0) return null;

  const items = [
    summary.formulaCount > 0 && {
      emoji: LOG_CATEGORY_CONFIG.formula.emoji,
      text: `분유 ${summary.formulaCount}회 (${summary.totalFormula}ml)`,
    },
    summary.breastCount > 0 && {
      emoji: LOG_CATEGORY_CONFIG.breast_feed.emoji,
      text: `모유 ${summary.breastCount}회 (${summary.totalBreastMinutes}분)`,
    },
    summary.babyFoodCount > 0 && {
      emoji: LOG_CATEGORY_CONFIG.baby_food.emoji,
      text: `이유식 ${summary.babyFoodCount}회 (${summary.totalBabyFood}ml)`,
    },
    summary.sleepCount > 0 && {
      emoji: LOG_CATEGORY_CONFIG.sleep.emoji,
      text: `수면 ${summary.sleepCount}회 (${Math.floor(summary.totalSleepMinutes / 60)}시간 ${summary.totalSleepMinutes % 60}분)`,
    },
    summary.poopCount > 0 && {
      emoji: LOG_CATEGORY_CONFIG.poop.emoji,
      text: `대변 ${summary.poopCount}회`,
    },
    summary.peeCount > 0 && {
      emoji: LOG_CATEGORY_CONFIG.pee.emoji,
      text: `소변 ${summary.peeCount}회`,
    },
  ].filter(Boolean) as { emoji: string; text: string }[];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium text-gray-500">오늘 요약</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <span className="text-sm">{item.emoji}</span>
            <span className="text-xs text-gray-600">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
