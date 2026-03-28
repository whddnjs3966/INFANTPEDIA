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
    emoji: "\ud83d\ude34",
    icon: Moon,
    color: "from-indigo-50 to-blue-50",
    iconColor: "text-indigo-400 bg-indigo-100",
  },
  {
    key: "feeding_tips",
    label: "수유 꿀팁",
    emoji: "\ud83c\udf7c",
    icon: Baby,
    color: "from-pink-50 to-rose-50",
    iconColor: "text-pink-400 bg-pink-100",
  },
  {
    key: "crying_tips",
    label: "울음 달래기",
    emoji: "\ud83d\ude2d",
    icon: Frown,
    color: "from-amber-50 to-yellow-50",
    iconColor: "text-amber-400 bg-amber-100",
  },
  {
    key: "outing_tips",
    label: "외출/여행",
    emoji: "\ud83e\uddf3",
    icon: Luggage,
    color: "from-green-50 to-emerald-50",
    iconColor: "text-green-500 bg-green-100",
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
      <div className="space-y-4 px-4">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="h-16 animate-pulse rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      {categories.map((cat) => {
        const catTips = tips.filter((t) => t.category === cat.key);
        const isOpen = openCategory === cat.key;
        const Icon = cat.icon;

        return (
          <div key={cat.key}>
            <motion.button
              onClick={() => toggle(cat.key)}
              className={cn(
                "flex w-full min-h-[56px] items-center gap-3 rounded-[28px] bg-gradient-to-r p-4 text-left transition-all",
                cat.color,
                isOpen && "shadow-md ring-1 ring-black/5"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn("rounded-xl p-2", cat.iconColor)}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <span className="text-base font-bold text-gray-700 dark:text-gray-200">
                  {cat.emoji} {cat.label}
                </span>
                {catTips.length > 0 ? (
                  <span className="ml-2 inline-flex items-center rounded-full bg-white/60 dark:bg-white/10 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    {catTips.length}
                  </span>
                ) : (
                  <span className="ml-2 text-[11px] text-gray-400 dark:text-gray-500">{"\ub370\uc774\ud130 \uc5c6\uc74c"}</span>
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
                  <div className="space-y-2 px-2 pt-2 pb-1">
                    {catTips.length === 0 ? (
                      <div className="rounded-xl bg-white/60 p-4 text-center text-sm text-gray-400">
                        {"\ud83d\udcad"} {"\uc774"} {"\uc6d4\ub839\uc758"} {cat.label} {"\uc815\ubcf4\uac00"} {"\uc544\uc9c1"} {"\uc5c6\uc5b4\uc694"}
                      </div>
                    ) : (
                      catTips.map((tip, idx) => (
                        <motion.div
                          key={tip.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-[0_2px_8px_rgb(0,0,0,0.04)] dark:border-gray-700/50 dark:bg-gray-800"
                        >
                          <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">
                            {tip.title}
                          </h4>
                          <div className="mt-2">
                            <FormattedContent content={tip.content} />
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
