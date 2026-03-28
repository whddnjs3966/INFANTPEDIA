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
    color: "text-green-500 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30",
    
    badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    gradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
  },
  medium: {
    label: "보통",
    stars: 2,
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    gradient: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
  },
  hard: {
    label: "어려움",
    stars: 3,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    gradient: "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30",
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
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function SleepStatCard({
  emoji,
  label,
  value,
  gradient,
}: {
  emoji: string;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "flex flex-1 flex-col items-center gap-1.5 rounded-[28px] bg-gradient-to-br p-3",
        gradient
      )}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="text-center text-sm font-bold text-gray-800 dark:text-gray-100">
        {value}
      </span>
    </motion.div>
  );
}

function MethodCard({ method }: { method: SleepTrainingMethod }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = difficultyConfig[method.difficulty];

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "overflow-hidden rounded-[28px] transition-shadow",
        isOpen && "shadow-md"
      )}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full min-h-[48px] items-center gap-3 bg-gradient-to-r p-3.5 text-left",
          config.gradient
        )}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-2xl">{method.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {method.name}
            </span>
            <span className={cn("flex items-center gap-0.5", config.color)}>
              {Array.from({ length: config.stars }).map((_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", config.badge)}>
              {config.label}
            </span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
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
          <ChevronDown size={18} className="text-gray-400 dark:text-gray-500" />
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
            <div className="space-y-4 border border-gray-100 bg-white p-4 rounded-[28px] dark:border-gray-700/50 dark:bg-gray-900/50">
              <FormattedContent content={method.description} />

              <div>
                <h4 className="mb-2 text-xs font-semibold text-green-600 dark:text-green-400">
                  ✅ 장점
                </h4>
                <ul className="space-y-1">
                  {method.pros.map((pro, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <span className="mt-0.5 text-green-500">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold text-red-500 dark:text-red-400">
                  ❌ 단점
                </h4>
                <ul className="space-y-1">
                  {method.cons.map((con, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <span className="mt-0.5 text-red-400">•</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  📋 진행 방법
                </h4>
                <ol className="space-y-2">
                  {method.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                        {i + 1}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function IssueAccordion({ issue }: { issue: SleepIssue }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "overflow-hidden rounded-[28px] transition-shadow",
        isOpen && ""
      )}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full min-h-[48px] items-center gap-3 bg-gradient-to-r from-purple-50 to-violet-50 p-3.5 text-left dark:from-purple-950/30 dark:to-violet-950/30"
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-xl">{issue.emoji}</span>
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          {issue.issue}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border border-gray-100 bg-white px-4 py-3 rounded-2xl dark:border-gray-700/50 dark:bg-gray-900/50">
              <FormattedContent content={issue.solution} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
      className="space-y-6"
    >
      {/* Section 1: Sleep Needs Summary */}
      <motion.section variants={itemVariants}>
        <div className="mb-3 flex items-center gap-2">
          <Moon size={18} className="text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            수면 정보
          </h3>
        </div>
        <div className="flex gap-2.5">
          <SleepStatCard
            emoji="💤"
            label="총 수면"
            value={guide.totalSleep}
            gradient="from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30"
          />
          <SleepStatCard
            emoji="🌙"
            label="야간 수면"
            value={guide.nightSleep}
            gradient="from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30"
          />
          <SleepStatCard
            emoji="😴"
            label="낮잠"
            value={guide.napInfo}
            gradient="from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30"
          />
        </div>
      </motion.section>

      {/* Section 2: Sleep Signals */}
      <motion.section variants={itemVariants}>
        <div className="mb-2 flex items-center gap-2">
          <Sun size={18} className="text-amber-500 dark:text-amber-400" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            졸림 신호
          </h3>
        </div>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          이 신호가 보이면 재울 타이밍!
        </p>
        <div className="flex flex-wrap gap-2">
          {guide.sleepSignals.map((signal, i) => {
            const signalEmojis = ["👀", "🥱", "😣", "👂", "🤚"];
            return (
              <motion.span
                key={i}
                variants={itemVariants}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 text-sm font-medium text-amber-800 dark:from-amber-950/30 dark:to-orange-950/30 dark:text-amber-200"
              >
                <span>{signalEmojis[i % signalEmojis.length]}</span>
                {signal}
              </motion.span>
            );
          })}
        </div>
      </motion.section>

      {/* Section 3: Sleep Training Methods */}
      <motion.section variants={itemVariants}>
        <div className="mb-3 flex items-center gap-2">
          <Star size={18} className="text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            수면교육 방법
          </h3>
        </div>

        {showMethodWarning && (
          <motion.div
            variants={itemVariants}
            className="mb-4 flex items-start gap-3 rounded-[28px] bg-gradient-to-r from-blue-50 to-sky-50 p-4 dark:from-blue-950/30 dark:to-sky-950/30"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400"
            />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                수면교육은 보통 4개월 이후에 시작해요
              </p>
              <p className="mt-1 text-xs leading-relaxed text-blue-600 dark:text-blue-300">
                지금은 아기와의 유대감 형성에 집중하고, 안아재우기 방법으로 부드럽게 수면 습관을 만들어주세요.
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {methods.map((method) => (
            <MethodCard key={method.id} method={method} />
          ))}
        </div>
      </motion.section>

      {/* Section 4: Common Issues FAQ */}
      <motion.section variants={itemVariants}>
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle size={18} className="text-purple-500 dark:text-purple-400" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            자주 하는 고민
          </h3>
        </div>
        <div className="space-y-2.5">
          {guide.commonIssues.map((issue, i) => (
            <IssueAccordion key={i} issue={issue} />
          ))}
        </div>
      </motion.section>

      {/* Section 5: Sleep Environment Checklist */}
      <motion.section variants={itemVariants}>
        <div className="mb-3 flex items-center gap-2">
          <Check size={18} className="text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            수면 환경 체크리스트
          </h3>
        </div>
        <div className="space-y-2">
          {guide.sleepEnvironment.map((tip, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 px-4 py-3 dark:from-indigo-950/20 dark:to-purple-950/20"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 dark:bg-indigo-600">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {tip}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
