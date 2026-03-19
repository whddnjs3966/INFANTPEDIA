"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { type LogEntry } from "@/lib/store/daily-log-store";

interface LastActivityTimersProps {
  allEntries: LogEntry[];
}

interface TimerItem {
  key: string;
  emoji: string;
  label: string;
  lastTime: Date | null;
  detail?: string;
  bgColor: string;
  textColor: string;
}

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseEntryDateTime(entry: LogEntry): Date {
  const [y, m, d] = entry.date.split("-").map(Number);
  const [h, min] = entry.time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
}

function formatElapsed(ms: number): { text: string; sub: string } {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return { text: "방금 전", sub: "" };
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours === 0) return { text: `${mins}분`, sub: "전" };
  if (hours < 24) return { text: `${hours}시간 ${mins}분`, sub: "전" };
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return { text: `${days}일 ${remHours}시간`, sub: "전" };
}

export default function LastActivityTimers({ allEntries }: LastActivityTimersProps) {
  const [now, setNow] = useState(new Date());

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const timers = useMemo(() => {
    // Sort all entries by datetime descending
    const sorted = [...allEntries]
      .map((e) => ({ ...e, _dt: parseEntryDateTime(e) }))
      .sort((a, b) => b._dt.getTime() - a._dt.getTime());

    // Find last feeding (breast + formula + baby food)
    const lastFeed = sorted.find(
      (e) => e.category === "breast_feed" || e.category === "formula" || e.category === "baby_food"
    );
    let feedDetail = "";
    if (lastFeed) {
      if (lastFeed.category === "formula") feedDetail = lastFeed.amount ? `분유 ${lastFeed.amount}ml` : "분유";
      else if (lastFeed.category === "breast_feed") feedDetail = "모유수유";
      else feedDetail = "이유식";
    }

    // Find last sleep
    const lastSleep = sorted.find((e) => e.category === "sleep");
    let sleepDetail = "";
    if (lastSleep) {
      // If sleep has end time, use end time as the "last" time
      if (lastSleep.endTime) {
        const [y2, m2, d2] = lastSleep.date.split("-").map(Number);
        const [eh, em] = lastSleep.endTime.split(":").map(Number);
        const endDt = new Date(y2, m2 - 1, d2, eh, em);
        // Handle overnight: if end < start, it's next day
        if (endDt < lastSleep._dt) endDt.setDate(endDt.getDate() + 1);
        (lastSleep as typeof lastSleep & { _sleepEnd: Date })._sleepEnd = endDt;
      }
      sleepDetail = lastSleep.duration
        ? `${Math.floor(lastSleep.duration / 60)}시간 ${lastSleep.duration % 60}분`
        : "";
    }

    // Find last diaper (poop or pee)
    const lastDiaper = sorted.find((e) => e.category === "poop" || e.category === "pee");
    let diaperDetail = "";
    if (lastDiaper) {
      diaperDetail = lastDiaper.category === "poop" ? "대변" : "소변";
    }

    const items: TimerItem[] = [
      {
        key: "feed",
        emoji: "🍼",
        label: "수유",
        lastTime: lastFeed ? lastFeed._dt : null,
        detail: feedDetail,
        bgColor: "bg-blue-50",
        textColor: "text-blue-600",
      },
      {
        key: "sleep",
        emoji: "😴",
        label: "수면",
        lastTime: lastSleep
          ? (lastSleep as typeof lastSleep & { _sleepEnd?: Date })._sleepEnd || lastSleep._dt
          : null,
        detail: sleepDetail,
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
      },
      {
        key: "diaper",
        emoji: "🧷",
        label: "기저귀",
        lastTime: lastDiaper ? lastDiaper._dt : null,
        detail: diaperDetail,
        bgColor: "bg-amber-50",
        textColor: "text-amber-600",
      },
    ];

    return items;
  }, [allEntries]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {timers.map((timer, i) => {
        const elapsed = timer.lastTime
          ? formatElapsed(now.getTime() - timer.lastTime.getTime())
          : null;

        return (
          <motion.div
            key={timer.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl ${timer.bgColor} p-3 text-center`}
          >
            <span className="text-xl">{timer.emoji}</span>
            <p className="mt-1 text-[10px] font-medium text-gray-500">{timer.label}</p>
            {elapsed ? (
              <>
                <p className={`text-sm font-bold ${timer.textColor}`}>
                  {elapsed.text}
                </p>
                <p className="text-[10px] text-gray-400">
                  {elapsed.sub}
                </p>
                {timer.detail && (
                  <p className="mt-0.5 text-[10px] text-gray-400">{timer.detail}</p>
                )}
              </>
            ) : (
              <p className="mt-1 text-[10px] text-gray-400">기록 없음</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
