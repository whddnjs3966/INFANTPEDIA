"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  showSearch?: boolean;
  action?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, showSearch, action }: PageHeaderProps) {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="pt-safe px-5 pb-3"
    >
      <div className="flex items-end justify-between gap-3 pt-3">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#14B8A6] dark:text-teal-400">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[26px] font-black tracking-[-0.02em] text-stone-900 dark:text-stone-50 leading-[1.15]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[13px] font-medium text-stone-500 dark:text-stone-400 leading-snug">
              {description}
            </p>
          )}
        </div>
        {action ? (
          action
        ) : showSearch ? (
          <button
            onClick={() => router.push("/search")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur text-stone-700 dark:text-stone-200 ring-1 ring-stone-200/80 dark:ring-stone-700/80 active:scale-95 transition-transform"
            aria-label="검색"
          >
            <Search size={18} strokeWidth={2.2} />
          </button>
        ) : null}
      </div>
    </motion.header>
  );
}
