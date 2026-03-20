"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMilestonesForMonth,
  domainInfo,
  type MilestoneDomain,
  type MilestoneItem,
} from "@/lib/data/milestone-data";
import { useMilestoneStore } from "@/lib/store/milestone-store";

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
  const [openDomain, setOpenDomain] = useState<MilestoneDomain | null>(null);
  const {
    completedMilestones,
    completedDates,
    toggleMilestone,
    resetMonth,
  } = useMilestoneStore();

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
      <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        이 월령의 발달 이정표 데이터가 없습니다.
      </div>
    );
  }

  const toggleDomain = (domain: MilestoneDomain) => {
    setOpenDomain((prev) => (prev === domain ? null : domain));
  };

  return (
    <div className="space-y-4 px-4 pb-4">
      {/* Overall Progress */}
      <div className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
              발달 체크리스트
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {month}개월
            </span>
          </div>
          <button
            onClick={() => resetMonth(month)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="이 월령 초기화"
          >
            <RotateCcw size={12} />
            초기화
          </button>
        </div>

        <div className="mb-1 flex items-end justify-between">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {completedCount}
            <span className="text-base font-normal text-gray-400">
              /{totalMilestones}
            </span>
          </span>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            {completionPercent}% 달성
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                  styles.badge
                )}
              >
                {info.emoji} {info.label} {done}/{items.length}
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
              onClick={() => toggleDomain(domain)}
              className={cn(
                "flex w-full min-h-[56px] items-center gap-3 rounded-2xl border bg-gradient-to-r p-4 text-left transition-all",
                styles.bg,
                styles.border,
                isOpen && "shadow-md"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-lg",
                  styles.iconBg
                )}
              >
                {info.emoji}
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {info.label}
                </span>
                <span
                  className={cn(
                    "ml-2 text-xs font-semibold",
                    domainCompleted === items.length
                      ? styles.text
                      : "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {domainCompleted}/{items.length}
                  {domainCompleted === items.length && " ✓"}
                </span>
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
                  <div className="space-y-2 px-1 pt-2 pb-1">
                    {items.map((milestone, idx) => (
                      <MilestoneItemRow
                        key={milestone.id}
                        milestone={milestone}
                        isCompleted={!!completedMilestones[milestone.id]}
                        completedDate={completedDates[milestone.id]}
                        onToggle={() => toggleMilestone(milestone.id)}
                        styles={styles}
                        delay={idx * 0.04}
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

interface MilestoneItemRowProps {
  milestone: MilestoneItem;
  isCompleted: boolean;
  completedDate?: string;
  onToggle: () => void;
  styles: (typeof domainStyles)[MilestoneDomain];
  delay: number;
}

function MilestoneItemRow({
  milestone,
  isCompleted,
  completedDate,
  onToggle,
  styles,
  delay,
}: MilestoneItemRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={cn(
        "flex gap-3 rounded-xl border bg-white p-3.5 shadow-sm transition-all dark:bg-gray-800",
        isCompleted
          ? "border-gray-200/40 dark:border-gray-700/40"
          : "border-gray-100 dark:border-gray-700"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="mt-0.5 flex-shrink-0"
        aria-label={isCompleted ? "완료 취소" : "완료로 표시"}
      >
        <motion.div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-colors",
            isCompleted ? styles.checkBg + " border-transparent" : styles.checkBorder
          )}
          whileTap={{ scale: 0.85 }}
          layout
        >
          <AnimatePresence mode="wait">
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Check size={14} className="text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <span className="text-base leading-none">{milestone.emoji}</span>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-[14px] font-semibold leading-snug transition-colors",
                isCompleted
                  ? "text-gray-400 line-through dark:text-gray-500"
                  : "text-gray-800 dark:text-gray-100"
              )}
            >
              {milestone.title}
            </p>
            <p
              className={cn(
                "mt-1 text-[12px] leading-relaxed transition-colors",
                isCompleted
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {milestone.description}
            </p>
            {isCompleted && completedDate && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("mt-1 text-[11px] font-medium", styles.text)}
              >
                {completedDate} 달성
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
