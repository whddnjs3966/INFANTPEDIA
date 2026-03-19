"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type LogEntry, type LogCategory } from "@/lib/store/daily-log-store";

interface WeeklyChartProps {
  allEntries: LogEntry[];
}

type ViewCategory = "feed" | "sleep" | "diaper";

const VIEW_CONFIG: Record<ViewCategory, {
  label: string;
  emoji: string;
  categories: LogCategory[];
  activeClass: string;
  barColor: string;
  barBg: string;
}> = {
  feed: {
    label: "수유",
    emoji: "🍼",
    categories: ["breast_feed", "formula", "baby_food"],
    activeClass: "bg-blue-100 text-blue-700",
    barColor: "bg-blue-400",
    barBg: "bg-blue-100",
  },
  sleep: {
    label: "수면",
    emoji: "😴",
    categories: ["sleep"],
    activeClass: "bg-purple-100 text-purple-700",
    barColor: "bg-purple-400",
    barBg: "bg-purple-100",
  },
  diaper: {
    label: "기저귀",
    emoji: "🧷",
    categories: ["poop", "pee"],
    activeClass: "bg-amber-100 text-amber-700",
    barColor: "bg-amber-400",
    barBg: "bg-amber-100",
  },
};

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDates(baseDate: string): string[] {
  const [y, m, d] = baseDate.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const dayOfWeek = base.getDay(); // 0=Sun
  const monday = new Date(y, m - 1, d - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    return toLocalDateStr(dt);
  });
}

function getWeekLabel(dates: string[]): string {
  const [, m1, d1] = dates[0].split("-").map(Number);
  const [, m2, d2] = dates[6].split("-").map(Number);
  return `${m1}/${d1} ~ ${m2}/${d2}`;
}

const DAYS_KR = ["월", "화", "수", "목", "금", "토", "일"];

// Hour labels for timeline
const HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

