"use client";

import { useState, useMemo } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceDot,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ruler,
  Weight,
  Circle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { growthData, growthRanges } from "@/lib/data/growth-data";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useBabyStore } from "@/lib/store/baby-store";
import { useThemeStore } from "@/lib/store/theme-store";
import MeasurementInput from "./MeasurementInput";

// Custom tooltip
const dataKeyLabels: Record<string, { label: string; color: string }> = {
  maleValue: { label: "남아 평균", color: "#3B82F6" },
  femaleValue: { label: "여아 평균", color: "#EC4899" },
  babyValue: { label: "우리 아기", color: "#10B981" },
  maleP97: { label: "남아 상한 (97%)", color: "#93C5FD" },
  maleP3: { label: "남아 하한 (3%)", color: "#93C5FD" },
  femaleP97: { label: "여아 상한 (97%)", color: "#F9A8D4" },
  femaleP3: { label: "여아 하한 (3%)", color: "#F9A8D4" },
};

function CustomTooltip({ active, payload, label, isDark }: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color?: string }>;
  label?: number;
  isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((p) => !String(p.dataKey).endsWith("P3"));
  return (
    <div
      style={{
        borderRadius: 12,
        boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.12)",
        backgroundColor: isDark ? "#1F2937" : "#fff",
        padding: "10px 14px",
        fontSize: 12,
      }}
    >
      <p style={{ color: isDark ? "#D1D5DB" : "#6B7280", fontWeight: 600, marginBottom: 6 }}>{label}개월</p>
      {items.map((entry) => {
        const info = dataKeyLabels[entry.dataKey];
        if (!info) return null;
        return (
          <div key={entry.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: info.color, flexShrink: 0 }} />
            <span style={{ color: isDark ? "#E5E7EB" : "#374151" }}>{info.label}:</span>
            <span style={{ fontWeight: 700, color: info.color }}>
              {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface GrowthChartProps {
  currentMonth: number;
}

type ChartType = "height" | "weight" | "head";
type GenderMode = "male" | "female" | "both";

const chartConfig: Record<ChartType, { label: string; unit: string; icon: typeof Ruler; color: string }> = {
  height: { label: "키", unit: "cm", icon: Ruler, color: "cyan" },
  weight: { label: "몸무게", unit: "kg", icon: Weight, color: "violet" },
  head: { label: "머리둘레", unit: "cm", icon: Circle, color: "amber" },
};

function getValueKey(chartType: ChartType, gender: "male" | "female") {
  if (chartType === "height") return gender === "male" ? "maleHeight" : "femaleHeight";
  if (chartType === "weight") return gender === "male" ? "maleWeight" : "femaleWeight";
  return gender === "male" ? "maleHead" : "femaleHead";
}

function getMeasurementKey(chartType: ChartType): "height" | "weight" | "headCircumference" {
  if (chartType === "height") return "height";
  if (chartType === "weight") return "weight";
  return "headCircumference";
}

function estimatePercentile(value: number, p3: number, p50: number, p97: number): number {
  if (value <= p3) return Math.max(1, Math.round((value / p3) * 3));
  if (value >= p97) return Math.min(99, Math.round(97 + ((value - p97) / (p97 - p50)) * 3));
  if (value <= p50) {
    const ratio = (value - p3) / (p50 - p3);
    return Math.round(3 + ratio * 47);
  }
  const ratio = (value - p50) / (p97 - p50);
  return Math.round(50 + ratio * 47);
}

function getPercentileLabel(pct: number): { text: string; color: string; bgColor: string } {
  if (pct >= 75) return { text: `상위 ${100 - pct}%`, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/30" };
  if (pct >= 50) return { text: `상위 ${100 - pct}%`, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" };
  if (pct >= 25) return { text: `상위 ${100 - pct}%`, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-950/30" };
  return { text: `상위 ${100 - pct}%`, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950/30" };
}

export default function GrowthChart({ currentMonth }: GrowthChartProps) {
  const babyGender = useBabyStore((s) => s.profile?.gender);
  const babyName = useBabyStore((s) => s.profile?.name) || "아기";
  const [chartType, setChartType] = useState<ChartType>("height");
  const [genderMode, setGenderMode] = useState<GenderMode>(babyGender || "male");
  const [showInput, setShowInput] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const measurements = useMeasurementStore((s) => s.measurements);
  const deleteMeasurement = useMeasurementStore((s) => s.deleteMeasurement);
  const isDark = useThemeStore((s) => s.theme === "dark");

  const latestByMonth = useMemo(() => {
    const map = new Map<number, typeof measurements[number]>();
    const sorted = [...measurements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    for (const m of sorted) {
      if (!map.has(m.month)) map.set(m.month, m);
    }
    return map;
  }, [measurements]);

  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [measurements]);

  const config = chartConfig[chartType];
  const isBoth = genderMode === "both";
  const primaryGender: "male" | "female" = isBoth ? "male" : genderMode as "male" | "female";

  const chartData = growthData.map((d, i) => {
    const maleRange = growthRanges.male[chartType][i];
    const femaleRange = growthRanges.female[chartType][i];
    const measurement = latestByMonth.get(d.month);
    const measKey = getMeasurementKey(chartType);
    const babyValue = measurement ? measurement[measKey] : undefined;
    const result: Record<string, unknown> = {
      month: d.month, label: d.label,
      maleValue: d[getValueKey(chartType, "male")],
      femaleValue: d[getValueKey(chartType, "female")],
      maleP3: maleRange.p3, maleP97: maleRange.p97,
      femaleP3: femaleRange.p3, femaleP97: femaleRange.p97,
    };
    if (babyValue !== undefined) result.babyValue = babyValue;
    return result;
  });

  const currentMaleValue = growthData[currentMonth]?.[getValueKey(chartType, "male")];
  const currentFemaleValue = growthData[currentMonth]?.[getValueKey(chartType, "female")];
  const currentBabyMeasurement = latestByMonth.get(currentMonth);
  const currentBabyValue = currentBabyMeasurement?.[getMeasurementKey(chartType)];
  const hasBabyData = chartData.some((d) => d.babyValue !== undefined);

  // Percentile calculations for all 3 metrics
  const percentiles = useMemo(() => {
    if (isBoth) return null;
    const gender = primaryGender;
    const result: Record<string, { value: number; pct: number; label: ReturnType<typeof getPercentileLabel> } | null> = {};
    const latestM = latestByMonth.get(currentMonth);
    if (!latestM) return null;

    for (const type of ["height", "weight", "head"] as ChartType[]) {
      const key = getMeasurementKey(type);
      const val = latestM[key];
      const rangeData = growthRanges[gender]?.[type]?.[currentMonth];
      const p50 = growthData[currentMonth]?.[getValueKey(type, gender)];
      if (val !== undefined && rangeData && p50) {
        const pct = estimatePercentile(val, rangeData.p3, p50, rangeData.p97);
        result[type] = { value: val, pct, label: getPercentileLabel(pct) };
      } else {
        result[type] = null;
      }
    }
    return result;
  }, [currentMonth, primaryGender, isBoth, latestByMonth]);

  // Growth trend (compare previous month)
  const growthTrend = useMemo(() => {
    const curr = latestByMonth.get(currentMonth);
    const prev = latestByMonth.get(currentMonth - 1);
    if (!curr || !prev) return null;
    return {
      height: curr.height && prev.height ? +(curr.height - prev.height).toFixed(1) : null,
      weight: curr.weight && prev.weight ? +(curr.weight - prev.weight).toFixed(1) : null,
    };
  }, [currentMonth, latestByMonth]);

  const babyPercentile = useMemo(() => {
    if (!currentBabyValue || isBoth) return null;
    const rangeData = growthRanges[primaryGender]?.[chartType]?.[currentMonth];
    const p50 = growthData[currentMonth]?.[getValueKey(chartType, primaryGender)];
    if (!rangeData || !p50) return null;
    const pct = estimatePercentile(currentBabyValue, rangeData.p3, p50, rangeData.p97);
    return getPercentileLabel(pct);
  }, [currentBabyValue, currentMonth, chartType, primaryGender, isBoth]);

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const child = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-4 pb-6"
    >
      {/* ── Summary Hero Card ── */}
      <motion.div
        variants={child}
        className="relative overflow-hidden rounded-2xl bg-[#7C5CFC] p-5 text-white shadow-[0_4px_16px_rgb(0,0,0,0.08)]"
      >

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-white/80" />
            <h2 className="text-sm font-bold text-white/90">{babyName}의 성장 현황</h2>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">{currentMonth}개월</span>
          </div>

          {hasBabyData && latestByMonth.get(currentMonth) ? (
            <div className="grid grid-cols-3 gap-3">
              {([
                { key: "height" as const, label: "키", unit: "cm", icon: Ruler },
                { key: "weight" as const, label: "몸무게", unit: "kg", icon: Weight },
                { key: "head" as const, label: "머리둘레", unit: "cm", icon: Circle },
              ]).map(({ key, label, unit, icon: Icon }) => {
                const m = latestByMonth.get(currentMonth);
                const val = m?.[getMeasurementKey(key)];
                return (
                  <div key={key} className="rounded-2xl bg-white/15 backdrop-blur-sm p-3 text-center">
                    <Icon size={14} className="mx-auto mb-1 text-white/70" />
                    <p className="text-[20px] font-black leading-tight">
                      {val !== undefined ? val : "-"}
                    </p>
                    <p className="text-[11px] text-white/60 mt-0.5">{label} ({unit})</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-4 text-center">
              <p className="text-sm text-white/80">아직 {currentMonth}개월 실측 데이터가 없어요</p>
              <p className="text-xs text-white/50 mt-1">아래 버튼으로 기록해 보세요</p>
            </div>
          )}

          {/* Growth trend */}
          {growthTrend && (
            <div className="mt-3 flex items-center gap-3">
              {growthTrend.height !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                  {growthTrend.height > 0 ? <ArrowUpRight size={12} /> : growthTrend.height < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                  키 {growthTrend.height > 0 ? "+" : ""}{growthTrend.height}cm
                </span>
              )}
              {growthTrend.weight !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                  {growthTrend.weight > 0 ? <ArrowUpRight size={12} /> : growthTrend.weight < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                  몸무게 {growthTrend.weight > 0 ? "+" : ""}{growthTrend.weight}kg
                </span>
              )}
              <span className="text-[11px] text-white/40">vs 전월</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Percentile Cards ── */}
      {percentiles && (
        <motion.div variants={child} className="grid grid-cols-3 gap-2.5">
          {([
            { key: "height" as const, label: "키", unit: "cm", icon: Ruler },
            { key: "weight" as const, label: "몸무게", unit: "kg", icon: Weight },
            { key: "head" as const, label: "머리둘레", unit: "cm", icon: Circle },
          ]).map(({ key, label, icon: Icon }) => {
            const data = percentiles[key];
            if (!data) return (
              <div key={key} className="rounded-2xl bg-white dark:bg-stone-900 p-3 text-center border border-stone-200 dark:border-stone-700 shadow-[0_2px_8px_rgb(0,0,0,0.03)]">
                <Icon size={14} className="mx-auto mb-1 text-gray-300 dark:text-gray-600" />
                <p className="text-[11px] text-stone-400">{label}</p>
                <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1">미입력</p>
              </div>
            );
            return (
              <div key={key} className={cn("rounded-2xl p-3 text-center border shadow-[0_2px_8px_rgb(0,0,0,0.03)]", data.label.bgColor, "border-transparent")}>
                <Icon size={14} className={cn("mx-auto mb-1", data.label.color)} />
                <p className="text-[11px] text-stone-500 dark:text-stone-400">{label}</p>
                <p className={cn("text-[13px] font-extrabold mt-0.5", data.label.color)}>{data.label.text}</p>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ── WHO Comparison Card ── */}
      {hasBabyData && !isBoth && (
        <motion.div
          variants={child}
          className="rounded-2xl border border-stone-200 bg-white dark:bg-stone-900 dark:border-stone-700 p-4 shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
        >
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-stone-400" />
            <p className="text-[12px] font-bold text-gray-700 dark:text-gray-300">WHO 평균 비교 ({currentMonth}개월 {primaryGender === "male" ? "남아" : "여아"})</p>
          </div>
          <div className="space-y-2">
            {([
              { key: "height" as const, label: "키", unit: "cm" },
              { key: "weight" as const, label: "몸무게", unit: "kg" },
              { key: "head" as const, label: "머리둘레", unit: "cm" },
            ]).map(({ key, label, unit }) => {
              const m = latestByMonth.get(currentMonth);
              const val = m?.[getMeasurementKey(key)];
              const whoVal = growthData[currentMonth]?.[getValueKey(key, primaryGender)];
              if (val === undefined || !whoVal) return null;
              const diff = +(val - whoVal).toFixed(1);
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-400 dark:text-stone-500">WHO {whoVal}{unit}</span>
                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">우리 아기 {val}{unit}</span>
                    <span className={cn("text-[11px] font-bold", diff > 0 ? "text-emerald-500" : diff < 0 ? "text-orange-500" : "text-stone-400")}>
                      ({diff > 0 ? "+" : ""}{diff})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Chart Section ── */}
      <motion.div variants={child} className="rounded-2xl border border-stone-200 bg-white dark:bg-stone-900 dark:border-stone-700 p-4 shadow-[0_2px_8px_rgb(0,0,0,0.06)]">
        {/* Chart Type Toggle */}
        <div className="flex gap-1.5 rounded-[16px] bg-gray-100/80 dark:bg-stone-800 p-1 mb-3">
          {(["height", "weight", "head"] as ChartType[]).map((type) => {
            const Icon = chartConfig[type].icon;
            const isActive = chartType === type;
            return (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition-all",
                  isActive ? "text-stone-800 dark:text-stone-100" : "text-stone-400 dark:text-stone-500"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="chart-type-bg"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-stone-700 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  <Icon size={13} />
                  {chartConfig[type].label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gender Toggle */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {([
            { key: "male", label: "남아", activeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
            { key: "female", label: "여아", activeClass: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400" },
            { key: "both", label: "비교", activeClass: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" },
          ] as const).map(({ key, label, activeClass }) => (
            <button
              key={key}
              onClick={() => setGenderMode(key)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
                genderMode === key ? activeClass : "text-stone-400 dark:text-stone-500"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Current Value Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${chartType}-${genderMode}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-center gap-4 mb-3"
          >
            {(isBoth || genderMode === "male") && (
              <div className="text-center">
                <p className="text-[11px] text-blue-400">{currentMonth}개월 남아</p>
                <p className="text-lg font-bold text-blue-500">
                  {currentMaleValue}<span className="ml-0.5 text-xs font-normal text-stone-400">{config.unit}</span>
                </p>
              </div>
            )}
            {(isBoth || genderMode === "female") && (
              <div className="text-center">
                <p className="text-[11px] text-pink-400">{currentMonth}개월 여아</p>
                <p className="text-lg font-bold text-pink-500">
                  {currentFemaleValue}<span className="ml-0.5 text-xs font-normal text-stone-400">{config.unit}</span>
                </p>
              </div>
            )}
            {currentBabyValue && (
              <div className="text-center">
                <p className="text-[11px] text-emerald-500">우리 아기</p>
                <p className="text-lg font-bold text-emerald-600">
                  {currentBabyValue}<span className="ml-0.5 text-xs font-normal text-stone-400">{config.unit}</span>
                </p>
                {babyPercentile && (
                  <p className={cn("text-[11px] font-semibold", babyPercentile.color)}>{babyPercentile.text}</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="band-male" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={isDark ? 0.25 : 0.2} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={isDark ? 0.08 : 0.05} />
              </linearGradient>
              <linearGradient id="band-female" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F472B6" stopOpacity={isDark ? 0.25 : 0.2} />
                <stop offset="100%" stopColor="#F472B6" stopOpacity={isDark ? 0.08 : 0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f0f0f0"} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickFormatter={(v) => `${v}m`} axisLine={{ stroke: isDark ? "#374151" : "#E5E7EB" }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />

            {(isBoth || genderMode === "male") && (
              <>
                <Area dataKey="maleP97" stroke="none" fill="url(#band-male)" fillOpacity={1} name="남아 상한 (97%)" />
                <Area dataKey="maleP3" stroke="none" fill={isDark ? "#1F2937" : "#FFF8F0"} fillOpacity={1} name="남아 하한 (3%)" />
                <Line type="monotone" dataKey="maleValue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2.5, fill: "#3B82F6", strokeWidth: 0 }} activeDot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: isDark ? "#1F2937" : "#fff" }} name="남아 평균" />
              </>
            )}
            {(isBoth || genderMode === "female") && (
              <>
                <Area dataKey="femaleP97" stroke="none" fill="url(#band-female)" fillOpacity={1} name="여아 상한 (97%)" />
                <Area dataKey="femaleP3" stroke="none" fill={isDark ? "#1F2937" : "#FFF8F0"} fillOpacity={1} name="여아 하한 (3%)" />
                <Line type="monotone" dataKey="femaleValue" stroke="#EC4899" strokeWidth={2} dot={{ r: 2.5, fill: "#EC4899", strokeWidth: 0 }} activeDot={{ r: 4, fill: "#EC4899", strokeWidth: 2, stroke: isDark ? "#1F2937" : "#fff" }} name="여아 평균" />
              </>
            )}
            {hasBabyData && (
              <Line type="monotone" dataKey="babyValue" stroke="#10B981" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3.5, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }} connectNulls name="우리 아기" />
            )}
            {(isBoth || genderMode === "male") && currentMaleValue && (
              <ReferenceDot x={currentMonth} y={currentMaleValue} r={5} fill="#3B82F6" stroke={isDark ? "#1F2937" : "#fff"} strokeWidth={2} />
            )}
            {(isBoth || genderMode === "female") && currentFemaleValue && (
              <ReferenceDot x={currentMonth} y={currentFemaleValue} r={5} fill="#EC4899" stroke={isDark ? "#1F2937" : "#fff"} strokeWidth={2} />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-stone-400 dark:text-stone-500">
          {(isBoth || genderMode === "male") && (
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-blue-500" />남아</span>
          )}
          {(isBoth || genderMode === "female") && (
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-pink-500" />여아</span>
          )}
          {hasBabyData && (
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />우리 아기</span>
          )}
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-4 rounded-sm bg-gray-200/50" />정상 범위</span>
        </div>
      </motion.div>

      {/* ── Measurement History ── */}
      {sortedMeasurements.length > 0 && (
        <motion.div
          variants={child}
          className="rounded-2xl border border-stone-200 bg-white dark:bg-stone-900 dark:border-stone-700 shadow-[0_2px_8px_rgb(0,0,0,0.06)] overflow-hidden"
        >
          <button onClick={() => setShowHistory(!showHistory)} className="flex w-full items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-emerald-500" />
              <span className="text-[13px] font-bold text-stone-800 dark:text-stone-100">실측 기록</span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {sortedMeasurements.length}건
              </span>
            </div>
            {showHistory ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {sortedMeasurements.map((m) => (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-stone-800 px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">{m.month}개월</span>
                          <span className="text-[11px] text-stone-400 dark:text-stone-500">{m.date}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                          {m.height !== undefined && <span>키 <b className="text-blue-500">{m.height}</b>cm</span>}
                          {m.weight !== undefined && <span>몸무게 <b className="text-pink-500">{m.weight}</b>kg</span>}
                          {m.headCircumference !== undefined && <span>머리둘레 <b className="text-purple-500">{m.headCircumference}</b>cm</span>}
                        </div>
                        {m.memo && <p className="mt-1 text-[11px] text-stone-400 dark:text-stone-500 truncate">{m.memo}</p>}
                      </div>
                      <button onClick={() => deleteMeasurement(m.id)} className="flex-shrink-0 rounded-full p-2 text-gray-300 dark:text-gray-600 active:bg-red-50 dark:active:bg-red-950/30 active:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Add Measurement Button ── */}
      <motion.button
        variants={child}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowInput(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7C5CFC] py-4 text-[14px] font-bold text-white shadow-[0_4px_16px_rgb(124,92,252,0.25)] transition-all active:bg-[#6B4CE0]"
      >
        <Plus size={18} strokeWidth={2.5} />
        실측 데이터 입력하기
      </motion.button>

      <motion.p variants={child} className="text-center text-[11px] text-stone-400 dark:text-stone-500">
        * WHO 영유아 성장 기준 (WHO Child Growth Standards) 기반
      </motion.p>

      {showInput && (
        <MeasurementInput currentMonth={currentMonth} onClose={() => setShowInput(false)} />
      )}
    </motion.div>
  );
}
