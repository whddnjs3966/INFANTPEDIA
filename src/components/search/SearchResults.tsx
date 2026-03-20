"use client";

import { motion } from "framer-motion";
import { BookOpen, Lightbulb } from "lucide-react";
import type { SearchResult } from "@/lib/queries/months";

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  keyword: string;
  hasSearched: boolean;
}

const categoryLabels: Record<string, string> = {
  development: "발달",
  play: "놀이",
  sleep: "수면",
  food: "이유식",
  sleeping: "수면",
  feeding: "수유/이유식",
  crying: "울음",
  outing: "외출",
};

const categoryColors: Record<string, string> = {
  development: "bg-pink-100 text-pink-700",
  play: "bg-blue-100 text-blue-700",
  sleep: "bg-purple-100 text-purple-700",
  food: "bg-green-100 text-green-700",
  sleeping: "bg-purple-100 text-purple-700",
  feeding: "bg-pink-100 text-pink-700",
  crying: "bg-amber-100 text-amber-700",
  outing: "bg-teal-100 text-teal-700",
};

function highlightKeyword(text: string, keyword: string): React.ReactNode {
  if (!keyword.trim()) return text;

  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedKeyword})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-gray-800 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function truncateContent(content: string, keyword: string, maxLen = 80): string {
  if (content.length <= maxLen) return content;

  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const idx = lowerContent.indexOf(lowerKeyword);

  if (idx === -1) return content.slice(0, maxLen) + "...";

  const start = Math.max(0, idx - 20);
  const end = Math.min(content.length, idx + keyword.length + 60);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < content.length ? "..." : "";

  return prefix + content.slice(start, end) + suffix;
}

function ResultSkeleton() {
  return (
    <div className="space-y-3 px-4 pt-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-pink-100/50 bg-gradient-to-r from-pink-50/60 via-purple-50/40 to-pink-50/60 p-4"
        >
          <div className="flex gap-2 mb-2">
            <div className="h-5 w-12 rounded-full bg-pink-100/80" />
            <div className="h-5 w-16 rounded-full bg-gray-100/80" />
          </div>
          <div className="h-4 w-3/4 rounded bg-gray-100/80 mb-2" />
          <div className="h-3 w-full rounded bg-gray-100/60" />
          <div className="h-3 w-2/3 rounded bg-gray-100/60 mt-1" />
        </div>
      ))}
    </div>
  );
}

export default function SearchResults({
  results,
  loading,
  keyword,
  hasSearched,
}: SearchResultsProps) {
  if (loading) {
    return <ResultSkeleton />;
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
        <p className="text-4xl mb-3">{"🔍"}</p>
        <p className="text-sm text-gray-500">
          백과사전과 꿀팁에서 원하는 정보를 검색해 보세요
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
        <p className="text-4xl mb-3">{"🔍"}</p>
        <p className="text-sm font-medium text-gray-700 mb-1">
          검색 결과가 없어요
        </p>
        <p className="text-xs text-gray-400">
          다른 검색어로 다시 시도해 보세요
        </p>
      </div>
    );
  }

  const activityResults = results.filter((r) => r.source === "activities");
  const tipResults = results.filter((r) => r.source === "parenting_tips");

  return (
    <div className="pb-24">
      {activityResults.length > 0 && (
        <ResultGroup
          title="백과사전"
          icon={<BookOpen size={16} />}
          results={activityResults}
          keyword={keyword}
          color="text-pink-600"
        />
      )}
      {tipResults.length > 0 && (
        <ResultGroup
          title="꿀팁"
          icon={<Lightbulb size={16} />}
          results={tipResults}
          keyword={keyword}
          color="text-amber-600"
        />
      )}
    </div>
  );
}

function ResultGroup({
  title,
  icon,
  results,
  keyword,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  results: SearchResult[];
  keyword: string;
  color: string;
}) {
  return (
    <div className="mt-4">
      <div className={`flex items-center gap-1.5 px-4 mb-2 ${color}`}>
        {icon}
        <span className="text-sm font-bold">{title}</span>
        <span className="text-xs text-gray-400 ml-1">
          {results.length}건
        </span>
      </div>
      <div className="space-y-2 px-4">
        {results.map((result, idx) => (
          <motion.div
            key={`${result.source}-${result.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                {result.month_id}개월
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  categoryColors[result.category] || "bg-gray-100 text-gray-600"
                }`}
              >
                {categoryLabels[result.category] || result.category}
              </span>
            </div>
            <h4 className="text-[15px] font-bold text-gray-800">
              {highlightKeyword(result.title, keyword)}
            </h4>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
              {highlightKeyword(
                truncateContent(result.content, keyword),
                keyword
              )}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
