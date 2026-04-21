"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDragScroll } from "@/hooks/useDragScroll";

interface MonthSelectorProps {
  selectedMonth: number;
  currentMonth: number;
  onSelect: (month: number) => void;
}

const months = Array.from({ length: 13 }, (_, i) => i);

export default function MonthSelector({
  selectedMonth,
  currentMonth,
  onSelect,
}: MonthSelectorProps) {
  const { ref: scrollRef, dragProps, suppressClickIfDragging } = useDragScroll<HTMLDivElement>();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const scrollToCenter = useCallback((month: number, smooth = true) => {
    const el = itemRefs.current[month];
    if (el) {
      el.scrollIntoView({
        inline: "center",
        behavior: smooth ? "smooth" : "instant",
        block: "nearest",
      });
    }
  }, []);

  useEffect(() => {
    scrollToCenter(selectedMonth, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToCenter(selectedMonth);
  }, [selectedMonth, scrollToCenter]);

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        {...dragProps}
        className="flex gap-2.5 overflow-x-auto px-4 py-2.5 no-scrollbar cursor-grab active:cursor-grabbing select-none"
      >
        {/* Left spacer for centering */}
        <div className="shrink-0 w-[calc(50vw-48px)] max-w-[calc(224px-48px)]" />

        {months.map((month) => {
          const isSelected = month === selectedMonth;
          const isCurrent = month === currentMonth;

          return (
            <motion.button
              key={month}
              ref={(el) => { itemRefs.current[month] = el; }}
              whileTap={{ scale: 0.92 }}
              onClick={suppressClickIfDragging(() => onSelect(month))}
              className={cn(
                "relative shrink-0 flex items-center justify-center transition-all duration-200",
                isSelected
                  ? cn(
                      "min-w-[72px] h-[46px] px-4",
                      "rounded-full",
                      "bg-[#7C5CFC] dark:bg-violet-500",
                      "shadow-md shadow-violet-500/25 dark:shadow-violet-400/20",
                    )
                  : cn(
                      "min-w-[60px] h-[42px] px-3.5",
                      "rounded-full",
                      "bg-white dark:bg-stone-800",
                      "border border-stone-200/60 dark:border-stone-700/60",
                      "active:bg-stone-50 dark:active:bg-stone-700"
                    )
              )}
            >
              <span
                className={cn(
                  "whitespace-nowrap select-none",
                  isSelected
                    ? "text-[13px] font-bold text-white"
                    : "text-[13px] font-semibold text-stone-500 dark:text-stone-400"
                )}
              >
                {month}개월
              </span>

              {/* Current month dot */}
              {isCurrent && !isSelected && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#7C5CFC] ring-[1.5px] ring-white dark:ring-stone-900" />
              )}
            </motion.button>
          );
        })}

        {/* Right spacer for centering */}
        <div className="shrink-0 w-[calc(50vw-48px)] max-w-[calc(224px-48px)]" />
      </div>
    </div>
  );
}
