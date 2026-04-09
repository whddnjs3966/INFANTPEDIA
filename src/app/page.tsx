"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Baby,
  Moon,
  Syringe,
  ChevronRight,
  Ruler,
  BookOpen,
  Sparkles,
  Heart,
  Star,
  Calendar,
  Camera,
  TrendingUp,
  Activity,
  Shield,
  Lightbulb,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBabyStore } from "@/lib/store/baby-store";
import { getMonthInfo, getWonderWeeks } from "@/lib/queries/months";
import { getVaccinationsForMonth } from "@/lib/data/growth-data";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { resizeImage } from "@/lib/utils/resize-image";
import WonderWeekBanner from "@/components/home/WonderWeekBanner";
import FormattedContent from "@/components/ui/FormattedContent";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [wonderWeeks, setWonderWeeks] = useState<WonderWeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
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
          getWonderWeeks(days),
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
      // silently ignore
    }
    e.target.value = "";
  };

  if (!profile) return null;

  // Vaccination data
  const upcomingVaccinations = getVaccinationsForMonth(months);
  const incompleteVaccinations = upcomingVaccinations.filter(
    (u) =>
      !vaccinationRecords.some(
        (r) => r.vaccineId === u.vaccine.id && r.doseNumber === u.dose.doseNumber
      )
  );
  const completedCount = vaccinationRecords.length;

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.08 },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? "밤사이 잘 잤나요?" :
    hour < 12 ? "좋은 아침이에요" :
    hour < 18 ? "오늘 하루도 힘내세요" :
    "오늘도 수고하셨어요";

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <div className="px-4 pt-6 pb-6">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* ── Hero Section ── */}
            <motion.div
              variants={child}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 text-white shadow-xl shadow-purple-500/20"
            >
              {/* Decorative circles */}
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/8" />
              <div className="absolute right-20 bottom-0 h-24 w-24 rounded-full bg-fuchsia-400/10 blur-lg" />
              <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-violet-400/10" />

              <div className="relative z-10 p-5">
                {/* Profile row: photo + greeting */}
                <div className="flex items-center gap-4 mb-5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative shrink-0 active:scale-95 transition-transform"
                  >
                    <div className="relative h-[72px] w-[72px] rounded-2xl bg-white/15 backdrop-blur-sm overflow-hidden ring-2 ring-white/25 shadow-lg">
                      {photoUrl ? (
                        <Image src={photoUrl} alt={profile.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Camera size={28} className="text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-white shadow-md">
                      <Camera size={11} className="text-purple-600" />
                    </div>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-white/50">{greeting}</p>
                    <h1 className="text-[20px] font-extrabold tracking-tight leading-tight truncate">
                      {profile.name} 부모님
                    </h1>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/85">
                        <Calendar size={10} />
                        {isOver12 ? `${realMonths}개월` : `${months}개월 차`}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/85">
                        <Star size={10} />
                        {Math.floor(days / 7)}주 {days % 7}일
                      </span>
                    </div>
                  </div>
                </div>

                {/* D-day + progress bar */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        className="text-[40px] font-black tracking-tighter leading-none"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
                      >
                        D+{days}
                      </motion.span>
                      <span className="text-sm font-bold text-white/40 mb-0.5">일</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 font-medium">{months}개월 진행률</p>
                      <p className="text-[13px] font-bold text-white/80">{days % 30}/30일</p>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-white/90 to-white/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((days % 30) / 30) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Wonder Weeks Banner ── */}
            {wonderWeeks.length > 0 && (
              <motion.div variants={child}>
                <WonderWeekBanner
                  title={wonderWeeks[0].title || `원더윅스 ${wonderWeeks[0].week_number || ""}번째 도약`}
                  description={wonderWeeks[0].description || "아기가 지금 성장 도약기에 있어요. 보채고 칭찬으로 도와주세요!"}
                  leapNumber={wonderWeeks[0].week_number}
                />
              </motion.div>
            )}

            {/* ── 12개월 이상 안내 ── */}
            {isOver12 && (
              <motion.div
                variants={child}
                className="rounded-[28px] border border-purple-200/40 bg-purple-50 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.06)] dark:border-purple-800/30 dark:bg-purple-950/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50">
                    <Sparkles size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                      우리 아기가 벌써 {realMonths}개월!
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      12개월 이후 정보는 12개월 기준으로 제공돼요.
                      성장 기록과 예방접종은 계속 이용할 수 있어요.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error state */}
            {error ? (
              <motion.div
                variants={child}
                className="rounded-[28px] bg-gray-100 p-6 text-center dark:bg-gray-800/50"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">네트워크를 확인하고 다시 시도해 주세요</p>
              </motion.div>
            ) : (
              <>
                {/* ── Quick Stats Row (3 cols) ── */}
                <motion.div variants={child} className="grid grid-cols-3 gap-2.5">
                  {/* Feeding stat */}
                  <div
                    onClick={() => router.push("/encyclopedia")}
                    className="cursor-pointer rounded-2xl bg-white dark:bg-gray-900 p-3.5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 text-center active:scale-[0.97] transition-transform"
                  >
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40">
                      <Baby size={18} className="text-violet-500" />
                    </div>
                    <p className="text-[18px] font-extrabold text-violet-600 dark:text-violet-400 leading-tight">
                      {monthData?.daily_feed_total ? `${monthData.daily_feed_total}` : "-"}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">ml/일 수유량</p>
                  </div>

                  {/* Sleep stat */}
                  <div
                    onClick={() => router.push("/encyclopedia")}
                    className="cursor-pointer rounded-2xl bg-white dark:bg-gray-900 p-3.5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 text-center active:scale-[0.97] transition-transform"
                  >
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40">
                      <Moon size={18} className="text-sky-500" />
                    </div>
                    <p className="text-[18px] font-extrabold text-sky-600 dark:text-sky-400 leading-tight">
                      {monthData?.total_sleep_hours ? `${monthData.total_sleep_hours}` : "-"}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">시간 수면</p>
                  </div>

                  {/* Vaccination stat */}
                  <div
                    onClick={() => router.push("/growth?tab=vaccination")}
                    className="cursor-pointer rounded-2xl bg-white dark:bg-gray-900 p-3.5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 text-center active:scale-[0.97] transition-transform"
                  >
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                      <Shield size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-[18px] font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight">
                      {completedCount}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">접종 완료</p>
                  </div>
                </motion.div>

                {/* ── Detail Cards (Feeding + Sleep) ── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Feeding Card */}
                  <motion.div
                    variants={child}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push("/encyclopedia")}
                    className="cursor-pointer rounded-[24px] border border-violet-200/40 bg-white p-4 shadow-[0_2px_16px_rgb(0,0,0,0.05)] dark:border-violet-800/30 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
                        <Baby size={15} className="text-violet-500" />
                      </div>
                      <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">수유 가이드</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">1회량</span>
                        <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">
                          {monthData?.feed_amount_min != null ? `${monthData.feed_amount_min}~${monthData.feed_amount_max}ml` : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">횟수</span>
                        <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">
                          {monthData?.feed_count ? (monthData.feed_count.includes("회") ? monthData.feed_count : `${monthData.feed_count}회`) : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">하루 총량</span>
                        <span className="text-[12px] font-bold text-violet-600 dark:text-violet-400">
                          {monthData?.daily_feed_total ? `${monthData.daily_feed_total}ml` : "-"}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Sleep Card */}
                  <motion.div
                    variants={child}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push("/encyclopedia")}
                    className="cursor-pointer rounded-[24px] border border-sky-200/40 bg-white p-4 shadow-[0_2px_16px_rgb(0,0,0,0.05)] dark:border-sky-800/30 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/40">
                        <Moon size={15} className="text-sky-500" />
                      </div>
                      <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">수면 가이드</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">총 수면</span>
                        <span className="text-[12px] font-bold text-sky-600 dark:text-sky-400">
                          {monthData?.total_sleep_hours ? `${monthData.total_sleep_hours}시간` : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">낮잠</span>
                        <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">
                          {monthData?.nap_count ? (monthData.nap_count.includes("회") ? monthData.nap_count : `${monthData.nap_count}회`) : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">활동 시간</span>
                        <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">
                          {monthData?.wake_window_min != null ? `${monthData.wake_window_min}~${monthData.wake_window_max}분` : "-"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* ── Weaning Food Guide (4개월+) ── */}
                {months >= 4 && (
                  <motion.div
                    variants={child}
                    className="rounded-[24px] border border-orange-200/40 bg-white p-4 shadow-[0_2px_16px_rgb(0,0,0,0.05)] dark:border-orange-800/30 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40">
                        <UtensilsCrossed size={17} className="text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">이유식 가이드</h3>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {months <= 5 ? "초기 이유식" : months === 6 ? "초기 이유식 (2단계)" : months <= 8 ? "중기 이유식" : months <= 11 ? "후기 이유식" : "완료기 이유식"}
                        </p>
                      </div>
                    </div>

                    {/* Stage info */}
                    {(() => {
                      const weaningInfo = months <= 5
                        ? { stage: "초기", frequency: "1일 1회", texture: "묽은 미음", foods: "쌀미음, 감자, 고구마, 애호박", tip: "한 가지 재료로 시작, 알레르기 반응 3일간 관찰", amount: "1~2숟가락 (30~50ml)" }
                        : months === 6
                        ? { stage: "초기 2단계", frequency: "1일 1~2회", texture: "걸쭉한 미음~묽은 죽", foods: "당근, 시금치, 사과, 배, 브로콜리", tip: "새 식재료는 3~5일 간격으로 하나씩, 오전에 먹여 반응 관찰", amount: "50~80ml씩" }
                        : months <= 8
                        ? { stage: "중기", frequency: "1일 2회", texture: "으깬 죽 (5~7배죽)", foods: "소고기, 닭고기, 두부, 당근, 브로콜리", tip: "단백질(소고기) 필수! 철분 보충이 중요해요", amount: "80~120ml씩" }
                        : months <= 11
                        ? { stage: "후기", frequency: "1일 3회", texture: "무른밥 (3~4배죽)", foods: "생선, 달걀 노른자, 치즈, 다양한 채소", tip: "손으로 집어먹는 핑거푸드 시작해 보세요", amount: "120~150ml씩" }
                        : { stage: "완료기", frequency: "1일 3회 + 간식", texture: "잘게 썬 진밥/무른밥", foods: "달걀 흰자, 우유(만1세+), 다양한 과일", tip: "가족 식사와 비슷한 식단으로 전환해요", amount: "150~200ml씩" };

                      return (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-orange-50/70 dark:bg-orange-950/20 p-2.5 text-center">
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">횟수</p>
                              <p className="text-[12px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">{weaningInfo.frequency}</p>
                            </div>
                            <div className="rounded-xl bg-orange-50/70 dark:bg-orange-950/20 p-2.5 text-center">
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">1회 양</p>
                              <p className="text-[12px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">{weaningInfo.amount}</p>
                            </div>
                            <div className="rounded-xl bg-orange-50/70 dark:bg-orange-950/20 p-2.5 text-center">
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">형태</p>
                              <p className="text-[12px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">{weaningInfo.texture}</p>
                            </div>
                          </div>
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1">추천 식재료</p>
                            <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300">{weaningInfo.foods}</p>
                          </div>
                          <div className="flex items-start gap-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 p-3">
                            <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">{weaningInfo.tip}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* ── Growth Record Card ── */}
                <motion.button
                  variants={child}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/growth")}
                  className="w-full rounded-[24px] border border-cyan-200/40 bg-white p-4 text-left shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-cyan-800/30 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 dark:bg-cyan-950/40">
                      <TrendingUp size={20} className="text-cyan-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-900 dark:text-white">성장 기록</p>
                      {latestMeasurement ? (
                        <>
                          <div className="mt-1.5 flex items-center gap-2">
                            {latestMeasurement.height && (
                              <span className="rounded-lg bg-cyan-50 dark:bg-cyan-950/30 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
                                키 {latestMeasurement.height}cm
                              </span>
                            )}
                            {latestMeasurement.weight && (
                              <span className="rounded-lg bg-cyan-50 dark:bg-cyan-950/30 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
                                몸무게 {latestMeasurement.weight}kg
                              </span>
                            )}
                            {latestMeasurement.headCircumference && (
                              <span className="rounded-lg bg-cyan-50 dark:bg-cyan-950/30 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
                                머리 {latestMeasurement.headCircumference}cm
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                            {latestMeasurement.month}개월 측정 기준
                          </p>
                        </>
                      ) : (
                        <p className="mt-0.5 text-[12px] text-gray-400 dark:text-gray-500">
                          탭하여 키·몸무게를 기록하세요
                        </p>
                      )}
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-cyan-400/60 dark:text-cyan-500/40" />
                  </div>
                </motion.button>

                {/* ── Vaccination Alert ── */}
                {incompleteVaccinations.length > 0 && (
                  <motion.button
                    variants={child}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/growth?tab=vaccination")}
                    className="w-full rounded-[24px] border border-amber-200/40 bg-white p-4 text-left shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-amber-800/30 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/40">
                        <Syringe size={20} className="text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-bold text-gray-900 dark:text-white">예방접종</p>
                          <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                            {incompleteVaccinations.length}건
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12px] font-medium text-amber-600/90 dark:text-amber-400/90 truncate">
                          {incompleteVaccinations[0].vaccine.name}({incompleteVaccinations[0].vaccine.nameEn}) {incompleteVaccinations[0].dose.doseNumber}차
                        </p>
                        {incompleteVaccinations.length > 1 && (
                          <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                            외 {incompleteVaccinations.length - 1}건 접종 필요
                          </p>
                        )}
                      </div>
                      <ChevronRight size={18} className="shrink-0 text-amber-400/60" />
                    </div>
                  </motion.button>
                )}

                {/* ── Quick Navigation ── */}
                <motion.div variants={child}>
                  <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-2 px-1">바로가기</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: BookOpen, label: "백과사전", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", path: "/encyclopedia" },
                      { icon: Ruler, label: "성장 그래프", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/40", path: "/growth" },
                      { icon: Syringe, label: "예방접종", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40", path: "/growth?tab=vaccination" },
                      { icon: Lightbulb, label: "육아 꿀팁", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40", path: "/tips" },
                    ].map(({ icon: Icon, label, color, bg, path }) => (
                      <motion.button
                        key={label}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => router.push(path)}
                        className="flex flex-col items-center gap-1.5 rounded-2xl bg-white dark:bg-gray-900 py-3.5 border border-gray-100 dark:border-gray-800 shadow-[0_1px_6px_rgb(0,0,0,0.03)] active:bg-gray-50 dark:active:bg-gray-800"
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                          <Icon size={17} className={color} />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">{label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* ── Development Milestones ── */}
                <motion.div
                  variants={child}
                  className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_16px_rgb(0,0,0,0.05)] dark:border-gray-700/50 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40">
                      <Activity size={17} className="text-orange-500" />
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
                      {months}개월 발달 이정표
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1">대근육 발달</p>
                      <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">
                        {months <= 1 ? "고개 들기 연습" : months <= 3 ? "목 가누기" : months <= 5 ? "뒤집기" : months <= 7 ? "혼자 앉기" : months <= 9 ? "기어다니기" : months <= 11 ? "붙잡고 서기" : "첫 걸음마"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1">언어 발달</p>
                      <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">
                        {months <= 1 ? "울음으로 소통" : months <= 3 ? "옹알이 시작" : months <= 5 ? "소리에 반응" : months <= 7 ? "모음 소리 내기" : months <= 9 ? "자음 옹알이" : months <= 11 ? "맘마·빠빠" : "단어 1~3개"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1">소근육 발달</p>
                      <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">
                        {months <= 1 ? "반사적 움켜쥠" : months <= 3 ? "손 펴기" : months <= 5 ? "물건 잡기" : months <= 7 ? "양손 옮기기" : months <= 9 ? "엄지로 집기" : months <= 11 ? "집게손 사용" : "블록 쌓기"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1">사회성 발달</p>
                      <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">
                        {months <= 1 ? "얼굴 응시" : months <= 3 ? "사회적 미소" : months <= 5 ? "소리 내 웃기" : months <= 7 ? "낯가림 시작" : months <= 9 ? "까꿍 반응" : months <= 11 ? "이름에 반응" : "간단한 소통"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* ── Monthly Summary ── */}
                {monthData?.summary && (
                  <motion.div
                    variants={child}
                    className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_16px_rgb(0,0,0,0.05)] dark:border-gray-700/50 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                        <BookOpen size={17} className="text-emerald-500" />
                      </div>
                      <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
                        {months}개월 발달 요약
                      </h3>
                    </div>
                    <FormattedContent content={monthData.summary} />
                  </motion.div>
                )}

                {/* ── Footer love note ── */}
                <motion.div variants={child} className="pt-2 pb-4 text-center">
                  <p className="text-[11px] text-gray-300 dark:text-gray-600 flex items-center justify-center gap-1">
                    <Heart size={10} className="text-pink-300" fill="currentColor" />
                    {profile.name}의 건강한 성장을 응원합니다
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
