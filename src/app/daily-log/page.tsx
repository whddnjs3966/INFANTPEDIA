"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyStore } from "@/lib/store/baby-store";
import {
  useDailyLogStore,
  LOG_CATEGORY_CONFIG,
  type LogCategory,
} from "@/lib/store/daily-log-store";
import LogForm from "@/components/daily-log/LogForm";
import DailySummary from "@/components/daily-log/DailySummary";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function getDateStr(offset: number, base: string) {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

const CATEGORY_COLORS: Record<string, string> = {
  breast_feed: "bg-pink-50 border-pink-100",
  formula: "bg-blue-50 border-blue-100",
  baby_food: "bg-orange-50 border-orange-100",
  poop: "bg-amber-50 border-amber-100",
  pee: "bg-sky-50 border-sky-100",
  sleep: "bg-purple-50 border-purple-100",
  temperature: "bg-red-50 border-red-100",
  memo: "bg-gray-50 border-gray-100",
};

function getEntryDetail(entry: { category: LogCategory; amount?: number; duration?: number; side?: string; menu?: string; color?: string; consistency?: string; temperature?: number; note?: string; endTime?: string; time: string }) {
  switch (entry.category) {
    case "breast_feed":
      return [
        entry.side === "left" ? "왼쪽" : entry.side === "right" ? "오른쪽" : "양쪽",
        entry.duration ? `${entry.duration}분` : null,
      ].filter(Boolean).join(" · ");
    case "formula":
      return entry.amount ? `${entry.amount}ml` : "";
    case "baby_food":
      return [entry.amount ? `${entry.amount}ml` : null, entry.menu].filter(Boolean).join(" · ");
    case "poop":
      return [
        entry.color ? {yellow:"노란색",green:"녹색",brown:"갈색",dark:"진한색"}[entry.color] : null,
        entry.consistency,
      ].filter(Boolean).join(" · ");
    case "pee":
      return "";
    case "sleep":
      return [
        entry.endTime ? `${entry.time}~${entry.endTime}` : null,
        entry.duration ? `${entry.duration}분` : null,
      ].filter(Boolean).join(" · ");
    case "temperature":
      return entry.temperature ? `${entry.temperature}°C` : "";
    case "memo":
      return entry.note || "";
    default:
      return "";
  }
}

export default function DailyLogPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<LogCategory | "all">("all");

  const profile = useBabyStore((s) => s.profile);
  const allEntries = useDailyLogStore((s) => s.entries);
  const deleteEntry = useDailyLogStore((s) => s.deleteEntry);

  const entries = useMemo(
    () =>
      allEntries
        .filter((e) => e.date === selectedDate)
        .sort((a, b) => b.time.localeCompare(a.time)),
    [allEntries, selectedDate]
  );

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const filteredEntries = filter === "all"
    ? entries
    : entries.filter((e) => e.category === filter);

  const categories = Object.entries(LOG_CATEGORY_CONFIG) as [LogCategory, typeof LOG_CATEGORY_CONFIG[LogCategory]][];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pb-2 pt-12"
      >
        <h1 className="text-xl font-bold text-gray-800">
          육아 일지 📝
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {profile?.name ? `${profile.name}의 ` : "우리 아기의 "}
          하루를 기록해요
        </p>
      </motion.div>

      {/* Date Selector */}
      <div className="sticky top-0 z-20 bg-[var(--cream-bg)] px-5 pb-3 pt-2">
        <div className="flex items-center justify-between rounded-2xl bg-white px-2 py-2 shadow-sm">
          <button
            onClick={() => setSelectedDate(getDateStr(-1, selectedDate))}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800">{formatDate(selectedDate)}</p>
            {isToday && (
              <span className="text-[10px] font-medium text-pink-500">오늘</span>
            )}
          </div>
          <button
            onClick={() => {
              const next = getDateStr(1, selectedDate);
              if (next <= new Date().toISOString().split("T")[0]) {
                setSelectedDate(next);
              }
            }}
            className={cn(
              "rounded-full p-2",
              isToday ? "text-gray-200" : "text-gray-500 hover:bg-gray-100"
            )}
            disabled={isToday}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Daily Summary */}
        <DailySummary entries={entries} />

        {/* Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              filter === "all" ? "bg-pink-100 text-pink-700 shadow-sm" : "bg-gray-100 text-gray-500"
            )}
          >
            전체 ({entries.length})
          </button>
          {categories.map(([key, cfg]) => {
            const count = entries.filter((e) => e.category === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  filter === key ? "bg-pink-100 text-pink-700 shadow-sm" : "bg-gray-100 text-gray-500"
                )}
              >
                {cfg.emoji} {count}
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedDate}-${filter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <p className="text-4xl">📋</p>
                <p className="mt-3 text-sm text-gray-400">
                  {isToday ? "오늘의 첫 기록을 추가해보세요!" : "이 날의 기록이 없습니다"}
                </p>
              </div>
            ) : (
              filteredEntries.map((entry, i) => {
                const cfg = LOG_CATEGORY_CONFIG[entry.category];
                const detail = getEntryDetail(entry);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-3",
                      CATEGORY_COLORS[entry.category]
                    )}
                  >
                    <div className="flex flex-col items-center pt-0.5">
                      <span className="text-lg">{cfg.emoji}</span>
                      <span className="mt-0.5 text-[10px] font-medium text-gray-400">{entry.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{cfg.label}</p>
                      {detail && (
                        <p className="mt-0.5 text-xs text-gray-500">{detail}</p>
                      )}
                      {entry.note && entry.category !== "memo" && (
                        <p className="mt-1 text-[10px] text-gray-400 italic">{entry.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="shrink-0 rounded-full p-1.5 text-gray-300 hover:bg-white hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg shadow-pink-200"
      >
        <Plus size={24} />
      </motion.button>

      {showForm && (
        <LogForm date={selectedDate} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
