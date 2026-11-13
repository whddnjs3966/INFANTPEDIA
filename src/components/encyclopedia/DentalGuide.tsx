"use client";

import { useMemo, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import FormattedContent from "@/components/ui/FormattedContent";
import { GuideAccordion, GuideContent, GuideStats } from "./GuidePresentation";
import { getDentalGuide, getMonthlyDentalNote, type ToothInfo } from "@/lib/data/dental-guide-data";

type ToothStatus = "erupted" | "upcoming" | "future";
function getToothStatus(tooth: ToothInfo, month: number): ToothStatus {
  const match = tooth.eruptionMonth.match(/(\d+)~(\d+)/);
  if (!match) return "future";
  const start = parseInt(match[1], 10), end = parseInt(match[2], 10);
  if (month >= end) return "erupted";
  return month >= start ? "upcoming" : "future";
}

function JawDiagram({ month }: { month: number }) {
  const teeth = getDentalGuide().teethTimeline;
  const sideOrder: ToothInfo["side"][] = ["second_molar", "first_molar", "canine", "lateral", "center"];
  const arrangeRow = (row: ToothInfo[]) => {
    const left: ToothInfo[] = [], right: ToothInfo[] = [];
    for (const side of sideOrder) { const pair = row.filter(tooth => tooth.side === side); if (pair[0]) left.push(pair[0]); if (pair[1]) right.unshift(pair[1]); }
    return [...left, ...right];
  };
  return <figure aria-label="월령별 치아 발달 참고 그림" className="space-y-3">
    {[{ label: "윗니", row: arrangeRow(teeth.filter(tooth => tooth.position === "upper")) }, { label: "아랫니", row: arrangeRow(teeth.filter(tooth => tooth.position === "lower")) }].map(({ label, row }) => <div key={label} className="space-y-2"><p className="text-center text-sm font-medium text-[var(--muted-foreground)]">{label}</p><div className="mx-auto grid w-full max-w-[260px] grid-cols-10 gap-1">{row.map(tooth => { const status = getToothStatus(tooth, month); return <span key={tooth.id} title={`${tooth.name} (${tooth.eruptionMonth})`} className={cn("flex h-[28px] min-w-0 items-center justify-center rounded-md", status === "erupted" ? "bg-[var(--brand)] text-[var(--brand-foreground)]" : status === "upcoming" ? "bg-blue-100 text-blue-800 ring-1 ring-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:ring-blue-700" : "bg-[var(--surface-muted)] text-[var(--muted-foreground)]")}>{status === "erupted" ? <Check size={12} aria-hidden /> : <span aria-hidden className="text-[12px] leading-none">{status === "upcoming" ? "•" : "·"}</span>}<span className="sr-only">{tooth.name} {tooth.eruptionMonth}</span></span>; })}</div></div>)}
    <figcaption className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm leading-6 text-[var(--muted-foreground)]">{[{ label: "나온 이", color: "bg-[var(--brand)]" }, { label: "나올 수 있는 이", color: "bg-blue-100 ring-1 ring-blue-300 dark:bg-blue-900/50 dark:ring-blue-700" }, { label: "아직", color: "bg-[var(--surface-muted)]" }].map(item => <span key={item.label} className="inline-flex max-w-full items-center gap-1.5"><span aria-hidden className={cn("h-[12px] w-[12px] shrink-0 rounded-sm", item.color)} />{item.label}</span>)}</figcaption>
  </figure>;
}

function DetailRow({ title, meta, children }: { title: string; meta?: ReactNode; children: ReactNode }) {
  return <details className="group border-b border-[var(--border)] last:border-b-0"><summary className="flex min-h-14 cursor-pointer list-none items-start gap-3 py-3 text-base font-semibold leading-7"><span className="min-w-0 flex-1 break-words">{title}{meta && <span className="mt-1 block text-sm font-normal leading-6 text-[var(--muted-foreground)]">{meta}</span>}</span><ChevronDown size={17} aria-hidden className="mt-1 shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary><div className="space-y-3 pb-4 text-base leading-7">{children}</div></details>;
}

export default function DentalGuide({ month }: { month: number }) {
  const guide = getDentalGuide(), monthlyNote = getMonthlyDentalNote(month);
  const uniqueTimeline = useMemo(() => {
    const seen = new Set<number>();
    return guide.teethTimeline.filter(tooth => { if (seen.has(tooth.eruptionOrder)) return false; seen.add(tooth.eruptionOrder); return true; }).map(tooth => ({ order: tooth.eruptionOrder, name: tooth.name, eruptionMonth: tooth.eruptionMonth, count: guide.teethTimeline.filter(item => item.eruptionOrder === tooth.eruptionOrder).length }));
  }, [guide.teethTimeline]);
  const eruptedCount = guide.teethTimeline.filter(tooth => getToothStatus(tooth, month) === "erupted").length;
  const upcomingCount = guide.teethTimeline.filter(tooth => getToothStatus(tooth, month) === "upcoming").length;

  return <GuideContent>
    <GuideAccordion title="월령별 치아 참고" artwork="tooth">
      <p className="text-sm text-[var(--muted-foreground)]">월령별 참고예요. 실제로 난 치아와는 다를 수 있어요.</p>
      <p className="text-sm font-semibold text-[var(--brand)]">참고 예상 {eruptedCount}개{upcomingCount > 0 && ` · 나올 수 있는 이 ${upcomingCount}개`}</p>
      <JawDiagram month={month} />
      <div className="border-t border-[var(--border)] pt-3"><FormattedContent variant="prose" content={monthlyNote} /></div>
    </GuideAccordion>

    <GuideAccordion title="유치가 나는 시기" readingKey="유치 발달 타임라인" artwork="record">
      <ol className="divide-y divide-[var(--border)]">{uniqueTimeline.map(item => { const match = item.eruptionMonth.match(/(\d+)~(\d+)/), start = match ? parseInt(match[1], 10) : 999, end = match ? parseInt(match[2], 10) : 999; const current = month >= start && month < end; return <li key={item.order} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><span aria-hidden className={cn("mt-0.5 flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-sm font-semibold", current ? "bg-[var(--surface-sky)] text-[var(--brand)]" : "bg-[var(--surface-muted)] text-[var(--muted-foreground)]")}>{item.order}</span><div className="min-w-0 flex-1"><p className="break-words font-semibold">{item.name}</p><p className={cn("mt-1 text-sm leading-6", current ? "font-medium text-[var(--brand)]" : "text-[var(--muted-foreground)]")}>{item.eruptionMonth} · {item.count}개</p></div></li>; })}</ol>
    </GuideAccordion>

    <GuideAccordion title="이앓이 증상·대처" readingKey="이앓이 증상 & 대처법" artwork="rattle">
      <section className="space-y-3"><h4 className="text-base font-semibold text-[var(--content-caution)]">주요 증상</h4><ul className="grid gap-2 sm:grid-cols-2">{guide.teethingSymptoms.map(symptom => <li key={symptom} className="flex items-start gap-2.5"><span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--content-caution)]" /><span>{symptom}</span></li>)}</ul></section>
      <section><h4 className="mb-1 text-base font-semibold">대처법</h4>{guide.teethingRemedies.map(remedy => remedy.title.includes("주의") ? <section key={remedy.title} className="my-3 border-l-2 border-[var(--content-caution)] pl-3"><h5 className="mb-2 text-sm font-semibold text-[var(--content-caution)]">{remedy.title}</h5><FormattedContent variant="prose" content={remedy.description} /></section> : <DetailRow key={remedy.title} title={remedy.title}><FormattedContent variant="prose" content={remedy.description} className="text-base leading-7" /></DetailRow>)}</section>
    </GuideAccordion>

    <GuideAccordion title="양치 가이드" artwork="wash" tone="lilac">
      <GuideStats items={[{ label: "시작", value: guide.brushingGuide.startAge }, { label: "횟수", value: guide.brushingGuide.frequency }, { label: "시간", value: guide.brushingGuide.duration }]} />
      <section className="space-y-2 border-l-2 border-[var(--brand)] pl-4"><h4 className="text-base font-semibold text-[var(--brand)]">불소 치약 안내</h4><FormattedContent variant="prose" content={guide.brushingGuide.fluorideNote} className="text-base leading-7" /></section>
      <ol className="space-y-4">{guide.brushingGuide.steps.map(step => <li key={step.step} className="flex items-start gap-3"><span aria-hidden className="mt-0.5 flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[var(--surface-sky)] text-sm font-semibold text-[var(--brand)]">{step.step}</span><div className="min-w-0 flex-1"><h4 className="font-semibold">{step.title}</h4><p className="mt-1 text-base leading-7 text-[var(--muted-foreground)]">{step.description}</p></div></li>)}</ol>
    </GuideAccordion>

    <GuideAccordion title="치과 방문 가이드" artwork="thermometer">
      <section className="space-y-2"><h4 className="text-base font-semibold text-[var(--brand)]">첫 치과 방문</h4><FormattedContent variant="prose" content={guide.dentalVisit.firstVisit} className="text-base leading-7" /></section>
      <section className="space-y-2"><h4 className="text-base font-semibold text-[var(--brand)]">정기 검진</h4><p>{guide.dentalVisit.frequency}</p></section>
      <section className="space-y-3"><h4 className="text-base font-semibold">검진 시 확인 사항</h4><ul className="space-y-2.5">{guide.dentalVisit.whatToExpect.map(item => <li key={item} className="flex items-start gap-2.5"><Check size={17} aria-hidden className="mt-1 shrink-0 text-[var(--brand)]" /><span>{item}</span></li>)}</ul></section>
    </GuideAccordion>

    <GuideAccordion title="치아 관련 질문" readingKey="자주 묻는 질문 (FAQ)" artwork="book"><div>{guide.commonIssues.map(item => <DetailRow key={item.issue} title={item.issue}><FormattedContent variant="prose" content={item.solution} className="text-base leading-7" /></DetailRow>)}</div></GuideAccordion>
    <details className="group border-t border-[var(--border)] text-sm leading-6 text-[var(--muted-foreground)]">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 py-2.5 font-medium [&::-webkit-details-marker]:hidden">
        치아·이앓이 참고 자료
        <ChevronDown size={16} aria-hidden className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <ul>{[{ title: "NHS · 아기 양치", url: "https://www.nhs.uk/baby/babys-development/teething/looking-after-your-babys-teeth/" }, { title: "NHS · 이앓이 증상", url: "https://www.nhs.uk/baby/babys-development/teething/baby-teething-symptoms/" }, { title: "FDA · 이앓이 약·젤 안전", url: "https://www.fda.gov/consumers/consumer-updates/safely-soothing-teething-pain-infants-and-children" }].map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center py-2 text-[var(--brand)] underline">{source.title}<span className="sr-only"> (새 창)</span></a></li>)}</ul>
    </details>
  </GuideContent>;
}

