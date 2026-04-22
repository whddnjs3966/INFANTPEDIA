"use client";

import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  caption?: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

export default function SectionHeader({ title, caption, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-3 px-1">
      <div className="min-w-0">
        <h2 className="text-[18px] font-black tracking-[-0.015em] text-stone-900 dark:text-stone-50 leading-tight">
          {title}
        </h2>
        {caption && (
          <p className="mt-0.5 text-[12px] font-medium text-stone-400 dark:text-stone-500 truncate">
            {caption}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex shrink-0 items-center gap-0.5 text-[12px] font-bold text-[#14B8A6] dark:text-teal-400 active:opacity-60 transition-opacity"
        >
          {action.label}
          <ChevronRight size={14} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}
