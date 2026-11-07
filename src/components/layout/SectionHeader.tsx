"use client";

import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  level?: 2 | 3;
  caption?: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

export default function SectionHeader({ title, caption, action, level = 2 }: SectionHeaderProps) {
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <Heading className="text-xl font-bold leading-7 tracking-[-0.02em] text-[var(--foreground)]">
          {title}
        </Heading>
        {caption && (
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {caption}
          </p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="flex min-h-12 shrink-0 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-[var(--brand)] transition-colors hover:bg-[var(--accent-soft)] active:bg-[var(--accent-soft)]"
        >
          {action.label}
          <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
