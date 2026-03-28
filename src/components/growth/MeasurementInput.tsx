"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { X, Save } from "lucide-react";
import { useMeasurementStore } from "@/lib/store/measurement-store";

interface MeasurementInputProps {
  currentMonth: number;
  onClose: () => void;
}

export default function MeasurementInput({ currentMonth, onClose }: MeasurementInputProps) {
  const addMeasurement = useMeasurementStore((s) => s.addMeasurement);

  const [month, setMonth] = useState(currentMonth);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [headCirc, setHeadCirc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);
  const controls = useAnimation();
  const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);

  // Lock body scroll when modal is open + animate in
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    controls.start({ y: 0 });
    return () => { document.body.style.overflow = original; };
  }, [controls]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      controls.start({ y: "100%" }).then(onClose);
    } else {
      controls.start({ y: 0 });
    }
  };

  const resetForm = () => {
    setHeight("");
    setWeight("");
    setHeadCirc("");
    setDate(new Date().toISOString().split("T")[0]);
    setMemo("");
  };

  const handleSave = () => {
    if (!height && !weight && !headCirc) return;

    const h = height ? parseFloat(height) : undefined;
    const w = weight ? parseFloat(weight) : undefined;
    const hc = headCirc ? parseFloat(headCirc) : undefined;

    // 영유아(0~12개월) 현실적인 범위 검증
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

    const data = {
      month,
      date,
      height: h,
      weight: w,
      headCircumference: hc,
      memo: memo.trim() || undefined,
    };

    addMeasurement(data);

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      resetForm();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/30"
        style={{ opacity: backdropOpacity }}
      />

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
        className="relative z-10 flex w-full max-w-md flex-col rounded-t-3xl bg-white dark:bg-gray-900 pb-8 sm:rounded-3xl sm:mb-0"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 overscroll-contain">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            실측 데이터 입력
          </h3>
          <button onClick={onClose} className="rounded-full p-2 active:bg-gray-100 dark:active:bg-gray-800">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Month selector */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">월령</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {Array.from({ length: 13 }, (_, i) => i).map((m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                className={`min-w-[44px] rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  month === m
                    ? "bg-emerald-500 text-white "
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">측정일</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
          />
        </div>

        {/* Input fields */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">키 (cm)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-2xl bg-white dark:bg-gray-800 px-3 py-2 text-center text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">몸무게 (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-2xl bg-white dark:bg-gray-800 px-3 py-2 text-center text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">머리둘레 (cm)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={headCirc}
              onChange={(e) => setHeadCirc(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-2xl bg-white dark:bg-gray-800 px-3 py-2 text-center text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Memo */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value.slice(0, 100))}
            placeholder="예: 아침 수유 후 측정"
            maxLength={100}
            rows={2}
            className="w-full resize-none rounded-2xl bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
          />
          <p className="mt-0.5 text-right text-[10px] text-gray-400 dark:text-gray-500">{memo.length}/100</p>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="mb-3 rounded-2xl bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            {validationError}
          </div>
        )}

        {/* Save button */}
        <div className="mb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!height && !weight && !headCirc}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all ${
              saved
                ? "bg-emerald-500 text-white"
                : !height && !weight && !headCirc
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                : "bg-emerald-500 text-white "
            }`}
          >
            <Save size={16} />
            {saved ? "저장 완료!" : "저장"}
          </motion.button>
        </div>


        </div>{/* end scrollable content */}
      </motion.div>
    </motion.div>
  );
}
