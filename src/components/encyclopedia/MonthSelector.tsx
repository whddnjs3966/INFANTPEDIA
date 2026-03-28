"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

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

  // Mouse drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft ?? 0);
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto px-4 py-2.5 no-scrollbar cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
              onClick={() => onSelect(month)}
              className={cn(
                "relative shrink-0 flex items-center justify-center transition-all duration-200",
                isSelected
                  ? cn(
                      "min-w-[72px] h-[46px] px-4",
                      "rounded-full",
                      "bg-violet-600 dark:bg-violet-500",
                      "shadow-md shadow-violet-500/25 dark:shadow-violet-400/20",
                    )
                  : cn(
                      "min-w-[60px] h-[42px] px-3.5",
                      "rounded-full",
                      "bg-white dark:bg-gray-800",
                      "border border-gray-200/60 dark:border-gray-700/60",
                      "active:bg-gray-50 dark:active:bg-gray-700"
                    )
              )}
            >
              <span
                className={cn(
                  "whitespace-nowrap select-none",
                  isSelected
                    ? "text-[13px] font-bold text-white"
                    : "text-[13px] font-semibold text-gray-500 dark:text-gray-400"
                )}
              >
                {month}개월
              </span>

              {/* Current month dot */}
              {isCurrent && !isSelected && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-violet-500 ring-[1.5px] ring-white dark:ring-gray-900" />
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
