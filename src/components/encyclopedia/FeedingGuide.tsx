"use client";

import { AlertTriangle, ChevronDown } from "lucide-react";
import FormattedContent from "@/components/ui/FormattedContent";
import { bottleCleaningEvidence, feedingCueEvidence, getFeedingGuideForMonth, milkSafety } from "@/lib/data/feeding-guide-data";
import { GuideAccordion, GuideCard, GuideContent } from "./GuidePresentation";
import HealthFAQEvidence from "./HealthFAQEvidence";

export default function FeedingGuide({ month }: { month: number }) {
  const guide = getFeedingGuideForMonth(month);
  if (!guide) return <GuideCard><p>해당 월령의 수유 가이드가 준비 중이에요</p></GuideCard>;
  return <GuideContent>
    <GuideAccordion title="배고픔·포만 신호" readingKey="수유량·횟수 참고 수치" artwork="feeding" tone="amber">
      <p className="font-semibold">{guide.feedingType}</p>
      <ul className="list-disc space-y-2 pl-5">{guide.feedingCues.map(cue => <li key={cue}>{cue}</li>)}</ul>
      <HealthFAQEvidence evidence={feedingCueEvidence} />
    </GuideAccordion>

      <GuideAccordion title="수유 자세" readingKey="수유 자세 가이드" artwork="rattle">
        <div className="divide-y divide-[var(--border)]">{guide.positions.map(position => <details key={position.id} className="group py-1 first:pt-0 last:pb-0" data-feeding-position={position.id}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 py-2.5 [&::-webkit-details-marker]:hidden"><span className="min-w-0 flex-1 break-words text-base font-semibold leading-6">{position.name}</span><ChevronDown size={17} aria-hidden className="shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
          <div className="space-y-2 pb-4 pt-1"><p className="text-sm text-[var(--muted-foreground)]">{position.suitableFor}</p><FormattedContent variant="prose" content={position.description} /></div>
        </details>)}</div>
      </GuideAccordion>

      <GuideAccordion title="트림시키기" readingKey="트림시키기 가이드" artwork="health">
        <ol className="space-y-3">{guide.burpingTips.map((tip, index) => <li key={tip} className="flex items-start gap-3"><span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-lavender)] text-sm font-semibold text-violet-800 dark:text-violet-200">{index + 1}</span><span>{tip}</span></li>)}</ol>
      </GuideAccordion>

      <GuideAccordion title="젖병 세척·소독" readingKey="젖병 소독 & 관리" artwork="wash">
        <ol className="divide-y divide-[var(--border)]">{guide.bottleCleaning.map(step => <li key={step.step} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-sky)] text-sm font-semibold text-[var(--brand)]">{step.step}</span><div className="min-w-0"><h4 className="text-base font-semibold text-[var(--foreground)]">{step.title}</h4><p className="mt-1 leading-7">{step.description}</p></div></li>)}</ol>
        <HealthFAQEvidence evidence={bottleCleaningEvidence} />
      </GuideAccordion>

      {Object.entries(milkSafety).map(([kind, topic]) => <GuideAccordion key={kind} title={topic.title} readingKey={kind === "breastMilk" ? "모유 보관 가이드" : undefined} artwork="storage">
        <dl className="divide-y divide-[var(--border)]">{topic.entries.map(({ label, text }) => <div key={label} className="space-y-1 py-3 first:pt-0 last:pb-0">
          <dt className="font-semibold">{label}</dt><dd className="leading-7">{text}</dd>
        </div>)}</dl>
        <HealthFAQEvidence evidence={topic.evidence} />
      </GuideAccordion>)}

      {guide.mixedFeedingTips.length > 0 && <GuideAccordion title="혼합수유 팁" artwork="feeding"><ul className="list-disc space-y-3 pl-5">{guide.mixedFeedingTips.map(tip => <li key={tip}>{tip}</li>)}</ul></GuideAccordion>}

      <GuideAccordion title="수유할 때 궁금한 점" readingKey="수유 트러블슈팅" artwork="thermometer">
        <div className="divide-y divide-[var(--border)]">
          {guide.troubleshooting.map(item => item.urgency === "warning" ? (
            <section key={item.issue} className="space-y-2 border-l-2 border-l-[var(--content-urgent)] py-3 pl-3">
              <h4 className="flex items-start gap-2 text-base font-semibold text-[var(--content-urgent)]"><AlertTriangle size={17} aria-hidden className="mt-1 shrink-0" />{item.issue}</h4>
              <FormattedContent variant="prose" content={item.solution} />
            </section>
          ) : (
            <details key={item.issue} className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 py-2.5 font-semibold [&::-webkit-details-marker]:hidden">
                {item.urgency === "caution" && <AlertTriangle size={16} aria-label="주의" className="shrink-0 text-[var(--content-caution)]" />}
                <span className="min-w-0 flex-1 break-words">{item.issue}</span>
                <ChevronDown size={16} aria-hidden className="shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <div className="pb-3"><FormattedContent variant="prose" content={item.solution} /></div>
            </details>
          ))}
        </div>
      </GuideAccordion>
    <details className="group border-t border-[var(--border)] text-sm leading-6 text-[var(--muted-foreground)]">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 py-2.5 font-medium [&::-webkit-details-marker]:hidden">
        수유 자세 참고 자료
        <ChevronDown size={16} aria-hidden className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <a href="https://safetosleep.nichd.nih.gov/safe-sleep/breastfeeding" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center py-2 text-[var(--brand)] underline">NIH · 수유와 안전한 수면<span className="sr-only"> (새 창)</span></a>
    </details>
  </GuideContent>;
}

