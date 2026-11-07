"use client";

import { AlertTriangle, Baby, ChevronDown, Info } from "lucide-react";
import FormattedContent from "@/components/ui/FormattedContent";
import { getFeedingGuideForMonth } from "@/lib/data/feeding-guide-data";
import { GuideAccordion, GuideCard, GuideContent, GuideHeading, GuideStats } from "./GuidePresentation";

const urgencyClasses = { info: "border-stone-200 dark:border-stone-700", caution: "border-amber-300 dark:border-amber-800", warning: "border-red-300 dark:border-red-800" };

export default function FeedingGuide({ month }: { month: number }) {
  const guide = getFeedingGuideForMonth(month);
  if (!guide) return <GuideCard><p>해당 월령의 수유 가이드가 준비 중이에요</p></GuideCard>;
  return <GuideContent>
    <GuideCard>
      <GuideHeading title="수유 정보" description={guide.feedingType} icon={<Baby size={21} />} />
      <details className="group"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-[var(--brand)]">수유량·횟수 참고 수치<ChevronDown size={16} aria-hidden className="group-open:rotate-180" /></summary><div className="pt-3"><GuideStats items={[{ label: "1회 수유량", value: guide.perFeedAmount }, { label: "일일 총량", value: guide.dailyTotal }, { label: "수유 횟수", value: guide.frequency }, { label: "수유 간격", value: guide.interval }]} /></div></details><p className="text-sm leading-6 text-[var(--muted-foreground)]">월령별 참고 수치예요. 아기의 신호와 개별 수유 안내를 우선해요.</p>
    </GuideCard>

    <div className="space-y-3">
      <GuideAccordion title="수유 자세" readingKey="수유 자세 가이드" artwork="feeding" icon={<Baby size={20} />} description={`${guide.positions.length}가지 자세 · 궁금한 자세만 열어보세요`}>
        <div className="divide-y divide-[var(--border)]">{guide.positions.map(position => <details key={position.id} className="group py-1 first:pt-0 last:pb-0" data-feeding-position={position.id}>
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 py-3 [&::-webkit-details-marker]:hidden"><span className="min-w-0 flex-1"><span className="block break-words text-base font-semibold leading-6 text-[var(--foreground)]">{position.name}</span><span className="mt-1 block break-words text-sm leading-6 text-[var(--muted-foreground)]">{position.suitableFor}</span></span><ChevronDown size={17} aria-hidden className="shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
          <div className="pb-4 pt-1"><FormattedContent variant="prose" content={position.description} /></div>
        </details>)}</div>
      </GuideAccordion>

      <GuideAccordion title="트림시키기" readingKey="트림시키기 가이드" artwork="health" icon={<Baby size={20} />} tone="lilac" description="자세와 순서 살펴보기">
        <ol className="space-y-3">{guide.burpingTips.map((tip, index) => <li key={tip} className="flex items-start gap-3"><span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-lavender)] text-sm font-semibold text-violet-800 dark:text-violet-200">{index + 1}</span><span>{tip}</span></li>)}</ol>
      </GuideAccordion>

      <GuideAccordion title="젖병 세척·소독" readingKey="젖병 소독 & 관리" artwork="wash" icon={<Baby size={20} />} description={`${guide.bottleCleaning.length}단계 · 세척부터 보관까지`}>
        <ol className="divide-y divide-[var(--border)]">{guide.bottleCleaning.map(step => <li key={step.step} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-sky)] text-sm font-semibold text-[var(--brand)]">{step.step}</span><div className="min-w-0"><h4 className="text-base font-semibold text-[var(--foreground)]">{step.title}</h4><p className="mt-1 leading-7">{step.description}</p></div></li>)}</ol>
      </GuideAccordion>

      <GuideAccordion title="모유 보관" readingKey="모유 보관 가이드" artwork="storage" icon={<Baby size={20} />} tone="lilac" description="보관 장소와 해동 후 기준">
        <GuideStats items={[{ label: "실온", value: guide.breastMilkStorage.roomTemp }, { label: "냉장", value: guide.breastMilkStorage.fridge }, { label: "냉동", value: guide.breastMilkStorage.freezer }, { label: "해동 후", value: guide.breastMilkStorage.thawing }]} />
      </GuideAccordion>

      {guide.mixedFeedingTips.length > 0 && <GuideAccordion title="혼합수유 팁" artwork="feeding" icon={<Baby size={20} />} tone="amber"><ul className="list-disc space-y-3 pl-5">{guide.mixedFeedingTips.map(tip => <li key={tip}>{tip}</li>)}</ul></GuideAccordion>}

      <GuideAccordion title="수유할 때 궁금한 점" readingKey="수유 트러블슈팅" artwork="thermometer" icon={<Info size={20} />} tone="amber" description="상황별 안내와 주의사항">
        <div className="divide-y divide-[var(--border)]">{guide.troubleshooting.map(item => <section key={item.issue} className={`space-y-3 border-l-2 py-4 pl-3 first:pt-0 last:pb-0 ${urgencyClasses[item.urgency]}`}><h4 className="flex items-start gap-2 text-base font-semibold leading-7 text-[var(--foreground)]">{item.urgency === "info" ? <Info size={18} aria-hidden="true" className="mt-1 shrink-0 text-[var(--brand)]" /> : <AlertTriangle size={18} aria-hidden="true" className={`mt-1 shrink-0 ${item.urgency === "warning" ? "text-[var(--content-urgent)]" : "text-[var(--content-caution)]"}`} />}{item.issue}</h4><FormattedContent variant="prose" content={item.solution} /></section>)}</div>
      </GuideAccordion>
    </div>
    <details className="border-t border-[var(--border)] text-sm leading-6 text-[var(--muted-foreground)]"><summary className="min-h-11 cursor-pointer py-2.5 font-medium">수유 자세 참고 자료</summary><a href="https://safetosleep.nichd.nih.gov/safe-sleep/breastfeeding" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center py-2 text-[var(--brand)] underline">NIH · 수유와 안전한 수면<span className="sr-only"> (새 창)</span></a></details>
  </GuideContent>;
}

