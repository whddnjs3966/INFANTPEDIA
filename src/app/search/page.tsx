"use client";
import HealthCareAnswer from "@/components/encyclopedia/HealthCareAnswer";
import HealthFAQEvidence from "@/components/encyclopedia/HealthFAQEvidence";
import EmergencyCareNotice from "@/components/encyclopedia/EmergencyCareNotice";


import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/search/SearchBar";
import SearchResults, { resultAgeLabel, searchResultKey } from "@/components/search/SearchResults";
import FormattedContent from "@/components/ui/FormattedContent";
import { searchContentWithStatus, type SearchResult } from "@/lib/queries/months";
import { useBabyStore } from "@/lib/store/baby-store";

import { useReadingPosition } from "@/hooks/useReadingPosition";
import { guideReturnHref } from "@/lib/utils/guide-navigation";

export default function SearchPage() {
  return <Suspense fallback={<div className="px-5 py-8 text-base" role="status">검색을 준비하고 있어요</div>}><SearchContent /></Suspense>;
}
function SearchContent() {
  const router = useRouter();
  const params = useSearchParams();
  const profile = useBabyStore(s => s.profile);
  const babyMonth = useBabyStore(s => s.getMonthsOld());
  const requestedMonth = params.get("month");
  const month = requestedMonth !== null && /^(?:[0-9]|1[0-2])$/.test(requestedMonth) ? Number(requestedMonth) : Math.max(0, Math.min(12, babyMonth));
  const keyword = (params.get("q") || "").slice(0, 100);
  const scope = params.get("scope") === "current" ? "current" : "all";
  const selectedKey = params.get("result");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [resultsContext, setResultsContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [remoteUnavailable, setRemoteUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const requestSequence = useRef(0);
  const previousList = useRef<string | null>(null);
  const returnTo = guideReturnHref(params.get("from"));
  const requestKey = `${month}:${keyword}`;
  const activeResults = resultsContext === requestKey ? results : [];
  const selectedResult = activeResults.find(result => searchResultKey(result) === selectedKey);
  const fetchingNewQuery = !!keyword.trim() && resultsContext !== requestKey;
  const returnParams = new URLSearchParams({ q: keyword, scope, month: String(month) });
  if (returnTo) returnParams.set("from", returnTo);
  const listHref = `/search?${returnParams}`;
  const readingScope = "search:" + JSON.stringify([profile?.id || "browse", month, keyword, scope, selectedKey]);
  const readingRef = useReadingPosition(readingScope, !fetchingNewQuery && !loading && (!selectedKey || !!selectedResult || !onlineLoading), "/search?" + params.toString());

  useEffect(() => {
    const sequence = ++requestSequence.current;
    const controller = new AbortController();
    let localPublished = false;
    if (!keyword.trim()) return () => controller.abort();
    searchContentWithStatus(keyword, { signal: controller.signal, currentMonth: month, onLocalResults: local => {
      if (!controller.signal.aborted && sequence === requestSequence.current) { localPublished = true; setResultsContext(requestKey); setResults(local); setError(null); setRemoteUnavailable(false); setOnlineLoading(true); setLoading(false); }
    } }).then(response => {
      if (!controller.signal.aborted && sequence === requestSequence.current) { setResultsContext(requestKey); setResults(response.results); setError(null); setRemoteUnavailable(response.remoteUnavailable); }
    }).catch(() => {
      if (!controller.signal.aborted && sequence === requestSequence.current) { if (!localPublished) setResults([]); setResultsContext(requestKey); setError("검색 정보를 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요."); }
    }).finally(() => { if (!controller.signal.aborted && sequence === requestSequence.current) { setLoading(false); setOnlineLoading(false); } });
    return () => controller.abort();
  }, [keyword, month, retry, requestKey]);

  useEffect(() => {
    if (selectedKey && previousList.current === listHref) {
      window.history.replaceState({ ...window.history.state, infantpediaSearchParent: listHref }, "", window.location.href);
    }
    previousList.current = selectedKey ? null : listHref;
  }, [selectedKey, listHref]);

  const handleSearch = (value: string) => {
    const next = new URLSearchParams({ scope, month: String(month) });
    if (returnTo) next.set("from", returnTo);
    if (value.trim()) next.set("q", value.slice(0, 100));
    router.replace(`/search?${next}`, { scroll: false });
  };
  const changeScope = (nextScope: "all" | "current") => {
    const next = new URLSearchParams(returnParams);
    next.set("scope", nextScope);
    router.replace(`/search?${next}`, { scroll: false });
  };
  const visibleResults = scope === "all" ? activeResults : activeResults.filter(result => !result.applicableMonths?.length || result.applicableMonths.includes(month));

  if (selectedResult) return <div ref={readingRef}><article className="space-y-5 px-5 pb-8 pt-safe">
    <Link href={listHref} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); if (window.history.state?.infantpediaSearchParent === listHref) router.back(); else router.replace(listHref, { scroll: false }); }} scroll={false} className="inline-flex min-h-12 items-center gap-2 text-base font-semibold text-blue-800 dark:text-blue-300"><ArrowLeft size={19} aria-hidden="true" />검색 결과로</Link>
    <div><p className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-300">{resultAgeLabel(selectedResult)}</p><h1 className="text-2xl font-bold leading-snug text-stone-900 dark:text-stone-100">{selectedResult.title}</h1></div>
    <div className="rounded-2xl bg-white p-5 text-base leading-relaxed dark:bg-[var(--card)]">{selectedResult.source === "health_faq" && <div className="mb-5"><EmergencyCareNotice /></div>}{selectedResult.source === "health_faq" || selectedResult.care ? <HealthCareAnswer faq={{care:selectedResult.care,answer:selectedResult.content}} /> : <FormattedContent content={selectedResult.content} />}{(selectedResult.source === "health_faq" || selectedResult.evidence) && <HealthFAQEvidence evidence={selectedResult.evidence} />}</div>
    {selectedResult.href && <Link scroll={!selectedResult.href.startsWith("/encyclopedia")} href={selectedResult.href} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-blue-800 px-4 py-3 text-base font-bold text-white dark:bg-blue-300 dark:text-blue-950">관련 주제 더 보기<ArrowRight size={19} aria-hidden="true" /></Link>}
  </article></div>;

  return <div ref={readingRef} className="min-h-screen bg-[var(--surface-bg)] dark:bg-[var(--background)]">
    <SearchBar onSearch={handleSearch} initialValue={keyword} autoFocus={!keyword.trim()} backHref={returnTo} />
    <div className="flex flex-wrap gap-2 px-5 py-3" aria-label="검색 대상 월령">
      <button type="button" aria-pressed={scope === "all"} onClick={() => changeScope("all")} className={`min-h-12 rounded-xl px-4 text-sm font-bold ${scope === "all" ? "bg-blue-800 text-white dark:bg-blue-300 dark:text-blue-950" : "bg-white text-stone-700 dark:bg-[var(--card)] dark:text-stone-200"}`}>전체 월령</button>
      <button type="button" aria-pressed={scope === "current"} onClick={() => changeScope("current")} className={`min-h-12 rounded-xl px-4 text-sm font-bold ${scope === "current" ? "bg-blue-800 text-white dark:bg-blue-300 dark:text-blue-950" : "bg-white text-stone-700 dark:bg-[var(--card)] dark:text-stone-200"}`}>{profile && month === babyMonth ? "우리 아기 · " : "선택한 월령 · "}{month}개월</button>
    </div>
    {selectedKey && !selectedResult && !loading && !onlineLoading && !fetchingNewQuery && <p role="status" className="mx-5 mb-3 rounded-xl bg-stone-100 p-4 text-sm leading-relaxed text-stone-700 dark:bg-[var(--surface-muted)] dark:text-stone-200">선택한 글을 찾을 수 없어요. 아래 검색 결과에서 다시 선택해 주세요.</p>}
    <SearchResults returnTo={returnTo} results={visibleResults} loading={loading || fetchingNewQuery} onlineLoading={onlineLoading} keyword={keyword} hasSearched={!!keyword.trim()} error={resultsContext === requestKey ? error : null} remoteUnavailable={resultsContext === requestKey && remoteUnavailable} onRetry={() => { setLoading(activeResults.length === 0); setOnlineLoading(true); setError(null); setRemoteUnavailable(false); setRetry(value => value + 1); }} onSuggestedSearch={handleSearch} month={month} scope={scope} />
  </div>;
}
