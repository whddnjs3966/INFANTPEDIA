"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type LogCategory,
  type LogEntry,
  LOG_CATEGORY_CONFIG,
  useDailyLogStore,
} from "@/lib/store/daily-log-store";

interface LogFormProps {
  date: string;
  editEntry?: LogEntry;
  onClose: () => void;
}

const POOP_COLORS = [
  { value: "yellow", label: "노란색", bg: "bg-yellow-300" },
  { value: "green", label: "녹색", bg: "bg-green-400" },
  { value: "brown", label: "갈색", bg: "bg-amber-700" },
  { value: "dark", label: "진한색", bg: "bg-gray-700" },
];

const POOP_TYPES = ["묽음", "보통", "단단함", "물변"];
const BREAST_SIDES: { value: "left" | "right" | "both"; label: string }[] = [
  { value: "left", label: "왼쪽" },
  { value: "right", label: "오른쪽" },
  { value: "both", label: "양쪽" },
];

export default function LogForm({ date, editEntry, onClose }: LogFormProps) {
  const { addEntry, updateEntry } = useDailyLogStore();

  const [category, setCategory] = useState<LogCategory>(editEntry?.category || "formula");
  const [time, setTime] = useState(editEntry?.time || new Date().toTimeString().slice(0, 5));
  const [endTime, setEndTime] = useState(editEntry?.endTime || "");
  const [amount, setAmount] = useState(editEntry?.amount?.toString() || "");
  const [duration, setDuration] = useState(editEntry?.duration?.toString() || "");
  const [side, setSide] = useState<"left" | "right" | "both">(editEntry?.side || "both");
  const [menu, setMenu] = useState(editEntry?.menu || "");
  const [color, setColor] = useState(editEntry?.color || "");
  const [consistency, setConsistency] = useState(editEntry?.consistency || "");
  const [temperature, setTemperature] = useState(editEntry?.temperature?.toString() || "");
  const [note, setNote] = useState(editEntry?.note || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const entry: Omit<LogEntry, "id"> = {
      category,
      date,
      time,
      ...(endTime && { endTime }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(duration && { duration: parseInt(duration) }),
      ...(side && category === "breast_feed" && { side }),
      ...(menu && { menu }),
      ...(color && { color }),
      ...(consistency && { consistency }),
      ...(temperature && { temperature: parseFloat(temperature) }),
      ...(note && { note }),
    };

    if (editEntry) {
      updateEntry(editEntry.id, entry);
    } else {
      addEntry(entry);
    }
    setSaved(true);
    setTimeout(() => onClose(), 800);
  };

  const categories = Object.entries(LOG_CATEGORY_CONFIG) as [LogCategory, typeof LOG_CATEGORY_CONFIG[LogCategory]][];

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
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">
            {editEntry ? "기록 수정" : "새 기록 추가"}
          </h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Category selector */}
        {!editEntry && (
          <div className="mb-4">
            <label className="mb-2 block text-xs text-gray-500">카테고리</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs transition-all",
                    category === key
                      ? "bg-pink-50 font-semibold text-pink-700 shadow-sm ring-1 ring-pink-200"
                      : "bg-gray-50 text-gray-500"
                  )}
                >
                  <span className="text-lg">{cfg.emoji}</span>
                  <span className="text-[10px]">{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time */}
        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-500">시간</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
        </div>

        {/* Category-specific fields */}
        {category === "breast_feed" && (
          <>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-gray-500">수유 위치</label>
              <div className="flex gap-2">
                {BREAST_SIDES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSide(s.value)}
                    className={cn(
                      "flex-1 rounded-xl py-2 text-xs font-medium transition-all",
                      side === s.value ? "bg-pink-100 text-pink-700" : "bg-gray-50 text-gray-500"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-gray-500">수유 시간 (분)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="15"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              />
            </div>
          </>
        )}

        {category === "formula" && (
          <div className="mb-3">
            <label className="mb-1 block text-xs text-gray-500">분유량 (ml)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="120"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
            />
          </div>
        )}

        {category === "baby_food" && (
          <>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-gray-500">이유식량 (ml)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="80"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-gray-500">메뉴</label>
              <input
                type="text"
                value={menu}
                onChange={(e) => setMenu(e.target.value)}
                placeholder="예: 감자미음, 소고기죽"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              />
            </div>
          </>
        )}

        {category === "poop" && (
          <>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-gray-500">색상</label>
              <div className="flex gap-2">
                {POOP_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs transition-all",
                      color === c.value ? "ring-2 ring-amber-400 ring-offset-1" : "bg-gray-50"
                    )}
                  >
                    <span className={cn("h-3 w-3 rounded-full", c.bg)} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-gray-500">형태</label>
              <div className="flex gap-2">
                {POOP_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setConsistency(t)}
                    className={cn(
                      "flex-1 rounded-xl py-2 text-xs font-medium transition-all",
                      consistency === t ? "bg-amber-100 text-amber-700" : "bg-gray-50 text-gray-500"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {category === "sleep" && (
          <>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-gray-500">종료 시간</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-gray-500">수면 시간 (분)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="90"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>
          </>
        )}

        {category === "temperature" && (
          <div className="mb-3">
            <label className="mb-1 block text-xs text-gray-500">체온 (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="36.5"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
            />
          </div>
        )}

        {/* Note (always available) */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-gray-500">
            {category === "memo" ? "메모 내용" : "메모 (선택)"}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모를 입력하세요..."
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
        </div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
            saved ? "bg-green-500 text-white" : "bg-pink-500 text-white shadow-md"
          )}
        >
          <Save size={16} />
          {saved ? "저장 완료!" : editEntry ? "수정" : "저장"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
