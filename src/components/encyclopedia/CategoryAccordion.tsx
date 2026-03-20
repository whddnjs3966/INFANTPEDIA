"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Baby, Gamepad2, Moon, UtensilsCrossed, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
    color: "from-pink-50 to-rose-50 border-pink-200/50",
    iconColor: "text-pink-400 bg-pink-100",
  },
  {
    key: "play",
    label: "\ub180\uc774",
    emoji: "\ud83c\udfae",
    icon: Gamepad2,
    color: "from-blue-50 to-sky-50 border-blue-200/50",
    iconColor: "text-blue-400 bg-blue-100",
  },
  {
    key: "sleep",
    label: "\uc218\uba74",
    emoji: "\ud83c\udf19",
    icon: Moon,
    color: "from-purple-50 to-violet-50 border-purple-200/50",
    iconColor: "text-purple-400 bg-purple-100",
  },
  {
    key: "food",
    label: "\uc774\uc720\uc2dd",
    emoji: "\ud83c\udf5c",
    icon: UtensilsCrossed,
    color: "from-green-50 to-emerald-50 border-green-200/50",
    iconColor: "text-green-500 bg-green-100",
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
            className="h-16 animate-pulse rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50"
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
                "flex w-full min-h-[56px] items-center gap-3 rounded-2xl border bg-gradient-to-r p-4 text-left transition-all",
                cat.color,
                isOpen && "shadow-md"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn("rounded-xl p-2", cat.iconColor)}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {cat.emoji} {cat.label}
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {catActivities.length > 0
                    ? `${catActivities.length}\uac1c \ud56d\ubaa9`
                    : "\ub370\uc774\ud130 \uc5c6\uc74c"}
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
                  <div className="space-y-2 px-2 pt-2 pb-1">
                    {catActivities.length === 0 ? (
                      <div className="rounded-xl bg-white/60 p-4 text-center text-sm text-gray-400">
                        {"\ud83d\udcad"} {"\uc774"} {"\uc6d4\ub839\uc758"} {cat.label} {"\uc815\ubcf4\uac00"} {"\uc544\uc9c1"} {"\uc5c6\uc5b4\uc694"}
                      </div>
                    ) : (
                      catActivities.map((activity, idx) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                          <h4 className="text-[15px] font-bold text-gray-800 dark:text-gray-100">
                            {activity.title}
                          </h4>
                          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
                            {activity.content}
                          </p>
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
