"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  ClipboardCheck,
  Gamepad2,
  UtensilsCrossed,
  Moon,
  Baby,
  Smile,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyStore } from "@/lib/store/baby-store";
import { getMonthInfo, getActivities } from "@/lib/queries/months";
import MonthSelector from "@/components/encyclopedia/MonthSelector";
import CategoryAccordion from "@/components/encyclopedia/CategoryAccordion";
import MilestoneChecklist from "@/components/encyclopedia/MilestoneChecklist";
import RecommendedActivities from "@/components/encyclopedia/RecommendedActivities";
import BabyFoodGuide from "@/components/encyclopedia/BabyFoodGuide";
import SleepGuide from "@/components/encyclopedia/SleepGuide";
import FeedingGuide from "@/components/encyclopedia/FeedingGuide";
import DentalGuide from "@/components/encyclopedia/DentalGuide";
import HealthFAQ from "@/components/encyclopedia/HealthFAQ";
import { EncyclopediaSkeleton } from "@/components/ui/LoadingSkeleton";

type SubTab =
  | "encyclopedia"
  | "milestone"
  | "activities"
  | "babyfood"
  | "sleep"
  | "feeding"
  | "dental"
  | "health";

interface MonthData {
  month: number;
  wake_window: string;
  feeding_amount: string;
  nap_count: string;
  summary: string;
}

interface Activity {
  id: number;
  title: string;
  content: string;
  category: string;
  month_id: number;
}

const subTabs = [
  { id: "encyclopedia" as SubTab, label: "백과사전", icon: BookOpen },
  { id: "milestone" as SubTab, label: "발달 체크", icon: ClipboardCheck },
  { id: "activities" as SubTab, label: "추천 놀이", icon: Gamepad2 },
  { id: "babyfood" as SubTab, label: "이유식", icon: UtensilsCrossed },
  { id: "sleep" as SubTab, label: "수면", icon: Moon },
  { id: "feeding" as SubTab, label: "수유", icon: Baby },
  { id: "dental" as SubTab, label: "치아", icon: Smile },
  { id: "health" as SubTab, label: "건강 FAQ", icon: HeartPulse },
];

export default function EncyclopediaPage() {
  const router = useRouter();
  const getMonthsOld = useBabyStore((s) => s.getMonthsOld);
  const currentMonth = getMonthsOld();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [activeTab, setActiveTab] = useState<SubTab>("encyclopedia");
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [mData, aData] = await Promise.all([
          getMonthInfo(selectedMonth),
          getActivities(selectedMonth),
        ]);
        setMonthData(mData as MonthData);
        setActivities((aData as Activity[]) || []);
      } catch {
        setError("데이터를 불러오는 중 문제가 발생했어요");
        setMonthData(null);
        setActivities([]);
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
        className="px-4 pt-6 pb-2"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            📚 영유아 종합백과
          </h1>
          <button
            onClick={() => router.push("/search")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500 active:scale-95 transition-transform dark:bg-pink-900/30 dark:text-pink-400"
            aria-label="검색"
          >
            <Search size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          월령별 맞춤 육아 정보를 확인하세요
        </p>
      </motion.div>

      {/* Sub-Tab Switcher */}
      <div className="sticky top-0 z-20 bg-[var(--cream-bg)] dark:bg-gray-900 px-4 pb-2 pt-1">
        <div className="flex gap-1 rounded-2xl bg-gray-100/80 dark:bg-gray-800 p-1 overflow-x-auto no-scrollbar">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "text-gray-800 dark:text-gray-100"
                    : "text-gray-400 dark:text-gray-500"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="enc-tab-bg"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-gray-700 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  <Icon size={14} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Month selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pb-3"
      >
        <MonthSelector
          selectedMonth={selectedMonth}
          currentMonth={currentMonth}
          onSelect={setSelectedMonth}
        />
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "encyclopedia" && (
          <motion.div
            key="encyclopedia"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Month info card */}
            {!loading && monthData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mb-4 rounded-2xl border border-pink-200/50 bg-gradient-to-r from-pink-50 to-purple-50 p-4 dark:border-pink-800/50 dark:from-pink-950/40 dark:to-purple-950/40"
              >
                <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">
                  🌟 {selectedMonth}개월 요약
                </h2>
                {monthData.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {monthData.summary}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {monthData.wake_window && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      ⏰ 깨시 {monthData.wake_window}
                    </span>
                  )}
                  {monthData.feeding_amount && (
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                      🍼 수유 {monthData.feeding_amount}
                    </span>
                  )}
                  {monthData.nap_count && (
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      🌙 낮잠 {monthData.nap_count}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {loading ? (
              <EncyclopediaSkeleton />
            ) : error ? (
              <div className="mx-4 rounded-2xl border border-pink-200/50 bg-white/80 p-6 text-center dark:border-gray-700 dark:bg-gray-800/80">
                <p className="text-3xl">😢</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  네트워크를 확인하고 다시 시도해 주세요
                </p>
              </div>
            ) : (
              <CategoryAccordion activities={activities} isLoading={false} />
            )}
          </motion.div>
        )}

        {activeTab === "milestone" && (
          <motion.div
            key="milestone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            <MilestoneChecklist month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "activities" && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            <RecommendedActivities month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "babyfood" && (
          <motion.div
            key="babyfood"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            <BabyFoodGuide month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "sleep" && (
          <motion.div
            key="sleep"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            <SleepGuide month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "feeding" && (
          <motion.div
            key="feeding"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            <FeedingGuide month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "dental" && (
          <motion.div
            key="dental"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            <DentalGuide month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "health" && (
          <motion.div
            key="health"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-4"
          >
            <HealthFAQ month={selectedMonth} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
