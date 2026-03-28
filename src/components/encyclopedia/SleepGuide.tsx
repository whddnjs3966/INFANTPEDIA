"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  ChevronDown,
  Check,
  Star,
  AlertCircle,
  Clock,
  Sunrise,
  CloudMoon,
  ThumbsUp,
  ThumbsDown,
  ListOrdered,
  Eye,
  CircleDot,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FormattedContent from "@/components/ui/FormattedContent";
import {
  getSleepGuideForMonth,
  getSuitableMethodsForMonth,
  type SleepTrainingMethod,
  type SleepIssue,
} from "@/lib/data/sleep-guide-data";

interface SleepGuideProps {
  month: number;
}

const difficultyConfig = {
  easy: {
    label: "쉬움",
    stars: 1,
    color: "text-green-500",
    badgeBg: "bg-green-50 dark:bg-green-950/30",
    badgeText: "text-green-700 dark:text-green-300",
  },
  medium: {
    label: "보통",
    stars: 2,
    color: "text-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/30",
    badgeText: "text-amber-700 dark:text-amber-300",
  },
  hard: {
    label: "어려움",
    stars: 3,
    color: "text-red-500",
    badgeBg: "bg-red-50 dark:bg-red-950/30",
    badgeText: "text-red-700 dark:text-red-300",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function MethodCard({ method }: { method: SleepTrainingMethod }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = difficultyConfig[method.difficulty];

  return (
    <div className="rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_2px_12px_rgb(0,0,0,0.04)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full min-h-[48px] items-center gap-3 p-4 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 shrink-0">
          <Moon size={17} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
              {method.name}
            </span>
            <span className={cn("flex items-center gap-0.5", config.color)}>
              {Array.from({ length: config.stars }).map((_, i) => (
                <Star key={i} size={10} fill="currentColor" />
              ))}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className={cn("rounded-lg px-1.5 py-0.5 text-[10px] font-medium", config.badgeBg, config.badgeText)}>
              {config.label}
            </span>
            <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
              {method.duration}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {method.suitableAge}
            </span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      </button>

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
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <FormattedContent content={method.description} className="text-[12px]" />
              </div>

              {/* Pros */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ThumbsUp size={13} className="text-green-500" />
                  <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">장점</p>
                </div>
                <div className="space-y-1.5">
                  {method.pros.map((pro, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CircleDot size={8} className="text-green-400 shrink-0 mt-1.5" />
                      <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">{pro}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cons */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ThumbsDown size={13} className="text-red-500" />
                  <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">단점</p>
                </div>
                <div className="space-y-1.5">
                  {method.cons.map((con, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CircleDot size={8} className="text-red-400 shrink-0 mt-1.5" />
                      <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">{con}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ListOrdered size={13} className="text-indigo-500" />
                  <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">진행 방법</p>
                </div>
                <div className="space-y-2">
                  {method.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                        {i + 1}
                      </span>
                      <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IssueAccordion({ issue }: { issue: SleepIssue }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_2px_12px_rgb(0,0,0,0.04)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full min-h-[48px] items-center gap-3 p-4 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 shrink-0">
          <AlertCircle size={17} className="text-purple-500" />
        </div>
        <span className="flex-1 text-[13px] font-bold text-gray-800 dark:text-gray-100">
          {issue.issue}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <FormattedContent content={issue.solution} className="text-[12px]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SleepGuide({ month }: SleepGuideProps) {
  const guide = useMemo(() => getSleepGuideForMonth(month), [month]);
  const methods = useMemo(() => getSuitableMethodsForMonth(month), [month]);

  if (!guide) return null;

  const showMethodWarning = month < 4;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {/* Sleep Stats Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)]"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
            <Moon size={17} className="text-indigo-500" />
          </div>
          <h3 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
            수면 정보
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center">
            <Clock size={13} className="mx-auto mb-1 text-indigo-500" />
            <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate">{guide.totalSleep}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">총 수면</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center">
            <CloudMoon size={13} className="mx-auto mb-1 text-violet-500" />
            <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate">{guide.nightSleep}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">야간 수면</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center">
            <Sunrise size={13} className="mx-auto mb-1 text-sky-500" />
            <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate">{guide.napInfo}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">낮잠</p>
          </div>
        </div>
      </motion.div>

      {/* Sleep Signals Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)]"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40">
            <Eye size={17} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
              졸림 신호
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              이 신호가 보이면 재울 타이밍
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {guide.sleepSignals.map((signal, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300"
            >
              <Sun size={11} className="text-amber-400" />
              {signal}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Sleep Training Methods */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
            <Star size={17} className="text-indigo-500" />
          </div>
          <h3 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
            수면교육 방법
          </h3>
        </div>

        {showMethodWarning && (
          <div className="mb-3 rounded-[24px] border border-blue-200/40 dark:border-blue-800/30 bg-blue-50/60 dark:bg-blue-950/20 p-4">
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 shrink-0">
                <Info size={17} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-blue-800 dark:text-blue-200">
                  수면교육은 보통 4개월 이후에 시작해요
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-blue-600 dark:text-blue-300">
                  지금은 아기와의 유대감 형성에 집중하고, 안아재우기 방법으로 부드럽게 수면 습관을 만들어주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {methods.map((method) => (
            <MethodCard key={method.id} method={method} />
          ))}
        </div>
      </motion.div>

      {/* Common Issues */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40">
            <AlertCircle size={17} className="text-purple-500" />
          </div>
          <h3 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
            자주 하는 고민
          </h3>
        </div>
        <div className="space-y-3">
          {guide.commonIssues.map((issue, i) => (
            <IssueAccordion key={i} issue={issue} />
          ))}
        </div>
      </motion.div>

      {/* Sleep Environment Checklist */}
      <motion.div
        variants={itemVariants}
        className="rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)]"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
            <Check size={17} className="text-emerald-500" />
          </div>
          <h3 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
            수면 환경 체크리스트
          </h3>
        </div>
        <div className="space-y-2">
          {guide.sleepEnvironment.map((tip, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[12px] text-gray-700 dark:text-gray-300 leading-relaxed">
                {tip}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="pb-4" />
    </motion.div>
  );
}
