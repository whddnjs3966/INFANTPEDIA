"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Sparkles, Check, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useBabyStore } from "@/lib/store/baby-store";
import { getAllWonderWeeks } from "@/lib/queries/months";
import FormattedContent from "@/components/ui/FormattedContent";
import { cn } from "@/lib/utils";

interface WonderWeekData {
  id: number;
  title: string;
  description: string;
  start_day: number;
  end_day: number;
  week_number: number;
}

export default function WonderWeeksPage() {
  const getDaysOld = useBabyStore((s) => s.getDaysOld);
  const profile = useBabyStore((s) => s.profile);
  const days = getDaysOld();

  const [weeks, setWeeks] = useState<WonderWeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllWonderWeeks();
        setWeeks((data as WonderWeekData[]) || []);
      } catch {
        setError("원더윅스 데이터를 불러오지 못했어요");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!profile) return null;

  const currentWeek = weeks.find(
    (w) => days >= w.start_day && days <= w.end_day
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--surface-bg)" }}
    >
      {/* ── Top bar with back ── */}
      <header className="pt-safe sticky top-0 z-10 bg-[var(--surface-bg)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-5 pt-3 pb-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 dark:bg-stone-800/80 ring-1 ring-stone-200/80 dark:ring-stone-700/80 text-stone-700 dark:text-stone-200 active:scale-95 transition-transform"
            aria-label="뒤로"
          >
            <ChevronLeft size={18} strokeWidth={2.3} />
          </Link>
          <span className="text-[13px] font-semibold text-stone-500 dark:text-stone-400">
            홈
          </span>
        </div>
      </header>

      {/* ── Title ── */}
      <div className="px-5 pt-2 pb-5">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1">
          <Sparkles
            size={13}
            className="text-[#14B8A6] dark:text-teal-400"
            strokeWidth={2.4}
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#14B8A6] dark:text-teal-400">
            Wonder Weeks
          </span>
        </div>
        <h1 className="text-[26px] font-black tracking-[-0.02em] text-stone-900 dark:text-stone-50 leading-[1.15]">
          원더윅스 도약기
        </h1>
        <p className="mt-1.5 text-[13px] font-medium text-stone-500 dark:text-stone-400 leading-snug">
          아기가 첫 해 동안 겪는 10번의 정신적 도약을 시기별로 확인하세요.
        </p>
      </div>

      {/* ── Current period highlight ── */}
      {currentWeek && (
        <div className="px-5 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-500 to-cyan-500 p-5 text-white shadow-[0_8px_24px_rgba(20,184,166,0.25)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl"
            />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-white/25 backdrop-blur px-2.5 py-1 text-[10.5px] font-black uppercase tracking-[0.15em]">
                  진행 중
                </span>
                <span className="text-[11px] font-bold text-white/85">
                  Leap {currentWeek.week_number}
                </span>
                <span className="text-white/50">·</span>
                <span className="text-[11px] font-semibold tabular-nums text-white/80">
                  {currentWeek.start_day}~{currentWeek.end_day}일
                </span>
              </div>
              <h2 className="mt-2 text-[22px] font-black tracking-tight leading-tight">
                {currentWeek.title}
              </h2>
              <div className="mt-3 rounded-2xl bg-white/15 backdrop-blur p-4 [&_p]:text-white/95 [&_strong]:text-white">
                <FormattedContent content={currentWeek.description} />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Timeline ── */}
      <div className="px-5">
        <div className="mb-3 px-1">
          <h2 className="text-[18px] font-black tracking-[-0.015em] text-stone-900 dark:text-stone-50 leading-tight">
            10번의 도약
          </h2>
          <p className="mt-0.5 text-[12px] font-medium text-stone-400 dark:text-stone-500">
            생후 약 5주부터 75주까지 · 현재 생후{" "}
            <span className="tabular-nums font-semibold text-stone-500 dark:text-stone-400">
              {days}일
            </span>
          </p>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-3xl bg-stone-200/60 dark:bg-stone-800/60"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white dark:bg-stone-900 p-6 text-center elevation-1">
            <p className="text-[14px] text-stone-500 dark:text-stone-400">
              {error}
            </p>
          </div>
        ) : weeks.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-stone-900 p-6 text-center elevation-1">
            <p className="text-[14px] text-stone-500 dark:text-stone-400">
              아직 원더윅스 정보가 등록되지 않았어요
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {weeks.map((w, idx) => {
              const isPast = days > w.end_day;
              const isCurrent = days >= w.start_day && days <= w.end_day;
              // isUpcoming = everything else

              return (
                <motion.article
                  key={w.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={cn(
                    "rounded-3xl bg-white dark:bg-stone-900 p-5 transition-shadow",
                    isCurrent
                      ? "ring-2 ring-[#14B8A6] shadow-[0_6px_20px_rgba(20,184,166,0.15)]"
                      : "elevation-1"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Status indicator */}
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        isPast &&
                          "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500",
                        isCurrent && "bg-[#14B8A6] text-white",
                        !isPast &&
                          !isCurrent &&
                          "bg-teal-50 dark:bg-teal-950/40 text-[#14B8A6] dark:text-teal-400"
                      )}
                    >
                      {isPast ? (
                        <Check size={16} strokeWidth={3} />
                      ) : isCurrent ? (
                        <Sparkles size={15} strokeWidth={2.5} />
                      ) : (
                        <Clock size={15} strokeWidth={2.3} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10.5px] font-black tabular-nums tracking-[0.1em]",
                            isPast && "text-stone-400 dark:text-stone-500",
                            isCurrent && "text-[#14B8A6] dark:text-teal-400",
                            !isPast &&
                              !isCurrent &&
                              "text-stone-500 dark:text-stone-400"
                          )}
                        >
                          LEAP {w.week_number}
                        </span>
                        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                        <span
                          className={cn(
                            "text-[11px] font-semibold tabular-nums",
                            isPast
                              ? "text-stone-400 dark:text-stone-500"
                              : "text-stone-500 dark:text-stone-400"
                          )}
                        >
                          {w.start_day}~{w.end_day}일
                        </span>
                      </div>
                      <h3
                        className={cn(
                          "mt-2 text-[15px] font-bold tracking-tight leading-snug",
                          isPast
                            ? "text-stone-500 dark:text-stone-500"
                            : "text-stone-900 dark:text-stone-100"
                        )}
                      >
                        {w.title}
                      </h3>
                      <div className={cn("mt-2.5", isPast && "opacity-70")}>
                        <FormattedContent content={w.description} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
