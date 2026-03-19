"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Trash2 } from "lucide-react";
import { useMeasurementStore } from "@/lib/store/measurement-store";

interface MeasurementInputProps {
  currentMonth: number;
  onClose: () => void;
}

export default function MeasurementInput({ currentMonth, onClose }: MeasurementInputProps) {
  const addMeasurement = useMeasurementStore((s) => s.addMeasurement);
  const measurements = useMeasurementStore((s) => s.measurements);
  const deleteMeasurement = useMeasurementStore((s) => s.deleteMeasurement);

  const [month, setMonth] = useState(currentMonth);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [headCirc, setHeadCirc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saved, setSaved] = useState(false);

  const existingForMonth = measurements
    .filter((m) => m.month === month)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSave = () => {
    if (!height && !weight && !headCirc) return;
    addMeasurement({
      month,
      date,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      headCircumference: headCirc ? parseFloat(headCirc) : undefined,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setHeight("");
      setWeight("");
      setHeadCirc("");
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md rounded-t-3xl bg-white px-5 pb-8 pt-4"
      >
        {/* Handle bar */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">실측 데이터 입력</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Month selector */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-gray-500">월령</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {Array.from({ length: 13 }, (_, i) => i).map((m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                className={`min-w-[44px] rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  month === m
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-gray-500">측정일</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </div>

        {/* Input fields */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">키 (cm)</label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-center text-sm focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">몸무게 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-center text-sm focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">머리둘레 (cm)</label>
            <input
              type="number"
              step="0.1"
              value={headCirc}
              onChange={(e) => setHeadCirc(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-center text-sm focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!height && !weight && !headCirc}
          className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : !height && !weight && !headCirc
              ? "bg-gray-100 text-gray-400"
              : "bg-emerald-500 text-white shadow-md"
          }`}
        >
          <Save size={16} />
          {saved ? "저장 완료!" : "저장"}
        </motion.button>

        {/* Existing records for this month */}
        {existingForMonth.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">
              {month}개월 기록 ({existingForMonth.length})
            </p>
            <div className="max-h-32 space-y-1.5 overflow-y-auto">
              {existingForMonth.map((m) => (
                <div key={m.id} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                  <span className="text-[10px] text-gray-400">{m.date}</span>
                  <div className="flex flex-1 gap-2 text-xs text-gray-600">
                    {m.height && <span>키 {m.height}cm</span>}
                    {m.weight && <span>몸무게 {m.weight}kg</span>}
                    {m.headCircumference && <span>머리 {m.headCircumference}cm</span>}
                  </div>
                  <button
                    onClick={() => deleteMeasurement(m.id)}
                    className="rounded-full p-1 text-gray-300 hover:bg-red-50 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
