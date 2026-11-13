"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
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
import { EncyclopediaSkeleton } from "@/components/ui/LoadingSkeleton";
import "./tips.css";

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
  const requestedTip = getPracticalTip(searchParams.get("tip") || "");
  const linkedTip = requestedTip && requestedTip.minMonth <= selectedMonth ? requestedTip : null;
  const from = `/tips?${searchParams.toString()}`;
  const positionScope = linkedTip ? `${readingScope}:tip:${linkedTip.key}` : readingScope;
  const readingRef = useReadingPosition(positionScope, hasContext, from);
  const setSelectedMonth = (month: number) => router.push(`/tips?month=${month}`, { scroll: false });
  const [result, setResult] = useState<{ key: string; tips: Tip[]; error: string | null } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const requestKey = `${selectedMonth}:${retryCount}`;
  const loading = result?.key !== requestKey;
  const tips = loading ? [] : result?.tips ?? [];
  const error = loading ? null : result?.error;
  const searchLink = `/search?${new URLSearchParams({ month: String(selectedMonth), from })}`;

  useEffect(() => {
    if (!hasContext) {
      const saved = useReadingStore.getState().views[contextKey]?.values.month;
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", String(parseMonth(typeof saved === "string" ? saved : null, currentMonth)));
      router.replace(`/tips?${params}`, { scroll: false });
      return;
    }
    useReadingStore.getState().setValue(contextKey, "month", String(selectedMonth));
  }, [hasContext, contextKey, currentMonth, selectedMonth, router, searchParams]);

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
    <div ref={readingRef} data-tips-redesign className="tips-page @container min-h-screen pb-6">
      <header data-page-header className="tips-header">
        <div className="min-w-0">
          <h1>육아 꿀팁</h1>
          <p>막히는 순간, 작은 요령</p>
        </div>
        <Image src="/images/redesign/sun.webp" width={78} height={72} alt="" className="tips-header-art" />
        <Link href={searchLink} aria-label="육아 정보 검색" className="header-action"><Search size={21} strokeWidth={1.7} aria-hidden /></Link>
      </header>
      <div className="mb-3.5">
        <MonthSelector selectedMonth={selectedMonth} currentMonth={profile ? currentMonth : undefined} currentAge={Math.max(0, realMonths)} babyName={profile?.name} onSelect={setSelectedMonth} />
      </div>
      <ReadingScope key={readingScope} scope={readingScope}>
        <div className="space-y-3.5">
          {linkedTip && <article aria-label="검색에서 찾은 팁" className="tips-card space-y-3 p-4">
            <p className="text-sm font-semibold text-[var(--brand)]">찾고 있던 작은 요령</p>
            <h2 className="text-lg font-semibold leading-snug">{linkedTip.title}</h2>
            <PracticalTipBody tip={linkedTip} />
            <Link href={`/tips?month=${selectedMonth}`} scroll={false} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--brand)]"><ArrowLeft size={16} aria-hidden />전체 팁으로 돌아가기</Link>
          </article>}
          {realMonths > 12 && selectedMonth === 12 && <p className="rounded-2xl bg-[var(--accent-soft)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">현재 {realMonths}개월이에요. 12개월 이후 정보는 12개월 기준으로 제공됩니다.</p>}
          {error && <div role="alert" className="tips-card space-y-2 p-4">
            <p className="text-base font-semibold">{error}</p>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">기기에 포함된 상황별 팁은 아래에서 계속 볼 수 있어요.</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="tips-pill">다시 시도</button>
          </div>}
          {loading ? <div data-reading-loading><EncyclopediaSkeleton /></div> : <TipsCategoryAccordion month={selectedMonth} tips={tips.length ? tips : getMonthPracticalTips(selectedMonth)} />}
          <DailyScheduleCard month={selectedMonth} />
          <MealPlanCard month={selectedMonth} />
          <TodaysTipCard month={selectedMonth} />
        </div>
      </ReadingScope>
    </div>
  );
}
