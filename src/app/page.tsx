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
  Droplets,
  Heart,
  Star,
  Calendar,
  Camera,
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
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  if (!profile) return null;

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen dark:bg-gray-950">
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500">
            오늘도 함께하는 육아
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            안녕하세요, {profile.name} 부모님
          </h1>
        </motion.div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Hero D-day Card */}
            <motion.div
              variants={child}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-6 pb-5 text-white shadow-xl shadow-purple-500/20"
            >
              {/* Decorative elements */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-sm" />
              <div className="absolute right-16 top-4 h-20 w-20 rounded-full bg-fuchsia-400/15 blur-md" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-violet-400/10 blur-sm" />
              <div className="absolute bottom-12 right-8 h-3 w-3 rounded-full bg-white/30" />
              <div className="absolute top-8 left-[40%] h-2 w-2 rounded-full bg-white/20" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Heart size={14} className="text-pink-300" fill="currentColor" />
                    </motion.div>
                    <p className="text-sm font-semibold text-white/80 tracking-wide">
                      {profile.name}의 성장 여정
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex flex-col items-center gap-1 shrink-0 active:scale-95 transition-transform"
                  >
                    <div className="relative h-16 w-16 rounded-full bg-white/15 backdrop-blur-sm overflow-hidden ring-2 ring-white/30">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={profile.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Camera size={24} className="text-white/70" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md border-2 border-purple-400">
                        <Camera size={11} className="text-purple-600" />
                      </div>
                    </div>
                    {!photoUrl && (
                      <span className="text-[10px] font-medium text-white/60">사진 등록</span>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </div>

                <div className="flex items-baseline gap-2">
                  <motion.span
                    className="text-[56px] font-black tracking-tighter leading-none"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 180, delay: 0.3 }}
                  >
                    D+{days}
                  </motion.span>
                  <span className="text-lg font-bold text-white/40 mb-1">일</span>
                </div>

                <div className="mt-3 flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/90">
                    <Calendar size={12} />
                    {isOver12 ? `${realMonths}개월 (만 1세+)` : `${months}개월 차`}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/90">
                    <Star size={12} />
                    {Math.floor(days / 7)}주 {days % 7}일
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-white/50">
                      {months}개월 진행률
                    </span>
                    <span className="text-[11px] font-bold text-white/70">
                      {days % 30}/30일
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-white/80 to-white/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((days % 30) / 30) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Wonder Weeks Banner */}
            {wonderWeeks.length > 0 && (
              <motion.div variants={child}>
                <WonderWeekBanner
                  title={
                    wonderWeeks[0].title ||
                    `원더윅스 ${wonderWeeks[0].week_number || ""}번째 도약`
                  }
                  description={
                    wonderWeeks[0].description ||
                    "아기가 지금 성장 도약기에 있어요. 보채고 칭찬으로 도와주세요!"
                  }
                  leapNumber={wonderWeeks[0].week_number}
                />
              </motion.div>
            )}

            {/* 12개월 이상 안내 */}
            {isOver12 && (
              <motion.div
                variants={child}
                className="rounded-[28px] border border-purple-200/40 bg-purple-50 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.06)] dark:border-purple-800/30 dark:bg-purple-950/30"
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {error}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  네트워크를 확인하고 다시 시도해 주세요
                </p>
              </motion.div>
            ) : (
              <>
                {/* Feeding & Sleep Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Feeding Card */}
                  <motion.div
                    variants={child}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-[28px] border border-violet-200/40 bg-white p-4 shadow-[0_2px_16px_rgb(0,0,0,0.05)] dark:border-violet-800/30 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40">
                        <Baby size={18} className="text-violet-500" />
                      </div>
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                        수유 권장량
                      </h3>
                    </div>

                    {/* Key metric */}
                    <div className="mb-3.5">
                      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">하루 총량</p>
                      <p className="text-[22px] font-extrabold text-violet-600 dark:text-violet-400 leading-tight tracking-tight">
                        {monthData?.daily_feed_total ? `${monthData.daily_feed_total}ml` : "-"}
                      </p>
                    </div>

                    {/* Sub metrics */}
                    <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-gray-400 dark:text-gray-500">1회량</span>
                        <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                          {monthData?.feed_amount_min != null ? `${monthData.feed_amount_min}~${monthData.feed_amount_max}ml` : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-gray-400 dark:text-gray-500">횟수</span>
                        <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                          {monthData?.feed_count ? (monthData.feed_count.includes("회") ? monthData.feed_count : `${monthData.feed_count}회`) : "-"}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Sleep Card */}
                  <motion.div
                    variants={child}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-[28px] border border-sky-200/40 bg-white p-4 shadow-[0_2px_16px_rgb(0,0,0,0.05)] dark:border-sky-800/30 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40">
                        <Moon size={18} className="text-sky-500" />
                      </div>
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                        수면 가이드
                      </h3>
                    </div>

                    {/* Key metric */}
                    <div className="mb-3.5">
                      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">총 수면</p>
                      <p className="text-[22px] font-extrabold text-sky-600 dark:text-sky-400 leading-tight tracking-tight">
                        {monthData?.total_sleep_hours ? `${monthData.total_sleep_hours}h` : "-"}
                      </p>
                    </div>

                    {/* Sub metrics */}
                    <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-gray-400 dark:text-gray-500">낮잠</span>
                        <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                          {monthData?.nap_count ? (monthData.nap_count.includes("회") ? monthData.nap_count : `${monthData.nap_count}회`) : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-gray-400 dark:text-gray-500">활동 시간</span>
                        <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                          {monthData?.wake_window_min != null ? `${monthData.wake_window_min}~${monthData.wake_window_max}분` : "-"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  {/* Growth Record */}
                  <motion.button
                    variants={child}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/growth")}
                    className="w-full rounded-[24px] border border-cyan-200/40 bg-cyan-50/50 p-4 text-left shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-cyan-800/30 dark:bg-cyan-950/20"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 dark:bg-cyan-950/40">
                        <Ruler size={20} className="text-cyan-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-gray-900 dark:text-white">
                          성장 현황
                        </p>
                        {latestMeasurement ? (
                          <>
                            <div className="mt-1.5 flex items-center gap-2">
                              {latestMeasurement.height && (
                                <span className="rounded-lg bg-white/80 dark:bg-cyan-950/30 px-2 py-0.5 text-[12px] font-semibold text-cyan-700 dark:text-cyan-400">
                                  키 {latestMeasurement.height}cm
                                </span>
                              )}
                              {latestMeasurement.weight && (
                                <span className="rounded-lg bg-white/80 dark:bg-cyan-950/30 px-2 py-0.5 text-[12px] font-semibold text-cyan-700 dark:text-cyan-400">
                                  몸무게 {latestMeasurement.weight}kg
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                              {latestMeasurement.month}개월 기록 기준
                            </p>
                          </>
                        ) : (
                          <p className="mt-0.5 text-[13px] text-gray-400 dark:text-gray-500">
                            탭하여 키·몸무게를 기록하세요
                          </p>
                        )}
                      </div>
                      <ChevronRight size={18} className="shrink-0 text-cyan-400/60 dark:text-cyan-500/40" />
                    </div>
                  </motion.button>

                  {/* Vaccination Alert */}
                  {(() => {
                    const upcoming = getVaccinationsForMonth(months);
                    const incomplete = upcoming.filter(
                      (u) =>
                        !vaccinationRecords.some(
                          (r) =>
                            r.vaccineId === u.vaccine.id &&
                            r.doseNumber === u.dose.doseNumber
                        )
                    );
                    if (incomplete.length === 0) return null;
                    return (
                      <motion.button
                        variants={child}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/growth?tab=vaccination")}
                        className="w-full rounded-[24px] border border-amber-200/40 bg-amber-50/50 p-4 text-left shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-amber-800/30 dark:bg-amber-950/20"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 dark:bg-amber-900/40">
                            <Syringe size={20} className="text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[15px] font-bold text-gray-900 dark:text-white">
                                예방접종 알림
                              </p>
                              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                                {incomplete.length}건
                              </span>
                            </div>
                            <p className="mt-0.5 text-[13px] font-medium text-amber-600/90 dark:text-amber-400/90 truncate">
                              {incomplete[0].vaccine.name}({incomplete[0].vaccine.nameEn}) {incomplete[0].dose.doseNumber}차
                            </p>
                            {incomplete.length > 1 && (
                              <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                                외 {incomplete.length - 1}건 접종 필요
                              </p>
                            )}
                          </div>
                          <ChevronRight size={18} className="shrink-0 text-amber-400/60" />
                        </div>
                      </motion.button>
                    );
                  })()}
                </div>

                {/* Monthly Summary Card */}
                {monthData?.summary && (
                  <motion.div
                    variants={child}
                    className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_2px_16px_rgb(0,0,0,0.05)] dark:border-gray-700/50 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                        <BookOpen size={18} className="text-emerald-500" />
                      </div>
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                        {months}개월 발달 요약
                      </h3>
                    </div>

                    <FormattedContent content={monthData.summary} />

                    {/* Development milestones */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-1">
                          대근육 발달
                        </p>
                        <p className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
                          {months <= 1
                            ? "고개 들기 연습"
                            : months <= 3
                              ? "목 가누기"
                              : months <= 5
                                ? "뒤집기"
                                : months <= 7
                                  ? "혼자 앉기"
                                  : months <= 9
                                    ? "기어다니기"
                                    : months <= 11
                                      ? "붙잡고 서기"
                                      : "첫 걸음마"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-1">
                          언어 발달
                        </p>
                        <p className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
                          {months <= 1
                            ? "울음으로 소통"
                            : months <= 3
                              ? "옹알이 시작"
                              : months <= 5
                                ? "소리에 반응"
                                : months <= 7
                                  ? "모음 소리 내기"
                                  : months <= 9
                                    ? "자음 옹알이"
                                    : months <= 11
                                      ? "맘마·빠빠"
                                      : "단어 1~3개"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
