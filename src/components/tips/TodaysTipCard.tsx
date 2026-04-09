"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import FormattedContent from "@/components/ui/FormattedContent";
import { getRandomTip } from "@/lib/data/daily-tips-data";

export default function TodaysTipCard() {
  const [tip] = useState(() => getRandomTip());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mx-4 mb-5"
    >
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_2px_8px_rgb(0,0,0,0.06)] dark:border-stone-700 dark:bg-stone-900">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-xl bg-yellow-100 p-2">
            <Sparkles size={18} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-200">
              {"오늘의 꿀팁! ✨"}
            </h3>
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-600">
              {tip.categoryEmoji} {tip.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-[16px] font-extrabold leading-snug text-stone-900 dark:text-stone-100 mb-2">
          {tip.title}
        </h4>

        {/* Content */}
        <FormattedContent content={tip.content} className="text-[14px]" />

        {/* Footer */}
        <div className="mt-3 pt-2">
          <p className="text-[11px] text-yellow-600 text-center font-medium">
            {"💡 새로고침하면 새로운 팁을 볼 수 있어요!"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
