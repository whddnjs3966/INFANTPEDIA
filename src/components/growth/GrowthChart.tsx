"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpen, ChevronDown, ChevronRight, ClipboardList, Pencil, Plus, Syringe, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { growthData, growthRanges } from "@/lib/data/growth-data";
import { useMeasurementStore, type Measurement } from "@/lib/store/measurement-store";
import { useBabyStore } from "@/lib/store/baby-store";
import { useThemeStore } from "@/lib/store/theme-store";
import MeasurementInput from "./MeasurementInput";

interface GrowthChartProps { currentMonth: number }
type ChartType = "height" | "weight" | "head";
type GenderMode = "male" | "female" | "both";

const chartConfig = {
  height: { label: "키", unit: "cm", key: "height" as const },
  weight: { label: "몸무게", unit: "kg", key: "weight" as const },
  head: { label: "머리둘레", unit: "cm", key: "headCircumference" as const },
};

function referenceValue(type: ChartType, gender: "male" | "female", month: number) {
  const row = growthData[month];
  if (!row) return undefined;
  if (type === "height") return gender === "male" ? row.maleHeight : row.femaleHeight;
  if (type === "weight") return gender === "male" ? row.maleWeight : row.femaleWeight;
  return gender === "male" ? row.maleHead : row.femaleHead;
}

