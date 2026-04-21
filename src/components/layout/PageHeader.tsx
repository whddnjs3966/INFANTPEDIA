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
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-safe px-5 pb-4"
    >
      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#14B8A6] dark:text-teal-400">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[32px] font-black tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-[14px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action ? (
          action
        ) : showSearch ? (
          <button
            onClick={() => router.push("/search")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 elevation-1 active:scale-95 transition-transform"
            aria-label="검색"
          >
            <Search size={20} strokeWidth={2.1} />
          </button>
        ) : null}
      </div>
    </motion.header>
  );
}
