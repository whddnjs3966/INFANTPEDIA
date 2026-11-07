"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthSelectorProps {
  selectedMonth: number;
  currentMonth?: number;
  babyName?: string;
  currentAge?: number;
  onSelect: (month: number) => void;
}
const months = Array.from({ length: 13 }, (_, month) => month);

export default function MonthSelector({ selectedMonth, currentMonth, babyName, currentAge, onSelect }: MonthSelectorProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId(), headingId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const age = currentAge ?? currentMonth;
  const isCurrent = currentMonth !== undefined && selectedMonth === currentMonth && (age ?? 0) <= 12;
  const selectMonth = (month: number) => {
    onSelect(month);
    setExpanded(false);
    toggleRef.current?.focus();
  };
  return <section data-month-selector aria-labelledby={headingId} onKeyDown={event => {
    if (expanded && event.key === "Escape") { setExpanded(false); toggleRef.current?.focus(); }
  }} className="@container rounded-[22px] bg-[var(--card)] shadow-[var(--shadow-card)]">
    <h2 id={headingId} className="sr-only">둘러볼 월령</h2>
    <div className="flex min-h-12 items-center gap-1 px-1">
      <button type="button" aria-label="이전 월령" disabled={selectedMonth === 0} onClick={() => onSelect(selectedMonth - 1)} className="flex min-h-12 w-12 max-w-[48px] shrink-0 items-center justify-center rounded-xl text-[var(--brand)] hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={21} aria-hidden /></button>
      <button ref={toggleRef} type="button" aria-label={`${selectedMonth}개월 · ${expanded ? "월령 접기" : "전체 월령 선택"}`} aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded(value => !value)} className="flex min-h-12 min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-xl px-1 py-1 text-center hover:bg-[var(--surface-bg)]">
        <span aria-live="polite" aria-atomic="true" className="text-lg font-bold tabular-nums">{selectedMonth}개월</span>
        <span className="text-sm text-[var(--muted-foreground)]">{selectedMonth === 0 ? "신생아" : isCurrent ? "우리 아기" : "참고 가이드"}</span>
        <ChevronDown size={16} aria-hidden className={cn("shrink-0 text-[var(--brand)] transition-transform motion-reduce:transition-none", expanded && "rotate-180")} />
      </button>
      <button type="button" aria-label="다음 월령" disabled={selectedMonth === 12} onClick={() => onSelect(selectedMonth + 1)} className="flex min-h-12 w-12 max-w-[48px] shrink-0 items-center justify-center rounded-xl text-[var(--brand)] hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={21} aria-hidden /></button>
    </div>
    {currentMonth !== undefined && !isCurrent && <div className="flex flex-wrap items-center justify-center gap-x-2 border-t border-[var(--border)] px-3 py-1 text-sm leading-6">
      <p className="min-w-0 break-words text-[var(--muted-foreground)]">{babyName || "우리 아기"} · 현재 {age}개월</p>
      {selectedMonth !== currentMonth ? <button type="button" onClick={() => selectMonth(currentMonth)} className="inline-flex min-h-12 items-center gap-1 rounded-lg px-1 font-semibold text-[var(--brand)]"><RotateCcw size={14} aria-hidden />우리 아기 월령으로</button> : <span className="text-[var(--muted-foreground)]">12개월 기준 참고 정보예요</span>}
    </div>}
    <div id={panelId} hidden={!expanded} className="border-t border-[var(--border)] p-3">
      <p className="mb-3 text-sm leading-6 text-[var(--muted-foreground)]">둘러볼 월령을 선택해 주세요.</p>
      <div role="group" aria-label="둘러볼 월령 선택" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,4rem),1fr))] gap-2">
        {months.map(month => <button key={month} type="button" aria-pressed={month === selectedMonth} aria-label={`${month}개월${month === 0 ? " 신생아" : ""}${month === currentMonth && (age ?? 0) <= 12 ? " · 우리 아기 월령" : ""}`} onClick={() => selectMonth(month)} className={cn("flex min-h-12 items-center justify-center gap-1 rounded-xl px-1 py-2 text-sm font-semibold tabular-nums", month === selectedMonth ? "bg-[var(--brand)] text-[var(--brand-foreground)]" : "bg-[var(--surface-bg)] text-[var(--foreground)] hover:bg-[var(--accent-soft)]")}>
          {month === selectedMonth && <Check size={13} aria-hidden className="shrink-0" />}<span>{month}개월</span>
        </button>)}
      </div>
    </div>
  </section>;
}