export default function GrowthChart({ currentMonth }: GrowthChartProps) {
  const profile = useBabyStore((state) => state.profile);
  const legacyOwnerId = useBabyStore((state) => state.legacyOwnerId);
  const allMeasurements = useMeasurementStore((state) => state.measurements);
  const deleteMeasurement = useMeasurementStore((state) => state.deleteMeasurement);
  const isDark = useThemeStore((state) => state.theme === "dark");
  const [chartType, setChartType] = useState<ChartType>("height");
  const [genderMode, setGenderMode] = useState<GenderMode>(profile?.gender || "male");
  const [showReference, setShowReference] = useState(false);
  const [inputOpen, setShowInput] = useState(false);
  const [editing, setEditing] = useState<Measurement | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [notice, setNotice] = useState("");
  const fillId = useId();
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = profile?.id;
  const requestedAdd = searchParams.get("record") === "add";
  const showInput = requestedAdd || inputOpen;
  const activeEditing = requestedAdd ? undefined : editing;

  const measurements = useMemo(() => allMeasurements
    .filter((record) => !!profileId && (record.babyId === profileId || (!record.babyId && legacyOwnerId === profileId)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)), [allMeasurements, profileId, legacyOwnerId]);
  const config = chartConfig[chartType];
  const metricRecords = measurements.filter((record) => record[config.key] !== undefined);
  const latestMetric = metricRecords[0];
  const trend = metricRecords.length > 1 ? Number(((metricRecords[0][config.key] || 0) - (metricRecords[1][config.key] || 0)).toFixed(1)) : null;
  const chartData = growthData.map((row) => {
    const maleRange = growthRanges.male[chartType][row.month];
    const femaleRange = growthRanges.female[chartType][row.month];
    const measured = metricRecords.find((record) => record.month === row.month);
    return {
      month: row.month,
      male: referenceValue(chartType, "male", row.month),
      female: referenceValue(chartType, "female", row.month),
      maleBand: [maleRange.p3, maleRange.p97],
      femaleBand: [femaleRange.p3, femaleRange.p97],
      baby: measured?.[config.key],
    };
  });
  const measuredMonths = chartData.filter((row) => row.baby !== undefined).map((row) => row.month);
  const firstMonth = measuredMonths[0];
  const lastMonth = measuredMonths.at(-1);
  const plottedData = showReference || firstMonth === undefined || lastMonth === undefined
    ? chartData
    : chartData.filter((row) => row.month >= Math.max(0, firstMonth - 1) && row.month <= Math.min(12, lastMonth + 1));
  const visibleRecords = showAll ? measurements : measurements.slice(0, 5);

  const closeInput = () => {
    setShowInput(false); setEditing(undefined);
    if (searchParams.has("record")) {
      const params = new URLSearchParams(searchParams.toString()); params.delete("record");
      router.replace(`/growth${params.size ? `?${params}` : ""}`, { scroll: false });
    }
  };

  return (
    <div className="@container space-y-3 pb-8">
      {notice && <p role="status" className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">{notice}</p>}

      <section data-growth-chart aria-labelledby="growth-chart-title" className="surface-card min-w-0 p-4">
        <h2 id="growth-chart-title" className="sr-only">성장 변화</h2>
        <div className="flex items-center justify-between gap-2">
          <div data-growth-metric={chartType} className="min-w-0">
            <p className="text-base font-semibold">최근 {config.label}</p>
            {latestMetric ? <>
              <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 font-bold leading-tight tracking-tight tabular-nums text-[var(--brand)]">
                <span className="text-[2rem]">{latestMetric[config.key]}</span>
                <span className="text-base font-medium text-[var(--muted-foreground)]">{config.unit}</span>
              </p>
              <p className="mt-1 flex flex-wrap gap-x-2 text-sm leading-snug text-[var(--muted-foreground)]">
                <time dateTime={latestMetric.date} className="whitespace-nowrap">{latestMetric.date}</time>
                {trend !== null && <span>이전보다 <strong className="font-semibold text-[var(--foreground)]">{trend > 0 ? "+" : ""}{trend}{config.unit}</strong></span>}
              </p>
            </> : <p className="mt-1 break-words text-sm leading-relaxed text-[var(--muted-foreground)]">아직 {config.label} 기록이 없어요.</p>}
          </div>
          <Image src="/images/redesign/ruler.webp" alt="" width={100} height={100} className="record-illustration shrink-0" />
        </div>
        {(latestMetric || showReference) && <div className="mt-2" role="img" aria-label={`${profile?.name || "아기"}의 ${config.label} 변화. 가로축 월령, 세로축 ${config.unit}. 측정한 값은 아래 기록 목록에서도 확인할 수 있어요.`}>
          <ResponsiveContainer width="100%" height={166}>
            <ComposedChart data={plottedData} margin={{ top: 8, right: 10, left: -8, bottom: 2 }} accessibilityLayer>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? "#BDC5DA" : "#687086" }} tickFormatter={(value) => `${value}개월`} tickLine={false} minTickGap={12} />
              <YAxis width={48} unit={config.unit} tick={{ fontSize: 12, fill: isDark ? "#BDC5DA" : "#687086" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip formatter={(value, name) => [Array.isArray(value) ? value.join(" ~ ") + config.unit : `${value}${config.unit}`, name]} labelFormatter={(label) => `${label}개월`} contentStyle={{ borderRadius: 12, backgroundColor: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)", fontSize: 13 }} />
              {showReference && (genderMode === "male" || genderMode === "both") && <><Area dataKey="maleBand" stroke="none" fill="#3b82f6" fillOpacity={0.12} name="남아 참고 범위" isAnimationActive={false} /><Line dataKey="male" name="남아 중앙값" type="monotone" stroke="#2563eb" strokeWidth={2} dot={false} strokeDasharray="3 4" isAnimationActive={false} /></>}
              {showReference && (genderMode === "female" || genderMode === "both") && <><Area dataKey="femaleBand" stroke="none" fill="#db2777" fillOpacity={0.1} name="여아 참고 범위" isAnimationActive={false} /><Line dataKey="female" name="여아 중앙값" type="monotone" stroke="#db2777" strokeWidth={2} dot={false} strokeDasharray="5 3" isAnimationActive={false} /></>}
              {latestMetric && <Area dataKey="baby" name="우리 아기 측정값" type="linear" stroke="var(--brand)" strokeWidth={2.5} fill={`url(#${fillId})`} dot={{ r: 3.5, strokeWidth: 2, fill: "var(--card)" }} connectNulls isAnimationActive={false} />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>}
        {showReference && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted-foreground)]">
          {latestMetric && <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-[var(--brand)]" aria-hidden />우리 아기</span>}
          {genderMode !== "female" && <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-blue-600" aria-hidden />남아 중앙값</span>}
          {genderMode !== "male" && <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-pink-600" aria-hidden />여아 중앙값</span>}
        </div>}
        <div className="mt-2 flex flex-wrap gap-1 border-t border-[var(--border)] pt-2" role="group" aria-label="성장 항목 선택">
          {(["height", "weight", "head"] as ChartType[]).map((type) => (
            <button key={type} type="button" aria-pressed={chartType === type} onClick={() => setChartType(type)} className={cn("min-h-11 flex-1 whitespace-nowrap rounded-xl px-2 py-1.5 text-sm font-semibold transition-colors motion-reduce:transition-none", chartType === type ? "bg-[var(--accent-soft)] text-[var(--brand)]" : "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]")}>{chartConfig[type].label}</button>
          ))}
        </div>
      </section>

      <button type="button" onClick={() => { setEditing(undefined); setShowInput(true); }} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-4 py-2.5 text-base font-semibold text-[var(--brand-foreground)] transition-colors hover:bg-[var(--brand-pressed)] motion-reduce:transition-none"><Plus size={19} aria-hidden />성장 기록 추가</button>

      <section aria-labelledby="measurement-history-title">
        <details className="group record-disclosure surface-card" data-measurement-history>
        <summary className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-2xl px-4 py-2.5">
          <ClipboardList size={18} aria-hidden className="shrink-0 text-[var(--brand)]" />
          <h2 id="measurement-history-title" className="min-w-0 flex-1 text-base font-semibold">측정 기록 <span className="font-medium text-[var(--muted-foreground)]">{measurements.length}건</span></h2>
          <ChevronDown size={17} aria-hidden className="shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="space-y-3 border-t border-[var(--border)] px-4 py-3">
        {measurements.length === 0 ? <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">아직 측정 기록이 없어요. 위의 ‘성장 기록 추가’로 첫 기록을 남겨보세요.</p> : (
          <ul className="divide-y divide-[var(--border)]">
            {visibleRecords.map((record) => (
              <li key={record.id} className="py-3 first:pt-0 last:pb-0">
                <p className="flex flex-wrap items-center gap-2 text-base font-bold text-[var(--foreground)]">{record.date} <span className="rounded-lg bg-[var(--surface-bg)] px-2 py-1 text-sm font-medium text-[var(--muted-foreground)]">{record.month}개월</span></p>
                <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-base text-stone-700 dark:text-stone-200">
                  {record.height !== undefined && <div className="flex gap-1"><dt>키</dt><dd className="font-semibold">{record.height}cm</dd></div>}
                  {record.weight !== undefined && <div className="flex gap-1"><dt>몸무게</dt><dd className="font-semibold">{record.weight}kg</dd></div>}
                  {record.headCircumference !== undefined && <div className="flex gap-1"><dt>머리둘레</dt><dd className="font-semibold">{record.headCircumference}cm</dd></div>}
                </dl>
                {record.memo && <p className="mt-2 break-words text-sm leading-relaxed text-stone-600 dark:text-stone-300">{record.memo}</p>}
                {deleteId === record.id ? (
                  <div className="mt-3 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
                    <p role="alert" className="text-sm font-semibold text-red-800 dark:text-red-200">이 측정 기록을 삭제할까요?</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setDeleteId(null)} className="min-h-12 rounded-xl bg-white px-4 text-sm font-bold text-stone-800 dark:bg-[var(--surface-muted)] dark:text-stone-100">기록 유지</button>
                      <button type="button" onClick={() => { const removed = deleteMeasurement(record.id, profile?.id); setDeleteId(null); setNotice(removed ? "선택한 측정 기록을 삭제했어요." : "현재 아기와 기록을 확인한 뒤 다시 시도해 주세요."); }} className="min-h-12 rounded-xl bg-red-700 px-4 text-sm font-bold text-white">삭제하기</button>
                    </div>
                  </div>
                ) : <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-2"><button type="button" aria-label={`${record.date} 측정 기록 수정`} onClick={() => { setEditing(record); setShowInput(true); }} className="flex min-h-12 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-[var(--brand)] hover:bg-[var(--accent-soft)]"><Pencil size={16} aria-hidden />수정</button><button type="button" aria-label={`${record.date} 측정 기록 삭제`} onClick={() => setDeleteId(record.id)} className="flex min-h-12 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[var(--muted-foreground)] hover:bg-[var(--surface-bg)]"><Trash2 size={16} aria-hidden />삭제</button></div>}
              </li>
            ))}
          </ul>
        )}
        {measurements.length > 5 && <button type="button" onClick={() => setShowAll(!showAll)} aria-expanded={showAll} className="min-h-12 w-full rounded-2xl border border-stone-300 px-4 text-base font-semibold text-stone-700 dark:border-stone-600 dark:text-stone-200">{showAll ? "최근 5건만 보기" : `기록 ${measurements.length}건 모두 보기`}</button>}
        </div>
        </details>
      </section>

      <details data-growth-reference className="group record-disclosure surface-card" onToggle={(event) => setShowReference(event.currentTarget.open)}>
        <summary className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-2xl px-4 py-2.5 text-base font-semibold">
          <BookOpen size={18} aria-hidden className="shrink-0 text-[var(--brand)]" />
          <span className="min-w-0 flex-1">WHO 참고 기준과 비교 보기</span>
          <ChevronDown size={17} aria-hidden className="shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="border-t border-[var(--border)] px-4 py-3">
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">WHO 성장 기준의 중앙값과 3~97백분위 참고 범위를 보여줘요. 성장 상태는 여러 번의 측정값과 아기의 상태를 함께 살펴요. 그래프에는 월령별 마지막 측정값을 표시해요.</p>
        <div role="group" aria-label="성장 참고 기준 선택" className="mt-3 flex flex-wrap gap-1.5">
          {([{ key: "male", label: "남아 기준" }, { key: "female", label: "여아 기준" }, { key: "both", label: "두 기준 비교" }] as const).map((item) => <button type="button" key={item.key} aria-pressed={genderMode === item.key} onClick={() => setGenderMode(item.key)} className={cn("min-h-11 min-w-0 max-w-full break-words rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors motion-reduce:transition-none", genderMode === item.key ? "border-[var(--brand)] bg-[var(--accent-soft)] text-[var(--brand)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-bg)]")}>{item.label}</button>)}
        </div>
        {genderMode === "both" ? <p className="mt-3 text-sm">남아 또는 여아 기준을 선택하면 마지막 측정값과 비교할 수 있어요.</p> : <dl className="mt-4 space-y-3">{(["height", "weight", "head"] as ChartType[]).map((type) => {
          const item = chartConfig[type]; const record = measurements.find((entry) => entry[item.key] !== undefined); if (!record) return null;
          const value = record[item.key]!; const median = referenceValue(type, genderMode, record.month); const range = growthRanges[genderMode][type][record.month]; if (!median || !range) return null;
          return <div key={type} className="border-t border-stone-100 pt-3 dark:border-[var(--border)]"><dt className="font-semibold">{item.label} · {record.month}개월 {genderMode === "male" ? "남아" : "여아"} 기준</dt><dd className="mt-1 text-sm leading-relaxed">측정 {value}{item.unit} · 중앙값 {median}{item.unit} · 참고 범위 {range.p3}~{range.p97}{item.unit}</dd></div>;
        })}</dl>}
        </div>
      </details>

      <Link href="/growth?tab=vaccination" className="flex min-h-12 items-center gap-2.5 rounded-2xl bg-[var(--surface-peach)] px-4 py-2.5 text-base font-semibold">
        <Syringe size={18} aria-hidden className="shrink-0 text-[var(--art-peach-ink)]" />
        <span className="min-w-0 flex-1">예방접종 일정 확인</span>
        <ChevronRight size={17} aria-hidden className="shrink-0 text-[var(--muted-foreground)]" />
      </Link>

      {showInput && profile && <MeasurementInput key={`${profile.id}-${activeEditing?.id || "new"}`} currentMonth={currentMonth} initialMeasurement={activeEditing} onClose={closeInput} onSaved={(edited) => setNotice(edited ? "수정한 기록을 이 기기에 저장했어요." : "새 기록을 이 기기에 저장했어요.")} />}
    </div>
  );
}

