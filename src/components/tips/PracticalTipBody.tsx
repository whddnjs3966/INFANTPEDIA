import { ArrowUpRight, ChevronDown } from "lucide-react";
import { practicalEvidence, type PracticalTip } from "@/lib/data/practical-tips-data";

export default function PracticalTipBody({ tip }: { tip: PracticalTip }) {
  const evidence = practicalEvidence(tip);
  return <div data-practical-tip={tip.key} className="space-y-3 text-base leading-[1.65]">
    <p className="font-semibold">{tip.takeaway}</p>
    <ol className="space-y-2.5">{tip.steps.map((step, index) => <li key={step} className="flex items-start gap-2.5">
      <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-semibold text-[var(--brand)]">{index + 1}</span>
      <span className="min-w-0 break-words">{step}</span>
    </li>)}</ol>
    <p className="border-l-2 border-[var(--content-caution)] pl-3 text-sm leading-[1.65] text-[var(--content-caution)]"><strong>기억해 주세요</strong><br />{tip.caution}</p>
    {evidence ? <details className="tips-source border-t border-[var(--border)] text-sm leading-6 text-[var(--muted-foreground)]">
      <summary>참고 자료<ChevronDown size={16} className="tips-chevron" aria-hidden /></summary>
      <p className="mb-2">2026-11-06 공개 자료 대조 · 생활 구성 예시는 편집 제안이에요.</p>
      {evidence.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1.5 py-2 font-medium text-[var(--brand)] underline underline-offset-4">
        <span className="min-w-0 break-words">{source.title}</span><ArrowUpRight size={14} className="shrink-0" aria-hidden /><span className="sr-only">새 창</span>
      </a>)}
    </details> : <p className="text-sm leading-6 text-[var(--muted-foreground)]">생활 정리를 위한 아이디어예요. 의학적 권고가 아니에요.</p>}
  </div>;
}
