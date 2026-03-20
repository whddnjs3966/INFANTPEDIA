"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useBabyStore } from "@/lib/store/baby-store";
import { getParentingTips } from "@/lib/queries/months";
import MonthSelector from "@/components/encyclopedia/MonthSelector";
import TipsCategoryAccordion from "@/components/tips/TipsCategoryAccordion";
import DailyScheduleCard from "@/components/tips/DailyScheduleCard";
import MealPlanCard from "@/components/tips/MealPlanCard";
import TodaysTipCard from "@/components/tips/TodaysTipCard";
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
  const currentMonth = getMonthsOld();

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
            {"\uc721\uc544 \uaf41\ud301"} {"\ud83d\udca1"}
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

      {/* Today's tip (always visible, not month-specific) */}
      <div className="mt-6 pb-24">
        <TodaysTipCard />
      </div>
    </div>
  );
}
