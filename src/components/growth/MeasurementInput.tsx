"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { X, Check, Ruler, Weight, Circle, CalendarDays, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { growthData } from "@/lib/data/growth-data";
import { useBabyStore } from "@/lib/store/baby-store";

interface MeasurementInputProps {
  currentMonth: number;
  onClose: () => void;
}

export default function MeasurementInput({ currentMonth, onClose }: MeasurementInputProps) {
  const addMeasurement = useMeasurementStore((s) => s.addMeasurement);
  const babyGender = useBabyStore((s) => s.profile?.gender) || "male";

  const [month, setMonth] = useState(currentMonth);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [headCirc, setHeadCirc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);
  const controls = useAnimation();
  const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    controls.start({ y: 0 });
    // Scroll selected month into view
    if (monthScrollRef.current) {
      const selected = monthScrollRef.current.children[currentMonth] as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ inline: "center", block: "nearest" });
      }
    }
    return () => { document.body.style.overflow = original; };
  }, [controls, currentMonth]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      controls.start({ y: "100%" }).then(onClose);
    } else {
      controls.start({ y: 0 });
    }
  };

  // WHO reference for selected month
  const whoRef = growthData[month];
  const whoHeight = whoRef ? (babyGender === "male" ? whoRef.maleHeight : whoRef.femaleHeight) : null;
  const whoWeight = whoRef ? (babyGender === "male" ? whoRef.maleWeight : whoRef.femaleWeight) : null;
  const whoHead = whoRef ? (babyGender === "male" ? whoRef.maleHead : whoRef.femaleHead) : null;

  const handleSave = () => {
    if (!height && !weight && !headCirc) return;

    const h = height ? parseFloat(height) : undefined;
    const w = weight ? parseFloat(weight) : undefined;
    const hc = headCirc ? parseFloat(headCirc) : undefined;

    if (h !== undefined && (h < 30 || h > 90)) {
      setValidationError("키는 30~90cm 범위로 입력해 주세요");
      return;
    }
    if (w !== undefined && (w < 1 || w > 20)) {
      setValidationError("몸무게는 1~20kg 범위로 입력해 주세요");
      return;
    }
    if (hc !== undefined && (hc < 25 || hc > 55)) {
      setValidationError("머리둘레는 25~55cm 범위로 입력해 주세요");
      return;
    }
    setValidationError(null);

    addMeasurement({
      month, date,
      height: h, weight: w, headCircumference: hc,
      memo: memo.trim() || undefined,
    });

    setSaved(true);
    setTimeout(() => {
      controls.start({ y: "100%" }).then(onClose);
    }, 800);
  };

  const hasInput = !!(height || weight || headCirc);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" style={{ opacity: backdropOpacity }} />

      <motion.div
        ref={sheetRef}
        initial={{ y: "100%" }}
        animate={controls}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y: dragY, maxHeight: "92vh" }}
        className="relative z-10 flex w-full max-w-md flex-col rounded-t-3xl bg-white dark:bg-stone-900 pb-8 sm:rounded-3xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 overscroll-contain">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                <Ruler size={17} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-stone-800 dark:text-stone-100">실측 데이터 입력</h3>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">아기의 성장을 기록해 보세요</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors">
              <X size={18} className="text-stone-400" />
            </button>
          </div>

          {/* Month selector */}
          <div className="mb-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              <CalendarDays size={12} />
              월령 선택
            </label>
            <div ref={monthScrollRef} className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {Array.from({ length: 13 }, (_, i) => i).map((m) => (
                <button
                  key={m}
                  onClick={() => setMonth(m)}
                  className={cn(
                    "min-w-[48px] rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                    month === m
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : "bg-stone-100 text-gray-500 dark:bg-stone-800 dark:text-gray-400 active:bg-gray-200"
                  )}
                >
                  {m}개월
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              <CalendarDays size={12} />
              측정일
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-stone-800 px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
            />
          </div>

          {/* Measurement inputs with WHO reference */}
          <div className="mb-4 space-y-3">
            {/* Height */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-3.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-cyan-500" />
                  <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">키 (cm)</span>
                </div>
                {whoHeight && (
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">WHO 평균 {whoHeight}cm</span>
                )}
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={whoHeight ? `예: ${whoHeight}` : "0.0"}
                className="w-full bg-transparent text-[18px] font-bold text-stone-800 dark:text-stone-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none"
              />
            </div>

            {/* Weight */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-3.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Weight size={14} className="text-violet-500" />
                  <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">몸무게 (kg)</span>
                </div>
                {whoWeight && (
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">WHO 평균 {whoWeight}kg</span>
                )}
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={whoWeight ? `예: ${whoWeight}` : "0.0"}
                className="w-full bg-transparent text-[18px] font-bold text-stone-800 dark:text-stone-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none"
              />
            </div>

            {/* Head circumference */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-3.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Circle size={14} className="text-amber-500" />
                  <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">머리둘레 (cm)</span>
                </div>
                {whoHead && (
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">WHO 평균 {whoHead}cm</span>
                )}
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={headCirc}
                onChange={(e) => setHeadCirc(e.target.value)}
                placeholder={whoHead ? `예: ${whoHead}` : "0.0"}
                className="w-full bg-transparent text-[18px] font-bold text-stone-800 dark:text-stone-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Memo */}
          <div className="mb-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              <StickyNote size={12} />
              메모 (선택)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value.slice(0, 100))}
              placeholder="예: 소아과 정기검진 측정"
              maxLength={100}
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-stone-800 px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
            />
            <p className="mt-0.5 text-right text-[11px] text-stone-400 dark:text-stone-500">{memo.length}/100</p>
          </div>

          {/* Validation error */}
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 rounded-xl bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30"
            >
              {validationError}
            </motion.div>
          )}

          {/* Save button */}
          <div className="mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={!hasInput}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold transition-all",
                saved
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : !hasInput
                  ? "bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500"
                  : "bg-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/25 active:bg-[#6B4CE0]"
              )}
            >
              {saved ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Check size={18} strokeWidth={3} />
                  </motion.div>
                  저장되었습니다
                </>
              ) : (
                "저장하기"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
