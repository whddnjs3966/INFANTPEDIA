"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { presentationForMonth } from "@/lib/utils/content-presentation";
import { useReadingValue } from "@/components/reading/ReadingScope";
import EmphasizedText from "@/components/ui/EmphasizedText";

export default function MonthSummaryCard({ month, summary, reference }: {
  month: number;
  summary: string | null;
  reference: { label: string; value: string }[];
}) {
  const id = useId();
  const [expanded, setExpanded] = useReadingValue<boolean>("month-summary:expanded", false);
  const [showReference, setShowReference] = useReadingValue<boolean>("month-summary:reference", false);
  const presentation = summary ? presentationForMonth(month, summary) : null;
  const showFull = expanded || !presentation;
  return <article aria-label={`${month}개월 핵심 요약`} data-reading-anchor="month-summary" className="surface-card p-5" style={{ backgroundColor: "var(--surface-sky)" }}>
    <h3 className="sr-only">{month}개월 핵심 요약</h3>
    {summary && <>
      <div id={`${id}-source`} hidden={!showFull} className="whitespace-pre-line break-words text-base leading-7" data-month-summary-source>
        <EmphasizedText text={summary} marks={presentation?.emphasis ?? []} />
      </div>
      {presentation && <ul hidden={showFull} className={cn("space-y-3", showFull && "hidden")} aria-label="핵심 포인트">
        {presentation.preview.map(point => <li key={point} className="flex gap-2.5 text-base leading-7"><span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" /><span><EmphasizedText text={point} marks={presentation.emphasis} /></span></li>)}
      </ul>}
      {presentation && <button type="button" aria-expanded={expanded} aria-controls={`${id}-source`} onClick={() => setExpanded(value => !value)} className="mt-2 inline-flex min-h-12 items-center gap-1.5 rounded-lg pr-2 text-sm font-semibold text-[var(--brand)]">
        {expanded ? "핵심만 보기" : "설명 원문 자세히"}<ChevronDown size={16} aria-hidden className={cn("shrink-0 transition-transform motion-reduce:transition-none", expanded && "rotate-180")} />
      </button>}
    </>}
    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">월령별 공통 설명 · 실제 관찰·수유·수면 기록과는 달라요.</p>

    <div className="mt-3 border-t border-[var(--border)] pt-1">
      <button type="button" aria-expanded={showReference} aria-controls={`${id}-reference`} onClick={() => setShowReference(value => !value)} className="flex min-h-12 w-full items-center justify-between gap-2 py-2 text-left text-sm font-semibold">
        수유·수면 참고 수치<ChevronDown size={16} aria-hidden className={cn("shrink-0 text-[var(--muted-foreground)] transition-transform motion-reduce:transition-none", showReference && "rotate-180")} />
      </button>
      <div id={`${id}-reference`} hidden={!showReference} className="pb-1">
        <p className="mb-3 text-sm leading-6 text-[var(--muted-foreground)]">월령별 참고 정보예요. 하루 목표나 아기에게 정해진 양·횟수를 뜻하지 않으며 개별 안내가 있으면 따라주세요.</p>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-3">
          {reference.map(item => <div key={item.label} className="rounded-xl bg-[var(--surface-bg)] p-3"><dt className="text-sm leading-6 text-[var(--muted-foreground)]">{item.label}</dt><dd className="mt-1 break-words text-base font-semibold leading-7 tabular-nums">{item.value}</dd></div>)}
        </dl>
      </div>
    </div>
  </article>;
}

