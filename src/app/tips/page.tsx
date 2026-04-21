"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useBabyStore } from "@/lib/store/baby-store";
import { getParentingTips } from "@/lib/queries/months";
import MonthSelector from "@/components/encyclopedia/MonthSelector";
import PageHeader from "@/components/layout/PageHeader";
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
      <PageHeader
        eyebrow={profile?.name ? `${profile.name}에게 맞는` : "월령별 노하우"}
        title="육아 꿀팁"
        description="수면·수유·놀이·외출까지 선배 부모의 실전 팁을 모았어요."
        showSearch
      />

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
        <div className="mx-5 mb-3 rounded-2xl bg-teal-50 dark:bg-teal-950/30 px-4 py-3 elevation-1">
          <p className="text-[13px] text-stone-600 dark:text-stone-300 leading-relaxed">
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
        <div className="mx-5 rounded-2xl bg-white dark:bg-stone-900 p-6 text-center elevation-1">
          <p className="text-[14px] text-stone-500 dark:text-stone-400">{error}</p>
          <p className="mt-1 text-[12px] text-stone-400 dark:text-stone-500">네트워크를 확인하고 다시 시도해 주세요</p>
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
