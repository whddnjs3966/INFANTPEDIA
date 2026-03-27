"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useBabyStore } from "@/lib/store/baby-store";
import { getParentingTips } from "@/lib/queries/months";
import MonthSelector from "@/components/encyclopedia/MonthSelector";
import dynamic from "next/dynamic";

const TipsCategoryAccordion = dynamic(() => import("@/components/tips/TipsCategoryAccordion"), {
  ssr: false,
  loading: () => <EncyclopediaSkeleton />,
});
const DailyScheduleCard = dynamic(() => import("@/components/tips/DailyScheduleCard"), { ssr: false });
const MealPlanCard = dynamic(() => import("@/components/tips/MealPlanCard"), { ssr: false });
const TodaysTipCard = dynamic(() => import("@/components/tips/TodaysTipCard"), { ssr: false });
import { EncyclopediaSkeleton } from "@/components/ui/LoadingSkeleton";

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  month_id: number;
}

export default function TipsPage() {
  const router = useRouter();
  const getMonthsOld = useBabyStore((s) => s.getMonthsOld);
  const getRealMonthsOld = useBabyStore((s) => s.getRealMonthsOld);
  const currentMonth = getMonthsOld();
  const realMonths = getRealMonthsOld();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getParentingTips(selectedMonth);
        setTips((data as Tip[]) || []);
      } catch {
        setError("\ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\ub294 \uc911 \ubb38\uc81c\uac00 \ubc1c\uc0dd\ud588\uc5b4\uc694");
        setTips([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedMonth]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-3"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            꿀팁 {"\ud83d\udca1"}
          </h1>
          <button
            onClick={() => router.push("/search")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500 active:scale-95 transition-transform dark:bg-amber-900/30 dark:text-amber-400"
            aria-label="검색"
          >
            <Search size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {"\uc6d4\ub839\ubcc4 \uc721\uc544 \ub178\ud558\uc6b0\ub97c \ud655\uc778\ud558\uc138\uc694"}
        </p>
      </motion.div>

      {/* Month selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pb-4"
      >
        <MonthSelector
          selectedMonth={selectedMonth}
          currentMonth={currentMonth}
          onSelect={setSelectedMonth}
        />
      </motion.div>

      {/* Today's tip */}
      <div className="pb-4">
        <TodaysTipCard />
      </div>

      {/* 12개월 이상 안내 */}
      {realMonths > 12 && selectedMonth === 12 && (
        <div className="mx-4 mb-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/40 px-4 py-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            현재 {realMonths}개월이에요. 12개월 이후 정보는 12개월 기준으로 제공됩니다.
          </p>
        </div>
      )}

      {/* Schedule & Meal Plan cards (always visible) */}
      <DailyScheduleCard month={selectedMonth} />
      <MealPlanCard month={selectedMonth} />

      {/* Content */}
      {loading ? (
        <EncyclopediaSkeleton />
      ) : error ? (
        <div className="mx-4 rounded-2xl border border-pink-200/50 bg-white/80 p-6 text-center">
          <p className="text-3xl">{"\ud83d\ude22"}</p>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <p className="mt-1 text-xs text-gray-400">
            {"\ub124\ud2b8\uc6cc\ud06c\ub97c"} {"\ud655\uc778\ud558\uace0"} {"\ub2e4\uc2dc"} {"\uc2dc\ub3c4\ud574"} {"\uc8fc\uc138\uc694"}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TipsCategoryAccordion tips={tips} isLoading={false} />
        </motion.div>
      )}

      <div className="pb-24" />
    </div>
  );
}
