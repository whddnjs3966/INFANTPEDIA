"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Baby,
  ChevronDown,
  Droplets,
  Clock,
  Thermometer,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FormattedContent from "@/components/ui/FormattedContent";
import {
  getFeedingGuideForMonth,
  type FeedingPosition,
  type BottleCleaningStep,
  type FeedingTroubleshooting,
} from "@/lib/data/feeding-guide-data";

interface FeedingGuideProps {
  month: number;
}

function SectionHeader({
  title,
  emoji,
  isOpen,
  onToggle,
  color = "pink",
}: {
  title: string;
  emoji: string;
  isOpen: boolean;
  onToggle: () => void;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    pink: "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30",
    blue: "from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30",
    amber: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
    cyan: "from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30",
    violet: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
    red: "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30",
  };

  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4 text-left transition-all",
        colorMap[color] || colorMap.pink,
        isOpen && ""
      )}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-xl">{emoji}</span>
      <span className="flex-1 text-sm font-bold text-stone-700 dark:text-stone-200">
        {title}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown size={18} className="text-gray-400" />
      </motion.div>
    </motion.button>
  );
}

function ExpandableSection({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="mt-2 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const urgencyConfig = {
  info: {
    dot: "bg-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    
    text: "text-blue-700 dark:text-blue-300",
    icon: Info,
  },
  caution: {
    dot: "bg-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    
    text: "text-amber-700 dark:text-amber-300",
    icon: AlertTriangle,
  },
  warning: {
    dot: "bg-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    
    text: "text-red-700 dark:text-red-300",
    icon: AlertTriangle,
  },
};

export default function FeedingGuide({ month }: FeedingGuideProps) {
  const guide = useMemo(() => getFeedingGuideForMonth(month), [month]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  if (!guide) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center dark:bg-stone-800">
        <p className="text-3xl">🍼</p>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          해당 월령의 수유 가이드가 준비 중이에요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {/* Feeding Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-2"
      >
        {[
          { label: "1회 수유량", value: guide.perFeedAmount, emoji: "🍼", gradient: "from-pink-100 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40" },
          { label: "일일 총량", value: guide.dailyTotal, emoji: "📊", gradient: "from-purple-100 to-violet-100 dark:from-purple-950/40 dark:to-violet-950/40" },
          { label: "수유 횟수", value: guide.frequency, emoji: "🔢", gradient: "from-blue-100 to-sky-100 dark:from-blue-950/40 dark:to-sky-950/40" },
          { label: "수유 간격", value: guide.interval, emoji: "⏰", gradient: "from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "rounded-2xl p-3.5 text-center bg-stone-50 dark:bg-stone-800/60 border border-stone-200/50 dark:border-stone-700/50",
              ""
            )}
          >
            <p className="text-lg">{stat.emoji}</p>
            <p className="mt-1 text-base font-bold text-stone-800 dark:text-stone-100">
              {stat.value}
            </p>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Feeding Type Badge */}
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-4 py-1.5 text-xs font-semibold text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
          <Baby size={14} />
          {guide.feedingType}
        </span>
      </div>

      {/* Positions */}
      <div>
        <SectionHeader
          title="수유 자세 가이드"
          emoji="🤱"
          isOpen={!!openSections.positions}
          onToggle={() => toggle("positions")}
          color="pink"
        />
        <ExpandableSection isOpen={!!openSections.positions}>
          <div className="space-y-2.5">
            {guide.positions.map((pos, idx) => (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl bg-pink-50/50 p-3 dark:bg-pink-950/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{pos.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
                      {pos.name}
                    </p>
                    <span className="inline-block mt-0.5 rounded-full bg-pink-100 px-2 py-0.5 text-[11px] font-medium text-pink-600 dark:bg-pink-900/40 dark:text-pink-300">
                      {pos.suitableFor}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <FormattedContent content={pos.description} className="text-[12px]" />
                </div>
              </motion.div>
            ))}
          </div>
        </ExpandableSection>
      </div>

      {/* Burping Tips */}
      <div>
        <SectionHeader
          title="트림시키기 가이드"
          emoji="💨"
          isOpen={!!openSections.burping}
          onToggle={() => toggle("burping")}
          color="blue"
        />
        <ExpandableSection isOpen={!!openSections.burping}>
          <div className="space-y-2">
            {guide.burpingTips.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-2"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                  {idx + 1}
                </div>
                <p className="text-[13px] leading-relaxed text-gray-700 dark:text-gray-300">
                  {tip}
                </p>
              </motion.div>
            ))}
          </div>
        </ExpandableSection>
      </div>

      {/* Bottle Cleaning */}
      <div>
        <SectionHeader
          title="젖병 소독 & 관리"
          emoji="🧴"
          isOpen={!!openSections.cleaning}
          onToggle={() => toggle("cleaning")}
          color="cyan"
        />
        <ExpandableSection isOpen={!!openSections.cleaning}>
          <div className="relative space-y-0">
            {guide.bottleCleaning.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 pb-3 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                    {step.emoji}
                  </div>
                  {idx < guide.bottleCleaning.length - 1 && (
                    <div className="mt-1 h-4 w-px bg-cyan-200 dark:bg-cyan-800" />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-[13px] font-bold text-stone-800 dark:text-stone-100">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-stone-500 dark:text-stone-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ExpandableSection>
      </div>

      {/* Breast Milk Storage */}
      <div>
        <SectionHeader
          title="모유 보관 가이드"
          emoji="🥛"
          isOpen={!!openSections.storage}
          onToggle={() => toggle("storage")}
          color="violet"
        />
        <ExpandableSection isOpen={!!openSections.storage}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { emoji: "🌡️", label: "실온", value: guide.breastMilkStorage.roomTemp, color: "bg-amber-50 dark:bg-amber-950/30" },
              { emoji: "❄️", label: "냉장", value: guide.breastMilkStorage.fridge, color: "bg-blue-50 dark:bg-blue-950/30" },
              { emoji: "🧊", label: "냉동", value: guide.breastMilkStorage.freezer, color: "bg-indigo-50 dark:bg-indigo-950/30" },
              { emoji: "🔄", label: "해동 후", value: guide.breastMilkStorage.thawing, color: "bg-green-50 dark:bg-green-950/30" },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-2xl p-3 text-center",
                  item.color
                )}
              >
                <p className="text-lg">{item.emoji}</p>
                <p className="mt-1 text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[13px] font-bold text-stone-800 dark:text-stone-100">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </ExpandableSection>
      </div>

      {/* Mixed Feeding */}
      {guide.mixedFeedingTips.length > 0 && (
        <div>
          <SectionHeader
            title="혼합수유 팁"
            emoji="🔄"
            isOpen={!!openSections.mixed}
            onToggle={() => toggle("mixed")}
            color="amber"
          />
          <ExpandableSection isOpen={!!openSections.mixed}>
            <div className="space-y-2">
              {guide.mixedFeedingTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-amber-400" />
                  <p className="text-[13px] leading-relaxed text-gray-700 dark:text-gray-300">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </ExpandableSection>
        </div>
      )}

      {/* Troubleshooting */}
      <div>
        <SectionHeader
          title="수유 트러블슈팅"
          emoji="🔧"
          isOpen={!!openSections.trouble}
          onToggle={() => toggle("trouble")}
          color="red"
        />
        <ExpandableSection isOpen={!!openSections.trouble}>
          <div className="space-y-2">
            {guide.troubleshooting.map((item, idx) => {
              const config = urgencyConfig[item.urgency];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    "rounded-2xl p-3",
                    config.bg
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-2 w-2 rounded-full", config.dot)} />
                        <p className="text-[13px] font-bold text-stone-800 dark:text-stone-100">
                          {item.issue}
                        </p>
                      </div>
                      <div className="mt-1">
                        <FormattedContent content={item.solution} className="text-[12px]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}
