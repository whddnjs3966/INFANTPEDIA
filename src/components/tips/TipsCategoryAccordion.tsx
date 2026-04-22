"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Moon, Baby, Frown, Luggage, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import FormattedContent from "@/components/ui/FormattedContent";

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  month_id: number;
}

interface TipsCategoryAccordionProps {
  tips: Tip[];
  isLoading: boolean;
}

const categories = [
  {
    key: "sleep_tips",
    label: "수면 꿀팁",
    icon: Moon,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
    accentBar: "bg-indigo-500",
  },
  {
    key: "feeding_tips",
    label: "수유 꿀팁",
    icon: Baby,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    accentBar: "bg-rose-500",
  },
  {
    key: "crying_tips",
    label: "울음 달래기",
    icon: Frown,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-950/30",
    accentBar: "bg-amber-500",
  },
  {
    key: "outing_tips",
    label: "외출·여행",
    icon: Luggage,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    accentBar: "bg-emerald-500",
  },
];

export default function TipsCategoryAccordion({
  tips,
  isLoading,
}: TipsCategoryAccordionProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenCategory((prev) => (prev === key ? null : key));
  };

  if (isLoading) {
    return (
      <div className="space-y-3 px-5">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="h-[72px] animate-pulse rounded-3xl bg-stone-200/60 dark:bg-stone-800/60"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 px-5">
      {categories.map((cat) => {
        const catTips = tips.filter((t) => t.category === cat.key);
        const isOpen = openCategory === cat.key;
        const Icon = cat.icon;
        const hasContent = catTips.length > 0;

        return (
          <div key={cat.key}>
            <motion.button
              onClick={() => toggle(cat.key)}
              whileTap={{ scale: 0.985 }}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-3xl bg-white dark:bg-stone-900 p-4 text-left elevation-1 transition-shadow",
                isOpen && "shadow-[0_6px_20px_rgba(15,15,20,0.08)]"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  cat.iconBg
                )}
              >
                <Icon size={21} className={cat.iconColor} strokeWidth={2.1} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {cat.label}
                  </span>
                  {hasContent ? (
                    <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-stone-500 dark:text-stone-400">
                      {catTips.length}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
                      데이터 없음
                    </span>
                  )}
                </div>
                {hasContent && (
                  <p className="mt-0.5 text-[12px] font-medium text-stone-500 dark:text-stone-400 truncate">
                    {catTips[0].title}
                    {catTips.length > 1 && ` 외 ${catTips.length - 1}건`}
                  </p>
                )}
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0"
              >
                <ChevronDown
                  size={18}
                  className="text-stone-400 dark:text-stone-500"
                  strokeWidth={2.2}
                />
              </motion.div>
            </motion.button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2.5 pt-2.5">
                    {catTips.length === 0 ? (
                      <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/60 p-5 text-center">
                        <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
                          이 월령의 {cat.label} 정보가 아직 없어요
                        </p>
                      </div>
                    ) : (
                      catTips.map((tip, idx) => (
                        <motion.article
                          key={tip.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.04 }}
                          className="rounded-3xl bg-white dark:bg-stone-900 p-5 elevation-1"
                        >
                          <div className="mb-3 flex items-center gap-2.5">
                            <span
                              className={cn(
                                "h-[18px] w-[3px] rounded-full",
                                cat.accentBar
                              )}
                            />
                            <h4 className="text-[15px] font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                              {tip.title}
                            </h4>
                          </div>
                          <FormattedContent content={tip.content} />
                        </motion.article>
                      ))
                    )}
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
