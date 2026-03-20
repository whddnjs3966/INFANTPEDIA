"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, Moon, Sun, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  getScheduleForMonth,
  type ScheduleItem,
} from "@/lib/data/daily-schedule-data";

const typeColors: Record<string, string> = {
  sleep: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700",
  feed: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-700",
  play: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  bath: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700",
  nap: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700",
  meal: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
};

const barColors: Record<string, string> = {
  sleep: "bg-indigo-400",
  feed: "bg-pink-400",
  play: "bg-blue-400",
  bath: "bg-cyan-400",
  nap: "bg-purple-400",
  meal: "bg-amber-400",
};

const dotColors: Record<string, string> = {
  sleep: "bg-indigo-400 border-indigo-300",
  feed: "bg-pink-400 border-pink-300",
  play: "bg-blue-400 border-blue-300",
  bath: "bg-cyan-400 border-cyan-300",
  nap: "bg-purple-400 border-purple-300",
  meal: "bg-amber-400 border-amber-300",
};

const typeLabels: Record<string, string> = {
  sleep: "취침",
  feed: "수유",
  play: "놀이",
  bath: "목욕",
  nap: "낮잠",
  meal: "이유식",
};

/** Convert "HH:MM" to minutes from 06:00 (the bar start). Wraps for next-day times. */
function timeToMinutes(time: string): number | null {
  if (!time || time === "수시" || time === "—") return null;
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  // The bar spans 06:00 to 06:00 next day (24 hours)
  let mins = h * 60 + m - 360; // offset from 06:00
  if (mins < 0) mins += 1440;
  return mins;
}

interface TimeBarSegment {
  left: number; // percentage
  width: number; // percentage
  type: string;
}

function buildTimeBarSegments(items: ScheduleItem[]): TimeBarSegment[] {
  const totalMinutes = 1440; // 24 hours
  const segments: TimeBarSegment[] = [];

  // Filter items with valid times
  const timed = items
    .map((item) => ({ ...item, mins: timeToMinutes(item.time) }))
    .filter((item): item is typeof item & { mins: number } => item.mins !== null)
    .sort((a, b) => a.mins - b.mins);

  for (let i = 0; i < timed.length; i++) {
    const current = timed[i];
    const next = timed[i + 1];
    const startMin = current.mins;
    const endMin = next ? next.mins : totalMinutes;
    const duration = endMin - startMin;
    if (duration <= 0) continue;

    segments.push({
      left: (startMin / totalMinutes) * 100,
      width: (duration / totalMinutes) * 100,
      type: current.type,
    });
  }

  return segments;
}

interface DailyScheduleCardProps {
  month: number;
}

