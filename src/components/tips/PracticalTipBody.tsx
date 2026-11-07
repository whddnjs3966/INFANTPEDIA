import { ArrowUpRight } from "lucide-react";
import { practicalEvidence, type PracticalTip } from "@/lib/data/practical-tips-data";

export default function PracticalTipBody({ tip }: { tip: PracticalTip }) {
  const evidence = practicalEvidence(tip);
  return <div data-practical-tip={tip.key} className="space-y-4 text-base leading-7">
    <ol className="space-y-3">{tip.steps.map((step, index) => <li key={step} className="flex items-start gap-3"><span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-sm font-semibold text-[var(--muted-foreground)]">{index + 1}</span><span>{step}</span></li>)}</ol>
    <p className="border-l-2 border-[var(--content-caution)] pl-3 text-sm leading-6 text-[var(--content-caution)]"><strong>기억해 주세요</strong><br />{tip.caution}</p>
    {evidence ? <details className="text-sm leading-6 text-[var(--muted-foreground)]"><summary className="min-h-11 cursor-pointer py-2.5 font-medium">참고 자료</summary><p className="mb-2">2026-11-06 공개 자료 대조 · 생활 구성 예시는 편집 제안이에요.</p>{evidence.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1.5 py-2 font-medium text-[var(--brand)] underline underline-offset-4">{source.title}<ArrowUpRight size={14} aria-hidden /><span className="sr-only">새 창</span></a>)}</details> : <p className="text-sm leading-6 text-[var(--muted-foreground)]">생활 정리를 위한 아이디어예요. 의학적 권고가 아니에요.</p>}
  </div>;
}
