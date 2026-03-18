"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useBabyStore } from "@/lib/store/baby-store";
import { getMonthInfo, getActivities } from "@/lib/queries/months";
import MonthSelector from "@/components/encyclopedia/MonthSelector";
import CategoryAccordion from "@/components/encyclopedia/CategoryAccordion";
import { EncyclopediaSkeleton } from "@/components/ui/LoadingSkeleton";

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

export default function EncyclopediaPage() {
  const getMonthsOld = useBabyStore((s) => s.getMonthsOld);
  const currentMonth = getMonthsOld();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
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
        setError("\ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\ub294 \uc911 \ubb38\uc81c\uac00 \ubc1c\uc0dd\ud588\uc5b4\uc694");
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
        className="px-4 pt-6 pb-3"
      >
        <h1 className="text-xl font-bold text-gray-800">
          {"\ud83d\udcda"} {"\uc544\uae30 \ubc31\uacfc\uc0ac\uc804"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {"\uc6d4\ub839\ubcc4 \ub9de\ucda4 \uc721\uc544 \uc815\ubcf4\ub97c \ud655\uc778\ud558\uc138\uc694"}
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

      {/* Month info card */}
      {!loading && monthData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-2xl border border-pink-200/50 bg-gradient-to-r from-pink-50 to-purple-50 p-4"
        >
          <h2 className="text-base font-bold text-gray-700">
            {"\ud83c\udf1f"} {selectedMonth}{"\uac1c\uc6d4"} {"\uc694\uc57d"}
          </h2>
          {monthData.summary && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {monthData.summary}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {monthData.wake_window && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {"\u23f0"} {"\uae68\uc2dc"} {monthData.wake_window}
              </span>
            )}
            {monthData.feeding_amount && (
              <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                {"\ud83c\udf7c"} {"\uc218\uc720"} {monthData.feeding_amount}
              </span>
            )}
            {monthData.nap_count && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                {"\ud83c\udf19"} {"\ub0ae\uc7a0"} {monthData.nap_count}
              </span>
            )}
          </div>
        </motion.div>
      )}

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
          <CategoryAccordion activities={activities} isLoading={false} />
        </motion.div>
      )}
    </div>
  );
}
