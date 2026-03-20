"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
          className="relative overflow-hidden rounded-2xl border border-yellow-200/60 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 p-4 shadow-sm"
        >
          {/* Sparkle decorations */}
          <motion.span
            className="absolute right-4 top-2 text-xl"
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {"\u2728"}
          </motion.span>
          <motion.span
            className="absolute right-12 top-6 text-sm"
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            {"\u2b50"}
          </motion.span>

          <div className="flex items-start gap-3 pr-8">
            <div className="shrink-0 rounded-xl bg-yellow-100 p-2">
              <Sparkles size={20} className="text-yellow-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-yellow-800">
                  {"\ud83c\udf1f"} {title}
                </h3>
                {leapNumber && (
                  <span className="rounded-full bg-yellow-200/60 px-2 py-0.5 text-[10px] font-semibold text-yellow-700">
                    Leap {leapNumber}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-yellow-800">
                {description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-2 rounded-full p-1.5 text-yellow-400 transition-colors hover:bg-yellow-100 hover:text-yellow-600"
            aria-label="\ub2eb\uae30"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
