"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Baby, Moon, Info } from "lucide-react";
import { useBabyStore } from "@/lib/store/baby-store";
import { getMonthInfo, getWonderWeeks } from "@/lib/queries/months";
import DashboardCard from "@/components/home/DashboardCard";
import WonderWeekBanner from "@/components/home/WonderWeekBanner";
import FloatingDecorations from "@/components/layout/FloatingDecorations";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";

interface MonthData {
  month: number;
  wake_window_min: number | null;
  wake_window_max: number | null;
  feed_amount_min: number | null;
  feed_amount_max: number | null;
  daily_feed_total: number | null;
  nap_count: string | null;
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

  const days = getDaysOld();
  const months = getMonthsOld();

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
          <h1 className="text-xl font-bold text-gray-800">
            {"\uc548\ub155\ud558\uc138\uc694"}, {profile.name} {"\ub9d8/\ub300\ub514!"} {"\ud83d\udc4b"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
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

            {/* Data cards grid */}
            {error ? (
              <motion.div
                variants={child}
                className="rounded-2xl border border-pink-200/50 bg-white/80 p-6 text-center"
              >
                <p className="text-3xl">{"\ud83d\ude22"}</p>
                <p className="mt-2 text-sm text-gray-500">{error}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {"\ub124\ud2b8\uc6cc\ud06c\ub97c"} {"\ud655\uc778\ud558\uace0"} {"\ub2e4\uc2dc"} {"\uc2dc\ub3c4\ud574"} {"\uc8fc\uc138\uc694"}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <DashboardCard
                  title="깨시 시간"
                  value={
                    monthData?.wake_window_min != null && monthData?.wake_window_max != null
                      ? `${monthData.wake_window_min}~${monthData.wake_window_max}분`
                      : "-"
                  }
                  subtitle="권장 깨어있는 시간"
                  icon={Clock}
                  colorScheme="blue"
                  emoji="⏰"
                  index={0}
                />
                <DashboardCard
                  title="수유량"
                  value={
                    monthData?.feed_amount_min != null && monthData?.feed_amount_max != null
                      ? `${monthData.feed_amount_min}~${monthData.feed_amount_max}ml`
                      : "-"
                  }
                  subtitle={
                    monthData?.daily_feed_total
                      ? `하루 총 ${monthData.daily_feed_total}ml`
                      : "하루 권장량"
                  }
                  icon={Baby}
                  colorScheme="pink"
                  emoji="🍼"
                  index={1}
                />
                <DashboardCard
                  title={"\ub0ae\uc7a0 \ud69f\uc218"}
                  value={monthData?.nap_count || "-"}
                  subtitle={"\ud558\ub8e8 \uad8c\uc7a5 \ub0ae\uc7a0"}
                  icon={Moon}
                  colorScheme="purple"
                  emoji={"\ud83c\udf19"}
                  index={2}
                />
                <DashboardCard
                  title={"\uc6d4\ub839 \uc815\ubcf4"}
                  value={`${months}\uac1c\uc6d4`}
                  subtitle={"\ud604\uc7ac \uc6d4\ub839"}
                  icon={Info}
                  colorScheme="mint"
                  emoji={"\ud83d\udcda"}
                  index={3}
                />
              </div>
            )}

            {/* Monthly summary card */}
            {monthData?.summary && (
              <motion.div
                variants={child}
                className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-lg bg-emerald-100 p-1.5">
                    <Info size={16} className="text-emerald-500" />
                  </span>
                  <h3 className="text-sm font-bold text-gray-700">
                    {"\ud83d\udcd6"} {months}{"\uac1c\uc6d4"} {"\uc544\uae30"} {"\uc694\uc57d"}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  {monthData.summary}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
