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
  type HealthFAQItem,
} from "@/lib/data/health-faq-data";

interface HealthFAQProps {
  month: number;
}

const urgencyConfig = {
  info: {
    dot: "bg-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    label: "정보",
    icon: Info,
  },
  caution: {
    dot: "bg-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    label: "주의",
    icon: AlertCircle,
  },
  emergency: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    
    text: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    label: "응급",
    icon: AlertTriangle,
  },
};

const categoryColorMap: Record<string, { bg: string; active: string; text: string }> = {
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    active: "bg-red-500 dark:bg-red-600",
    text: "text-red-700 dark:text-red-300",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    active: "bg-pink-500 dark:bg-pink-600",
    text: "text-pink-700 dark:text-pink-300",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    active: "bg-green-500 dark:bg-green-600",
    text: "text-green-700 dark:text-green-300",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    active: "bg-sky-500 dark:bg-sky-600",
    text: "text-sky-700 dark:text-sky-300",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    active: "bg-purple-500 dark:bg-purple-600",
    text: "text-purple-700 dark:text-purple-300",
  },
};

export default function HealthFAQ({ month }: HealthFAQProps) {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

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

  const emergencyFAQs = useMemo(
    () => getFAQsForMonth(month).filter((f) => f.urgency === "emergency"),
    [month]
  );

  const sortedFAQs = useMemo(() => {
    const order = { emergency: 0, caution: 1, info: 2 };
    return [...faqs].sort((a, b) => order[a.urgency] - order[b.urgency]);
  }, [faqs]);

  const getCategoryCount = (catId: FAQCategory) =>
    getFAQsForMonth(month, catId).length;

  return (
    <div className="space-y-3 pb-8">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="증상이나 질문을 검색하세요..."
          className="w-full rounded-2xl bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-rose-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-rose-900/30"
        />
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar"
      >
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
            selectedCategory === "all"
              ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          전체 {faqs.length > 0 && `(${getFAQsForMonth(month).length})`}
        </button>
        {faqCategories.map((cat) => {
          const colors = categoryColorMap[cat.color] || categoryColorMap.purple;
          const isActive = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                isActive
                  ? cn(colors.active, "text-white")
                  : cn(colors.bg, colors.text)
              )}
            >
              {cat.emoji} {cat.label}
              {count > 0 && ` (${count})`}
            </button>
          );
        })}
      </motion.div>

      {/* Emergency Banner */}
      {emergencyFAQs.length > 0 && selectedCategory === "all" && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[28px] bg-gradient-to-r from-red-50 to-rose-50 p-4 dark:from-red-950/40 dark:to-rose-950/40"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-sm font-bold text-red-700 dark:text-red-300">
              🚨 이런 증상은 즉시 병원에 가세요
            </p>
          </div>
          <div className="space-y-1">
            {emergencyFAQs.slice(0, 3).map((faq) => (
              <p key={faq.id} className="text-[12px] text-red-600 dark:text-red-300">
                • {faq.question}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* FAQ List */}
      <div className="space-y-2">
        {sortedFAQs.length === 0 ? (
          <div className="rounded-[28px] bg-white p-8 text-center dark:bg-gray-800">
            <p className="text-3xl">🔍</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "검색 결과가 없어요"
                : "해당 카테고리의 FAQ가 없어요"}
            </p>
          </div>
        ) : (
          sortedFAQs.map((faq, idx) => {
            const config = urgencyConfig[faq.urgency];
            const UrgencyIcon = config.icon;
            const isOpen = openFAQ === faq.id;
            const catInfo = faqCategories.find((c) => c.id === faq.category);

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <button
                  onClick={() => setOpenFAQ(isOpen ? null : faq.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-[28px] p-3.5 text-left transition-all",
                    isOpen
                      ? config.bg
                      : "bg-white active:bg-gray-50 dark:bg-gray-800/80 dark:active:bg-gray-800"
                  )}
                >
                  {/* Urgency dot */}
                  <div className="mt-1 flex flex-col items-center gap-1">
                    <div className={cn("h-2.5 w-2.5 rounded-full", config.dot)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Question */}
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">
                      {faq.emoji} {faq.question}
                    </p>

                    {/* Tags */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {catInfo && (
                        <span className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                          config.badge
                        )}>
                          {catInfo.emoji} {catInfo.label}
                        </span>
                      )}
                      <span className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                        config.badge
                      )}>
                        <UrgencyIcon size={8} className="inline mr-0.5" />
                        {config.label}
                      </span>
                    </div>

                    {/* Answer */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2.5 dark:pt-2.5">
                            <FormattedContent content={faq.answer} />
                          </div>
                          {faq.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {faq.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Chevron */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-0.5 shrink-0"
                  >
                    <ChevronDown size={16} className="text-gray-400" />
                  </motion.div>
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Result count */}
      {sortedFAQs.length > 0 && (
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
          총 {sortedFAQs.length}개의 FAQ
        </p>
      )}
    </div>
  );
}
