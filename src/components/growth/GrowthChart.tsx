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
import { Ruler, Weight, Circle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { growthData, growthRanges } from "@/lib/data/growth-data";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useBabyStore } from "@/lib/store/baby-store";
import { useThemeStore } from "@/lib/store/theme-store";
import MeasurementInput from "./MeasurementInput";

// Custom tooltip with Korean labels and proper colors
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

  // Filter out the P3 entries (they're used to "cut out" the band, not real data)
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
      <p style={{ color: isDark ? "#D1D5DB" : "#6B7280", fontWeight: 600, marginBottom: 6 }}>
        {label}개월
      </p>
      {items.map((entry) => {
        const info = dataKeyLabels[entry.dataKey];
        if (!info) return null;
        return (
          <div key={entry.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: info.color, flexShrink: 0 }} />
            <span style={{ color: isDark ? "#E5E7EB" : "#374151" }}>
              {info.label}:
            </span>
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

const chartConfig: Record<ChartType, { label: string; unit: string; icon: typeof Ruler; maleColor: string; femaleColor: string }> = {
  height: {
    label: "키",
    unit: "cm",
    icon: Ruler,
    maleColor: "#60A5FA",
    femaleColor: "#F472B6",
  },
  weight: {
    label: "몸무게",
    unit: "kg",
    icon: Weight,
    maleColor: "#60A5FA",
    femaleColor: "#F472B6",
  },
  head: {
    label: "머리둘레",
    unit: "cm",
    icon: Circle,
    maleColor: "#60A5FA",
    femaleColor: "#F472B6",
  },
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

// Estimate percentile from p3, p50, p97 using log-normal interpolation
function estimatePercentile(value: number, p3: number, p50: number, p97: number): number {
  if (value <= p3) return Math.max(1, Math.round((value / p3) * 3));
  if (value >= p97) return Math.min(99, Math.round(97 + ((value - p97) / (p97 - p50)) * 3));
  // Interpolate between p3-p50 or p50-p97
  if (value <= p50) {
    const ratio = (value - p3) / (p50 - p3); // 0~1
    return Math.round(3 + ratio * 47); // 3~50
  }
  const ratio = (value - p50) / (p97 - p50); // 0~1
  return Math.round(50 + ratio * 47); // 50~97
}

function getPercentileLabel(pct: number): { text: string; color: string } {
  if (pct >= 75) return { text: `상위 ${100 - pct}%`, color: "text-blue-600" };
  if (pct >= 50) return { text: `상위 ${100 - pct}%`, color: "text-emerald-600" };
  if (pct >= 25) return { text: `상위 ${100 - pct}%`, color: "text-amber-600" };
  return { text: `상위 ${100 - pct}%`, color: "text-orange-600" };
}

export default function GrowthChart({ currentMonth }: GrowthChartProps) {
  const babyGender = useBabyStore((s) => s.profile?.gender);
  const [chartType, setChartType] = useState<ChartType>("height");
  const [genderMode, setGenderMode] = useState<GenderMode>(babyGender || "male");
  const [showInput, setShowInput] = useState(false);

  const measurements = useMeasurementStore((s) => s.measurements);
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
      month: d.month,
      label: d.label,
      maleValue: d[getValueKey(chartType, "male")],
      femaleValue: d[getValueKey(chartType, "female")],
      maleP3: maleRange.p3,
      maleP97: maleRange.p97,
      femaleP3: femaleRange.p3,
      femaleP97: femaleRange.p97,
    };

    if (babyValue !== undefined) {
      result.babyValue = babyValue;
    }

    return result;
  });

  const currentMaleValue = growthData[currentMonth]?.[getValueKey(chartType, "male")];
  const currentFemaleValue = growthData[currentMonth]?.[getValueKey(chartType, "female")];
  const currentBabyMeasurement = latestByMonth.get(currentMonth);
  const currentBabyValue = currentBabyMeasurement?.[getMeasurementKey(chartType)];

  const hasBabyData = chartData.some((d) => d.babyValue !== undefined);

  // Calculate percentile for current month's baby value
  const babyPercentile = useMemo(() => {
    if (!currentBabyValue || isBoth) return null;
    const gender = primaryGender;
    const rangeData = growthRanges[gender]?.[chartType]?.[currentMonth];
    const p50 = growthData[currentMonth]?.[getValueKey(chartType, gender)];
    if (!rangeData || !p50) return null;
    const pct = estimatePercentile(currentBabyValue, rangeData.p3, p50, rangeData.p97);
    return getPercentileLabel(pct);
  }, [currentBabyValue, currentMonth, chartType, primaryGender, isBoth]);

  return (
    <div className="space-y-4">
      {/* Chart Type Toggle */}
      <div className="flex gap-1.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800 p-1.5">
        {(["height", "weight", "head"] as ChartType[]).map((type) => {
          const Icon = chartConfig[type].icon;
          const isActive = chartType === type;
          return (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition-all",
                isActive ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="chart-type-bg"
                  className="absolute inset-0 rounded-xl bg-white dark:bg-gray-700 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <Icon size={14} />
                {chartConfig[type].label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Gender Toggle */}
      <div className="flex items-center justify-center gap-2">
        {([
          { key: "male", label: "👦 남아", activeClass: "bg-blue-100 text-blue-700" },
          { key: "female", label: "👧 여아", activeClass: "bg-pink-100 text-pink-700" },
          { key: "both", label: "👦👧 비교", activeClass: "bg-purple-100 text-purple-700" },
        ] as const).map(({ key, label, activeClass }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGenderMode(key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              genderMode === key
                ? `${activeClass} shadow-sm`
                : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            )}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Current Value Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${chartType}-${genderMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-center gap-4"
        >
          {(isBoth || genderMode === "male") && (
            <div className="text-center">
              <p className="text-[10px] text-blue-400">{currentMonth}개월 남아</p>
              <p className="text-xl font-bold text-blue-500">
                {currentMaleValue}
                <span className="ml-0.5 text-xs font-normal text-gray-400 dark:text-gray-500">{config.unit}</span>
              </p>
            </div>
          )}
          {(isBoth || genderMode === "female") && (
            <div className="text-center">
              <p className="text-[10px] text-pink-400">{currentMonth}개월 여아</p>
              <p className="text-xl font-bold text-pink-500">
                {currentFemaleValue}
                <span className="ml-0.5 text-xs font-normal text-gray-400 dark:text-gray-500">{config.unit}</span>
              </p>
            </div>
          )}
          {currentBabyValue && (
            <div className="text-center">
              <p className="text-[10px] text-emerald-500">우리 아기</p>
              <p className="text-xl font-bold text-emerald-600">
                {currentBabyValue}
                <span className="ml-0.5 text-xs font-normal text-gray-400 dark:text-gray-500">{config.unit}</span>
              </p>
              {babyPercentile && (
                <p className={cn("text-[10px] font-semibold", babyPercentile.color)}>
                  {babyPercentile.text}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Chart */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-3 shadow-sm">
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#9CA3AF" }}
              tickFormatter={(v) => `${v}m`}
              axisLine={{ stroke: isDark ? "#374151" : "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />

            {/* Male band & line */}
            {(isBoth || genderMode === "male") && (
              <>
                <Area dataKey="maleP97" stroke="none" fill="url(#band-male)" fillOpacity={1} name="남아 상한 (97%)" />
                <Area dataKey="maleP3" stroke="none" fill={isDark ? "#1F2937" : "#FFF8F0"} fillOpacity={1} name="남아 하한 (3%)" />
                <Line
                  type="monotone"
                  dataKey="maleValue"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#3B82F6", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#3B82F6", strokeWidth: 2, stroke: isDark ? "#1F2937" : "#fff" }}
                  name="남아 평균"
                />
              </>
            )}

            {/* Female band & line */}
            {(isBoth || genderMode === "female") && (
              <>
                <Area dataKey="femaleP97" stroke="none" fill="url(#band-female)" fillOpacity={1} name="여아 상한 (97%)" />
                <Area dataKey="femaleP3" stroke="none" fill={isDark ? "#1F2937" : "#FFF8F0"} fillOpacity={1} name="여아 하한 (3%)" />
                <Line
                  type="monotone"
                  dataKey="femaleValue"
                  stroke="#EC4899"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#EC4899", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#EC4899", strokeWidth: 2, stroke: isDark ? "#1F2937" : "#fff" }}
                  name="여아 평균"
                />
              </>
            )}

            {/* Baby actual data */}
            {hasBabyData && (
              <Line
                type="monotone"
                dataKey="babyValue"
                stroke="#10B981"
                strokeWidth={2.5}
                strokeDasharray="6 3"
                dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                connectNulls
                name="우리 아기"
              />
            )}

            {/* Current month indicators */}
            {(isBoth || genderMode === "male") && currentMaleValue && (
              <ReferenceDot x={currentMonth} y={currentMaleValue} r={6} fill="#3B82F6" stroke={isDark ? "#1F2937" : "#fff"} strokeWidth={2} />
            )}
            {(isBoth || genderMode === "female") && currentFemaleValue && (
              <ReferenceDot x={currentMonth} y={currentFemaleValue} r={6} fill="#EC4899" stroke={isDark ? "#1F2937" : "#fff"} strokeWidth={2} />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
          {(isBoth || genderMode === "male") && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              남아 평균
            </span>
          )}
          {(isBoth || genderMode === "female") && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-pink-500" />
              여아 평균
            </span>
          )}
          {hasBabyData && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              우리 아기
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-5 rounded-sm bg-gray-200/50" />
            정상 범위
          </span>
        </div>
      </div>

      {/* Add Measurement Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowInput(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:shadow-sm dark:from-emerald-600 dark:to-teal-600"
      >
        <Plus size={18} strokeWidth={2.5} />
        우리 아기 실측 데이터 입력
      </motion.button>

      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
        * WHO 영유아 성장 기준 (WHO Child Growth Standards) 기반
      </p>

      {showInput && (
        <MeasurementInput
          currentMonth={currentMonth}
          onClose={() => setShowInput(false)}
        />
      )}
    </div>
  );
}
