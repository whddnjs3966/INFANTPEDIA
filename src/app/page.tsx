"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Baby,
  Moon,
  Syringe,
  ChevronRight,
  Ruler,
  BookOpen,
  Sparkles,
  Shield,
  Lightbulb,
  UtensilsCrossed,
  Activity,
  MessageCircle,
  Hand,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useBabyStore } from "@/lib/store/baby-store";
import { getMonthInfo, getAllWonderWeeks } from "@/lib/queries/months";
import { getVaccinationsForMonth } from "@/lib/data/growth-data";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { resizeImage } from "@/lib/utils/resize-image";
import FormattedContent from "@/components/ui/FormattedContent";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import CircularFocus from "@/components/home/CircularFocus";
import SectionHeader from "@/components/layout/SectionHeader";
import { useDragScroll } from "@/hooks/useDragScroll";

interface MonthData {
  month: number;
  wake_window_min: number | null;
  wake_window_max: number | null;
  feed_amount_min: number | null;
  feed_amount_max: number | null;
  daily_feed_total: number | null;
  nap_count: string | null;
  total_sleep_hours: string | null;
  feed_count: string | null;
  summary: string | null;
}

interface WonderWeekData {
  id: number;
  title: string;
  description: string;
  start_day: number;
  end_day: number;
  week_number: number;
}

