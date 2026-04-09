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
    label: "\ubc1c\ub2ec",
    emoji: "\ud83d\udc76",
    icon: Baby,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    key: "play",
    label: "\ub180\uc774",
    emoji: "\ud83c\udfae",
    icon: Gamepad2,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "sleep",
    label: "\uc218\uba74",
    emoji: "\ud83c\udf19",
    icon: Moon,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    key: "food",
    label: "\uc774\uc720\uc2dd",
    emoji: "\ud83c\udf5c",
    icon: UtensilsCrossed,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
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
      <div className="space-y-3 px-4">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="h-16 animate-pulse rounded-2xl bg-stone-200/60 dark:bg-stone-800/60"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4">
      {categories.map((cat) => {
        const catActivities = activities.filter(
          (a) => a.category === cat.key
        );
        const isOpen = openCategory === cat.key;
        const Icon = cat.icon;

        return (
          <div key={cat.key}>
            <motion.button
              onClick={() => toggle(cat.key)}
              className={cn(
                "flex w-full min-h-[56px] items-center gap-3 rounded-2xl p-4 text-left transition-all",
                "bg-white dark:bg-stone-900",
                "border border-stone-200 dark:border-stone-700",
                isOpen && "shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn("rounded-xl p-2", cat.iconBg, cat.iconColor)}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <span className="text-base font-bold text-stone-700 dark:text-stone-200">
                  {cat.emoji} {cat.label}
                </span>
                {catActivities.length > 0 ? (
                  <span className="ml-2 inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[11px] font-bold text-stone-500 dark:text-stone-400">
                    {catActivities.length}
                  </span>
                ) : (
                  <span className="ml-2 text-[11px] text-stone-400 dark:text-stone-500">{"\ub370\uc774\ud130 \uc5c6\uc74c"}</span>
                )}
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={18} className="text-stone-400" />
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
                  <div className="space-y-2 px-2 pt-2 pb-1">
                    {catActivities.length === 0 ? (
                      <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/60 p-4 text-center text-sm text-stone-400">
                        {"\ud83d\udcad"} {"\uc774"} {"\uc6d4\ub839\uc758"} {cat.label} {"\uc815\ubcf4\uac00"} {"\uc544\uc9c1"} {"\uc5c6\uc5b4\uc694"}
                      </div>
                    ) : (
                      catActivities.map((activity, idx) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
                        >
                          <h4 className="text-base font-bold text-stone-800 dark:text-stone-100">
                            {activity.title}
                          </h4>
                          <div className="mt-2">
                            <FormattedContent content={activity.content} />
                          </div>
                        </motion.div>
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
