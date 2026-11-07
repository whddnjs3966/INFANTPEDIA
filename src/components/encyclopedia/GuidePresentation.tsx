"use client";

import { useId, type ReactNode } from "react";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import type { GuideArtworkKind } from "@/components/illustrations/GuideArtwork";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useReadingValue } from "@/components/reading/ReadingScope";

type GuideTone = "sage" | "amber" | "lilac";
const tones: Record<GuideTone, string> = {
  sage: "bg-[var(--surface-sky)] text-[var(--brand)]",
  amber: "bg-[var(--surface-peach)] text-[var(--art-peach-ink)]",
  lilac: "bg-[var(--surface-lavender)] text-violet-800 dark:text-violet-200",
};

export function GuideContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-4 pb-6 text-base leading-7 text-[var(--foreground)]", className)}>{children}</div>;
}

export function GuideHeading({ title, description, icon, tone = "sage" }: { title: string; description?: string; icon?: ReactNode; tone?: GuideTone }) {
  return <div className="flex items-start gap-3">
    {icon && <span aria-hidden="true" className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]", tones[tone])}>{icon}</span>}
    <div className="min-w-0"><h3 className="text-lg font-bold leading-7 tracking-tight text-stone-900 dark:text-stone-100">{title}</h3>{description && <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p>}</div>
  </div>;
}

export function GuideStats({ items }: { items: { label: string; value: ReactNode }[] }) {
  return <dl className="@container divide-y divide-[var(--border)]">{items.map(item => <div key={item.label} className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0 @max-[16rem]:grid-cols-1 @max-[16rem]:gap-1"><dt className="break-words text-sm leading-6 text-[var(--muted-foreground)]">{item.label}</dt><dd className="min-w-0 break-words text-base font-semibold leading-6 text-[var(--foreground)]">{item.value}</dd></div>)}</dl>;
}

export function GuideCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("surface-card space-y-4 p-5", className)}>{children}</section>;
}

export function GuideAccordion({ title, icon, artwork, compact = false, description, meta, children, defaultOpen = false, readingKey }: { title: string; icon?: ReactNode; artwork?: GuideArtworkKind; compact?: boolean; description?: string; meta?: ReactNode; children: ReactNode; tone?: GuideTone; defaultOpen?: boolean; readingKey?: string }) {
  const [open, setOpen] = useReadingValue(`accordion:${readingKey ?? title}`, defaultOpen);
  const id = useId();
  return <section data-reading-anchor={`accordion:${readingKey ?? title}`} style={{ borderColor: open ? "var(--brand)" : undefined }} className="@container surface-card overflow-hidden transition-colors motion-reduce:transition-none">
    <h3><button id={`${id}-heading`} type="button" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => setOpen(value => !value)} className={cn("flex w-full items-center gap-3 px-4 text-left", compact ? "min-h-16 py-3" : "min-h-20 py-4", open && "bg-[var(--surface-sky)]")}>
      {!compact && (icon || artwork) && <TopicArtwork kind={artwork} label={title} className="h-[48px] w-[48px] @max-[18rem]:hidden" />}
      <span className="min-w-0 flex-1"><span className="block break-words text-base font-semibold leading-7 text-stone-900 dark:text-stone-100">{title}</span>{description && <span className="mt-0.5 block text-sm font-normal leading-6 text-stone-600 dark:text-stone-300">{description}</span>}{meta && <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm font-normal leading-6 text-stone-600 dark:text-stone-300">{meta}</span>}</span>
      <ChevronDown size={19} aria-hidden="true" className={cn("shrink-0 text-stone-500 transition-transform motion-reduce:transition-none dark:text-stone-400", open && "rotate-180")} />
    </button></h3>
    <div id={`${id}-body`} role="region" aria-labelledby={`${id}-heading`} hidden={!open} className="border-t border-[var(--border)] p-4"><div className="space-y-4 break-words text-base leading-7 text-[var(--foreground)]">{children}</div></div>
  </section>;
}



