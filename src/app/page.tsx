"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Baby, Moon, Info, Syringe, ChevronRight, Ruler } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBabyStore } from "@/lib/store/baby-store";
import { getMonthInfo, getWonderWeeks } from "@/lib/queries/months";
import { getVaccinationsForMonth } from "@/lib/data/growth-data";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
// DashboardCard no longer used — replaced by inline full-width cards
import WonderWeekBanner from "@/components/home/WonderWeekBanner";
import FloatingDecorations from "@/components/layout/FloatingDecorations";
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
  leap_number: number;
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
  const latestMeasurement = measurements.length > 0
    ? measurements.reduce((a, b) => a.month > b.month ? a : b)
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
        setError("\ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\ub294 \uc911 \ubb38\uc81c\uac00 \ubc1c\uc0dd\ud588\uc5b4\uc694");
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
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen">
      <FloatingDecorations />

      <div className="relative z-10 px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {"\uc548\ub155\ud558\uc138\uc694"}, {profile.name} {"\ub9d8/\ub300\ub514!"} {"\ud83d\udc4b"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {"\uc624\ub298\ub3c4"} {profile.name}{"\uc758"} {"\ud558\ub8e8\ub97c"} {"\uc751\uc6d0\ud574\uc694"} {"\ud83d\udc95"}
          </p>
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
            {/* D-day counter card */}
            <motion.div
              variants={child}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 p-5 text-white shadow-lg"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10" />

              <div className="relative z-10">
                <p className="text-sm font-medium opacity-90">
                  {"\ud83c\udf1f"} {profile.name}{"\uc758"} {"\uc131\uc7a5 \uae30\ub85d"}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <motion.span
                    className="text-4xl font-black"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: 0.3,
                    }}
                  >
                    D+{days}
                  </motion.span>
                  <span className="text-sm font-medium opacity-80">
                    {"\uc77c"}
                  </span>
                </div>
                <p className="mt-1 text-sm opacity-80">
                  {months}{"\uac1c\uc6d4"} {"\ucc28"} {"\uc544\uae30"} {"\ud83d\udc76"}
                </p>
              </div>
            </motion.div>

            {/* Wonder Weeks Banner */}
            {wonderWeeks.length > 0 && (
              <motion.div variants={child}>
                <WonderWeekBanner
                  title={wonderWeeks[0].title || `\uc6d0\ub354\uc705\uc2a4 ${wonderWeeks[0].leap_number || ""}\ubc88\uc9f8 \ub3c4\uc57d`}
                  description={
                    wonderWeeks[0].description ||
                    "\uc544\uae30\uac00 \uc9c0\uae08 \uc131\uc7a5 \ub3c4\uc57d\uae30\uc5d0 \uc788\uc5b4\uc694. \ubcf4\ucc44\uace0 \uce6d\ucc2c\uc73c\ub85c \ub3c4\uc640\uc8fc\uc138\uc694!"
                  }
                  leapNumber={wonderWeeks[0].leap_number}
                />
              </motion.div>
            )}

            {/* Data cards — 2 full-width cards */}
            {error ? (
              <motion.div
                variants={child}
                className="rounded-2xl border border-pink-200/50 bg-white/80 p-6 text-center dark:border-gray-700 dark:bg-gray-800/80"
              >
                <p className="text-3xl">😢</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  네트워크를 확인하고 다시 시도해 주세요
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* 🍼 수유 & 이유식 종합 카드 */}
                <motion.div
                  variants={child}
                  className="relative overflow-hidden rounded-2xl border border-pink-200/50 dark:border-pink-800/50 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 dark:from-pink-950/50 dark:via-rose-950/40 dark:to-orange-950/40 p-5 shadow-sm"
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="rounded-xl bg-white/60 dark:bg-white/10 p-2 text-pink-500">
                        <Baby size={22} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                          🍼 수유 & 이유식 정보
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {months}개월 권장 기준
                        </p>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* 1회 수유량 */}
                      <div className="rounded-xl bg-white/70 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">1회 수유량</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                          {monthData?.feed_amount_min != null && monthData?.feed_amount_max != null
                            ? `${monthData.feed_amount_min}~${monthData.feed_amount_max}`
                            : "-"}
                        </p>
                        <p className="text-xs font-bold text-pink-500 dark:text-pink-400">ml</p>
                      </div>

                      {/* 하루 총량 */}
                      <div className="rounded-xl bg-white/70 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">하루 총 수유량</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                          {monthData?.daily_feed_total || "-"}
                        </p>
                        <p className="text-xs font-bold text-rose-500 dark:text-rose-400">ml</p>
                      </div>

                      {/* 수유 횟수 */}
                      <div className="rounded-xl bg-white/70 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">수유 횟수</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                          {monthData?.feed_count || "-"}
                        </p>
                        <p className="text-xs font-bold text-orange-500 dark:text-orange-400">/ 하루</p>
                      </div>
                    </div>

                    {/* 이유식 정보 */}
                    <div className="mt-3 pt-3 border-t border-pink-200/40 dark:border-pink-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">🥣</span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">이유식 가이드</span>
                      </div>
                      <div className="rounded-xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/40 dark:border-orange-800/30 p-3">
                        {months < 4 ? (
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            아직 <strong className="text-gray-800 dark:text-gray-100">이유식 시작 전</strong>이에요.
                            만 <strong className="text-gray-800 dark:text-gray-100">4~6개월</strong> 사이,
                            목을 가눌 수 있고 음식에 관심을 보이면 시작하세요.
                          </p>
                        ) : months <= 5 ? (
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-800 dark:text-gray-100">초기 이유식</strong> 단계예요.
                            쌀미음부터 시작하여 <strong className="text-gray-800 dark:text-gray-100">하루 1회</strong>,
                            새 재료는 <strong className="text-gray-800 dark:text-gray-100">3일 간격</strong>으로 시도하세요.
                          </p>
                        ) : months <= 8 ? (
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-800 dark:text-gray-100">중기 이유식</strong> 단계예요.
                            <strong className="text-gray-800 dark:text-gray-100">하루 2회</strong>, 으깬 형태로
                            다양한 채소·과일·단백질을 시도해 보세요.
                          </p>
                        ) : months <= 11 ? (
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-800 dark:text-gray-100">후기 이유식</strong> 단계예요.
                            <strong className="text-gray-800 dark:text-gray-100">하루 3회</strong>, 잘게 다진 형태로
                            밥·국·반찬 구성을 시작하세요.
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-800 dark:text-gray-100">완료기 이유식</strong> 단계예요.
                            <strong className="text-gray-800 dark:text-gray-100">하루 3회</strong> + 간식,
                            부드러운 고형식으로 스스로 먹기 연습을 해보세요.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 😴 수면 종합 카드 */}
                <motion.div
                  variants={child}
                  className="relative overflow-hidden rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-violet-950/40 p-5 shadow-sm"
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="rounded-xl bg-white/60 dark:bg-white/10 p-2 text-indigo-500">
                        <Moon size={22} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                          😴 수면 종합 정보
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {months}개월 권장 수면 가이드
                        </p>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* 하루 총 수면 */}
                      <div className="rounded-xl bg-white/70 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">하루 총 수면</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                          {monthData?.total_sleep_hours || "-"}
                        </p>
                        <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400">시간</p>
                      </div>

                      {/* 낮잠 */}
                      <div className="rounded-xl bg-white/70 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">낮잠 횟수</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                          {monthData?.nap_count || "-"}
                        </p>
                        <p className="text-xs font-bold text-purple-500 dark:text-purple-400">/ 하루</p>
                      </div>

                      {/* 깨어있는 시간 */}
                      <div className="rounded-xl bg-white/70 dark:bg-gray-800/60 p-3 text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">깨어있는 시간</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                          {monthData?.wake_window_min != null && monthData?.wake_window_max != null
                            ? `${monthData.wake_window_min}~${monthData.wake_window_max}`
                            : "-"}
                        </p>
                        <p className="text-xs font-bold text-violet-500 dark:text-violet-400">분</p>
                      </div>
                    </div>

                    {/* 수면 꿀팁 */}
                    <div className="mt-3 pt-3 border-t border-indigo-200/40 dark:border-indigo-700/30">
                      <div className="rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/40 dark:border-indigo-800/30 p-3">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300 mb-1">💡 수면 꿀팁</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {months <= 1
                            ? "신생아는 수면 주기가 불규칙해요. 낮밤 구분을 위해 낮에는 밝게, 밤에는 어둡게 환경을 조성해 주세요."
                            : months <= 3
                            ? "졸림 신호(눈 비비기, 하품)가 보이면 바로 재워주세요. 수면 의식(목욕→수유→자장가)을 만들어 보세요."
                            : months <= 5
                            ? "규칙적인 낮잠 루틴을 잡아줄 시기예요. 매일 비슷한 시간에 재우면 생체리듬이 안정돼요."
                            : months <= 8
                            ? "낮잠을 하루 2~3회로 줄여가세요. 오후 늦은 낮잠은 밤잠에 영향을 줄 수 있어요."
                            : months <= 11
                            ? "오전·오후 낮잠 2회가 적당해요. 밤중 수유를 점차 줄이고 스스로 잠드는 연습을 해보세요."
                            : "낮잠 1~2회로 전환하는 시기예요. 취침 루틴을 꾸준히 유지하는 것이 중요해요."}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Vaccination Alert Card */}
            {(() => {
              const upcoming = getVaccinationsForMonth(months);
              const incomplete = upcoming.filter(
                (u) => !vaccinationRecords.some((r) => r.vaccineId === u.vaccine.id && r.doseNumber === u.dose.doseNumber)
              );
              if (incomplete.length === 0) return null;
              return (
                <motion.button
                  variants={child}
                  onClick={() => router.push("/growth")}
                  className="w-full rounded-2xl border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-left shadow-sm dark:border-amber-800/50 dark:from-amber-950/40 dark:to-orange-950/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-amber-100 p-2">
                      <Syringe size={18} className="text-amber-600" />
                    </span>
                    <div className="flex-1">
                      <p className="text-base font-bold text-gray-700 dark:text-gray-200">
                        📅 예방접종 안내
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                        {months}개월 접종 대상: {incomplete.slice(0, 3).map((u) => u.vaccine.nameEn).join(", ")}
                        {incomplete.length > 3 && ` 외 ${incomplete.length - 3}건`}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-amber-400" />
                  </div>
                </motion.button>
              );
            })()}

            {/* 내 아기 성장과정 입력 카드 */}
            <motion.button
              variants={child}
              onClick={() => router.push("/growth")}
              className="w-full rounded-2xl border border-cyan-200/50 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 p-4 text-left shadow-sm dark:border-cyan-800/50 dark:from-cyan-950/40 dark:via-sky-950/40 dark:to-blue-950/40"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-cyan-100 dark:bg-cyan-900/50 p-2.5">
                  <Ruler size={20} className="text-cyan-600 dark:text-cyan-400" />
                </span>
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-700 dark:text-gray-200">
                    📏 내 아기의 성장 기록
                  </p>
                  {latestMeasurement ? (
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {latestMeasurement.height && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                          📐 키 {latestMeasurement.height}cm
                        </span>
                      )}
                      {latestMeasurement.weight && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 dark:bg-sky-900/40 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                          ⚖️ 몸무게 {latestMeasurement.weight}kg
                        </span>
                      )}
                      {latestMeasurement.headCircumference && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                          🧠 머리둘레 {latestMeasurement.headCircumference}cm
                        </span>
                      )}
                      <p className="w-full text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        최근 기록: {latestMeasurement.month}개월 ({latestMeasurement.date.slice(0, 10)})
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                      아직 기록이 없어요! 탭하여 키·몸무게를 입력하세요 ✏️
                    </p>
                  )}
                </div>
                <ChevronRight size={16} className="text-cyan-400" />
              </div>
            </motion.button>

            {/* Monthly summary card */}
            {monthData?.summary && (
              <motion.div
                variants={child}
                className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm dark:border-emerald-800/50 dark:from-emerald-950/40 dark:to-teal-950/40"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="rounded-xl bg-emerald-100 dark:bg-emerald-900/50 p-2">
                    <Info size={18} className="text-emerald-500" />
                  </span>
                  <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">
                    📖 {months}개월 아기 발달 요약
                  </h3>
                </div>
                <FormattedContent content={monthData.summary} />

                {/* 월령별 핵심 포인트 */}
                <div className="mt-4 pt-3 border-t border-emerald-200/40 dark:border-emerald-700/30 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-emerald-100/50 dark:bg-emerald-900/30 p-3 text-center">
                    <p className="text-xl mb-1">🏋️</p>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {months <= 1 ? "고개 들기 연습"
                        : months <= 3 ? "목 가누기"
                        : months <= 5 ? "뒤집기"
                        : months <= 7 ? "혼자 앉기"
                        : months <= 9 ? "기어다니기"
                        : months <= 11 ? "붙잡고 서기"
                        : "첫 걸음마"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">대근육 발달</p>
                  </div>
                  <div className="rounded-xl bg-teal-100/50 dark:bg-teal-900/30 p-3 text-center">
                    <p className="text-xl mb-1">🗣️</p>
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300">
                      {months <= 1 ? "울음으로 소통"
                        : months <= 3 ? "옹알이 시작"
                        : months <= 5 ? "소리에 반응"
                        : months <= 7 ? "모음 소리 내기"
                        : months <= 9 ? "자음 옹알이"
                        : months <= 11 ? "맘마·빠빠"
                        : "단어 1~3개"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">언어 발달</p>
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
