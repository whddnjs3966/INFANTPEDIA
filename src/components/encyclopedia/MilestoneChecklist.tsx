"use client";

import { useReadingValue } from "@/components/reading/ReadingScope";
import { useId, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMilestonesForMonth,
  domainInfo,
  type MilestoneDomain,
  type MilestoneItem,
} from "@/lib/data/milestone-data";
import { useMilestoneStore, activeMilestoneProgress } from "@/lib/store/milestone-store";
import { useBabyStore } from "@/lib/store/baby-store";
import MilestoneItemRow from "./MilestoneItemRow";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import type { GuideArtworkKind } from "@/components/illustrations/GuideArtwork";
const domainArtwork: Record<MilestoneDomain, GuideArtworkKind> = { gross_motor: "rattle", fine_motor: "play", language: "book", social: "cloud" };

interface MilestoneChecklistProps {
  month: number;
}

const domainStyles: Record<
  MilestoneDomain,
  {
    bg: string;
    border: string;
    iconBg: string;
    checkBg: string;
    checkBorder: string;
    progressBar: string;
    text: string;
    badge: string;
  }
> = {
  gross_motor: {
    bg: "from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30",
    border: "border-blue-200/50 dark:border-blue-800/50",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    checkBg: "bg-blue-500",
    checkBorder: "border-blue-300 dark:border-blue-600",
    progressBar: "from-blue-400 to-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  fine_motor: {
    bg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    border: "border-green-200/50 dark:border-green-800/50",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    checkBg: "bg-green-500",
    checkBorder: "border-green-300 dark:border-green-600",
    progressBar: "from-green-400 to-green-600",
    text: "text-green-600 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  },
  language: {
    bg: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    border: "border-orange-200/50 dark:border-orange-800/50",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    checkBg: "bg-orange-500",
    checkBorder: "border-orange-300 dark:border-orange-600",
    progressBar: "from-orange-400 to-orange-600",
    text: "text-orange-600 dark:text-orange-400",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  },
  social: {
    bg: "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30",
    border: "border-pink-200/50 dark:border-pink-800/50",
    iconBg: "bg-pink-100 dark:bg-pink-900/50",
    checkBg: "bg-pink-500",
    checkBorder: "border-pink-300 dark:border-pink-600",
    progressBar: "from-pink-400 to-pink-600",
    text: "text-pink-600 dark:text-pink-400",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
  },
};

const domainOrder: MilestoneDomain[] = [
  "gross_motor",
  "fine_motor",
  "language",
  "social",
];

export default function MilestoneChecklist({ month }: MilestoneChecklistProps) {
  const prefix = useId();
  const reduceMotion = useReducedMotion();
  const [openDomain, setOpenDomain] = useReadingValue<MilestoneDomain | null>("milestone:domain", null);
  const profile = useBabyStore((state) => state.profile);
  const store = useMilestoneStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState("");
  const { completedMilestones, completedDates } = activeMilestoneProgress(store);
  const resetMonth = (targetMonth: number) => {
    if (!profile) return;
    store.resetMonth(targetMonth, profile.id);
    setConfirmReset(false);
  };

  const monthData = useMemo(() => getMilestonesForMonth(month), [month]);

  const milestonesByDomain = useMemo(() => {
    if (!monthData) return {} as Record<MilestoneDomain, MilestoneItem[]>;
    const grouped: Record<MilestoneDomain, MilestoneItem[]> = {
      gross_motor: [],
      fine_motor: [],
      language: [],
      social: [],
    };
    for (const m of monthData.milestones) {
      grouped[m.domain].push(m);
    }
    return grouped;
  }, [monthData]);

  const totalMilestones = monthData?.milestones.length ?? 0;
  const completedCount = monthData
    ? monthData.milestones.filter((m) => completedMilestones[m.id]).length
    : 0;
  const completionPercent =
    totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  if (!monthData) {
    return (
      <div className="px-4 py-8 text-center text-sm text-stone-400 dark:text-stone-500">
        이 월령의 발달 이정표 데이터가 없습니다.
      </div>
    );
  }

  const toggleDomain = (domain: MilestoneDomain) => {
    setOpenDomain((prev) => (prev === domain ? null : domain));
  };

  return (
    <div className="@container space-y-5 pb-6">
      {notice && <p role="status" className="rounded-xl bg-[var(--accent-soft)] p-4 text-sm font-semibold leading-6 text-[var(--brand)]">{notice}</p>}
      <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">{profile ? `${profile.name}의 관찰 기록이에요. 관찰한 날짜를 기록해요.` : "아기를 등록하면 관찰 날짜를 기록할 수 있어요."}</p>
      {confirmReset && <div role="alert" className="rounded-xl border border-amber-300 p-4 text-sm dark:border-amber-800"><p>{profile?.name}의 {month}개월 관찰 기록만 초기화할까요?</p><div className="mt-2 flex gap-3"><button type="button" className="min-h-12 rounded-lg border px-4" onClick={() => setConfirmReset(false)}>취소</button><button type="button" className="min-h-12 rounded-lg bg-amber-800 px-4 text-white" onClick={() => resetMonth(month)}>관찰 기록 초기화</button></div></div>}
      {/* Overall Progress */}
      <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 dark:border-[var(--border)] dark:bg-[var(--card)]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-stone-800 dark:text-stone-100">
              발달 관찰 기록
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {month}개월
            </span>
          </div>
          <button
            onClick={() => setConfirmReset(true)}
            disabled={!profile || completedCount === 0}
            className="flex min-h-12 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-stone-600 transition-colors disabled:opacity-50 dark:text-stone-300"
            title="이 월령 초기화"
          >
            <RotateCcw size={12} />
            초기화
          </button>
        </div>

        <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
          <span className="text-2xl font-semibold text-stone-800 dark:text-stone-100">
            {completedCount}
            <span className="text-base font-normal text-gray-400">
              /{totalMilestones}
            </span>
          </span>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            {completionPercent}% 관찰
          </span>
        </div>

        {/* Progress Bar */}
        <div role="progressbar" aria-label="관찰한 발달 변화" aria-valuemin={0} aria-valuemax={totalMilestones} aria-valuenow={completedCount} className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-[var(--surface-muted)]">
          <motion.div
            className="h-full rounded-full bg-blue-800 dark:bg-blue-300"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Domain Summary Badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {domainOrder.map((domain) => {
            const items = milestonesByDomain[domain] || [];
            const done = items.filter((m) => completedMilestones[m.id]).length;
            const info = domainInfo[domain];
            const styles = domainStyles[domain];
            return (
              <span
                key={domain}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium",
                  styles.badge
                )}
              >
                {info.label} {done}/{items.length}
              </span>
            );
          })}
        </div>
      </div>

      {/* Domain Sections */}
      {domainOrder.map((domain) => {
        const items = milestonesByDomain[domain] || [];
        if (items.length === 0) return null;

        const info = domainInfo[domain];
        const styles = domainStyles[domain];
        const isOpen = openDomain === domain;
        const domainCompleted = items.filter(
          (m) => completedMilestones[m.id]
        ).length;

        return (
          <div key={domain}>
            <motion.button
              id={`${prefix}-${domain}-heading`}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${prefix}-${domain}-body`}
              onClick={() => toggleDomain(domain)}
              className={cn(
                "flex w-full min-h-20 items-center gap-3 rounded-[24px] bg-white dark:bg-[var(--card)] border border-stone-200/80 dark:border-[var(--border)] p-5 text-left transition-colors",
                styles.bg,
                isOpen && "border-blue-700/40 dark:border-blue-500/50"
              )}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <TopicArtwork kind={domainArtwork[domain]} className="h-[48px] w-[48px] @max-[16rem]:hidden" />
              <div className="min-w-0 flex-1">
                <span className="break-words text-base font-semibold text-stone-900 dark:text-stone-100">
                  {info.label}
                </span>
                <span
                  className={cn(
                    "ml-2 text-sm font-semibold",
                    domainCompleted === items.length
                      ? styles.text
                      : "text-stone-400 dark:text-stone-500"
                  )}
                >
                  {domainCompleted}/{items.length}
                  {domainCompleted === items.length && " ✓"}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
              >
                <ChevronDown size={18} className="text-gray-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  id={`${prefix}-${domain}-body`}
                  role="region"
                  aria-labelledby={`${prefix}-${domain}-heading`}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-[var(--border)] px-1 pt-2 pb-1">
                    {items.map((milestone) => (
                      <MilestoneItemRow
                        key={milestone.id}
                        milestone={milestone}
                        isCompleted={!!completedMilestones[milestone.id]}
                        completedDate={completedDates[milestone.id]}
                        onNotice={setNotice}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

