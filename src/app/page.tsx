"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, ChevronRight, Plus, RefreshCw, Sparkles, Syringe } from "lucide-react";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { getMonthInfo, getAllWonderWeeks } from "@/lib/queries/months";
import { getVaccinationsForMonth } from "@/lib/data/growth-data";
import { recordsForBaby } from "@/lib/utils/baby-records";
import { resizeImage } from "@/lib/utils/resize-image";
import CircularFocus from "@/components/home/CircularFocus";
import { HomeFeaturedGuide, HomeGuideSuggestions, HomeQuickActions } from "@/components/home/HomeDiscovery";
import GuideArtwork from "@/components/illustrations/GuideArtwork";
import SectionHeader from "@/components/layout/SectionHeader";

interface MonthData { daily_feed_total: number | null; feed_count: string | null; nap_count: string | null; total_sleep_hours: string | null; }
interface WonderWeek { id: number; title: string; start_day: number; end_day: number; }

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
  const [remote, setRemote] = useState<{ month: number; retry: number; data: MonthData | null; weeks: WonderWeek[]; failed: boolean } | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      getMonthInfo(months, { throwOnError: true, signal: controller.signal }),
      getAllWonderWeeks({ throwOnError: true, signal: controller.signal }),
    ]).then(([month, weeks]) => {
      if (controller.signal.aborted) return;
      setRemote({ month: months, retry, data: month.status === "fulfilled" ? month.value as MonthData | null : null, weeks: weeks.status === "fulfilled" ? (weeks.value ?? []) as WonderWeek[] : [], failed: month.status === "rejected" || weeks.status === "rejected" });
    });
    return () => controller.abort();
  }, [months, retry]);

  const loading = remote?.month !== months || remote?.retry !== retry;
  const monthData = loading ? null : remote?.data;
  const wonderWeeks = loading ? [] : remote?.weeks ?? [];
  const loadError = !loading && !!remote?.failed;
  if (!profile) return null;

  const measurements = recordsForBaby(allMeasurements, profile.id, babies.length, legacyOwnerId);
  const vaccinations = recordsForBaby(allVaccinations, profile.id, babies.length, legacyOwnerId);
  const latest = [...measurements].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0];
  const scheduled = getVaccinationsForMonth(months);
  const due = scheduled.filter(({ vaccine, dose }) => !vaccinations.some(record => record.vaccineId === vaccine.id && record.doseNumber === dose.doseNumber));
  const currentWonderWeek = wonderWeeks.find(week => days >= week.start_day && days <= week.end_day);
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", hour: "numeric", hourCycle: "h23" }).format(new Date()));
  const greeting = hour < 6 ? "편안한 밤 보내고 계신가요?" : hour < 12 ? "좋은 아침이에요" : hour < 18 ? "오늘도 함께 알아가요" : "오늘도 수고하셨어요";
  const photoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError(false);
    try { setBabyPhoto(profile.id, await resizeImage(file, 256, 0.85)); }
    catch { setPhotoError(true); }
    event.target.value = "";
  };

  return <div className="@container px-5 pb-8 pt-safe text-[var(--foreground)]" data-bright-home>
    <CircularFocus days={days} months={months} realMonths={realMonths} isOver12={realMonths > 12} greeting={greeting} babyName={profile.name} photoUrl={babyPhotos[profile.id]} onPhotoSelect={photoSelect} />
    {photoError && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">사진을 불러오지 못했어요. 다른 사진으로 다시 시도해 주세요.</p>}
    {realMonths > 12 && <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">현재 만 {realMonths}개월이에요. 월령 가이드는 12개월 기준으로 제공해요.</p>}

    <div className="mt-4 space-y-3"><HomeFeaturedGuide month={months} /><HomeQuickActions month={months} /></div>
    <div className="mt-5"><HomeGuideSuggestions month={months} /></div>

    <div className="mt-7 space-y-7">
      <section className="space-y-3" aria-label="최근 성장 기록">
        <div className="flex items-center justify-between gap-2"><SectionHeader title="최근 성장 기록" /><Link href="/growth" className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-[var(--brand)]">전체 보기<ChevronRight size={14} aria-hidden /></Link></div>
        <div className="surface-card p-5 @max-[18rem]:p-3">
          {latest ? <><p className="text-sm leading-6 text-[var(--muted-foreground)]">{latest.date} 측정 · {profile.name}</p><dl className="mt-3 grid grid-cols-3 gap-3 @max-[18rem]:grid-cols-1">
            {[{ label: "키", value: latest.height, unit: "cm" }, { label: "몸무게", value: latest.weight, unit: "kg" }, { label: "머리둘레", value: latest.headCircumference, unit: "cm" }].map(({ label, value, unit }) => <div key={label} className="min-w-0"><dt className="text-sm text-[var(--muted-foreground)]">{label}</dt><dd className="mt-1 flex flex-wrap items-baseline gap-x-1 text-2xl font-semibold leading-8 tracking-tight tabular-nums">{value === undefined ? <span className="text-sm font-normal text-[var(--muted-foreground)]">미입력</span> : <>{value}<span className="text-sm font-medium">{unit}</span></>}</dd></div>)}
          </dl><Link href="/growth?record=add" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--brand)]"><Plus size={16} aria-hidden />성장 기록 추가</Link></>
            : <div className="flex items-center gap-3"><GuideArtwork kind="record" className="h-20 max-h-[80px] w-20 max-w-[80px] shrink-0 @max-[18rem]:hidden" /><div className="min-w-0"><p className="text-base font-semibold">아직 측정 기록이 없어요</p><p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">키나 몸무게 하나부터 남겨보세요.</p><Link href="/growth?record=add" className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--brand)]">첫 성장 기록 남기기<ChevronRight size={14} aria-hidden /></Link></div></div>}
        </div>
      </section>

      <section className="space-y-3" aria-label="오늘 확인할 일정"><SectionHeader title="이번 시기에 확인해요" />
        <Link href="/growth?tab=vaccination" className="surface-card flex min-h-24 items-center gap-3 p-5 hover:bg-[var(--surface-sky)] @max-[18rem]:p-3 @max-[18rem]:[&>svg]:hidden @max-[18rem]:[&>span]:hidden"><span className="shrink-0 rounded-2xl bg-[var(--surface-sky)] p-3 text-[var(--brand)]"><Syringe size={22} aria-hidden /></span><div className="min-w-0 flex-1"><p className="text-base font-semibold leading-6">{due.length ? `이번 월령 접종 ${due.length}건 확인` : scheduled.length ? "이번 월령의 접종을 기록했어요" : "예방접종 일정을 확인해 보세요"}</p><p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{due[0] ? `${due[0].vaccine.name} ${due[0].dose.doseNumber}차 등 · 실제 일정 확인하기` : "전체 접종 일정과 기록을 살펴보세요"}</p></div><ChevronRight size={18} className="shrink-0 text-[var(--muted-foreground)]" aria-hidden /></Link>
      </section>

      <details className="group surface-card p-5 @max-[18rem]:p-3" aria-label="월령별 참고 정보"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold">월령별 참고 정보<ChevronDown size={17} className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden /></summary><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">실제 기록과 다른 일반적인 안내예요.</p><div className="mt-4" aria-busy={loading}>
        {loading ? <div className="h-20 animate-pulse rounded-2xl bg-[var(--surface-muted)]" role="status"><span className="sr-only">월령 정보를 불러오는 중</span></div> : monthData ? <dl className="grid grid-cols-2 gap-4 @max-[20rem]:grid-cols-1">{[{ label: "하루 수유량", value: monthData.daily_feed_total, unit: "ml" }, { label: "하루 수면", value: monthData.total_sleep_hours, unit: "시간" }].map(item => <div key={item.label}><dt className="text-sm text-[var(--muted-foreground)]">{item.label}</dt><dd className="mt-1 flex flex-wrap items-baseline gap-1 text-xl font-semibold">{item.value ?? "안내 없음"}{item.value ? <span className="text-sm font-normal">{item.unit}</span> : null}</dd></div>)}</dl> : !loadError ? <p className="text-sm leading-6 text-[var(--muted-foreground)]">이 월령의 참고 정보가 아직 준비되지 않았어요.</p> : null}
      </div></details>
      {loadError && <div role="status" className="surface-card p-5 @max-[18rem]:p-3"><p className="text-base font-semibold">일부 안내를 불러오지 못했어요</p><p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">아기 기록과 백과 가이드는 계속 이용할 수 있어요.</p><button type="button" onClick={() => setRetry(value => value + 1)} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--brand)]"><RefreshCw size={16} aria-hidden />다시 시도</button></div>}
      <Link href="/wonder-weeks" className="surface-card flex items-center gap-3 p-5 hover:bg-[var(--surface-lavender)] @max-[18rem]:p-3 @max-[18rem]:[&>svg]:hidden"><Sparkles size={22} className="shrink-0 text-[var(--brand)]" aria-hidden /><div className="min-w-0 flex-1"><p className="text-base font-semibold">원더윅스 살펴보기</p><p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{currentWonderWeek ? currentWonderWeek.title : "성장 도약기에 관한 참고 안내"}</p></div><ChevronRight size={18} className="shrink-0 text-[var(--muted-foreground)]" aria-hidden /></Link>
      <Link scroll={false} href={`/encyclopedia?tab=encyclopedia&month=${months}`} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3 text-base font-semibold text-[var(--brand)]"><BookOpen size={18} aria-hidden />백과사전 전체 보기</Link>
    </div>
  </div>;
}

