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
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyStore } from "@/lib/store/baby-store";
import { getMonthInfo, getActivities } from "@/lib/queries/months";
import dynamic from "next/dynamic";
import MonthSelector from "@/components/encyclopedia/MonthSelector";
import CategoryAccordion from "@/components/encyclopedia/CategoryAccordion";

const MilestoneChecklist = dynamic(() => import("@/components/encyclopedia/MilestoneChecklist"), { ssr: false });
const RecommendedActivities = dynamic(() => import("@/components/encyclopedia/RecommendedActivities"), { ssr: false });
const BabyFoodGuide = dynamic(() => import("@/components/encyclopedia/BabyFoodGuide"), { ssr: false });
const SleepGuide = dynamic(() => import("@/components/encyclopedia/SleepGuide"), { ssr: false });
const FeedingGuide = dynamic(() => import("@/components/encyclopedia/FeedingGuide"), { ssr: false });
const DentalGuide = dynamic(() => import("@/components/encyclopedia/DentalGuide"), { ssr: false });
const HealthFAQ = dynamic(() => import("@/components/encyclopedia/HealthFAQ"), { ssr: false });
import { EncyclopediaSkeleton } from "@/components/ui/LoadingSkeleton";
import FormattedContent from "@/components/ui/FormattedContent";

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
  const getRealMonthsOld = useBabyStore((s) => s.getRealMonthsOld);
  const profile = useBabyStore((s) => s.profile);
  const currentMonth = getMonthsOld();
  const realMonths = getRealMonthsOld();

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
    <div className="min-h-screen dark:bg-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-gray-400 dark:text-gray-500">
              {profile?.name ? `${profile.name}의 ` : ""}맞춤 정보
            </p>
            <h1 className="mt-0.5 text-[22px] font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
              영유아 종합백과
            </h1>
          </div>
          <button
            onClick={() => router.push("/search")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 active:scale-95 transition-transform"
            aria-label="검색"
          >
            <Search size={18} />
          </button>
        </div>
      </motion.div>

      {/* Sub-Tab Switcher */}
      <div className="sticky top-0 z-20 bg-[var(--cream-bg)] dark:bg-gray-950 px-4 pb-3 pt-1">
        <div
          className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800 p-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold whitespace-nowrap transition-all",
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
                  <Icon size={13} />
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

      {/* 12개월 이상 안내 */}
      {realMonths > 12 && selectedMonth === 12 && (
        <div className="mx-4 mb-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/40 dark:border-purple-800/30 px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            현재 {realMonths}개월이에요. 12개월 이후 정보는 12개월 기준으로 제공됩니다.
          </p>
        </div>
      )}

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
            {/* Month info summary card */}
            {!loading && monthData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mb-4 rounded-[24px] border border-emerald-200/40 bg-white dark:bg-gray-900 dark:border-emerald-800/30 p-5 shadow-[0_2px_16px_rgb(0,0,0,0.05)]"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                    <Info size={17} className="text-emerald-500" />
                  </div>
                  <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
                    {selectedMonth}개월 발달 요약
                  </h2>
                </div>

                {monthData.summary && (
                  <FormattedContent content={monthData.summary} />
                )}

                {/* Quick stats grid */}
                <div className="mt-4 pt-3 grid grid-cols-4 gap-1.5">
                  {monthData.feeding_amount && (
                    <div className="rounded-xl bg-pink-50 dark:bg-pink-950/30 p-2 text-center">
                      <Baby size={14} className="mx-auto mb-1 text-pink-500" />
                      <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300 truncate">{monthData.feeding_amount}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">수유량</p>
                    </div>
                  )}
                  {monthData.wake_window && (
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-2 text-center">
                      <ClipboardCheck size={14} className="mx-auto mb-1 text-blue-500" />
                      <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 truncate">{monthData.wake_window}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">활동시간</p>
                    </div>
                  )}
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 p-2 text-center">
                    <Moon size={14} className="mx-auto mb-1 text-indigo-500" />
                    <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 truncate">{monthData.nap_count || "-"}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">총 수면</p>
                  </div>
                  <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 p-2 text-center">
                    <UtensilsCrossed size={14} className="mx-auto mb-1 text-orange-500" />
                    <p className="text-[10px] font-bold text-orange-700 dark:text-orange-300 truncate">
                      {selectedMonth < 4 ? "시작 전" : selectedMonth <= 5 ? "초기" : selectedMonth <= 8 ? "중기" : selectedMonth <= 11 ? "후기" : "완료기"}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">이유식</p>
                  </div>
                </div>

                {/* Development milestones */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center">
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-0.5">대근육 발달</p>
                    <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100">
                      {selectedMonth <= 1 ? "고개 들기 연습" : selectedMonth <= 3 ? "목 가누기" : selectedMonth <= 5 ? "뒤집기" : selectedMonth <= 7 ? "혼자 앉기" : selectedMonth <= 9 ? "기어다니기" : selectedMonth <= 11 ? "붙잡고 서기" : "첫 걸음마"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center">
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-0.5">언어 발달</p>
                    <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100">
                      {selectedMonth <= 1 ? "울음으로 소통" : selectedMonth <= 3 ? "옹알이 시작" : selectedMonth <= 5 ? "소리에 반응" : selectedMonth <= 7 ? "모음 소리 내기" : selectedMonth <= 9 ? "자음 옹알이" : selectedMonth <= 11 ? "맘마·빠빠" : "단어 1~3개"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {loading ? (
              <EncyclopediaSkeleton />
            ) : error ? (
              <div className="mx-4 rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
                <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">네트워크를 확인하고 다시 시도해 주세요</p>
              </div>
            ) : (
              <CategoryAccordion activities={activities} isLoading={false} />
            )}
          </motion.div>
        )}

        {activeTab === "milestone" && (
          <motion.div key="milestone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-4">
            <MilestoneChecklist month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "activities" && (
          <motion.div key="activities" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-4">
            <RecommendedActivities month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "babyfood" && (
          <motion.div key="babyfood" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-4">
            <BabyFoodGuide month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "sleep" && (
          <motion.div key="sleep" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-4">
            <SleepGuide month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "feeding" && (
          <motion.div key="feeding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-4">
            <FeedingGuide month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "dental" && (
          <motion.div key="dental" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-4">
            <DentalGuide month={selectedMonth} />
          </motion.div>
        )}

        {activeTab === "health" && (
          <motion.div key="health" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="px-4">
            <HealthFAQ month={selectedMonth} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