export default function WeeklyChart({ allEntries }: WeeklyChartProps) {
  const [view, setView] = useState<ViewCategory>("feed");
  const [weekOffset, setWeekOffset] = useState(0);

  const today = toLocalDateStr(new Date());
  const [ty, tm, td] = today.split("-").map(Number);
  const baseDate = toLocalDateStr(new Date(ty, tm - 1, td + weekOffset * 7));
  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const weekLabel = getWeekLabel(weekDates);
  const config = VIEW_CONFIG[view];

  const isCurrentWeek = weekOffset === 0;

  // Build daily data
  const dailyData = useMemo(() => {
    return weekDates.map((dateStr) => {
      const dayEntries = allEntries.filter(
        (e) => e.date === dateStr && config.categories.includes(e.category)
      );

      // Count
      const count = dayEntries.length;

      // Total amount/duration
      let totalValue = 0;
      let unit = "회";

      if (view === "feed") {
        // Total ml for formula/baby_food, minutes for breast
        const mlEntries = dayEntries.filter((e) => e.category === "formula" || e.category === "baby_food");
        const breastEntries = dayEntries.filter((e) => e.category === "breast_feed");
        const totalMl = mlEntries.reduce((s, e) => s + (e.amount || 0), 0);
        const totalMin = breastEntries.reduce((s, e) => s + (e.duration || 0), 0);
        totalValue = totalMl || totalMin;
        unit = totalMl > 0 ? "ml" : (totalMin > 0 ? "분" : "회");
      } else if (view === "sleep") {
        totalValue = dayEntries.reduce((s, e) => s + (e.duration || 0), 0);
        unit = "분";
      }

      // Timeline blocks (for the schedule view)
      const blocks = dayEntries.map((e) => {
        const start = parseTime(e.time);
        let end = start + 0.5; // default 30min block
        if (e.endTime) {
          end = parseTime(e.endTime);
          if (end < start) end += 24;
        } else if (e.duration) {
          end = start + e.duration / 60;
        }
        return {
          start: Math.max(0, start),
          end: Math.min(24, end),
          category: e.category,
        };
      });

      return { dateStr, count, totalValue, unit, blocks };
    });
  }, [weekDates, allEntries, view, config.categories]);

  const maxCount = Math.max(...dailyData.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">주간 패턴</p>
        <div className="flex items-center gap-1">
          {(Object.entries(VIEW_CONFIG) as [ViewCategory, typeof VIEW_CONFIG[ViewCategory]][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium transition-all",
                  view === key ? cfg.activeClass : "text-gray-400"
                )}
              >
                {cfg.emoji} {cfg.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Week navigation */}
      <div className="mb-3 flex items-center justify-center gap-3">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="rounded-full p-1.5 hover:bg-gray-100"
        >
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
        <span className="text-xs font-medium text-gray-600">{weekLabel}</span>
        <button
          onClick={() => {
            if (!isCurrentWeek) setWeekOffset((o) => o + 1);
          }}
          disabled={isCurrentWeek}
          className={cn(
            "rounded-full p-1.5",
            isCurrentWeek ? "text-gray-200" : "text-gray-400 hover:bg-gray-100"
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Bar chart - counts per day */}
      <div className="mb-4">
        <div className="flex items-end gap-1.5" style={{ height: 100 }}>
          {dailyData.map((day, i) => {
            const barHeight = maxCount > 0 ? (day.count / maxCount) * 80 : 0;
            const isToday = day.dateStr === today;
            return (
              <div key={day.dateStr} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  className="w-full flex flex-col items-center justify-end"
                  style={{ height: 80 }}
                >
                  {day.count > 0 && (
                    <span className="mb-0.5 text-[9px] font-medium text-gray-500">
                      {day.count}
                    </span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: barHeight }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={cn(
                      "w-full rounded-t-lg",
                      day.count > 0 ? config.barColor : config.barBg
                    )}
                    style={{ minHeight: day.count > 0 ? 4 : 2 }}
                  />
                </motion.div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isToday ? "text-pink-500" : "text-gray-400"
                  )}
                >
                  {DAYS_KR[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline schedule view */}
      <div>
        <p className="mb-2 text-[10px] font-medium text-gray-400">시간대별 분포</p>
        <div className="space-y-1">
          {dailyData.map((day, dayIdx) => {
            const isToday = day.dateStr === today;
            return (
              <div key={day.dateStr} className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-4 text-center text-[10px] font-medium",
                    isToday ? "text-pink-500" : "text-gray-400"
                  )}
                >
                  {DAYS_KR[dayIdx]}
                </span>
                <div className="relative flex-1 h-4 rounded-full bg-gray-50 overflow-hidden">
                  {day.blocks.map((block, bi) => {
                    const left = (block.start / 24) * 100;
                    const width = Math.max(((block.end - block.start) / 24) * 100, 1.5);
                    return (
                      <motion.div
                        key={bi}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: dayIdx * 0.03 + bi * 0.02 }}
                        className={cn("absolute top-0 h-full rounded-full", config.barColor)}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          opacity: 0.7,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
          {/* Hour labels */}
          <div className="flex items-center gap-2">
            <span className="w-4" />
            <div className="relative flex-1 h-3">
              {HOURS.map((h) => (
                <span
                  key={h}
                  className="absolute text-[8px] text-gray-300 -translate-x-1/2"
                  style={{ left: `${(h / 24) * 100}%` }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly summary */}
      <div className="mt-3 flex justify-between rounded-xl bg-gray-50 px-3 py-2">
        <div className="text-center">
          <p className="text-[10px] text-gray-400">주간 총 횟수</p>
          <p className="text-sm font-bold text-gray-700">
            {dailyData.reduce((s, d) => s + d.count, 0)}회
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">일 평균</p>
          <p className="text-sm font-bold text-gray-700">
            {(dailyData.reduce((s, d) => s + d.count, 0) / 7).toFixed(1)}회
          </p>
        </div>
        {view === "sleep" && (
          <div className="text-center">
            <p className="text-[10px] text-gray-400">일 평균 수면</p>
            <p className="text-sm font-bold text-gray-700">
              {(dailyData.reduce((s, d) => s + d.totalValue, 0) / 7 / 60).toFixed(1)}시간
            </p>
          </div>
        )}
        {view === "feed" && (
          <div className="text-center">
            <p className="text-[10px] text-gray-400">일 평균</p>
            <p className="text-sm font-bold text-gray-700">
              {Math.round(dailyData.reduce((s, d) => s + d.totalValue, 0) / 7)}
              {dailyData.some((d) => d.unit === "ml") ? "ml" : "분"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
