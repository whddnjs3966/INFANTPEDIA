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
  Clock,
  Droplets,
  BedDouble,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useBabyStore } from "@/lib/store/baby-store";
import { getMonthInfo, getWonderWeeks } from "@/lib/queries/months";
import { getVaccinationsForMonth } from "@/lib/data/growth-data";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
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

  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [wonderWeeks, setWonderWeeks] = useState<WonderWeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const days = getDaysOld();
  const months = getMonthsOld();
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
    <div className="min-h-screen bg-gray-50/80 dark:bg-gray-950">
      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
            오늘도 함께하는 육아
          </p>
          <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white tracking-tight">
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
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-lg shadow-purple-500/20"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">
                    {profile.name}의 성장 기록
                  </p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <motion.span
                      className="text-5xl font-extrabold tracking-tight"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    >
                      D+{days}
                    </motion.span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-white/60">
                    {months}개월 차 아기
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <Baby size={32} className="text-white/90" />
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

            {/* Error state */}
            {error ? (
              <motion.div
                variants={child}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900"
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
                {/* Feeding Card */}
                <motion.div
                  variants={child}
                  className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40">
                      <Droplets size={20} className="text-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                        수유 정보
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {months}개월 권장 기준
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <StatItem
                      label="1회 수유량"
                      value={
                        monthData?.feed_amount_min != null &&
                        monthData?.feed_amount_max != null
                          ? `${monthData.feed_amount_min}~${monthData.feed_amount_max}`
                          : "-"
                      }
                      unit="ml"
                      accent="text-rose-500"
                    />
                    <StatItem
                      label="하루 총량"
                      value={
                        monthData?.daily_feed_total
                          ? String(monthData.daily_feed_total)
                          : "-"
                      }
                      unit="ml"
                      accent="text-rose-500"
                    />
                    <StatItem
                      label="수유 횟수"
                      value={monthData?.feed_count || "-"}
                      unit="회/일"
                      accent="text-rose-500"
                    />
                  </div>
                </motion.div>

                {/* Sleep Card */}
                <motion.div
                  variants={child}
                  className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                      <Moon size={20} className="text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                        수면 정보
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {months}개월 권장 수면량
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <StatItem
                      label="총 수면"
                      value={monthData?.total_sleep_hours || "-"}
                      unit="시간"
                      accent="text-indigo-500"
                    />
                    <StatItem
                      label="낮잠"
                      value={monthData?.nap_count || "-"}
                      unit="회/일"
                      accent="text-indigo-500"
                    />
                    <StatItem
                      label="깨어있는 시간"
                      value={
                        monthData?.wake_window_min != null &&
                        monthData?.wake_window_max != null
                          ? `${monthData.wake_window_min}~${monthData.wake_window_max}`
                          : "-"
                      }
                      unit="분"
                      accent="text-indigo-500"
                    />
                  </div>
                </motion.div>
              </>
            )}

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
                  onClick={() => router.push("/growth")}
                  className="w-full rounded-2xl border border-amber-200/60 bg-amber-50 p-4 text-left dark:border-amber-800/40 dark:bg-amber-950/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
                      <Syringe size={20} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-gray-900 dark:text-white">
                        예방접종 안내
                      </p>
                      <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400 truncate">
                        {months}개월:{" "}
                        {incomplete
                          .slice(0, 3)
                          .map((u) => u.vaccine.nameEn)
                          .join(", ")}
                        {incomplete.length > 3 &&
                          ` 외 ${incomplete.length - 3}건`}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-amber-400"
                    />
                  </div>
                </motion.button>
              );
            })()}

            {/* Growth Record Card */}
            <motion.button
              variants={child}
              onClick={() => router.push("/growth")}
              className="w-full rounded-2xl border border-gray-200/80 bg-white p-4 text-left shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950/40">
                  <Ruler size={20} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-gray-900 dark:text-white">
                    성장 기록
                  </p>
                  {latestMeasurement ? (
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {latestMeasurement.height && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          키 {latestMeasurement.height}cm
                        </span>
                      )}
                      {latestMeasurement.weight && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          몸무게 {latestMeasurement.weight}kg
                        </span>
                      )}
                      {latestMeasurement.headCircumference && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          머리둘레 {latestMeasurement.headCircumference}cm
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
                      탭하여 키·몸무게를 기록하세요
                    </p>
                  )}
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-gray-300 dark:text-gray-600"
                />
              </div>
            </motion.button>

            {/* Monthly Summary Card */}
            {monthData?.summary && (
              <motion.div
                variants={child}
                className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                    <BookOpen size={20} className="text-emerald-500" />
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                    {months}개월 발달 요약
                  </h3>
                </div>

                <FormattedContent content={monthData.summary} />

                {/* Development milestones */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                      대근육 발달
                    </p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
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
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3.5">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                      언어 발달
                    </p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
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
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* Reusable stat item for the grid cells */
function StatItem({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">
        {label}
      </p>
      <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">
        {value}
      </p>
      <p className={`text-[11px] font-semibold mt-1 ${accent}`}>{unit}</p>
    </div>
  );
}
