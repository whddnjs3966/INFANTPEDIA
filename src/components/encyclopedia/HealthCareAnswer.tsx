import { Check, ShieldAlert, Stethoscope } from "lucide-react";
import type { HealthFAQItem } from "@/lib/data/health-faq-data";
import EmphasizedText from "@/components/ui/EmphasizedText";

export default function HealthCareAnswer({ faq, compact = false }: { faq: Pick<HealthFAQItem, "care" | "answer"> & Partial<Pick<HealthFAQItem, "urgency">>; compact?: boolean }) {
  const lineHeight = compact ? "leading-[1.65]" : "leading-7";
  if (!faq.care) return <p data-health-care-answer className={`whitespace-pre-line break-words text-base text-[var(--foreground)] ${lineHeight}`}><EmphasizedText text={faq.answer} /></p>;
  const { summary, steps, avoid, seekHelp } = faq.care;
  const urgent = faq.urgency === "emergency";
  const help = <section aria-label="진료와 도움" className={urgent ? "rounded-xl bg-[var(--surface-peach)] px-3 py-2.5" : "border-t border-[var(--border)] pt-4"}>
    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--content-urgent)]"><Stethoscope size={17} aria-hidden />진료·도움</h4>
    <p><EmphasizedText text={seekHelp} /></p>
  </section>;
  return <div data-health-care-answer className={`space-y-4 break-words text-base ${lineHeight}`}>
    <p className="border-l-2 border-[var(--brand)] pl-3 font-medium"><EmphasizedText text={summary} /></p>
    {urgent && help}
    <section aria-label="이렇게 살펴보세요">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--brand)]"><Check size={17} aria-hidden />살펴볼 것</h4>
      <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-[var(--muted-foreground)]">{steps.map((step, i) => <li key={i} className="pl-1"><EmphasizedText text={step} /></li>)}</ol>
    </section>
    {avoid.length > 0 && <section aria-label="피해주세요" className="border-l-2 border-[var(--content-caution)] pl-3">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--content-caution)]"><ShieldAlert size={17} aria-hidden />피할 행동</h4>
      <ul className="list-disc space-y-2 pl-5">{avoid.map((item, i) => <li key={i} className="pl-1"><EmphasizedText text={item} /></li>)}</ul>
    </section>}
    {!urgent && help}
  </div>;
}
