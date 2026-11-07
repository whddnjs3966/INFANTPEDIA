"use client";
import { healthEvidenceView } from "@/lib/utils/health-evidence-view";


import Link from "next/link";
import { ArrowRight, BookOpen, RefreshCw, Search } from "lucide-react";
import type { SearchResult } from "@/lib/queries/months";

interface SearchResultsProps {
  returnTo?: string;
  results: SearchResult[];
  loading: boolean;
  keyword: string;
  hasSearched: boolean;
  error?: string | null;
  remoteUnavailable?: boolean;
  onRetry?: () => void;
  onSuggestedSearch?: (keyword: string) => void;
  month?: number;
  scope?: "all" | "current";
  onlineLoading?: boolean;
}
const categoryLabels: Record<string, string> = { development: "발달", play: "놀이", sleep: "수면", food: "수유·먹기", sleeping: "수면", feeding: "수유", crying: "울음", outing: "외출", dental: "치아", health: "건강" };
const sourceLabels: Record<SearchResult["source"], string> = { activities: "월령별 백과", parenting_tips: "육아 꿀팁", guides: "육아 가이드", health_faq: "건강 FAQ", milestones: "발달 체크" };
export function searchResultKey(result: SearchResult) { return `${result.source}:${result.id}:${result.month_id}`; }
export function resultAgeLabel(result: SearchResult) {
  if (result.applicableMonths?.length === 0) return "전 월령 공통";
  const months = result.applicableMonths || [result.month_id];
  if (months.length === 1) return `${months[0]}개월`;
  return `${Math.min(...months)}~${Math.max(...months)}개월`;
}
function highlight(text: string, keyword: string) {
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return text;
  return text.split(new RegExp(`(${escaped})`, "gi")).map((part, index) => part.toLocaleLowerCase("ko") === keyword.trim().toLocaleLowerCase("ko") ? <mark key={index} className="rounded bg-amber-100 px-0.5 text-stone-900 dark:bg-amber-300 dark:text-stone-950">{part}</mark> : part);
}
function excerpt(content: string, keyword: string) {
  const normalized = content.replace(/\s+/g, " ");
  const index = normalized.toLocaleLowerCase("ko").indexOf(keyword.trim().toLocaleLowerCase("ko"));
  const start = Math.max(0, index - 30);
  return `${start ? "…" : ""}${normalized.slice(start, start + 140)}${normalized.length > start + 140 ? "…" : ""}`;
}

export default function SearchResults({ returnTo, results, loading, keyword, hasSearched, error, remoteUnavailable, onRetry, onSuggestedSearch, month = 0, scope = "all", onlineLoading }: SearchResultsProps) {
  if (!hasSearched) return <section className="px-5 pt-8"><Search size={28} aria-hidden="true" className="mb-4 text-blue-800 dark:text-blue-300" /><h1 className="text-xl font-bold">어떤 정보가 궁금하세요?</h1><p className="mt-2 text-base leading-relaxed text-stone-600 dark:text-stone-300">월령별 백과와 수면·수유 가이드, 건강 FAQ를 함께 찾아보세요.</p><div className="mt-5 flex flex-wrap gap-2" aria-label="검색어 예시">{["수면", "이유식", "양치", "발달"].map(term => <button key={term} type="button" onClick={() => onSuggestedSearch?.(term)} className="min-h-12 rounded-xl border border-stone-300 bg-white px-4 text-base font-semibold text-stone-700 dark:border-stone-600 dark:bg-[var(--card)] dark:text-stone-200">{term}</button>)}</div></section>;
  return <section className="space-y-4 px-5 pb-8" aria-label="검색 결과" aria-busy={loading}>
    {onlineLoading && <span data-reading-loading hidden />}
    {onlineLoading && !loading && <p role="status" className="text-sm text-stone-600 dark:text-stone-300">앱 가이드부터 보여드려요. 온라인 정보도 확인하고 있어요.</p>}
    {(error || remoteUnavailable) && <div role="status" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"><p className="text-sm leading-relaxed text-stone-800 dark:text-stone-200">{error || "일부 온라인 정보를 불러오지 못했어요. 불러온 결과와 앱에 준비된 가이드를 보여드려요."}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-3 flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-stone-800 dark:bg-[var(--surface-muted)] dark:text-stone-100"><RefreshCw size={17} aria-hidden="true" />다시 시도</button>}</div>}
    {loading ? <div role="status" aria-label="검색 중" className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-36 animate-pulse rounded-2xl bg-stone-200 dark:bg-[var(--surface-muted)]" />)}</div> : <>
      <p aria-live="polite" className="text-sm text-stone-600 dark:text-stone-300">{scope === "current" ? `${month}개월 · ` : "전체 월령 · "}검색 결과 <strong className="text-stone-900 dark:text-stone-100">{results.length}건</strong></p>
      {results.length === 0 ? <div className="rounded-2xl bg-white p-5 dark:bg-[var(--card)]"><h2 className="text-lg font-bold">{onlineLoading ? "온라인 검색 결과를 확인하고 있어요" : error || remoteUnavailable ? "확인할 수 있는 결과가 없어요" : "이 검색어로 찾은 글이 없어요"}</h2><p className="mt-2 text-base leading-relaxed text-stone-600 dark:text-stone-300">{onlineLoading ? "결과가 준비되면 여기에 표시해요." : error || remoteUnavailable ? "연결을 확인한 후 다시 시도하거나 다른 주제를 검색해 주세요." : "검색어를 짧게 바꾸거나 전체 월령으로 다시 찾아보세요."}</p></div> : results.map(result => {
        const params = new URLSearchParams({ q: keyword, result: searchResultKey(result), scope, month: String(month) });
        if (returnTo) params.set("from", returnTo);
        return <Link data-reading-anchor={searchResultKey(result)} key={searchResultKey(result)} href={`/search?${params}`} scroll={false} className="block rounded-2xl bg-white p-5 ring-1 ring-stone-200 transition-colors hover:bg-stone-50 dark:bg-[var(--card)] dark:ring-stone-700 dark:hover:bg-stone-800">
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-600 dark:text-stone-300"><span>{sourceLabels[result.source]}</span><span aria-hidden="true">·</span><span>{resultAgeLabel(result)}</span><span className="font-semibold text-blue-800 dark:text-blue-300">{categoryLabels[result.category] || result.category}</span></div>
          {result.source === "health_faq" && (healthEvidenceView(result.evidence).compact || result.urgency === "emergency") && <p className="mb-2 text-sm leading-6 text-[var(--muted-foreground)]">{healthEvidenceView(result.evidence).compact}{result.urgency === "emergency" ? `${healthEvidenceView(result.evidence).compact ? " · " : ""}긴급 상황 안내 포함` : ""}</p>}<h2 className="text-base font-bold leading-relaxed text-stone-900 dark:text-stone-100">{highlight(result.title, keyword)}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{highlight(excerpt(result.content, keyword), keyword)}</p>
          <span className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-800 dark:text-blue-300"><BookOpen size={16} aria-hidden="true" />전체 내용 읽기<ArrowRight size={16} aria-hidden="true" /></span>
        </Link>;
      })}
    </>}
  </section>;
}
