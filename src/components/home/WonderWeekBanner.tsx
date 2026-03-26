"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import FormattedContent from "@/components/ui/FormattedContent";

interface WonderWeekBannerProps {
  title: string;
  description: string;
  leapNumber?: number;
}

export default function WonderWeekBanner({
  title,
  description,
  leapNumber,
}: WonderWeekBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -8 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/30"
        >
          <div className="flex items-start gap-3 pr-8">
            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
              <Sparkles size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
                {leapNumber && (
                  <span className="rounded-full bg-amber-200/60 dark:bg-amber-800/50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    Leap {leapNumber}
                  </span>
                )}
              </div>
              <div className="mt-1.5">
                <FormattedContent
                  content={description}
                  className="[&_p]:text-gray-600 [&_p]:dark:text-gray-300"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-2 rounded-full p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-400"
            aria-label="닫기"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
