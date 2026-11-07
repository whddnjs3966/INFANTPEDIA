"use client";

import { AlertCircle, Check, ChevronDown, Eye, Info, Moon, Star } from "lucide-react";
import FormattedContent from "@/components/ui/FormattedContent";
import { getSleepGuideForMonth, getSuitableMethodsForMonth } from "@/lib/data/sleep-guide-data";
import { GuideAccordion, GuideCard, GuideContent, GuideHeading, GuideStats } from "./GuidePresentation";

const difficultyLabels = { easy: "쉬움", medium: "보통", hard: "어려움" };

export default function SleepGuide({ month }: { month: number }) {
  const guide = getSleepGuideForMonth(month);
  const methods = getSuitableMethodsForMonth(month);
  if (!guide) return null;

  return <GuideContent>
    <GuideCard>
      <GuideHeading title="수면 참고" icon={<Moon size={21} />} tone="lilac" />
      <details className="group"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-[var(--brand)]">수면 참고 수치<ChevronDown size={16} aria-hidden className="group-open:rotate-180" /></summary><div className="pt-3"><GuideStats items={[{ label: "총 수면", value: guide.totalSleep }, { label: "야간 수면", value: guide.nightSleep }, { label: "낮잠", value: guide.napInfo }]} /></div></details><p className="text-sm leading-6 text-[var(--muted-foreground)]">밤 수면은 중간에 깨거나 먹는 시간을 사이에 두고 나뉠 수 있어요. 수치는 참고 범위예요.</p>
    </GuideCard>

    <GuideCard>
      <GuideHeading title="졸림 신호" description="이 신호가 보이면 재울 타이밍" icon={<Eye size={21} />} tone="amber" />
      <ul className="grid gap-x-5 gap-y-2 sm:grid-cols-2">{guide.sleepSignals.map(signal => <li key={signal} className="flex items-start gap-2.5"><span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700 dark:bg-amber-300" /><span>{signal}</span></li>)}</ul>
    </GuideCard>

    <section className="space-y-3">
      <GuideHeading title="수면교육 방법" icon={<Star size={21} />} tone="lilac" />
      {month < 4 && <aside className="rounded-2xl bg-[var(--surface-lavender)] p-4 text-[var(--foreground)]"><div className="flex items-start gap-2.5"><Info size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-violet-700 dark:text-violet-300" /><div><p className="font-semibold">수면교육은 보통 4개월 이후에 시작해요</p><p className="mt-2">지금은 아기와의 유대감 형성에 집중하고, 안아재우기 방법으로 부드럽게 수면 습관을 만들어주세요.</p></div></div></aside>}
      {methods.map(method => <GuideAccordion key={method.id} title={method.name} compact artwork="moon" icon={<Moon size={20} />} tone="lilac" meta={<><span>{difficultyLabels[method.difficulty]}</span><span>{method.duration}</span><span>{method.suitableAge}</span></>}>
        <FormattedContent variant="prose" content={method.description} />
        <div className="border-l-2 border-[var(--content-caution)] pl-3"><h4 className="mb-2 text-sm font-semibold text-[var(--content-caution)]">알아둘 점</h4><ul className="list-disc space-y-2 pl-4">{method.cons.map(con => <li key={con}>{con}</li>)}</ul></div>
        <div><h4 className="mb-3 text-sm font-semibold text-[var(--brand)]">진행 순서</h4><ol className="space-y-3">{method.steps.map((step, index) => <li key={step} className="flex items-start gap-3"><span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-lavender)] text-sm font-semibold text-violet-800 dark:text-violet-200">{index + 1}</span><span>{step}</span></li>)}</ol></div>
        <details className="group border-t border-[var(--border)] pt-1"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-semibold text-[var(--brand)] [&::-webkit-details-marker]:hidden">장점 {method.pros.length}가지<ChevronDown size={16} aria-hidden className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary><ul className="space-y-2 pb-1 pt-2">{method.pros.map(pro => <li key={pro} className="flex items-start gap-2.5"><Check size={17} aria-hidden="true" className="mt-1 shrink-0 text-[var(--brand)]" /><span>{pro}</span></li>)}</ul></details>
      </GuideAccordion>)}
    </section>

    <section className="space-y-3"><GuideHeading title="자주 하는 고민" icon={<AlertCircle size={21} />} tone="lilac" />{guide.commonIssues.map(issue => <GuideAccordion key={issue.issue} title={issue.issue} compact artwork={/수유|먹/.test(issue.issue) ? "feeding" : /이앓|치아/.test(issue.issue) ? "tooth" : "moon"} icon={<Moon size={20} />} tone="lilac"><FormattedContent variant="prose" content={issue.solution} /></GuideAccordion>)}</section>

    <GuideCard>
      <GuideHeading title="수면 환경 체크리스트" icon={<Check size={21} />} />
      <ul className="divide-y divide-stone-100 dark:divide-[var(--border)]">{guide.sleepEnvironment.map(tip => <li key={tip} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><Check size={19} aria-hidden="true" className="mt-1 shrink-0 text-blue-800 dark:text-blue-300" /><span>{tip}</span></li>)}</ul>
    </GuideCard>
  </GuideContent>;
}

