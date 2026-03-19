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
import MeasurementInput from "./MeasurementInput";

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

export default function GrowthChart({ currentMonth }: GrowthChartProps) {
  const [chartType, setChartType] = useState<ChartType>("height");
  const [genderMode, setGenderMode] = useState<GenderMode>("male");
  const [showInput, setShowInput] = useState(false);

  const measurements = useMeasurementStore((s) => s.measurements);
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

  return (
    <div className="space-y-4">
      {/* Chart Type Toggle */}
      <div className="flex gap-1.5 rounded-2xl bg-gray-100/80 p-1.5">
        {(["height", "weight", "head"] as ChartType[]).map((type) => {
          const Icon = chartConfig[type].icon;
          const isActive = chartType === type;
          return (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition-all",
                isActive ? "text-gray-800" : "text-gray-400"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="chart-type-bg"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm"
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
                : "text-gray-400 hover:text-gray-600"
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
                <span className="ml-0.5 text-xs font-normal text-gray-400">{config.unit}</span>
              </p>
            </div>
          )}
          {(isBoth || genderMode === "female") && (
            <div className="text-center">
              <p className="text-[10px] text-pink-400">{currentMonth}개월 여아</p>
              <p className="text-xl font-bold text-pink-500">
                {currentFemaleValue}
                <span className="ml-0.5 text-xs font-normal text-gray-400">{config.unit}</span>
              </p>
            </div>
          )}
          {currentBabyValue && (
            <div className="text-center">
              <p className="text-[10px] text-emerald-500">우리 아기</p>
              <p className="text-xl font-bold text-emerald-600">
                {currentBabyValue}
                <span className="ml-0.5 text-xs font-normal text-gray-400">{config.unit}</span>
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Chart */}
      <div className="rounded-2xl bg-white p-3 shadow-sm">
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="band-male" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="band-female" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F472B6" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#F472B6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              tickFormatter={(v) => `${v}m`}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }}
              labelFormatter={(label) => `${label}개월`}
            />

            {/* Male band & line */}
            {(isBoth || genderMode === "male") && (
              <>
                <Area dataKey="maleP97" stroke="none" fill="url(#band-male)" fillOpacity={1} />
                <Area dataKey="maleP3" stroke="none" fill="#FFF8F0" fillOpacity={1} />
                <Line
                  type="monotone"
                  dataKey="maleValue"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#60A5FA", strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: "#60A5FA", strokeWidth: 2, stroke: "#fff" }}
                  name="남아 평균"
                />
              </>
            )}

            {/* Female band & line */}
            {(isBoth || genderMode === "female") && (
              <>
                <Area dataKey="femaleP97" stroke="none" fill="url(#band-female)" fillOpacity={1} />
                <Area dataKey="femaleP3" stroke="none" fill="#FFF8F0" fillOpacity={1} />
                <Line
                  type="monotone"
                  dataKey="femaleValue"
                  stroke="#F472B6"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#F472B6", strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: "#F472B6", strokeWidth: 2, stroke: "#fff" }}
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
              <ReferenceDot x={currentMonth} y={currentMaleValue} r={6} fill="#60A5FA" stroke="#fff" strokeWidth={2} />
            )}
            {(isBoth || genderMode === "female") && currentFemaleValue && (
              <ReferenceDot x={currentMonth} y={currentFemaleValue} r={6} fill="#F472B6" stroke="#fff" strokeWidth={2} />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-400">
          {(isBoth || genderMode === "male") && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
              남아 평균
            </span>
          )}
          {(isBoth || genderMode === "female") && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-pink-400" />
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
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 py-3 text-sm font-medium text-emerald-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
      >
        <Plus size={16} />
        우리 아기 실측 데이터 입력
      </motion.button>

      <p className="text-center text-[10px] text-gray-400">
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
