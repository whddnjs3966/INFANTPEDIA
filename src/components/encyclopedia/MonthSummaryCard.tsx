"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { presentationForMonth } from "@/lib/utils/content-presentation";
import { useReadingValue } from "@/components/reading/ReadingScope";
import EmphasizedText from "@/components/ui/EmphasizedText";
import { GuideDisclosure, GuideStats } from "./GuidePresentation";

type ReferenceItem = { label: string; value: string };
type MonthSummaryProps = {
  month: number;
  summary: string | null;
  reference: { feeding: ReferenceItem[]; sleep: ReferenceItem[] };
};

const referenceNote = "월령별 참고 정보예요. 하루 목표나 아기에게 정해진 양·횟수를 뜻하지 않으며 개별 안내가 있으면 따라주세요.";

export default function MonthSummaryCard({ month, summary, reference }: MonthSummaryProps) {
  const id = useId();
  const [expanded, setExpanded] = useReadingValue<boolean>("month-summary:expanded", false);
  const [summaryOpen, setSummaryOpen] = useReadingValue<boolean>("month-summary:open", expanded);
  const [legacyReferenceOpen] = useReadingValue<boolean>("month-summary:reference", false);
  const [feedingOpen, setFeedingOpen] = useReadingValue<boolean>("month-summary:feeding", legacyReferenceOpen);
  const [sleepOpen, setSleepOpen] = useReadingValue<boolean>("month-summary:sleep", legacyReferenceOpen);
  const presentation = summary ? presentationForMonth(month, summary) : null;
  const showFull = expanded || !presentation;

  return <article aria-label={`${month}개월 핵심 요약`} data-reading-anchor="month-summary" className="space-y-2.5">
    {summary && <GuideDisclosure title="이번 달 알아둘 점" artwork="book" open={summaryOpen} onToggle={() => setSummaryOpen(value => !value)}>
      <div id={`${id}-source`} hidden={!showFull} className="whitespace-pre-line break-words" data-month-summary-source>
        <EmphasizedText text={summary} marks={presentation?.emphasis ?? []} />
      </div>
      {presentation && <>
        <ul hidden={showFull} className="space-y-2" aria-label="핵심 포인트">
          {presentation.preview.map(point => <li key={point} className="flex gap-2.5">
            <span aria-hidden className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
            <span className="min-w-0 break-words"><EmphasizedText text={point} marks={presentation.emphasis} /></span>
          </li>)}
        </ul>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`${id}-source`}
          onClick={() => setExpanded(value => !value)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg pr-2 text-sm font-semibold text-[var(--brand)]"
        >
          {expanded ? "핵심만 보기" : "설명 원문 자세히"}
          <ChevronDown size={16} aria-hidden className={cn("shrink-0 transition-transform duration-200 motion-reduce:transition-none", expanded && "rotate-180")} />
        </button>
      </>}
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">월령별 공통 설명 · 실제 관찰·수유·수면 기록과는 달라요.</p>
    </GuideDisclosure>}
    <GuideDisclosure title="수유 참고" artwork="feeding" tone="amber" tinted open={feedingOpen} onToggle={() => setFeedingOpen(value => !value)}>
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{referenceNote}</p>
      <GuideStats items={reference.feeding} />
    </GuideDisclosure>
    <GuideDisclosure title="수면 참고" artwork="moon" tone="lilac" tinted open={sleepOpen} onToggle={() => setSleepOpen(value => !value)}>
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{referenceNote}</p>
      <GuideStats items={reference.sleep} />
    </GuideDisclosure>
  </article>;
}
