"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { getScheduleForMonth } from "@/lib/data/daily-schedule-data";

const typeColors: Record<string, string> = {
  sleep: "bg-indigo-100 text-indigo-700 border-indigo-200",
  feed: "bg-pink-100 text-pink-700 border-pink-200",
  play: "bg-blue-100 text-blue-700 border-blue-200",
  bath: "bg-cyan-100 text-cyan-700 border-cyan-200",
  nap: "bg-purple-100 text-purple-700 border-purple-200",
  meal: "bg-amber-100 text-amber-700 border-amber-200",
};

interface DailyScheduleCardProps {
  month: number;
}

export default function DailyScheduleCard({ month }: DailyScheduleCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const schedule = getScheduleForMonth(month);

  if (!schedule) return null;

  return (
    <div className="mx-4 mb-4">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full min-h-[56px] items-center gap-3 rounded-2xl border bg-gradient-to-r p-4 text-left transition-all",
          "from-violet-50 to-indigo-50 border-violet-200/50",
          isOpen && "shadow-md"
        )}
        whileTap={{ scale: 0.98 }}
      >
        <div className="rounded-xl bg-violet-100 p-2">
          <Clock size={20} className="text-violet-500" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-gray-700">
            {"\u23f0"} {month}{"개월 추천 하루 시간표"}
          </span>
          {schedule.wakeUp !== '—' && (
            <span className="ml-2 text-xs text-gray-400">
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-violet-100 bg-white/80 mt-2 p-4 shadow-sm">
              {/* Timeline */}
              <div className="relative">
                {schedule.items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-start gap-3 mb-2 last:mb-0"
                  >
                    {/* Time */}
                    <div className="w-12 shrink-0 pt-0.5 text-right">
                      <span className="text-[13px] font-mono font-bold text-gray-700">
                        {item.time}
                      </span>
                    </div>

                    {/* Dot and line */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "h-3 w-3 rounded-full border-2 shrink-0",
                        item.type === 'sleep' || item.type === 'nap'
                          ? "bg-indigo-400 border-indigo-300"
                          : item.type === 'feed'
                          ? "bg-pink-400 border-pink-300"
                          : item.type === 'meal'
                          ? "bg-amber-400 border-amber-300"
                          : item.type === 'bath'
                          ? "bg-cyan-400 border-cyan-300"
                          : "bg-blue-400 border-blue-300"
                      )} />
                      {idx < schedule.items.length - 1 && (
                        <div className="w-px h-5 bg-gray-200" />
                      )}
                    </div>

                    {/* Activity */}
                    <div className={cn(
                      "flex-1 rounded-xl border px-3 py-2 text-[13px] font-semibold",
                      typeColors[item.type] || "bg-gray-100 text-gray-700 border-gray-200"
                    )}>
                      <span className="mr-1">{item.emoji}</span>
                      {item.activity}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer note */}
              <div className="mt-3 rounded-xl bg-violet-50 p-2.5 text-center">
                <p className="text-[11px] font-medium text-violet-700">
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
