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
  { id: "encyclopedia" as SubTab, label: "백과사전", icon: BookOpen, emoji: "📚", color: "text-rose-500" },
  { id: "milestone" as SubTab, label: "발달 체크", icon: ClipboardCheck, emoji: "✅", color: "text-emerald-500" },
  { id: "activities" as SubTab, label: "추천 놀이", icon: Gamepad2, emoji: "🎯", color: "text-blue-500" },
  { id: "babyfood" as SubTab, label: "이유식", icon: UtensilsCrossed, emoji: "🥣", color: "text-orange-500" },
  { id: "sleep" as SubTab, label: "수면", icon: Moon, emoji: "🌙", color: "text-indigo-500" },
  { id: "feeding" as SubTab, label: "수유", icon: Baby, emoji: "🍼", color: "text-pink-500" },
  { id: "dental" as SubTab, label: "치아", icon: Smile, emoji: "🦷", color: "text-teal-500" },
  { id: "health" as SubTab, label: "건강 FAQ", icon: HeartPulse, emoji: "💊", color: "text-red-500" },
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
      <div className="sticky top-0 z-20 bg-[var(--cream-bg)] dark:bg-gray-900 px-4 pb-3 pt-1">
        <div
          className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5 cursor-grab active:cursor-grabbing mask-fade-right"
          style={{ WebkitOverflowScrolling: "touch" }}
          onMouseDown={(e) => {
            const el = e.currentTarget;
            const startX = e.pageX - el.offsetLeft;
            const scrollLeft = el.scrollLeft;
            const onMove = (ev: MouseEvent) => {
              const x = ev.pageX - el.offsetLeft;
              el.scrollLeft = scrollLeft - (x - startX);
            };
            const onUp = () => {
              document.removeEventListener("mousemove", onMove);
              document.removeEventListener("mouseup", onUp);
            };
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
          }}
        >
          {subTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3.5 py-2.5 transition-all min-w-[64px]",
                  isActive
                    ? "bg-white dark:bg-gray-700 shadow-md border border-gray-200/60 dark:border-gray-600"
                    : "bg-gray-100/60 dark:bg-gray-800/60 border border-transparent"
                )}
              >
                <span className={cn(
                  "text-lg transition-transform",
                  isActive && "scale-110"
                )}>
                  {tab.emoji}
                </span>
                <span className={cn(
                  "text-[11px] font-bold whitespace-nowrap transition-colors",
                  isActive
                    ? "text-gray-800 dark:text-gray-100"
                    : "text-gray-400 dark:text-gray-500"
                )}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="enc-tab-dot"
                    className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-rose-400 dark:bg-rose-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
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
                className="mx-4 mb-4 rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm dark:border-emerald-800/50 dark:from-emerald-950/40 dark:to-teal-950/40"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="rounded-xl bg-emerald-100 dark:bg-emerald-900/50 p-2">
                    <Info size={18} className="text-emerald-500" />
                  </span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">
                    📖 {selectedMonth}개월 아기 발달 요약
                  </h2>
                </div>

                {monthData.summary && (
                  <FormattedContent content={monthData.summary} />
                )}

                {/* 핵심 정보 그리드 — 4칸 */}
                <div className="mt-4 pt-3 border-t border-emerald-200/40 dark:border-emerald-700/30 grid grid-cols-4 gap-2">
                  {monthData.feeding_amount && (
                    <div className="rounded-xl bg-pink-50/80 dark:bg-pink-950/30 border border-pink-200/40 dark:border-pink-800/30 p-2.5 text-center">
                      <p className="text-lg mb-0.5">🍼</p>
                      <p className="text-xs font-bold text-pink-700 dark:text-pink-300">
                        {monthData.feeding_amount}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">수유량</p>
                    </div>
                  )}
                  {monthData.wake_window && (
                    <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/40 dark:border-blue-800/30 p-2.5 text-center">
                      <p className="text-lg mb-0.5">⏰</p>
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        {monthData.wake_window}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">활동 시간</p>
                    </div>
                  )}
                  <div className="rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/40 dark:border-indigo-800/30 p-2.5 text-center">
                    <p className="text-lg mb-0.5">😴</p>
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {monthData.nap_count || "-"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">총 수면</p>
                  </div>
                  <div className="rounded-xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/40 dark:border-orange-800/30 p-2.5 text-center">
                    <p className="text-lg mb-0.5">🥣</p>
                    <p className="text-xs font-bold text-orange-700 dark:text-orange-300">
                      {selectedMonth < 4 ? "시작 전"
                        : selectedMonth <= 5 ? "초기"
                        : selectedMonth <= 8 ? "중기"
                        : selectedMonth <= 11 ? "후기"
                        : "완료기"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">이유식</p>
                  </div>
                </div>

                {/* 월령별 핵심 발달 포인트 */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-emerald-100/50 dark:bg-emerald-900/30 p-2.5 text-center">
                    <p className="text-lg mb-0.5">🏋️</p>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {selectedMonth <= 1 ? "고개 들기 연습"
                        : selectedMonth <= 3 ? "목 가누기"
                        : selectedMonth <= 5 ? "뒤집기"
                        : selectedMonth <= 7 ? "혼자 앉기"
                        : selectedMonth <= 9 ? "기어다니기"
                        : selectedMonth <= 11 ? "붙잡고 서기"
                        : "첫 걸음마"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">대근육 발달</p>
                  </div>
                  <div className="rounded-xl bg-teal-100/50 dark:bg-teal-900/30 p-2.5 text-center">
                    <p className="text-lg mb-0.5">🗣️</p>
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300">
                      {selectedMonth <= 1 ? "울음으로 소통"
                        : selectedMonth <= 3 ? "옹알이 시작"
                        : selectedMonth <= 5 ? "소리에 반응"
                        : selectedMonth <= 7 ? "모음 소리 내기"
                        : selectedMonth <= 9 ? "자음 옹알이"
                        : selectedMonth <= 11 ? "맘마·빠빠"
                        : "단어 1~3개"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">언어 발달</p>
                  </div>
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
