"use client";

import { useId } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import GuideArtwork from "@/components/illustrations/GuideArtwork";
import type { Measurement } from "@/lib/store/measurement-store";

const metrics = [
  { key: "weight", label: "몸무게", unit: "kg" },
  { key: "height", label: "키", unit: "cm" },
  { key: "headCircumference", label: "머리둘레", unit: "cm" },
] as const;

const isMeasured = (value: number | undefined): value is number => typeof value === "number" && Number.isFinite(value) && value > 0;

/** Only measured values are plotted; the home preview never estimates a missing measurement. */
export default function HomeGrowthSummary({ measurements, babyName }: { measurements: Measurement[]; babyName: string }) {
  const gradientId = `home-growth-${useId().replace(/:/g, "")}`;
  const ordered = [...measurements].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const summaries = metrics.map(metric => ({ ...metric, record: ordered.find(record => isMeasured(record[metric.key])) }));
  const headline = summaries.find(metric => metric.record);

  if (!headline?.record) return <section aria-labelledby="home-growth-title" data-home-growth>
    <h2 id="home-growth-title" className="home-section-title mb-3">최근 성장 기록</h2>
    <div className="home-panel flex items-center gap-3 p-4">
      <GuideArtwork kind="record" className="h-16 w-16 shrink-0 @max-[18rem]:hidden" />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold">첫 성장을 남겨볼까요?</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">키나 몸무게 하나부터 시작해요.</p>
        <Link href="/growth?record=add" className="mt-1 inline-flex min-h-11 items-center gap-1 rounded-lg text-sm font-semibold text-[var(--brand)]"><Plus size={16} aria-hidden />첫 성장 기록 남기기</Link>
      </div>
    </div>
  </section>;

  // One point per recorded date avoids implying that same-day edits are separate days of growth.
  const seenDates = new Set<string>();
  const recent = ordered.filter(record => {
    if (!isMeasured(record[headline.key]) || !Number.isFinite(Date.parse(`${record.date}T00:00:00Z`)) || seenDates.has(record.date)) return false;
    seenDates.add(record.date);
    return true;
  }).slice(0, 6).reverse();
  const values = recent.map(record => record[headline.key]!);
  const min = Math.min(...values), max = Math.max(...values);
  const firstTime = recent[0] ? Date.parse(`${recent[0].date}T00:00:00Z`) : 0;
  const lastTime = recent.at(-1) ? Date.parse(`${recent.at(-1)!.date}T00:00:00Z`) : firstTime;
  const points = recent.map((record, index) => ({
    x: 8 + ((Date.parse(`${record.date}T00:00:00Z`) - firstTime) / Math.max(1, lastTime - firstTime)) * 128,
    y: max === min ? 32 : 48 - ((values[index] - min) / (max - min)) * 32,
  }));
  const line = points.map(({ x, y }, index) => `${index ? "L" : "M"}${x},${y}`).join(" ");

  return <section aria-labelledby="home-growth-title" data-home-growth>
    <h2 id="home-growth-title" className="home-section-title mb-3">최근 성장 기록</h2>
    <div className="home-panel">
      <Link href="/growth" aria-label={`${babyName}의 성장 기록 보기`} className="home-growth-main flex min-h-[84px] flex-wrap items-center gap-x-3 gap-y-2 rounded-t-[20px] p-4">
        <div className="min-w-0 flex-1">
          <p data-home-growth-metric data-metric={headline.key} className="flex flex-wrap items-baseline gap-x-1.5 font-semibold leading-tight tracking-tight text-[var(--brand)]"><span className="text-[1.75rem] tabular-nums">{headline.record[headline.key]}</span><span className="text-lg">{headline.unit}</span></p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-sm text-[var(--muted-foreground)]">
            <span>{headline.label}</span>
            <time dateTime={headline.record.date} className="whitespace-nowrap">{headline.record.date}</time>
          </p>
        </div>
        {recent.length >= 2 && <svg data-home-sparkline data-points={recent.length} data-values={JSON.stringify(values)} viewBox="0 0 144 64" className="home-growth-sparkline h-14 w-[98px] shrink-0 text-[var(--brand)] @max-[20rem]:w-[80px] @max-[17rem]:hidden" role="img" aria-label={`${headline.label} 최근 ${recent.length}회 기록: ${recent.map(record => `${record.date} ${record[headline.key]}${headline.unit}`).join(", ")}`}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop stopColor="currentColor" stopOpacity=".18" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
          <path d={`${line} L${points.at(-1)!.x},60 L${points[0].x},60 Z`} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {points.map(({ x, y }, index) => <circle key={recent[index].id} cx={x} cy={y} r="2.6" fill="var(--card)" stroke="currentColor" strokeWidth="1.5" />)}
        </svg>}
        <span className="inline-flex min-h-11 shrink-0 items-center gap-0.5 text-sm font-semibold text-[var(--brand)]">기록 보기<ChevronRight size={15} aria-hidden /></span>
      </Link>
      <details className="group border-t border-[var(--border)]" data-home-measurement-details>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-b-[20px] px-4 py-2 text-sm text-[var(--muted-foreground)]"><span>키·몸무게·머리둘레</span><ChevronDown size={16} className="shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden /></summary>
        <div className="px-4 pb-4">
          <dl className="grid grid-cols-3 gap-3 @max-[21rem]:grid-cols-1">
            {[summaries[1], summaries[0], summaries[2]].map(metric => <div key={metric.key} className="min-w-0">
              <dt className="text-sm text-[var(--muted-foreground)]">{metric.label}</dt>
              <dd className="mt-1 text-base font-semibold tabular-nums">{metric.record ? <>{metric.record[metric.key]} <span className="font-normal">{metric.unit}</span></> : <span className="text-sm font-normal text-[var(--muted-foreground)]">미입력</span>}</dd>
              {metric.record && <dd className="mt-1 text-sm text-[var(--muted-foreground)]">{metric.record.date}</dd>}
            </div>)}
          </dl>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">항목마다 가장 최근에 측정한 값이에요.</p>
          <Link href="/growth?record=add" className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--brand)]"><Plus size={16} aria-hidden />성장 기록 추가</Link>
        </div>
      </details>
    </div>
  </section>;
}
