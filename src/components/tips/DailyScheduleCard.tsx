"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronDown,
  Moon,
  Sun,
  Timer,
  CloudMoon,
  Sunrise,
  Lightbulb,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  getScheduleForMonth,
  type ScheduleItem,
} from "@/lib/data/daily-schedule-data";

const typeConfig: Record<string, { bg: string; text: string; dot: string; bar: string; label: string }> = {
  sleep: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-400", bar: "bg-indigo-400", label: "취침" },
  feed: { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-300", dot: "bg-pink-400", bar: "bg-pink-400", label: "수유" },
  play: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-400", bar: "bg-blue-400", label: "놀이" },
  bath: { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-700 dark:text-cyan-300", dot: "bg-cyan-400", bar: "bg-cyan-400", label: "목욕" },
  nap: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-400", bar: "bg-purple-400", label: "낮잠" },
  meal: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-400", bar: "bg-amber-400", label: "이유식" },
};

function timeToMinutes(time: string): number | null {
  if (!time || time === "수시" || time === "—") return null;
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  let mins = h * 60 + m - 360;
  if (mins < 0) mins += 1440;
  return mins;
}

interface TimeBarSegment {
  left: number;
  width: number;
  type: string;
}

function buildTimeBarSegments(items: ScheduleItem[]): TimeBarSegment[] {
  const totalMinutes = 1440;
  const segments: TimeBarSegment[] = [];

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
    <div className="mx-4 mb-3">
      {/* Accordion Card */}
      <div className="rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_2px_12px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full min-h-[48px] items-center gap-3 p-4 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 shrink-0">
            <Clock size={17} className="text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
              {month}개월 추천 하루 시간표
            </p>
            {hasTimedSchedule && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {schedule.wakeUp} ~ {schedule.bedtime}
              </p>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-gray-400" />
          </motion.div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* 24-Hour Timeline Bar */}
                {hasTimedSchedule && segments.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        <Sun size={11} className="text-amber-400" />
                        <span className="text-[9px] text-gray-400 dark:text-gray-500">06</span>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500">12</span>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500">18</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-gray-400 dark:text-gray-500">00</span>
                        <Moon size={11} className="text-indigo-400" />
                      </div>
                    </div>
                    <div className="relative h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {segments.map((seg, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: i * 0.02, duration: 0.3 }}
                          className={cn(
                            "absolute top-0 h-full origin-left",
                            typeConfig[seg.type]?.bar || "bg-gray-300",
                            i === 0 && "rounded-l-full",
                            i === segments.length - 1 && "rounded-r-full"
                          )}
                          style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
                        />
                      ))}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {Object.entries(typeConfig).map(([type, cfg]) => {
                        const hasType = segments.some((s) => s.type === type);
                        if (!hasType) return null;
                        return (
                          <div key={type} className="flex items-center gap-1">
                            <div className={cn("h-2 w-2 rounded-full", cfg.bar)} />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5">
                    <div className="flex items-center gap-2">
                      <CloudMoon size={14} className="text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-[9px] text-gray-400">총 수면</p>
                        <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">{schedule.totalSleepHours}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5">
                    <div className="flex items-center gap-2">
                      <Moon size={14} className="text-purple-500 shrink-0" />
                      <div>
                        <p className="text-[9px] text-gray-400">낮잠</p>
                        <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">{schedule.napCount}</p>
                      </div>
                    </div>
                  </div>
                  {hasTimedSchedule && (
                    <>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5">
                        <div className="flex items-center gap-2">
                          <Sunrise size={14} className="text-amber-500 shrink-0" />
                          <div>
                            <p className="text-[9px] text-gray-400">기상</p>
                            <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">{schedule.wakeUp}</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5">
                        <div className="flex items-center gap-2">
                          <Moon size={14} className="text-slate-500 shrink-0" />
                          <div>
                            <p className="text-[9px] text-gray-400">취침</p>
                            <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">{schedule.bedtime}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Vertical Timeline */}
                <div className="relative">
                  {schedule.items.map((item, idx) => {
                    const isExpanded = expandedIdx === idx;
                    const cfg = typeConfig[item.type] || { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", dot: "bg-gray-400" };
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 mb-0.5 last:mb-0"
                      >
                        {/* Time */}
                        <div className="w-11 shrink-0 pt-2 text-right">
                          <span className="text-[12px] font-mono font-bold text-gray-600 dark:text-gray-400">
                            {item.time}
                          </span>
                        </div>

                        {/* Dot + line */}
                        <div className="flex flex-col items-center pt-1.5">
                          <div
                            className={cn(
                              "h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-gray-900",
                              cfg.dot
                            )}
                          />
                          {idx < schedule.items.length - 1 && (
                            <div
                              className="w-px bg-gray-200 dark:bg-gray-700 flex-1"
                              style={{ minHeight: isExpanded ? 72 : 28 }}
                            />
                          )}
                        </div>

                        {/* Activity */}
                        <div className="flex-1 pb-1">
                          <button
                            onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                            className={cn(
                              "w-full rounded-xl px-3 py-2 text-left transition-colors",
                              cfg.bg
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className={cn("text-[12px] font-semibold", cfg.text)}>
                                {item.activity}
                              </span>
                              {item.duration && item.duration !== "~" && (
                                <div className="flex items-center gap-0.5 ml-2 shrink-0">
                                  <Timer size={10} className="text-gray-400" />
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {item.duration}
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && item.tip && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-1.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 px-3 py-2">
                                  <div className="flex items-start gap-1.5">
                                    <Lightbulb size={11} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                                      {item.tip}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Info size={13} className="text-gray-400 shrink-0" />
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      아기마다 리듬이 다를 수 있어요. 참고용으로 활용해 주세요.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
