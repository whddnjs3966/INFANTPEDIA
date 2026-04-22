"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Baby, Gamepad2, Moon, UtensilsCrossed, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import FormattedContent from "@/components/ui/FormattedContent";

interface Activity {
  id: number;
  title: string;
  content: string;
  category: string;
  month_id: number;
}

interface CategoryAccordionProps {
  activities: Activity[];
  isLoading: boolean;
}

const categories = [
  {
    key: "development",
    label: "발달",
    icon: Baby,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    accentBar: "bg-rose-500",
  },
  {
    key: "play",
    label: "놀이",
    icon: Gamepad2,
    iconColor: "text-sky-500",
    iconBg: "bg-sky-50 dark:bg-sky-950/30",
    accentBar: "bg-sky-500",
  },
  {
    key: "sleep",
    label: "수면",
    icon: Moon,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
    accentBar: "bg-indigo-500",
  },
  {
    key: "food",
    label: "이유식",
    icon: UtensilsCrossed,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    accentBar: "bg-emerald-500",
  },
];

export default function CategoryAccordion({
  activities,
  isLoading,
}: CategoryAccordionProps) {
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
        const catActivities = activities.filter((a) => a.category === cat.key);
        const isOpen = openCategory === cat.key;
        const Icon = cat.icon;
        const hasContent = catActivities.length > 0;

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
                      {catActivities.length}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
                      데이터 없음
                    </span>
                  )}
                </div>
                {hasContent && (
                  <p className="mt-0.5 text-[12px] font-medium text-stone-500 dark:text-stone-400 truncate">
                    {catActivities[0].title}
                    {catActivities.length > 1 && ` 외 ${catActivities.length - 1}건`}
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
                    {catActivities.length === 0 ? (
                      <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/60 p-5 text-center">
                        <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
                          이 월령의 {cat.label} 정보가 아직 없어요
                        </p>
                      </div>
                    ) : (
                      catActivities.map((activity, idx) => (
                        <motion.article
                          key={activity.id}
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
                              {activity.title}
                            </h4>
                          </div>
                          <FormattedContent content={activity.content} />
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