export default function DailyScheduleCard({ month }: DailyScheduleCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const schedule = getScheduleForMonth(month);

  const segments = useMemo(() => {
    if (!schedule || schedule.wakeUp === "—") return [];
    return buildTimeBarSegments(schedule.items);
  }, [schedule]);

  if (!schedule) return null;

  const hasTimedSchedule = schedule.wakeUp !== "—";

  return (
    <div className="mx-4 mb-4">
      {/* Header button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full min-h-[56px] items-center gap-3 rounded-2xl border bg-gradient-to-r p-4 text-left transition-all",
          "from-violet-50 to-indigo-50 border-violet-200/50",
          "dark:from-violet-950/50 dark:to-indigo-950/50 dark:border-violet-700/50",
          isOpen && "shadow-md"
        )}
        whileTap={{ scale: 0.98 }}
      >
        <div className="rounded-xl bg-violet-100 p-2 dark:bg-violet-800/60">
          <Clock size={20} className="text-violet-500 dark:text-violet-300" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {"\u23f0"} {month}{"개월 추천 하루 시간표"}
          </span>
          {hasTimedSchedule && (
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
              {schedule.wakeUp} ~ {schedule.bedtime}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Expandable content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-violet-100 bg-white/80 mt-2 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
              {/* === 24-Hour Visual Timeline Bar === */}
              {hasTimedSchedule && segments.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <Sun size={12} className="text-amber-400" />
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">06</span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                      12
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">18</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">00</span>
                      <Moon size={12} className="text-indigo-400" />
                    </div>
                  </div>
                  <div className="relative h-5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {segments.map((seg, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.02, duration: 0.3 }}
                        className={cn(
                          "absolute top-0 h-full origin-left",
                          barColors[seg.type] || "bg-gray-300",
                          i === 0 && "rounded-l-full",
                          i === segments.length - 1 && "rounded-r-full"
                        )}
                        style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
                      />
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {Object.entries(barColors).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-1">
                        <div className={cn("h-2 w-2 rounded-full", color)} />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {typeLabels[type]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === Summary Stats Row === */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 p-2.5">
                  <span className="text-sm">{"💤"}</span>
                  <div>
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">
                      총 수면
                    </p>
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {schedule.totalSleepHours}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 p-2.5">
                  <span className="text-sm">{"😴"}</span>
                  <div>
                    <p className="text-[10px] text-purple-500 dark:text-purple-400 font-medium">
                      낮잠
                    </p>
                    <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      {schedule.napCount}
                    </p>
                  </div>
                </div>
                {hasTimedSchedule && (
                  <>
                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 p-2.5">
                      <span className="text-sm">{"🌅"}</span>
                      <div>
                        <p className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">
                          기상
                        </p>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                          {schedule.wakeUp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5">
                      <span className="text-sm">{"🌙"}</span>
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          취침
                        </p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {schedule.bedtime}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* === Detailed Vertical Timeline === */}
              <div className="relative">
                {schedule.items.map((item, idx) => {
                  const isExpanded = expandedIdx === idx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-start gap-3 mb-1 last:mb-0"
                    >
                      {/* Time column */}
                      <div className="w-12 shrink-0 pt-1.5 text-right">
                        <span className="text-[13px] font-mono font-bold text-gray-700 dark:text-gray-300">
                          {item.time}
                        </span>
                      </div>

                      {/* Dot and connecting line */}
                      <div className="flex flex-col items-center pt-1">
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full border-2 shrink-0",
                            dotColors[item.type] || "bg-gray-400 border-gray-300"
                          )}
                        />
                        {idx < schedule.items.length - 1 && (
                          <div
                            className={cn(
                              "w-px bg-gray-200 dark:bg-gray-600",
                              isExpanded ? "h-20" : "h-6"
                            )}
                            style={{ transition: "height 0.2s ease" }}
                          />
                        )}
                      </div>

                      {/* Activity card */}
                      <div className="flex-1 pb-1">
                        <motion.button
                          onClick={() =>
                            setExpandedIdx(isExpanded ? null : idx)
                          }
                          className={cn(
                            "w-full rounded-xl border px-3 py-2 text-left transition-all",
                            typeColors[item.type] ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                          )}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{item.emoji}</span>
                              <span className="text-[13px] font-semibold">
                                {item.activity}
                              </span>
                            </div>
                            {item.duration && item.duration !== "~" && (
                              <div className="flex items-center gap-0.5 ml-2 shrink-0">
                                <Timer size={10} className="opacity-60" />
                                <span className="text-[11px] opacity-70 font-medium">
                                  {item.duration}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.button>

                        {/* Expandable tip */}
                        <AnimatePresence>
                          {isExpanded && item.tip && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-700/30 px-3 py-2">
                                <p className="text-[12px] text-yellow-800 dark:text-yellow-300 leading-relaxed">
                                  {"💡"} {item.tip}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer note */}
              <div className="mt-3 rounded-xl bg-violet-50 dark:bg-violet-900/30 p-2.5 text-center">
                <p className="text-[11px] font-medium text-violet-700 dark:text-violet-300">
                  {"💡 아기마다 리듬이 다를 수 있어요. 참고용으로 활용해 주세요"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
