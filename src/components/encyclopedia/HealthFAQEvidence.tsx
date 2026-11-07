import { BookOpen, ExternalLink } from "lucide-react";
import type { HealthEvidence } from "@/lib/data/health-faq-data";
import { healthEvidenceView } from "@/lib/utils/health-evidence-view";
import { isValidDateOnly } from "@/lib/utils/date";

export default function HealthFAQEvidence({ evidence }: { evidence?: HealthEvidence }) {
  const { sources, compact } = healthEvidenceView(evidence);
  if (!sources.length) return null;
  const checkedOn = evidence?.checkedOn && isValidDateOnly(evidence.checkedOn) ? evidence.checkedOn : null;
  return <aside aria-label="답변 참고 자료" className="mt-5 border-t border-[var(--border)] pt-4 text-sm leading-6 text-[var(--muted-foreground)]">
    <p className="flex items-center gap-1.5"><BookOpen size={15} aria-hidden />{compact}</p>
    <details className="mt-2"><summary className="min-h-12 cursor-pointer py-3 text-sm font-semibold text-[var(--foreground)]">참고 자료 자세히 보기</summary>
      <ul className="space-y-1">{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 break-words py-2 font-semibold text-[var(--brand)] underline underline-offset-4">{source.title}<ExternalLink size={13} className="shrink-0" aria-hidden /><span className="sr-only">새 창</span></a></li>)}</ul>
      {(checkedOn || evidence?.scope) && <dl className="mt-3 space-y-2">{checkedOn && <div><dt className="font-semibold">자료 확인일</dt><dd>{checkedOn}</dd></div>}{evidence?.scope && <div><dt className="font-semibold">참고 범위</dt><dd>{evidence.scope}</dd></div>}</dl>}
      <p className="mt-3">개인별 진단·치료는 의료진과 상의해 주세요.</p>
    </details>
  </aside>;
}
