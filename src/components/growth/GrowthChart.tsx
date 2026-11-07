"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronDown, Circle, Pencil, Plus, Ruler, Trash2, Weight } from "lucide-react";
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
  height: { label: "키", unit: "cm", icon: Ruler, key: "height" as const },
  weight: { label: "몸무게", unit: "kg", icon: Weight, key: "weight" as const },
  head: { label: "머리둘레", unit: "cm", icon: Circle, key: "headCircumference" as const },
};

function referenceValue(type: ChartType, gender: "male" | "female", month: number) {
  const row = growthData[month];
  if (!row) return undefined;
  if (type === "height") return gender === "male" ? row.maleHeight : row.femaleHeight;
  if (type === "weight") return gender === "male" ? row.maleWeight : row.femaleWeight;
  return gender === "male" ? row.maleHead : row.femaleHead;
}

function percentile(value: number, p3: number, p50: number, p97: number) {
  if (value <= p3) return Math.max(1, Math.round(value / p3 * 3));
  if (value >= p97) return Math.min(99, Math.round(97 + (value - p97) / (p97 - p50) * 3));
  return Math.round(value <= p50 ? 3 + (value - p3) / (p50 - p3) * 47 : 50 + (value - p50) / (p97 - p50) * 47);
}

export default function GrowthChart({ currentMonth }: GrowthChartProps) {
  const profile = useBabyStore((state) => state.profile);
  const legacyOwnerId = useBabyStore((state) => state.legacyOwnerId);
  const allMeasurements = useMeasurementStore((state) => state.measurements);
  const deleteMeasurement = useMeasurementStore((state) => state.deleteMeasurement);
  const isDark = useThemeStore((state) => state.theme === "dark");
  const [chartType, setChartType] = useState<ChartType>("height");
  const [genderMode, setGenderMode] = useState<GenderMode>(profile?.gender || "male");
  const [inputOpen, setShowInput] = useState(false);
  const [editing, setEditing] = useState<Measurement | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [notice, setNotice] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = profile?.id;
  const requestedAdd = searchParams.get("record") === "add";
  const showInput = requestedAdd || inputOpen;
  const activeEditing = requestedAdd ? undefined : editing;

  const measurements = useMemo(() => allMeasurements
    .filter((record) => !!profileId && (record.babyId === profileId || (!record.babyId && legacyOwnerId === profileId)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)), [allMeasurements, profileId, legacyOwnerId]);
  const latest = measurements[0];
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
  const visibleRecords = showAll ? measurements : measurements.slice(0, 5);

  const closeInput = () => {
    setShowInput(false); setEditing(undefined);
    if (searchParams.has("record")) {
      const params = new URLSearchParams(searchParams.toString()); params.delete("record");
      router.replace(`/growth${params.size ? `?${params}` : ""}`, { scroll: false });
    }
  };

  return (
    <div className="@container space-y-8 pb-8">
      <section aria-labelledby="growth-latest-title" className="surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 id="growth-latest-title" className="break-words text-xl font-semibold tracking-tight text-[var(--foreground)]">{profile?.name || "아기"}의 최근 기록</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{latest ? `${latest.date} 측정 · ${latest.month}개월` : "측정한 값을 기록하면 성장 변화를 볼 수 있어요."}</p>
          </div>
        </div>
        {latest && (
          <dl className="mt-5 grid grid-cols-3 divide-x divide-[var(--border)] @max-[16rem]:grid-cols-1 @max-[16rem]:divide-x-0 @max-[16rem]:divide-y">
            {(["height", "weight", "head"] as ChartType[]).map((type) => {
              const item = chartConfig[type];
              const record = measurements.find((entry) => entry[item.key] !== undefined);
              return (
                <div key={type} className="min-w-0 px-2 first:pl-0 last:pr-0 @max-[16rem]:px-0 @max-[16rem]:py-3 @max-[16rem]:first:pt-0 @max-[16rem]:last:pb-0">
                  <dt className="text-sm text-[var(--muted-foreground)]">{item.label}</dt>
                  <dd className="mt-1 flex flex-wrap items-baseline gap-x-1 text-2xl font-bold leading-9 tracking-tight tabular-nums text-[var(--foreground)]">{record?.[item.key] ?? "—"}<span className="text-sm font-medium tracking-normal">{record ? item.unit : ""}</span></dd>
                  {record && record.date !== latest.date && <dd className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{record.date}</dd>}
                </div>
              );
            })}
          </dl>
        )}
        <button type="button" onClick={() => { setEditing(undefined); setShowInput(true); }} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-4 py-3 text-base font-bold text-[var(--brand-foreground)] transition-colors hover:bg-[var(--brand-pressed)]"><Plus size={20} aria-hidden />성장 기록 추가</button>
      </section>

      {notice && <p role="status" className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">{notice}</p>}

      <section aria-labelledby="growth-chart-title" className="surface-card p-5">
        <h2 id="growth-chart-title" className="mb-4 text-xl font-bold tracking-tight text-[var(--foreground)]">성장 변화</h2>
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[var(--surface-bg)] p-1 @max-[16rem]:grid-cols-1" role="group" aria-label="성장 항목 선택">
          {(["height", "weight", "head"] as ChartType[]).map((type) => {
            const Icon = chartConfig[type].icon;
            return <button key={type} type="button" aria-pressed={chartType === type} onClick={() => setChartType(type)} className={cn("flex min-h-12 min-w-0 items-center justify-center gap-1 rounded-xl px-1 py-2 text-sm font-semibold transition-colors", chartType === type ? "bg-[var(--card)] text-[var(--brand)] shadow-sm" : "text-[var(--muted-foreground)]")}><Icon size={16} className="shrink-0" aria-hidden />{chartConfig[type].label}</button>;
          })}
        </div>
        <div role="group" aria-label="성장 참고 기준 선택" className="mt-3 flex flex-wrap gap-2">
          {([{ key: "male", label: "남아 기준" }, { key: "female", label: "여아 기준" }, { key: "both", label: "두 기준 비교" }] as const).map((item) => <button type="button" key={item.key} aria-pressed={genderMode === item.key} onClick={() => setGenderMode(item.key)} className={cn("min-h-12 min-w-0 max-w-full break-words rounded-xl border px-3 py-2 text-sm font-semibold transition-colors", genderMode === item.key ? "border-[var(--brand)] bg-[var(--accent-soft)] text-[var(--brand)]" : "border-transparent text-[var(--muted-foreground)] hover:bg-[var(--surface-bg)]")}>{item.label}</button>)}
        </div>
        {latestMetric ? <div className="my-4 flex flex-wrap items-end justify-between gap-2 rounded-2xl bg-[var(--surface-bg)] p-4"><div><p className="text-sm text-[var(--muted-foreground)]">최근 {config.label} · {latestMetric.date}</p><p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-[var(--foreground)]">{latestMetric[config.key]}<span className="ml-1 text-base font-medium">{config.unit}</span></p></div>{trend !== null && <p className="pb-1 text-sm font-medium text-[var(--muted-foreground)]">이전보다 <span className="font-bold text-[var(--foreground)]">{trend > 0 ? "+" : ""}{trend}{config.unit}</span></p>}</div> : <p className="my-4 rounded-2xl bg-[var(--surface-bg)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">아직 {config.label} 기록이 없어요. 아래 그래프는 참고 기준이에요.</p>}
        <div role="img" aria-label={`${profile?.name || "아기"}의 ${config.label} 변화. 가로축 월령, 세로축 ${config.unit}. 측정한 값은 아래 기록 목록에서도 확인할 수 있어요.`}>
          <ResponsiveContainer width="100%" height={248}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 6 }} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 14, fill: isDark ? "#d6d3d1" : "#57534e" }} tickFormatter={(value) => `${value}개월`} tickLine={false} minTickGap={12} />
              <YAxis width={52} unit={config.unit} tick={{ fontSize: 14, fill: isDark ? "#d6d3d1" : "#57534e" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip formatter={(value, name) => [Array.isArray(value) ? value.join(" ~ ") + config.unit : `${value}${config.unit}`, name]} labelFormatter={(label) => `${label}개월`} contentStyle={{ borderRadius: 12, backgroundColor: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)", fontSize: 14 }} />
              {(genderMode === "male" || genderMode === "both") && <><Area dataKey="maleBand" stroke="none" fill="#3b82f6" fillOpacity={0.12} name="남아 참고 범위" /><Line dataKey="male" name="남아 중앙값" type="monotone" stroke="#2563eb" strokeWidth={2} dot={false} strokeDasharray="3 4" /></>}
              {(genderMode === "female" || genderMode === "both") && <><Area dataKey="femaleBand" stroke="none" fill="#db2777" fillOpacity={0.1} name="여아 참고 범위" /><Line dataKey="female" name="여아 중앙값" type="monotone" stroke="#db2777" strokeWidth={2} dot={false} strokeDasharray="5 3" /></>}
              <Line dataKey="baby" name="우리 아기 측정값" type="linear" stroke="var(--brand)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-700 dark:text-stone-200">
          <span className="flex items-center gap-1.5"><span aria-hidden="true" className="relative h-2 w-5"><span className="absolute top-1/2 h-0.5 w-5 -translate-y-1/2 bg-blue-700 dark:bg-blue-300" /><span className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-700 dark:bg-blue-300" /></span>우리 아기</span>
          {genderMode !== "female" && <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-blue-600" />남아 중앙값</span>}
          {genderMode !== "male" && <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-pink-600" />여아 중앙값</span>}
        </div>
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">옅은 영역은 WHO 참고 범위(3~97백분위)예요. 월령별로 마지막 측정값을 표시해요.</p>
      </section>

      <section aria-labelledby="measurement-history-title">
        <details className="group" data-measurement-history>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-1 py-3 [&::-webkit-details-marker]:hidden">
          <h2 id="measurement-history-title" className="text-xl font-bold tracking-tight text-[var(--foreground)]">측정 기록 <span className="ml-1 text-base font-medium text-[var(--muted-foreground)]">{measurements.length}건</span></h2>
          <ChevronDown size={19} aria-hidden className="shrink-0 text-[var(--brand)] transition-transform group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="space-y-3 pt-3">
        {measurements.length === 0 ? <p className="surface-card p-5 text-base leading-relaxed text-[var(--muted-foreground)]">아직 측정 기록이 없어요. 위의 ‘성장 기록 추가’로 첫 기록을 남겨보세요.</p> : (
          <ul className="space-y-3">
            {visibleRecords.map((record) => (
              <li key={record.id} className="surface-card p-5">
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

      <details className="surface-card px-5 py-3 text-[var(--foreground)]">
        <summary className="min-h-12 cursor-pointer py-3 text-base font-semibold">WHO 참고 기준과 비교 보기</summary>
        <p className="mt-2 text-sm leading-relaxed">WHO 영유아 성장 기준(WHO Child Growth Standards)을 바탕으로 한 참고값이에요. 백분위는 제공된 3·50·97백분위 사이를 단순 추정한 값이에요.</p>
        {genderMode === "both" ? <p className="mt-3 text-sm">남아 또는 여아 기준을 선택하면 마지막 측정값과 비교할 수 있어요.</p> : <dl className="mt-4 space-y-3">{(["height", "weight", "head"] as ChartType[]).map((type) => {
          const item = chartConfig[type]; const record = measurements.find((entry) => entry[item.key] !== undefined); if (!record) return null;
          const value = record[item.key]!; const median = referenceValue(type, genderMode, record.month); const range = growthRanges[genderMode][type][record.month]; if (!median || !range) return null;
          return <div key={type} className="border-t border-stone-100 pt-3 dark:border-[var(--border)]"><dt className="font-semibold">{item.label} · {record.month}개월 {genderMode === "male" ? "남아" : "여아"} 기준</dt><dd className="mt-1 text-sm leading-relaxed">측정 {value}{item.unit} · 중앙값 {median}{item.unit} · 추정 {percentile(value, range.p3, median, range.p97)}백분위</dd></div>;
        })}</dl>}
      </details>

      {showInput && profile && <MeasurementInput key={`${profile.id}-${activeEditing?.id || "new"}`} currentMonth={currentMonth} initialMeasurement={activeEditing} onClose={closeInput} onSaved={(edited) => setNotice(edited ? "수정한 기록을 이 기기에 저장했어요." : "새 기록을 이 기기에 저장했어요.")} />}
    </div>
  );
}

