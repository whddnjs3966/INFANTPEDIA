"use client";

import { Check, ChevronDown, Info } from "lucide-react";
import FormattedContent from "@/components/ui/FormattedContent";
import { getSleepGuideForMonth, getSuitableMethodsForMonth } from "@/lib/data/sleep-guide-data";
import { GuideAccordion, GuideContent, GuideHeading, GuideStats } from "./GuidePresentation";

const difficultyLabels = { easy: "쉬움", medium: "보통", hard: "어려움" };

export default function SleepGuide({ month }: { month: number }) {
  const guide = getSleepGuideForMonth(month);
  const methods = getSuitableMethodsForMonth(month);
  if (!guide) return null;

  return <GuideContent>
    <GuideAccordion title="수면 참고 수치" artwork="moon" tone="lilac">
      <p className="text-sm text-[var(--muted-foreground)]">밤 수면은 중간에 깨거나 먹는 시간을 사이에 두고 나뉠 수 있어요. 수치는 참고 범위예요.</p>
      <GuideStats items={[{ label: "총 수면", value: guide.totalSleep }, { label: "야간 수면", value: guide.nightSleep }, { label: "낮잠", value: guide.napInfo }]} />
    </GuideAccordion>

    <GuideAccordion title="졸림 신호" artwork="sleep">
      <ul className="list-disc space-y-2 pl-5 marker:text-[var(--brand)]">{guide.sleepSignals.map(signal => <li key={signal}>{signal}</li>)}</ul>
    </GuideAccordion>

    <GuideAccordion title="수면 환경 체크리스트" artwork="book">
      <ul className="divide-y divide-[var(--border)]">{guide.sleepEnvironment.map(tip => <li key={tip} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"><Check size={18} aria-hidden="true" className="mt-1 shrink-0 text-[var(--brand)]" /><span>{tip}</span></li>)}</ul>
    </GuideAccordion>

    <section className="space-y-3">
      <GuideHeading title="수면교육 방법" />
      {month < 4 && <aside className="flex items-start gap-2.5 rounded-xl bg-[var(--surface-lavender)] p-3.5 text-[var(--foreground)]"><Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-violet-700 dark:text-violet-300" /><div className="min-w-0"><p className="font-semibold">수면교육은 보통 4개월 이후에 시작해요</p><p className="mt-1.5 text-sm">지금은 아기와의 유대감 형성에 집중하고, 안아재우기 방법으로 부드럽게 수면 습관을 만들어주세요.</p></div></aside>}
      {methods.map(method => <GuideAccordion key={method.id} title={method.name} compact>
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--muted-foreground)]"><span>{difficultyLabels[method.difficulty]}</span><span>{method.duration}</span><span>{method.suitableAge}</span></p>
        <FormattedContent variant="prose" content={method.description} />
        <div className="border-l-2 border-[var(--content-caution)] pl-3"><h4 className="mb-2 text-sm font-semibold text-[var(--content-caution)]">알아둘 점</h4><ul className="list-disc space-y-2 pl-4">{method.cons.map(con => <li key={con}>{con}</li>)}</ul></div>
        <div><h4 className="mb-3 text-sm font-semibold text-[var(--brand)]">진행 순서</h4><ol className="space-y-3">{method.steps.map((step, index) => <li key={step} className="flex items-start gap-3"><span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-lavender)] text-sm font-semibold text-violet-800 dark:text-violet-200">{index + 1}</span><span>{step}</span></li>)}</ol></div>
        <details className="group border-t border-[var(--border)] pt-1"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-semibold text-[var(--brand)] [&::-webkit-details-marker]:hidden">장점 {method.pros.length}가지<ChevronDown size={16} aria-hidden className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary><ul className="space-y-2 pb-1 pt-2">{method.pros.map(pro => <li key={pro} className="flex items-start gap-2.5"><Check size={17} aria-hidden="true" className="mt-1 shrink-0 text-[var(--brand)]" /><span>{pro}</span></li>)}</ul></details>
      </GuideAccordion>)}
    </section>

    <section className="space-y-3"><GuideHeading title="자주 하는 고민" />{guide.commonIssues.map(issue => <GuideAccordion key={issue.issue} title={issue.issue} compact><FormattedContent variant="prose" content={issue.solution} /></GuideAccordion>)}</section>
  </GuideContent>;
}

