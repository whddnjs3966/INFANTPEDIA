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
    <div className="flex items-end justify-between px-1">
      <div>
        <h2 className="text-[17px] font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
          {title}
        </h2>
        {caption && (
          <p className="mt-0.5 text-[12px] font-medium text-stone-500 dark:text-stone-400">
            {caption}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-0.5 text-[13px] font-semibold text-[#14B8A6] dark:text-teal-400 active:opacity-60"
        >
          {action.label}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
