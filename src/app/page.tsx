"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, ChevronRight, RefreshCw, Sparkles, Syringe } from "lucide-react";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { getMonthInfo } from "@/lib/queries/months";
import { getVaccinationsForMonth } from "@/lib/data/growth-data";
import { recordsForBaby } from "@/lib/utils/baby-records";
import { resizeImage } from "@/lib/utils/resize-image";
import { homeFeaturedTip } from "@/lib/utils/home-guide-view";
import CircularFocus from "@/components/home/CircularFocus";
import { HomeFeaturedGuide, HomeGuideSuggestions, HomeQuickActions } from "@/components/home/HomeDiscovery";
import HomeGrowthSummary from "@/components/home/HomeGrowthSummary";
import GuideArtwork from "@/components/illustrations/GuideArtwork";

interface MonthData { total_sleep_hours: string | null; }

export default function HomePage() {
  const profile = useBabyStore(state => state.profile);
  const babies = useBabyStore(state => state.babies);
  const legacyOwnerId = useBabyStore(state => state.legacyOwnerId);
  const babyPhotos = useBabyStore(state => state.babyPhotos);
  const setBabyPhoto = useBabyStore(state => state.setBabyPhoto);
  const days = useBabyStore(state => state.getDaysOld());
  const months = useBabyStore(state => state.getMonthsOld());
  const realMonths = useBabyStore(state => state.getRealMonthsOld());
  const allMeasurements = useMeasurementStore(state => state.measurements);
  const allVaccinations = useVaccinationStore(state => state.records);
  const [remote, setRemote] = useState<{ month: number; retry: number; data: MonthData | null; failed: boolean } | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoRequest = useRef(0);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getMonthInfo(months, { throwOnError: true, signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setRemote({ month: months, retry, data, failed: false });
    }).catch(() => {
      if (!controller.signal.aborted) setRemote({ month: months, retry, data: null, failed: true });
    });
    return () => controller.abort();
  }, [months, retry]);

  const loading = remote?.month !== months || remote?.retry !== retry;
  const monthData = loading ? null : remote?.data;
  const loadError = !loading && !!remote?.failed;
  if (!profile) return null;

  const measurements = recordsForBaby(allMeasurements, profile.id, babies.length, legacyOwnerId);
  const vaccinations = recordsForBaby(allVaccinations, profile.id, babies.length, legacyOwnerId);
  const scheduled = getVaccinationsForMonth(realMonths);
  const due = scheduled.filter(({ vaccine, dose }) => !vaccinations.some(record => record.vaccineId === vaccine.id && record.doseNumber === dose.doseNumber));
  const tip = homeFeaturedTip(months);
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", hour: "numeric", hourCycle: "h23" }).format(new Date()));
  const greeting = hour < 6 ? "편안한 밤 보내고 계신가요?" : hour < 12 ? "좋은 아침이에요" : hour < 18 ? "오늘도 함께 알아가요" : "오늘도 수고하셨어요";
  const photoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const request = ++photoRequest.current;
    event.target.value = "";
    setPhotoError(null);
    try {
      const photo = await resizeImage(file, 256, 0.85);
      if (request === photoRequest.current) setBabyPhoto(profile.id, photo);
    } catch {
      if (request === photoRequest.current) setPhotoError(profile.id);
    }
  };

  return <div className="home-redesign @container px-5 pb-8 pt-safe text-[var(--foreground)]" data-bright-home>
    <CircularFocus days={days} months={months} realMonths={realMonths} isOver12={realMonths > 12} greeting={greeting} babyName={profile.name} photoUrl={babyPhotos[profile.id]} onPhotoSelect={photoSelect} />
    {photoError === profile.id && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">사진을 저장하지 못했어요. 10MB 이하의 JPG, PNG, WebP 등 다른 사진을 선택해 주세요.</p>}
    {realMonths > 12 && <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">현재 만 {realMonths}개월이에요. 월령 가이드는 12개월 기준으로 제공해요.</p>}

    <div className="mt-4"><HomeFeaturedGuide month={months} /></div>
    <div className="mt-5"><HomeGuideSuggestions month={months} /></div>
    <div className="mt-5"><HomeGrowthSummary key={profile.id} measurements={measurements} babyName={profile.name} /></div>

    <section aria-labelledby="home-story-title" className="mt-5">
      <h2 id="home-story-title" className="home-section-title mb-3">오늘 알아둘 이야기</h2>
      <details key={`${profile.id}:${months}:story`} className="home-disclosure group" data-home-story>
        <summary className="home-row flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3">
          <GuideArtwork kind={months >= 6 ? "solids" : "book"} className="h-12 w-12 shrink-0 @max-[18rem]:hidden" />
          <span className="min-w-0 flex-1 break-words text-base font-semibold leading-6">{tip.title}</span>
          <ChevronDown size={18} aria-hidden className="shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="border-t border-[var(--border)] px-4 pb-3 pt-3">
          <p className="text-base leading-[1.65]">{tip.takeaway}</p>
          <Link href={`/tips?month=${months}&tip=${tip.key}`} scroll={false} className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--brand)]">요령 자세히 보기<ChevronRight size={15} aria-hidden /></Link>
        </div>
      </details>
    </section>

    <div className="mt-4"><HomeQuickActions month={months} /></div>

    <section className="mt-5 space-y-2.5" aria-label="오늘 확인할 일정">
      <Link href="/growth?tab=vaccination" className="home-panel home-row flex min-h-16 items-center gap-3 px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-peach)] text-[var(--brand)] @max-[18rem]:hidden"><Syringe size={20} aria-hidden /></span>
        <span className="min-w-0 flex-1 break-words text-base font-semibold leading-6">{due.length ? `이번 월령 접종 ${due.length}건 확인` : scheduled.length ? "이번 월령의 접종을 기록했어요" : "예방접종 일정 확인"}</span>
        <ChevronRight size={18} className="shrink-0 text-[var(--muted-foreground)]" aria-hidden />
      </Link>

      <details key={`${profile.id}:${months}:reference`} className="home-disclosure group" aria-label="월령별 참고 정보" data-home-monthly>
        <summary className="home-row flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-sky)] text-[var(--brand)] @max-[18rem]:hidden"><BookOpen size={20} aria-hidden /></span>
          <span className="min-w-0 flex-1 text-base font-semibold">월령별 참고 정보</span>
          <ChevronDown size={18} className="shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
        </summary>
        <div className="border-t border-[var(--border)] px-4 pb-4 pt-3">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">수유는 배고픔과 포만 신호를 살피고, 개별 수유 안내가 있으면 우선해 주세요.</p>
          <div className="mt-3" aria-busy={loading}>
            {loading ? <div className="h-16 animate-pulse rounded-xl bg-[var(--surface-muted)] motion-reduce:animate-none" role="status"><span className="sr-only">월령 정보를 불러오는 중</span></div> : monthData?.total_sleep_hours ? <p className="text-sm leading-6 text-[var(--muted-foreground)]">하루 수면 참고 범위 <strong className="font-semibold text-[var(--foreground)]">{monthData.total_sleep_hours}시간</strong></p> : !loadError ? <p className="text-sm leading-6 text-[var(--muted-foreground)]">이 월령의 참고 정보가 아직 준비되지 않았어요.</p> : <p className="text-sm leading-6 text-[var(--muted-foreground)]">참고 정보를 불러오지 못했어요. 아래에서 다시 시도할 수 있어요.</p>}
          </div>
          <Link href={`/encyclopedia?tab=encyclopedia&month=${months}`} scroll={false} className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--brand)]">월령 가이드 보기<ChevronRight size={15} aria-hidden /></Link>
        </div>
      </details>

      <details key={`${profile.id}:wonder`} className="home-disclosure group" data-home-wonder>
        <summary className="home-row flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-lavender)] text-[var(--brand)] @max-[18rem]:hidden"><Sparkles size={20} aria-hidden /></span>
          <span className="min-w-0 flex-1 text-base font-semibold">원더윅스 살펴보기</span>
          <ChevronDown size={18} className="shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
        </summary>
        <div className="border-t border-[var(--border)] px-4 pb-3 pt-3">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">원더윅스 가설과 아기의 발달을 관찰하는 방법을 살펴봐요.</p>
          <Link href="/wonder-weeks" className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--brand)]">발달 참고 이야기 보기<ChevronRight size={15} aria-hidden /></Link>
        </div>
      </details>
    </section>

    {loadError && <div role="status" className="home-panel mt-4 p-4"><p className="text-base font-semibold">일부 안내를 불러오지 못했어요</p><p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">아기 기록과 백과 가이드는 계속 이용할 수 있어요.</p><button type="button" onClick={() => setRetry(value => value + 1)} className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-[var(--brand)]"><RefreshCw size={16} aria-hidden />다시 시도</button></div>}
    <nav aria-label="다른 생활 가이드" className="mt-3 flex flex-wrap justify-center gap-x-4 text-sm font-semibold text-[var(--brand)]">
      <Link scroll={false} href={`/encyclopedia?tab=activities&month=${months}`} className="inline-flex min-h-11 items-center gap-1">추천 놀이<ChevronRight size={14} aria-hidden /></Link>
      <Link scroll={false} href={`/encyclopedia?tab=babyfood&month=${months}`} className="inline-flex min-h-11 items-center gap-1">이유식<ChevronRight size={14} aria-hidden /></Link>
      <Link scroll={false} href={`/encyclopedia?tab=encyclopedia&month=${months}`} className="inline-flex min-h-11 items-center gap-1"><BookOpen size={15} aria-hidden />백과사전 전체 보기</Link>
    </nav>
  </div>;
}