export default function HomePage() {
  const profile = useBabyStore((s) => s.profile);
  const getDaysOld = useBabyStore((s) => s.getDaysOld);
  const getMonthsOld = useBabyStore((s) => s.getMonthsOld);
  const getRealMonthsOld = useBabyStore((s) => s.getRealMonthsOld);

  const babyPhotos = useBabyStore((s) => s.babyPhotos);
  const setBabyPhoto = useBabyStore((s) => s.setBabyPhoto);

  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [wonderWeeks, setWonderWeeks] = useState<WonderWeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { ref: exploreRef, dragProps: exploreDrag, suppressClickIfDragging: suppressExploreClick } = useDragScroll<HTMLDivElement>();
  const days = getDaysOld();
  const months = getMonthsOld();
  const realMonths = getRealMonthsOld();
  const isOver12 = realMonths > 12;
  const vaccinationRecords = useVaccinationStore((s) => s.records);
  const measurements = useMeasurementStore((s) => s.measurements);
  const latestMeasurement =
    measurements.length > 0
      ? measurements.reduce((a, b) => (a.month > b.month ? a : b))
      : null;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [mData, wwData] = await Promise.all([
          getMonthInfo(months),
          getAllWonderWeeks(),
        ]);
        if (mData) setMonthData(mData as MonthData);
        setWonderWeeks((wwData as WonderWeekData[]) || []);
      } catch {
        setError("데이터를 불러오는 중 문제가 발생했어요");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [months, days]);

  const photoUrl = profile && babyPhotos ? babyPhotos[profile.id] : undefined;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      const dataUrl = await resizeImage(file, 256, 0.85);
      setBabyPhoto(profile.id, dataUrl);
    } catch {
      /* ignore */
    }
    e.target.value = "";
  };

  if (!profile) return null;

  const upcomingVaccinations = getVaccinationsForMonth(months);
  const incompleteVaccinations = upcomingVaccinations.filter(
    (u) =>
      !vaccinationRecords.some(
        (r) => r.vaccineId === u.vaccine.id && r.doseNumber === u.dose.doseNumber
      )
  );
  const completedCount = vaccinationRecords.length;

  // Wonder Weeks status: current / upcoming / all-past
  const currentWW = wonderWeeks.find(
    (w) => days >= w.start_day && days <= w.end_day
  );
  const nextWW = wonderWeeks.find((w) => days < w.start_day);
  const allWWPast =
    wonderWeeks.length > 0 && wonderWeeks.every((w) => days > w.end_day);
  const hasWWData = wonderWeeks.length > 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? "밤사이 잘 잤나요?" :
    hour < 12 ? "좋은 아침이에요" :
    hour < 18 ? "오늘 하루도 힘내세요" :
    "오늘도 수고하셨어요";

  const milestones = [
    {
      icon: Activity,
      label: "대근육 발달",
      value: months <= 1 ? "고개 들기 연습" : months <= 3 ? "목 가누기" : months <= 5 ? "뒤집기" : months <= 7 ? "혼자 앉기" : months <= 9 ? "기어다니기" : months <= 11 ? "붙잡고 서기" : "첫 걸음마",
      tint: "text-orange-500",
    },
    {
      icon: Hand,
      label: "소근육 발달",
      value: months <= 1 ? "반사적 움켜쥠" : months <= 3 ? "손 펴기" : months <= 5 ? "물건 잡기" : months <= 7 ? "양손 옮기기" : months <= 9 ? "엄지로 집기" : months <= 11 ? "집게손 사용" : "블록 쌓기",
      tint: "text-amber-500",
    },
    {
      icon: MessageCircle,
      label: "언어 발달",
      value: months <= 1 ? "울음으로 소통" : months <= 3 ? "옹알이 시작" : months <= 5 ? "소리에 반응" : months <= 7 ? "모음 소리 내기" : months <= 9 ? "자음 옹알이" : months <= 11 ? "맘마·빠빠" : "단어 1~3개",
      tint: "text-sky-500",
    },
    {
      icon: Users,
      label: "사회성 발달",
      value: months <= 1 ? "얼굴 응시" : months <= 3 ? "사회적 미소" : months <= 5 ? "소리 내 웃기" : months <= 7 ? "낯가림 시작" : months <= 9 ? "까꿍 반응" : months <= 11 ? "이름에 반응" : "간단한 소통",
      tint: "text-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen dark:bg-stone-950">
      {/* Top breathing room + circular focus */}
      <section className="pt-safe pb-8">
        <div className="pt-6">
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <CircularFocus
              days={days}
              months={months}
              realMonths={realMonths}
              isOver12={isOver12}
              greeting={greeting}
              babyName={profile.name}
              photoUrl={photoUrl}
              onPhotoSelect={handlePhotoSelect}
            />
          )}
        </div>
      </section>

      {!loading && (
        <div className="px-5 space-y-7 pb-6">
          {/* ── Today's focus ── */}
          {(hasWWData || incompleteVaccinations.length > 0 || isOver12) && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-3"
            >
              <SectionHeader title="오늘의 포커스" caption="지금 알아두면 좋아요" />

              <div className="space-y-2.5">
                {/* Wonder Weeks — active (gradient) */}
                {hasWWData && currentWW && (
                  <button
                    onClick={() => router.push("/wonder-weeks")}
                    className="group relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 p-5 text-left text-white active:scale-[0.98] transition-transform"
                  >
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl"
                      aria-hidden
                    />
                    <div className="relative flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Sparkles size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center rounded-full bg-white/25 backdrop-blur px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]">
                            진행 중
                          </span>
                          <span className="text-[11px] font-bold text-white/80 tabular-nums">
                            Leap {currentWW.week_number}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[16px] font-bold leading-snug">
                          {currentWW.title || `${currentWW.week_number}번째 도약`}
                        </p>
                        <p className="mt-1 text-[13px] font-medium text-white/90 leading-relaxed line-clamp-2">
                          {currentWW.description || "아기가 지금 성장 도약기에 있어요."}
                        </p>
                      </div>
                      <ChevronRight size={20} className="shrink-0 text-white/60" />
                    </div>
                  </button>
                )}

                {/* Wonder Weeks — upcoming (neutral card) */}
                {hasWWData && !currentWW && nextWW && (
                  <button
                    onClick={() => router.push("/wonder-weeks")}
                    className="flex w-full items-start gap-3.5 rounded-3xl bg-white dark:bg-stone-900 p-5 text-left elevation-1 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40">
                      <Sparkles size={20} className="text-[#14B8A6] dark:text-teal-400" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#14B8A6] dark:text-teal-400">
                          다음 도약
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">·</span>
                        <span className="text-[11px] font-bold tabular-nums text-stone-500 dark:text-stone-400">
                          Leap {nextWW.week_number}
                        </span>
                      </div>
                      <p className="mt-1 text-[15px] font-bold leading-snug text-stone-900 dark:text-stone-100 tracking-tight truncate">
                        {nextWW.title || `${nextWW.week_number}번째 도약`}
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-stone-500 dark:text-stone-400 tabular-nums">
                        <span className="font-bold text-stone-700 dark:text-stone-300">
                          약 {nextWW.start_day - days}일 후
                        </span>
                        <span className="mx-1.5 text-stone-300 dark:text-stone-600">·</span>
                        생후 {nextWW.start_day}~{nextWW.end_day}일
                      </p>
                    </div>
                    <ChevronRight size={18} className="mt-1 shrink-0 text-stone-300 dark:text-stone-600" />
                  </button>
                )}

                {/* Wonder Weeks — all completed */}
                {hasWWData && !currentWW && !nextWW && allWWPast && (
                  <button
                    onClick={() => router.push("/wonder-weeks")}
                    className="flex w-full items-start gap-3.5 rounded-3xl bg-white dark:bg-stone-900 p-5 text-left elevation-1 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40">
                      <Sparkles size={20} className="text-[#14B8A6] dark:text-teal-400" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#14B8A6] dark:text-teal-400">
                          완료
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">·</span>
                        <span className="text-[11px] font-bold tabular-nums text-stone-500 dark:text-stone-400">
                          Leap 1–{wonderWeeks.length}
                        </span>
                      </div>
                      <p className="mt-1 text-[15px] font-bold leading-snug text-stone-900 dark:text-stone-100 tracking-tight">
                        10번의 도약을 모두 지나왔어요
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed">
                        지금까지의 원더윅스 여정을 다시 살펴볼 수 있어요.
                      </p>
                    </div>
                    <ChevronRight size={18} className="mt-1 shrink-0 text-stone-300 dark:text-stone-600" />
                  </button>
                )}

                {incompleteVaccinations.length > 0 && (
                  <button
                    onClick={() => router.push("/growth?tab=vaccination")}
                    className="flex w-full items-center gap-3.5 rounded-3xl bg-white dark:bg-stone-900 p-5 text-left elevation-1 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                      <Syringe size={22} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-bold text-stone-900 dark:text-stone-100">
                          예방접종 {incompleteVaccinations.length}건 남음
                        </p>
                      </div>
                      <p className="mt-0.5 text-[13px] font-medium text-stone-500 dark:text-stone-400 truncate">
                        다음: {incompleteVaccinations[0].vaccine.name} {incompleteVaccinations[0].dose.doseNumber}차
                      </p>
                    </div>
                    <ChevronRight size={20} className="shrink-0 text-stone-300 dark:text-stone-600" />
                  </button>
                )}

                {isOver12 && (
                  <div className="flex items-start gap-3 rounded-3xl bg-white dark:bg-stone-900 p-4 elevation-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-900/50">
                      <Sparkles size={18} className="text-teal-500" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-stone-900 dark:text-stone-100">
                        벌써 {realMonths}개월이에요!
                      </p>
                      <p className="mt-0.5 text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed">
                        12개월 이후 정보는 12개월 기준으로 제공됩니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {error && (
            <div className="rounded-3xl bg-white dark:bg-stone-900 p-6 text-center elevation-1">
              <p className="text-[14px] text-stone-500 dark:text-stone-400">{error}</p>
            </div>
          )}

          {!error && (
            <>
              {/* ── Month-specific data (2x2 grid) ── */}
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-3"
              >
                <SectionHeader title="월령 데이터" caption={`${months}개월 기준`} />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push("/encyclopedia")}
                    className="rounded-3xl bg-white dark:bg-stone-900 p-5 text-left elevation-1 active:scale-[0.98] transition-transform"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40">
                        <Baby size={20} className="text-teal-500" />
                      </div>
                      <ChevronRight size={16} className="text-stone-300 dark:text-stone-600" />
                    </div>
                    <p className="text-[12px] font-semibold text-stone-500 dark:text-stone-400">수유</p>
                    <p className="mt-1 text-[22px] font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                      {monthData?.daily_feed_total ? `${monthData.daily_feed_total}` : "-"}
                      <span className="text-[13px] font-semibold text-stone-400 dark:text-stone-500 ml-1">ml/일</span>
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-stone-400 dark:text-stone-500">
                      {monthData?.feed_count ? (monthData.feed_count.includes("회") ? monthData.feed_count : `${monthData.feed_count}회`) : "-"}
                    </p>
                  </button>

                  <button
                    onClick={() => router.push("/encyclopedia")}
                    className="rounded-3xl bg-white dark:bg-stone-900 p-5 text-left elevation-1 active:scale-[0.98] transition-transform"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/40">
                        <Moon size={20} className="text-sky-500" />
                      </div>
                      <ChevronRight size={16} className="text-stone-300 dark:text-stone-600" />
                    </div>
                    <p className="text-[12px] font-semibold text-stone-500 dark:text-stone-400">수면</p>
                    <p className="mt-1 text-[22px] font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                      {monthData?.total_sleep_hours ? `${monthData.total_sleep_hours}` : "-"}
                      <span className="text-[13px] font-semibold text-stone-400 dark:text-stone-500 ml-1">시간</span>
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-stone-400 dark:text-stone-500">
                      낮잠 {monthData?.nap_count
                        ? (monthData.nap_count.includes("회") || !/\d/.test(monthData.nap_count)
                            ? monthData.nap_count
                            : `${monthData.nap_count}회`)
                        : "-"}
                    </p>
                  </button>

                  <button
                    onClick={() => router.push("/growth")}
                    className="rounded-3xl bg-white dark:bg-stone-900 p-5 text-left elevation-1 active:scale-[0.98] transition-transform"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 dark:bg-cyan-950/40">
                        <Ruler size={20} className="text-cyan-500" />
                      </div>
                      <ChevronRight size={16} className="text-stone-300 dark:text-stone-600" />
                    </div>
                    <p className="text-[12px] font-semibold text-stone-500 dark:text-stone-400">성장</p>
                    {latestMeasurement?.height ? (
                      <>
                        <p className="mt-1 text-[22px] font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                          {latestMeasurement.height}
                          <span className="text-[13px] font-semibold text-stone-400 dark:text-stone-500 ml-1">cm</span>
                        </p>
                        <p className="mt-1 text-[12px] font-medium text-stone-400 dark:text-stone-500">
                          {latestMeasurement.weight ? `${latestMeasurement.weight}kg` : `${latestMeasurement.month}개월`}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 text-[17px] font-bold text-cyan-600 dark:text-cyan-400 leading-tight">
                          기록하기
                        </p>
                        <p className="mt-1 text-[12px] font-medium text-stone-400 dark:text-stone-500">
                          키·몸무게 추가
                        </p>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push("/growth?tab=vaccination")}
                    className="rounded-3xl bg-white dark:bg-stone-900 p-5 text-left elevation-1 active:scale-[0.98] transition-transform"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
                        <Shield size={20} className="text-emerald-500" />
                      </div>
                      <ChevronRight size={16} className="text-stone-300 dark:text-stone-600" />
                    </div>
                    <p className="text-[12px] font-semibold text-stone-500 dark:text-stone-400">예방접종</p>
                    <p className="mt-1 text-[22px] font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                      {completedCount}
                      <span className="text-[13px] font-semibold text-stone-400 dark:text-stone-500 ml-1">건 완료</span>
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-stone-400 dark:text-stone-500">
                      {incompleteVaccinations.length > 0 ? `${incompleteVaccinations.length}건 남음` : "모두 완료"}
                    </p>
                  </button>
                </div>
              </motion.section>

              {/* ── Milestones as list ── */}
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-3"
              >
                <SectionHeader title="발달 이정표" caption={`${months}개월 주요 변화`} />

                <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 elevation-1">
                  {milestones.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.label}
                        className={`flex items-center gap-4 px-5 py-4 ${
                          i < milestones.length - 1 ? "border-b border-stone-100 dark:border-stone-800" : ""
                        }`}
                      >
                        <Icon size={22} className={`${m.tint} shrink-0`} strokeWidth={2.1} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-stone-400 dark:text-stone-500">
                            {m.label}
                          </p>
                          <p className="text-[15px] font-bold text-stone-900 dark:text-stone-100 leading-tight">
                            {m.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>

              {/* ── Weaning guide ── */}
              {months >= 4 && (
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-3"
                >
                  <SectionHeader
                    title="이유식 가이드"
                    caption={months <= 5 ? "초기" : months === 6 ? "초기 2단계" : months <= 8 ? "중기" : months <= 11 ? "후기" : "완료기"}
                  />

                  <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 elevation-1">
                    {(() => {
                      const weaningInfo = months <= 5
                        ? { frequency: "1일 1회", texture: "묽은 미음", foods: "쌀미음, 감자, 고구마, 애호박", tip: "한 가지 재료로 시작, 알레르기 반응 3일간 관찰", amount: "30~50ml" }
                        : months === 6
                        ? { frequency: "1일 1~2회", texture: "걸쭉한 미음", foods: "당근, 시금치, 사과, 배, 브로콜리", tip: "새 식재료는 3~5일 간격으로 오전에 먹여 반응 관찰", amount: "50~80ml" }
                        : months <= 8
                        ? { frequency: "1일 2회", texture: "으깬 죽", foods: "소고기, 닭고기, 두부, 당근, 브로콜리", tip: "단백질(소고기) 필수! 철분 보충이 중요해요", amount: "80~120ml" }
                        : months <= 11
                        ? { frequency: "1일 3회", texture: "무른밥", foods: "생선, 달걀 노른자, 치즈, 다양한 채소", tip: "손으로 집어먹는 핑거푸드 시작해 보세요", amount: "120~150ml" }
                        : { frequency: "1일 3회 + 간식", texture: "진밥/무른밥", foods: "달걀 흰자, 우유(만1세+), 다양한 과일", tip: "가족 식사와 비슷한 식단으로 전환해요", amount: "150~200ml" };

                      return (
                        <>
                          <div className="grid grid-cols-3 divide-x divide-stone-100 dark:divide-stone-800">
                            <div className="text-center pr-3">
                              <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">횟수</p>
                              <p className="text-[14px] font-bold text-orange-600 dark:text-orange-400">{weaningInfo.frequency}</p>
                            </div>
                            <div className="text-center px-3">
                              <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">1회 양</p>
                              <p className="text-[14px] font-bold text-orange-600 dark:text-orange-400">{weaningInfo.amount}</p>
                            </div>
                            <div className="text-center pl-3">
                              <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">형태</p>
                              <p className="text-[14px] font-bold text-orange-600 dark:text-orange-400">{weaningInfo.texture}</p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                            <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5">추천 식재료</p>
                            <p className="text-[13px] font-medium text-stone-700 dark:text-stone-300 leading-relaxed">
                              {weaningInfo.foods}
                            </p>
                          </div>
                          <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 p-3.5">
                            <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[13px] text-amber-700 dark:text-amber-400 leading-relaxed">
                              {weaningInfo.tip}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </motion.section>
              )}

              {/* ── Explore (horizontal rail) ── */}
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-3"
              >
                <SectionHeader title="둘러보기" caption="더 많은 정보를 확인해요" />

                <div
                  ref={exploreRef}
                  {...exploreDrag}
                  className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1 cursor-grab active:cursor-grabbing select-none"
                >
                  {[
                    { icon: BookOpen, label: "백과사전", desc: "월령별 정보", color: "from-emerald-400 to-emerald-500", path: "/encyclopedia" },
                    { icon: Ruler, label: "성장 그래프", desc: "키·몸무게", color: "from-cyan-400 to-cyan-500", path: "/growth" },
                    { icon: Syringe, label: "예방접종", desc: "접종 일정", color: "from-amber-400 to-amber-500", path: "/growth?tab=vaccination" },
                    { icon: Lightbulb, label: "육아 꿀팁", desc: "생활 팁", color: "from-rose-400 to-rose-500", path: "/tips" },
                    { icon: UtensilsCrossed, label: "이유식", desc: "단계별 가이드", color: "from-orange-400 to-orange-500", path: "/encyclopedia" },
                  ].map(({ icon: Icon, label, desc, color, path }) => (
                    <button
                      key={label}
                      onClick={suppressExploreClick(() => router.push(path))}
                      className="flex flex-col shrink-0 w-[132px] rounded-3xl bg-white dark:bg-stone-900 p-4 elevation-1 active:scale-[0.97] transition-transform"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color}`}>
                        <Icon size={22} className="text-white" strokeWidth={2.2} />
                      </div>
                      <p className="mt-3 text-[14px] font-bold text-stone-900 dark:text-stone-100">
                        {label}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.section>

              {/* ── Monthly summary ── */}
              {monthData?.summary && (
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-3"
                >
                  <SectionHeader title="자세한 요약" caption={`${months}개월 발달 안내`} />
                  <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 elevation-1">
                    <FormattedContent content={monthData.summary} />
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
