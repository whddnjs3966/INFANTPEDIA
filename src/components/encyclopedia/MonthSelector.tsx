"use client";

import { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/free-mode";
import type { Swiper as SwiperType } from "swiper";

interface MonthSelectorProps {
  selectedMonth: number;
  currentMonth: number;
  onSelect: (month: number) => void;
}

const pastelColors = [
  "bg-pink-100 border-pink-300 text-pink-700",
  "bg-rose-100 border-rose-300 text-rose-700",
  "bg-purple-100 border-purple-300 text-purple-700",
  "bg-violet-100 border-violet-300 text-violet-700",
  "bg-blue-100 border-blue-300 text-blue-700",
  "bg-sky-100 border-sky-300 text-sky-700",
  "bg-cyan-100 border-cyan-300 text-cyan-700",
  "bg-teal-100 border-teal-300 text-teal-700",
  "bg-emerald-100 border-emerald-300 text-emerald-700",
  "bg-green-100 border-green-300 text-green-700",
  "bg-yellow-100 border-yellow-300 text-yellow-700",
  "bg-amber-100 border-amber-300 text-amber-700",
  "bg-orange-100 border-orange-300 text-orange-700",
];

export default function MonthSelector({
  selectedMonth,
  currentMonth,
  onSelect,
}: MonthSelectorProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(Math.max(0, selectedMonth - 1));
    }
  }, [selectedMonth]);

  return (
    <div className="w-full">
      <Swiper
        modules={[FreeMode]}
        freeMode
        slidesPerView="auto"
        spaceBetween={8}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="!px-4"
      >
        {Array.from({ length: 13 }, (_, i) => i).map((month) => {
          const isSelected = month === selectedMonth;
          const isCurrent = month === currentMonth;

          return (
            <SwiperSlide key={month} style={{ width: "auto" }}>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelect(month)}
                className={cn(
                  "relative flex min-h-[44px] min-w-[56px] items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  isSelected
                    ? cn(pastelColors[month], "shadow-md scale-110 border-2")
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                {month}{"개월"}
                {isCurrent && !isSelected && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-pink-400" />
                )}
              </motion.button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
