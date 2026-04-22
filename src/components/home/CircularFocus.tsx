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

  // Progress through the current month (0..1)
  const progress = (days % 30) / 30;
  const progressPct = Math.round(progress * 100);
  const weeks = Math.floor(days / 7);
  const remDays = days % 7;

  return (
    <div className="px-5">
      {/* ── Editorial header: small avatar + greeting + name ── */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3.5"
      >
        {/* Compact avatar with edit affordance */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative h-16 w-16 shrink-0 active:scale-95 transition-transform"
          aria-label="사진 변경"
        >
          <div className="relative h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/40 dark:to-teal-950/40 ring-2 ring-white dark:ring-stone-900 shadow-[0_2px_8px_rgba(15,15,20,0.08)]">
            {photoUrl ? (
              <Image src={photoUrl} alt={babyName} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Camera size={22} className="text-teal-400 dark:text-teal-600" strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700">
            <Camera size={10} className="text-[#14B8A6] dark:text-teal-400" strokeWidth={2.3} />
          </div>
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-stone-500 dark:text-stone-400 leading-tight">
            {greeting}
          </p>
          <p className="mt-0.5 text-[17px] font-bold text-stone-900 dark:text-stone-100 tracking-tight truncate">
            {babyName} 부모님
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPhotoSelect}
        />
      </motion.div>

      {/* ── Hero D+day display (distinguished card) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-50 via-white to-white dark:from-teal-950/40 dark:via-stone-900 dark:to-stone-900 p-5 ring-1 ring-teal-100/70 dark:ring-teal-900/30 shadow-[0_1px_3px_rgba(15,15,20,0.05),0_4px_16px_rgba(20,184,166,0.06)]"
      >
        {/* Subtle decorative blur accent in corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-200/25 dark:bg-teal-500/10 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#14B8A6] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-white">
              Day
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-teal-200/80 to-transparent dark:from-teal-800/60" />
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span
              className="text-[88px] font-black leading-[0.88] tracking-[-0.05em] text-stone-900 dark:text-stone-50"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {days}
            </span>
            <span className="mb-1 rounded-full bg-white px-2.5 py-1 text-[13px] font-bold text-[#14B8A6] ring-1 ring-teal-100 dark:bg-stone-800 dark:text-teal-400 dark:ring-teal-900/50">
              {isOver12 ? `${realMonths}개월` : `${months}개월 차`}
            </span>
          </div>

          <p className="mt-2.5 text-[13px] font-medium text-stone-500 dark:text-stone-400">
            출생 후{" "}
            <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
              {weeks}주 {remDays}일
            </span>
          </p>

          {/* ── Linear progress bar (replaces ring) ── */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                이번 달 진행
              </span>
              <span className="text-[12px] font-bold text-[#14B8A6] dark:text-teal-400 tabular-nums">
                {progressPct}%
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-teal-100/60 dark:bg-teal-950/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.25 }}
                className="h-full rounded-full bg-gradient-to-r from-[#5EEAD4] to-[#14B8A6]"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
