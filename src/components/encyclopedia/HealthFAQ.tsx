"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  AlertTriangle,
  Info,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FormattedContent from "@/components/ui/FormattedContent";
import {
  getFAQsForMonth,
  searchFAQs,
  faqCategories,
  type FAQCategory,
} from "@/lib/data/health-faq-data";
import { useDragScroll } from "@/hooks/useDragScroll";

interface HealthFAQProps {
  month: number;
}

const urgencyConfig = {
  emergency: {
    label: "응급",
    accent: "bg-red-500",
    textAccent: "text-red-600 dark:text-red-400",
    icon: AlertTriangle,
  },
  caution: {
    label: "주의",
    accent: "bg-amber-500",
    textAccent: "text-amber-600 dark:text-amber-400",
    icon: AlertCircle,
  },
  info: {
    label: "정보",
    accent: "bg-sky-500",
    textAccent: "text-sky-600 dark:text-sky-400",
    icon: Info,
  },
} as const;

const urgencyGroups = [
  { key: "emergency" as const, label: "응급 상황", desc: "즉시 병원 방문" },
  { key: "caution" as const, label: "주의 관찰", desc: "경과 관찰·상담" },
  { key: "info" as const, label: "일반 정보", desc: "참고 지식" },
];

export default function HealthFAQ({ month }: HealthFAQProps) {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const {
    ref: catRef,
    dragProps: catDrag,
    suppressClickIfDragging: suppressCatClick,
  } = useDragScroll<HTMLDivElement>();

  const faqs = useMemo(() => {
    if (searchQuery.trim()) {
      const results = searchFAQs(searchQuery);
      if (selectedCategory !== "all") {
        return results.filter((f) => f.category === selectedCategory);
      }
      return results;
    }
    if (selectedCategory === "all") {
      return getFAQsForMonth(month);
    }
    return getFAQsForMonth(month, selectedCategory);
  }, [month, selectedCategory, searchQuery]);

  const grouped = useMemo(() => {
    const g: Record<"emergency" | "caution" | "info", typeof faqs> = {
      emergency: [],
      caution: [],
      info: [],
    };
    faqs.forEach((f) => g[f.urgency].push(f));
    return g;
  }, [faqs]);

  const getCategoryCount = (catId: FAQCategory) =>
    getFAQsForMonth(month, catId).length;

  const totalCount = getFAQsForMonth(month).length;

  return (
    <div className="space-y-4 pb-8">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
          strokeWidth={2.3}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="증상·키워드를 검색하세요"
          className="w-full rounded-2xl bg-white dark:bg-stone-900 py-2.5 pl-9 pr-4 text-[13px] font-medium text-stone-800 placeholder-stone-400 outline-none ring-1 ring-stone-200/80 dark:ring-stone-700/60 dark:text-stone-100 dark:placeholder-stone-500 focus:ring-2 focus:ring-[#14B8A6]/30 transition-shadow"
        />
      </div>

      {/* Category chips — neutral */}
      <div
        ref={catRef}
        {...catDrag}
        className="flex gap-1.5 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none -mx-0.5 px-0.5"
      >
        <button
          onClick={suppressCatClick(() => setSelectedCategory("all"))}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold tracking-tight transition-colors",
            selectedCategory === "all"
              ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
              : "bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 ring-1 ring-stone-200/80 dark:ring-stone-700/60"
          )}
        >
          전체
          {totalCount > 0 && (
            <span className="ml-1 tabular-nums text-[11px] opacity-70">
              {totalCount}
            </span>
          )}
        </button>
        {faqCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);
          return (
            <button
              key={cat.id}
              onClick={suppressCatClick(() => setSelectedCategory(cat.id))}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold tracking-tight transition-colors",
                isActive
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 ring-1 ring-stone-200/80 dark:ring-stone-700/60"
              )}
            >
              {cat.label}
              {count > 0 && (
                <span className="ml-1 tabular-nums text-[11px] opacity-70">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {faqs.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-stone-900 p-8 text-center elevation-1">
          <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400">
            {searchQuery
              ? "검색 결과가 없어요"
              : "해당 조건의 FAQ가 없어요"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {urgencyGroups.map((group) => {
            const items = grouped[group.key];
            if (items.length === 0) return null;
            const config = urgencyConfig[group.key];
            const Icon = config.icon;

            return (
              <section key={group.key} className="space-y-2">
                {/* Group header */}
                <div className="flex items-center gap-2 px-1">
                  <Icon
                    size={13}
                    className={config.textAccent}
                    strokeWidth={2.4}
                  />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-stone-700 dark:text-stone-300">
                    {group.label}
                  </h3>
                  <span className="text-[11px] font-semibold tabular-nums text-stone-400 dark:text-stone-500">
                    {items.length}
                  </span>
                  <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                  <span className="text-[10.5px] font-medium text-stone-400 dark:text-stone-500">
                    {group.desc}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {items.map((faq, idx) => {
                    const isOpen = openFAQ === faq.id;
                    const catInfo = faqCategories.find(
                      (c) => c.id === faq.category
                    );

                    return (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                        className={cn(
                          "overflow-hidden rounded-3xl bg-white dark:bg-stone-900 transition-shadow",
                          isOpen
                            ? "shadow-[0_6px_20px_rgba(15,15,20,0.08)]"
                            : "elevation-1"
                        )}
                      >
                        <button
                          onClick={() => setOpenFAQ(isOpen ? null : faq.id)}
                          className="flex w-full items-start gap-3 p-4 text-left"
                        >
                          {/* Vertical accent bar */}
                          <span
                            className={cn(
                              "mt-1 h-5 w-[3px] shrink-0 rounded-full",
                              config.accent
                            )}
                          />

                          <div className="flex-1 min-w-0">
                            {/* Eyebrow */}
                            <div className="flex items-center gap-1.5">
                              {catInfo && (
                                <>
                                  <span className="text-[10.5px] font-bold tracking-[0.08em] text-stone-400 dark:text-stone-500">
                                    {catInfo.label}
                                  </span>
                                  <span className="text-stone-300 dark:text-stone-700">
                                    ·
                                  </span>
                                </>
                              )}
                              <span
                                className={cn(
                                  "text-[10.5px] font-bold tracking-[0.08em]",
                                  config.textAccent
                                )}
                              >
                                {config.label}
                              </span>
                            </div>
                            {/* Question */}
                            <p className="mt-0.5 text-[14px] font-bold leading-snug tracking-tight text-stone-900 dark:text-stone-100">
                              {faq.question}
                            </p>
                          </div>

                          {/* Chevron */}
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-0.5 shrink-0"
                          >
                            <ChevronDown
                              size={16}
                              className="text-stone-400 dark:text-stone-500"
                              strokeWidth={2.2}
                            />
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4">
                                <div className="border-t border-stone-100 pt-3 dark:border-stone-800">
                                  <FormattedContent content={faq.answer} />
                                </div>
                                {faq.tags.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1">
                                    {faq.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10.5px] font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Result count */}
      {faqs.length > 0 && (
        <p className="text-center text-[11px] font-medium tabular-nums text-stone-400 dark:text-stone-500">
          총 {faqs.length}개
        </p>
      )}
    </div>
  );
}
