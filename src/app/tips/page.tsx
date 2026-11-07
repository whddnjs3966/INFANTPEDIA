"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ReadingScope from "@/components/reading/ReadingScope";
import { useReadingStore } from "@/lib/store/reading-store";
import { useReadingPosition } from "@/hooks/useReadingPosition";

function parseMonth(value: string | null | undefined, fallback: number) {
  return typeof value === "string" && /^(?:[0-9]|1[0-2])$/.test(value) ? Number(value) : fallback;
}
const GuideLoading = () => <div data-reading-loading><EncyclopediaSkeleton /></div>;
import { useBabyStore } from "@/lib/store/baby-store";
import { getParentingTips } from "@/lib/queries/months";
import { getMonthPracticalTips, getPracticalTip } from "@/lib/data/practical-tips-data";
import PracticalTipBody from "@/components/tips/PracticalTipBody";
import MonthSelector from "@/components/encyclopedia/MonthSelector";
import PageHeader from "@/components/layout/PageHeader";
import { EncyclopediaSkeleton } from "@/components/ui/LoadingSkeleton";

const TipsCategoryAccordion = dynamic(() => import("@/components/tips/TipsCategoryAccordion"), { ssr: false, loading: GuideLoading });
const DailyScheduleCard = dynamic(() => import("@/components/tips/DailyScheduleCard"), { ssr: false, loading: GuideLoading });
const MealPlanCard = dynamic(() => import("@/components/tips/MealPlanCard"), { ssr: false, loading: GuideLoading });
const TodaysTipCard = dynamic(() => import("@/components/tips/TodaysTipCard"), { ssr: false, loading: GuideLoading });

interface Tip { id: number; title: string; content: string; category: string; month_id: number; }

export default function TipsPage() {
  return <Suspense fallback={<EncyclopediaSkeleton />}><TipsContent /></Suspense>;
}

function TipsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getMonthsOld = useBabyStore((state) => state.getMonthsOld);
  const getRealMonthsOld = useBabyStore((state) => state.getRealMonthsOld);
  const profile = useBabyStore((state) => state.profile);
  const currentMonth = getMonthsOld();
  const realMonths = getRealMonthsOld();
  const selectedMonth = parseMonth(searchParams.get("month"), currentMonth);
  const hasContext = searchParams.has("month");
  const contextKey = "tips-context:" + (profile?.id || "browse");
  const readingScope = "tips:" + JSON.stringify([profile?.id || "browse", selectedMonth]);
  const readingRef = useReadingPosition(readingScope, hasContext, "/tips?" + searchParams.toString());
  const setSelectedMonth = (month: number) => router.push(`/tips?month=${month}`, { scroll: false });
  const [result, setResult] = useState<{ key: string; tips: Tip[]; error: string | null } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const requestKey = `${selectedMonth}:${retryCount}`;
  const loading = result?.key !== requestKey;
  const tips = loading ? [] : result?.tips ?? [];
  const error = loading ? null : result?.error;
  const requestedTip = getPracticalTip(searchParams.get("tip") || "");
  const linkedTip = requestedTip && requestedTip.minMonth <= selectedMonth ? requestedTip : null;

  useEffect(() => {
    if (!hasContext) {
      const saved = useReadingStore.getState().views[contextKey]?.values.month;
      router.replace(`/tips?month=${parseMonth(typeof saved === "string" ? saved : null, currentMonth)}`, { scroll: false });
      return;
    }
    useReadingStore.getState().setValue(contextKey, "month", String(selectedMonth));
  }, [hasContext, contextKey, currentMonth, selectedMonth, router]);

  useEffect(() => {
    if (!hasContext) return;
    const controller = new AbortController();
    let active = true;
    async function fetchData() {
      try {
        const data = await getParentingTips(selectedMonth, undefined, { throwOnError: true, signal: controller.signal });
        if (active) setResult({ key: requestKey, tips: (data as Tip[]) || [], error: null });
      } catch {
        if (active && !controller.signal.aborted) {
          setResult({ key: requestKey, tips: [], error: "월령별 팁을 불러오지 못했어요" });
        }
      }
    }
    fetchData();
    return () => { active = false; controller.abort(); };
  }, [selectedMonth, requestKey, hasContext]);

  if (!hasContext) return <EncyclopediaSkeleton />;
  return (
    <ReadingScope key={readingScope} scope={readingScope}><div ref={readingRef} className="min-h-screen pb-6 dark:bg-[var(--background)]">
      <PageHeader eyebrow={profile?.name ? `${profile.name}의 생활 가이드` : "월령별 생활 가이드"} title="육아 꿀팁" description="매일 막히는 순간에, 바로 써보는 작은 요령" showSearch />
      <div className="mx-5 mb-5"><MonthSelector selectedMonth={selectedMonth} currentMonth={profile ? currentMonth : undefined} currentAge={Math.max(0, realMonths)} babyName={profile?.name} onSelect={setSelectedMonth} /></div>

      {linkedTip && <article aria-label="검색에서 찾은 팁" className="surface-card mx-5 mb-5 space-y-4 p-5"><p className="text-sm font-medium text-[var(--brand)]">찾고 있던 작은 요령</p><h2 className="text-xl font-semibold leading-8">{linkedTip.title}</h2><p className="text-base font-semibold leading-7 text-[var(--brand)]">{linkedTip.takeaway}</p><PracticalTipBody tip={linkedTip} /><Link href={`/tips?month=${selectedMonth}`} scroll={false} className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand)]">전체 팁으로 돌아가기</Link></article>}
      {realMonths > 12 && selectedMonth === 12 && <p className="mx-5 mb-4 rounded-2xl bg-[var(--accent-soft)] p-4 text-sm leading-6 text-stone-700 dark:text-stone-200">현재 {realMonths}개월이에요. 12개월 이후 정보는 12개월 기준으로 제공됩니다.</p>}
      <DailyScheduleCard month={selectedMonth} />
      <MealPlanCard month={selectedMonth} />

      <section className="mt-6 mb-6" aria-labelledby="month-tips-heading">
        <h2 id="month-tips-heading" className="px-5 text-xl font-bold text-stone-900 dark:text-stone-100">궁금한 순간별 팁</h2>
        <div className="mt-4">
          {loading ? <div data-reading-loading><EncyclopediaSkeleton /></div> : error ? (
            <div role="alert" className="mx-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200 dark:bg-[var(--card)] dark:ring-stone-800">
              <p className="text-base font-semibold text-stone-900 dark:text-stone-100">월령별 팁을 불러오지 못했어요</p>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">기기에 포함된 상황별 팁은 아래에서 계속 볼 수 있어요.</p>
              <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="mt-3 min-h-12 rounded-xl bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--brand)]">다시 시도</button>
            </div>
          ) : tips.length === 0 ? (
            <TipsCategoryAccordion tips={getMonthPracticalTips(selectedMonth)} isLoading={false} />
          ) : <TipsCategoryAccordion tips={tips} isLoading={false} />}
          {!loading && error && <div className="mt-4"><TipsCategoryAccordion tips={getMonthPracticalTips(selectedMonth)} isLoading={false} /></div>}
        </div>
      </section>
      <TodaysTipCard month={selectedMonth} />
    </div></ReadingScope>
  );
}
