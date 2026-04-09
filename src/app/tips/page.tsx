"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Lightbulb } from "lucide-react";
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
  const profile = useBabyStore((s) => s.profile);
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
        setError("데이터를 불러오는 중 문제가 발생했어요");
        setTips([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedMonth]);

  return (
    <div className="min-h-screen dark:bg-stone-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-stone-400 dark:text-stone-500">
              {profile?.name ? `${profile.name}에게 맞는 ` : ""}월령별 노하우
            </p>
            <h1 className="mt-0.5 text-[22px] font-extrabold text-stone-800 dark:text-stone-100 tracking-tight">
              육아 꿀팁
            </h1>
          </div>
          <button
            onClick={() => router.push("/search")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 active:scale-95 transition-transform"
            aria-label="검색"
          >
            <Search size={18} />
          </button>
        </div>
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
        <div className="mx-4 mb-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/40 dark:border-purple-800/30 px-4 py-3">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            현재 {realMonths}개월이에요. 12개월 이후 정보는 12개월 기준으로 제공됩니다.
          </p>
        </div>
      )}

      {/* Schedule & Meal Plan cards */}
      <DailyScheduleCard month={selectedMonth} />
      <MealPlanCard month={selectedMonth} />

      {/* Content */}
      {loading ? (
        <EncyclopediaSkeleton />
      ) : error ? (
        <div className="mx-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 text-center shadow-[0_2px_8px_rgb(0,0,0,0.06)]">
          <p className="text-sm text-stone-500 dark:text-stone-400">{error}</p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">네트워크를 확인하고 다시 시도해 주세요</p>
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
