"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
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
  const reduceMotion = useReducedMotion();


  return <motion.header
    data-page-header
    initial={reduceMotion ? false : { opacity: 0, y: -2 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduceMotion ? 0 : 0.2 }}
    className="pt-safe px-5 pb-4"
  >
    <div className="flex items-center gap-3">
      <TopicArtwork label={title} kind={title === "육아 꿀팁" ? "outing" : undefined} className="h-[56px] w-[56px]" />
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-[1.375rem] font-semibold leading-7 tracking-[-0.025em] text-[var(--foreground)]">{title}</h1>
        {eyebrow && <p className="mt-0.5 break-words text-sm font-medium leading-5 text-[var(--muted-foreground)]">{eyebrow}</p>}
      </div>
      {action ?? (showSearch ? <button type="button" onClick={() => router.push("/search")} className="header-action" aria-label="육아 정보 검색"><Search size={19} strokeWidth={1.8} aria-hidden /></button> : null)}
    </div>
    {description && <p className="mt-2.5 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>}
  </motion.header>;
}

