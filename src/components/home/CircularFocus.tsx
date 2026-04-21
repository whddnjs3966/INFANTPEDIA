"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Camera } from "lucide-react";
import { useRef } from "react";

interface CircularFocusProps {
  days: number;
  months: number;
  realMonths: number;
  isOver12: boolean;
  greeting: string;
  babyName: string;
  photoUrl?: string;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CircularFocus({
  days,
  months,
  realMonths,
  isOver12,
  greeting,
  babyName,
  photoUrl,
  onPhotoSelect,
}: CircularFocusProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const size = 240;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (days % 30) / 30;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex flex-col items-center">
      {/* Greeting + name header */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 text-center"
      >
        <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
          {greeting}
        </p>
        <p className="mt-0.5 text-[17px] font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          {babyName} 부모님
        </p>
      </motion.div>

      {/* Circular ring with avatar */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute -rotate-90">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9B7AFF" />
              <stop offset="100%" stopColor="#7C5CFC" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-stone-200/70 dark:text-stone-800"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
        </svg>

        {/* Avatar in center */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative h-[172px] w-[172px] active:scale-95 transition-transform"
        >
          <div className="relative h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/40 dark:to-violet-950/40 ring-[3px] ring-white dark:ring-stone-900">
            {photoUrl ? (
              <Image src={photoUrl} alt={babyName} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Camera size={44} className="text-violet-300 dark:text-violet-700" strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700">
            <Camera size={15} className="text-[#7C5CFC] dark:text-violet-400" />
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoSelect} />
      </div>

      {/* Big D+days label below */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-6 flex flex-col items-center"
      >
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[56px] font-black tracking-tighter leading-none text-stone-900 dark:text-stone-100"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            D+{days}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[13px]">
          <span className="font-semibold text-[#7C5CFC] dark:text-violet-400">
            {isOver12 ? `${realMonths}개월` : `${months}개월 차`}
          </span>
          <span className="text-stone-300 dark:text-stone-700">·</span>
          <span className="font-medium text-stone-500 dark:text-stone-400">
            {Math.floor(days / 7)}주 {days % 7}일
          </span>
        </div>
      </motion.div>
    </div>
  );
}
