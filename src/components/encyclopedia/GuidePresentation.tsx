"use client";

import { useId, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import type { GuideArtworkKind } from "@/components/illustrations/GuideArtwork";
import { useReadingValue } from "@/components/reading/ReadingScope";
import { cn } from "@/lib/utils";

type GuideTone = "sage" | "amber" | "lilac";
const tones: Record<GuideTone, { surface: string; icon: string }> = {
  sage: { surface: "bg-[var(--surface-sky)]", icon: "text-[var(--brand)]" },
  amber: { surface: "bg-[var(--surface-peach)]", icon: "text-[var(--art-peach-ink)]" },
  lilac: { surface: "bg-[var(--surface-lavender)]", icon: "text-violet-800 dark:text-violet-200" },
};

export function GuideContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-3 text-base leading-[1.65] text-[var(--foreground)]", className)}>{children}</div>;
}

export function GuideHeading({ title, description, icon, tone = "sage" }: { title: string; description?: string; icon?: ReactNode; tone?: GuideTone }) {
  return <div className="flex items-center gap-2.5">
    {icon && <span aria-hidden="true" className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tones[tone].surface, tones[tone].icon)}>{icon}</span>}
    <div className="min-w-0">
      <h3 className="break-words text-base font-semibold leading-snug">{title}</h3>
      {description && <p className="mt-0.5 break-words text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>}
    </div>
  </div>;
}

export function GuideStats({ items }: { items: { label: string; value: ReactNode }[] }) {
  return <dl className="@container divide-y divide-[var(--border)]">
    {items.map(item => <div key={item.label} className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] gap-2 py-2.5 first:pt-0 last:pb-0 @max-[16rem]:grid-cols-1 @max-[16rem]:gap-0.5">
      <dt className="break-words text-sm leading-relaxed text-[var(--muted-foreground)]">{item.label}</dt>
      <dd className="min-w-0 break-words text-base font-semibold leading-snug tabular-nums">{item.value}</dd>
    </div>)}
  </dl>;
}

export function GuideCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("space-y-3 rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4", className)}>{children}</section>;
}

type GuideDisclosureProps = {
  title: string;
  icon?: ReactNode;
  artwork?: GuideArtworkKind;
  compact?: boolean;
  description?: string;
  meta?: ReactNode;
  children: ReactNode;
  tone?: GuideTone;
  tinted?: boolean;
  flat?: boolean;
  headingLevel?: 3 | 4;
};

export function GuideDisclosure({
  title, icon, artwork, compact = false, description, meta, children, tone = "sage",
  tinted = false, flat = false, headingLevel = 3, open, onToggle, anchor,
}: GuideDisclosureProps & { open: boolean; onToggle: () => void; anchor?: string }) {
  const id = useId();
  const Heading = headingLevel === 3 ? "h3" : "h4";
  return <section data-reading-anchor={anchor} className={cn(
    "@container min-w-0",
    flat ? "border-b border-[var(--border)] last:border-b-0" : "rounded-[20px] border border-[var(--border)] bg-[var(--card)]",
  )}>
    <Heading>
      <button
        id={`${id}-heading`}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-body`}
        onClick={onToggle}
        className={cn(
          "flex min-h-[54px] w-full items-center gap-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)] motion-reduce:transition-none",
          flat ? "px-0" : "px-3.5",
          !flat && (open ? "rounded-t-[19px]" : "rounded-[19px]"),
          !flat && (open || tinted ? tones[tone].surface : "hover:bg-[var(--surface-muted)]"),
        )}
      >
        {(artwork || (!compact && icon)) && <TopicArtwork kind={artwork} label={title} className={cn("rounded-xl @max-[14rem]:hidden", compact ? "h-8 w-8" : "h-9 w-9")} />}
        <span className="min-w-0 flex-1">
          <span className="block break-words text-base font-semibold leading-snug tracking-[-0.01em]">{title}</span>
          {meta && <span className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-sm font-normal leading-snug text-[var(--muted-foreground)]">{meta}</span>}
        </span>
        <ChevronDown size={17} aria-hidden className={cn("shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} />
      </button>
    </Heading>
    <div
      id={`${id}-body`}
      role="region"
      aria-labelledby={`${id}-heading`}
      hidden={!open}
      className={cn(
        "space-y-3 break-words text-base leading-[1.65]",
        flat ? "pb-3" : "border-t border-[var(--border)] px-4 py-3.5",
        open && "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-200",
      )}
    >
      {description && <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>}
      {children}
    </div>
  </section>;
}

export function GuideAccordion({ defaultOpen = false, readingKey, ...props }: GuideDisclosureProps & {
  defaultOpen?: boolean;
  readingKey?: string;
}) {
  const key = `accordion:${readingKey ?? props.title}`;
  const [open, setOpen] = useReadingValue(key, defaultOpen);
  return <GuideDisclosure {...props} open={open} onToggle={() => setOpen(value => !value)} anchor={key} />;
}
