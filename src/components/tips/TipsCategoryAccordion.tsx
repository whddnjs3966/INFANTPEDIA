"use client";
import { useId } from "react";
import { Plus, Minus } from "lucide-react";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import { cn } from "@/lib/utils";
import { useReadingValue } from "@/components/reading/ReadingScope";
import FormattedContent from "@/components/ui/FormattedContent";
import HealthFAQEvidence from "@/components/encyclopedia/HealthFAQEvidence";
import type { HealthEvidence } from "@/lib/data/health-faq-data";
import type { PracticalTip } from "@/lib/data/practical-tips-data";
import PracticalTipBody from "./PracticalTipBody";

interface Tip { evidence?: HealthEvidence; practical?: PracticalTip; id: number; title: string; content: string; category: string; month_id: number; }
const categories = [{ key: "sleep_tips", label: "잠", art: "sleep" }, { key: "feeding_tips", label: "먹기", art: "feeding" }, { key: "crying_tips", label: "교감·달래기", art: "play" }, { key: "outing_tips", label: "외출", art: "outing" }] as const;
export default function TipsCategoryAccordion({ tips, isLoading }: { tips: Tip[]; isLoading: boolean }) {
  const [storedCategory, setCategory] = useReadingValue<string | null>("tips:category", null);
  const [openTip, setOpenTip] = useReadingValue<string | null>("tips:v4:detail", null);
  const active = categories.some(c => c.key === storedCategory) ? storedCategory : "sleep_tips";
  const id = useId(), items = tips.filter(tip => tip.category === active);
  if (isLoading) return <div role="status" aria-label="주제별 팁을 불러오는 중" className="mx-5 h-40 animate-pulse rounded-3xl bg-[var(--surface-muted)]" />;
  return <div className="px-5" data-practical-topics>
    <div role="group" aria-label="팁 주제 선택" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,4rem),1fr))] gap-2 rounded-2xl">
      {categories.map(({ key, label, art }) => <button key={key} type="button" aria-pressed={active === key} onClick={() => setCategory(key)} className={cn("flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-sm font-semibold transition-colors", active === key ? "bg-[var(--card)] text-[var(--brand)] ring-2 ring-[var(--brand)]/30" : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}><TopicArtwork kind={art} className="h-12 w-12" /><span className="break-words text-center leading-5">{label}</span></button>)}
    </div>
    <div className="mt-4 space-y-3" aria-live="polite">
      {items.length ? items.map(tip => { const open = openTip === String(tip.id), panel = `${id}-${tip.id}`; return <article key={tip.id} data-reading-anchor={`tips:item:${tip.id}`} className="surface-card overflow-hidden">
        <h3><button type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpenTip(open ? null : String(tip.id))} className="group flex min-h-16 w-full items-start gap-3 p-5 text-left"><span className="min-w-0 flex-1"><span className="block text-base font-semibold leading-6 tracking-tight">{tip.title}</span>{tip.practical && <span className="mt-2 block text-sm font-normal leading-6 text-[var(--muted-foreground)]">{tip.practical.takeaway}</span>}</span><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--muted-foreground)]">{open ? <Minus size={15} aria-hidden /> : <Plus size={15} aria-hidden />}</span></button></h3>
        <div id={panel} hidden={!open} className="px-5 pb-5">{tip.practical ? <PracticalTipBody tip={tip.practical} /> : <><FormattedContent content={tip.content} className="text-base leading-7" />{tip.evidence && <HealthFAQEvidence evidence={tip.evidence} />}</>}</div>
      </article>; }) : <p className="py-5 text-base leading-7 text-[var(--muted-foreground)]">이 월령의 팁이 아직 없어요. 다른 주제를 골라보세요.</p>}
    </div>
  </div>;
}
