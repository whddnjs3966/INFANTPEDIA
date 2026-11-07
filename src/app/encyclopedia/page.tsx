"use client";

import { Suspense, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useBabyStore } from "@/lib/store/baby-store";
import { getActivities, getMonthInfo } from "@/lib/queries/months";
import PageHeader from "@/components/layout/PageHeader";
import CategoryAccordion from "@/components/encyclopedia/CategoryAccordion";
import MonthSelector from "@/components/encyclopedia/MonthSelector";
import MonthSummaryCard from "@/components/encyclopedia/MonthSummaryCard";
import { EncyclopediaSkeleton } from "@/components/ui/LoadingSkeleton";
import FormattedContent from "@/components/ui/FormattedContent";
import { cn } from "@/lib/utils";

import ReadingScope from "@/components/reading/ReadingScope";
import { useReadingPosition } from "@/hooks/useReadingPosition";

const GuideLoading = () => <div data-reading-loading><EncyclopediaSkeleton /></div>;
const MilestoneChecklist = dynamic(() => import("@/components/encyclopedia/MilestoneChecklist"), { ssr: false, loading: GuideLoading });
const RecommendedActivities = dynamic(() => import("@/components/encyclopedia/RecommendedActivities"), { ssr: false, loading: GuideLoading });
const BabyFoodGuide = dynamic(() => import("@/components/encyclopedia/BabyFoodGuide"), { ssr: false, loading: GuideLoading });
const SleepGuide = dynamic(() => import("@/components/encyclopedia/SleepGuide"), { ssr: false, loading: GuideLoading });
const FeedingGuide = dynamic(() => import("@/components/encyclopedia/FeedingGuide"), { ssr: false, loading: GuideLoading });
const DentalGuide = dynamic(() => import("@/components/encyclopedia/DentalGuide"), { ssr: false, loading: GuideLoading });
const HealthFAQ = dynamic(() => import("@/components/encyclopedia/HealthFAQ"), { ssr: false, loading: GuideLoading });

const topics = [
  { id: "encyclopedia", label: "월령별 요약" },
  { id: "milestone", label: "발달 체크" },
  { id: "activities", label: "추천 놀이" },
  { id: "babyfood", label: "이유식" },
  { id: "sleep", label: "수면" },
  { id: "feeding", label: "수유" },
  { id: "dental", label: "치아" },
  { id: "health", label: "건강 FAQ" },
] as const;
type Topic = (typeof topics)[number]["id"];
interface MonthData {
  month: number;
  wake_window_min: number | null;
  wake_window_max: number | null;
  feed_amount_min: number | null;
  feed_amount_max: number | null;
  daily_feed_total: number | null;
  nap_count: string | null;
  total_sleep_hours: string | null;
  summary: string | null;
}
interface Activity { id: number; title: string; content: string; category: string; month_id: number; }
function isTopic(value: string | null): value is Topic { return topics.some(topic => topic.id === value); }
function parseMonth(value: string | null, fallback: number) {
  return value !== null && /^(?:[0-9]|1[0-2])$/.test(value) ? Number(value) : Math.max(0, Math.min(12, fallback));
}
function range(min: number | null, max: number | null, unit: string) {
  if (min === null || min === undefined) return "정보 없음";
  return `${min}${max !== null && max !== undefined && max !== min ? `~${max}` : ""}${unit}`;
}

export default function EncyclopediaPage() {
  return <Suspense fallback={<EncyclopediaSkeleton />}><EncyclopediaContent /></Suspense>;
}

function EncyclopediaContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const profile = useBabyStore(s => s.profile);
  const currentMonth = useBabyStore(s => s.getMonthsOld());
  const realMonths = useBabyStore(s => s.getRealMonthsOld());
  const selectedMonth = parseMonth(searchParams.get("month"), currentMonth);
  const requestedTab = searchParams.get("tab");
  const activeTab: Topic = isTopic(requestedTab) ? requestedTab : "encyclopedia";
  const [loadedMonthData, setMonthData] = useState<MonthData | null>(null);
  const [loadedActivities, setActivities] = useState<Activity[]>([]);
  const [loadedError, setError] = useState<string | null>(null);
  const [loadedContext, setLoadedContext] = useState("");
  const [retry, setRetry] = useState(0);
  const requestKey = `${selectedMonth}:${retry}`;
  const loading = activeTab === "encyclopedia" && loadedContext !== requestKey;
  const monthData = loadedContext === requestKey ? loadedMonthData : null;
  const activities = loadedContext === requestKey ? loadedActivities : [];
  const error = loadedContext === requestKey ? loadedError : null;
  const storageKey = `infantpedia-encyclopedia-context:${profile?.id || "browse"}`;
  const hasContext = searchParams.has("tab") || searchParams.has("month");
  const readingScope = "encyclopedia:" + JSON.stringify([profile?.id || "browse", selectedMonth, activeTab, searchParams.get("entry")]);
  const readingRef = useReadingPosition(readingScope, hasContext && !loading, pathname + "?" + searchParams.toString());
  const searchLinkParams = new URLSearchParams({ month: String(selectedMonth), from: pathname + "?" + searchParams.toString() });

  // Resolve a bare tab link before registering a reader or writing navigation memory.
  useEffect(() => {
    if (hasContext) return;
    let tab: Topic = "encyclopedia";
    let month = currentMonth;
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (stored && isTopic(stored.tab)) { tab = stored.tab; month = parseMonth(String(stored.month), currentMonth); }
    } catch { /* Reading memory is optional. */ }
    const params = new URLSearchParams({ tab, month: String(month) });
    router.replace(pathname + "?" + params, { scroll: false });
  }, [hasContext, storageKey, currentMonth, pathname, router]);

  useEffect(() => {
    if (!hasContext) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify({ tab: activeTab, month: selectedMonth })); } catch { /* Reading memory is optional. */ }
  }, [activeTab, selectedMonth, storageKey, hasContext]);

  useEffect(() => {
    if (!hasContext || activeTab !== "encyclopedia") return;
    const controller = new AbortController();
    Promise.all([
      getMonthInfo(selectedMonth, { throwOnError: true, signal: controller.signal }),
      getActivities(selectedMonth, undefined, { throwOnError: true, signal: controller.signal }),
    ]).then(([info, items]) => {
      if (!controller.signal.aborted) { setMonthData(info as MonthData | null); setActivities((items || []) as Activity[]); setError(null); setLoadedContext(requestKey); }
    }).catch(() => {
      if (!controller.signal.aborted) { setMonthData(null); setActivities([]); setError("월령별 정보를 불러오지 못했어요. 다른 주제의 가이드는 계속 볼 수 있어요."); setLoadedContext(requestKey); }
    });
    return () => controller.abort();
  }, [selectedMonth, activeTab, retry, requestKey, hasContext]);

  const navigate = (updates: { tab?: Topic; month?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", updates.tab || activeTab);
    params.set("month", String(updates.month ?? selectedMonth));
    params.delete("entry");
    if (params.toString() !== searchParams.toString()) router.push(`${pathname}?${params}`, { scroll: false });
  };
  const selectedActivity = activities.find(activity => String(activity.id) === searchParams.get("entry"));
  const topicLabel = topics.find(topic => topic.id === activeTab)?.label;

  if (!hasContext) return <EncyclopediaSkeleton />;
  return (
    <ReadingScope key={readingScope} scope={readingScope}><div ref={readingRef} className="min-h-screen dark:bg-[var(--background)]">
      <PageHeader eyebrow={profile ? `${profile.name}의 월령별 참고 정보` : "아기와 함께 알아가요"} title="육아 백과" action={<Link href={`/search?${searchLinkParams}`} aria-label={`${selectedMonth}개월 육아 정보 검색`} className="header-action"><Search size={19} strokeWidth={1.8} aria-hidden="true" /></Link>} />
      <div className="space-y-3 px-5 pb-8">
        <MonthSelector selectedMonth={selectedMonth} currentMonth={profile ? currentMonth : undefined} currentAge={Math.max(0, realMonths)} babyName={profile?.name} onSelect={month => navigate({ month })} />
        <div className="@container">
          <nav aria-label="육아 정보 주제" className="grid grid-cols-4 gap-1 rounded-[22px] bg-[var(--surface-muted)] p-1.5 @max-[18rem]:grid-cols-2">
            {topics.map(topic => <button key={topic.id} type="button" aria-label={topic.label} aria-pressed={activeTab === topic.id} aria-controls="encyclopedia-topic-content" onClick={() => navigate({ tab: topic.id })} className={cn("min-h-11 min-w-0 rounded-xl px-1 py-2 text-sm font-semibold leading-6 transition-colors", activeTab === topic.id ? "bg-[var(--card)] text-[var(--brand)] shadow-sm" : "text-[var(--muted-foreground)] hover:bg-[var(--card)]")}>
              {topic.id === "encyclopedia" ? "월령 요약" : topic.label}
            </button>)}
          </nav>
        </div>
        {realMonths > 12 && selectedMonth === 12 && <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm leading-relaxed text-stone-700 dark:bg-blue-950/30 dark:text-stone-200">12개월 이후 정보는 12개월 기준으로 제공돼요.</p>}
        <section id="encyclopedia-topic-content" aria-label={`${selectedMonth}개월 ${topicLabel}`} className="space-y-3">
          <p role="status" className="sr-only">{selectedMonth}개월 {topicLabel}을 보고 있어요.</p>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">{topicLabel}</h2>
          {activeTab === "encyclopedia" && <>
            {loading ? <EncyclopediaSkeleton /> : error ? <div role="alert" className="rounded-2xl bg-white p-5 dark:bg-[var(--card)]"><p className="text-base leading-relaxed text-stone-700 dark:text-stone-200">{error}</p><button onClick={() => setRetry(value => value + 1)} className="mt-4 flex min-h-12 items-center gap-2 rounded-xl bg-blue-800 px-4 font-semibold text-white dark:bg-blue-300 dark:text-blue-950"><RefreshCw size={18} aria-hidden="true" />다시 시도</button></div> : <>
              {monthData && <MonthSummaryCard month={selectedMonth} summary={monthData.summary} reference={[
                { label: "1회 수유량", value: range(monthData.feed_amount_min, monthData.feed_amount_max, "ml") },
                { label: "깨어 있는 시간", value: range(monthData.wake_window_min, monthData.wake_window_max, "분") },
                { label: "총 수면", value: monthData.total_sleep_hours ? `${monthData.total_sleep_hours}시간` : "정보 없음" },
                { label: "낮잠 횟수", value: monthData.nap_count || "정보 없음" },
              ]} />}
              {selectedActivity && <article className="rounded-2xl border border-blue-700 bg-white p-5 dark:border-blue-400 dark:bg-[var(--card)]"><p className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-300">검색에서 찾은 글</p><h3 className="mb-3 text-lg font-bold">{selectedActivity.title}</h3><FormattedContent content={selectedActivity.content} /></article>}
              {!monthData && activities.length === 0 ? <p className="rounded-2xl bg-white p-5 text-base text-stone-600 dark:bg-[var(--card)] dark:text-stone-300">이 월령의 요약 정보가 아직 없어요. 위에서 다른 주제를 선택해 주세요.</p> : <div className="-mx-5"><CategoryAccordion activities={activities} isLoading={false} /></div>}
            </>}
          </>}
          {activeTab === "milestone" && <MilestoneChecklist month={selectedMonth} />}
          {activeTab === "activities" && <RecommendedActivities month={selectedMonth} />}
          {activeTab === "babyfood" && <BabyFoodGuide month={selectedMonth} />}
          {activeTab === "sleep" && <SleepGuide month={selectedMonth} />}
          {activeTab === "feeding" && <FeedingGuide month={selectedMonth} />}
          {activeTab === "dental" && <DentalGuide month={selectedMonth} />}
          {activeTab === "health" && <HealthFAQ month={selectedMonth} />}
        </section>
      </div>
    </div></ReadingScope>
  );
}
