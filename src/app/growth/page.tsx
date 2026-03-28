"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Syringe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyStore } from "@/lib/store/baby-store";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const GrowthChart = dynamic(() => import("@/components/growth/GrowthChart"), { ssr: false });
const VaccinationSchedule = dynamic(() => import("@/components/growth/VaccinationSchedule"), { ssr: false });

type TabType = "growth" | "vaccination";

export default function GrowthPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "vaccination" ? "vaccination" : "growth";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [mounted, setMounted] = useState(false);
  const getMonthsOld = useBabyStore((s) => s.getMonthsOld);
  const profile = useBabyStore((s) => s.profile);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentMonth = getMonthsOld();

  const tabs = [
    { id: "growth" as TabType, label: "성장 그래프", icon: TrendingUp },
    { id: "vaccination" as TabType, label: "예방접종", icon: Syringe },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pb-2 pt-6"
      >
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
          성장 & 건강 📊
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {profile?.name ? `${profile.name}의 ` : "우리 아기의 "}
          성장 기록과 예방접종 일정
        </p>
      </motion.div>

      {/* Sub-Tab Switcher */}
      <div className="sticky top-0 z-20 bg-[var(--cream-bg)] dark:bg-gray-900 px-4 pb-3 pt-2">
        <div className="flex gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const emoji = tab.id === "growth" ? "📈" : "💉";
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3.5 transition-all",
                  isActive
                    ? "bg-white dark:bg-gray-700 shadow-md"
                    : "bg-gray-100/60 dark:bg-gray-800/60"
                )}
              >
                <span className={cn("text-xl transition-transform", isActive && "scale-110")}>
                  {emoji}
                </span>
                <span className={cn(
                  "text-sm font-bold transition-colors",
                  isActive
                    ? "text-gray-800 dark:text-gray-100"
                    : "text-gray-400 dark:text-gray-500"
                )}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="growth-tab-dot"
                    className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-cyan-400 dark:bg-cyan-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === "growth" ? (
            <motion.div
              key="growth"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <GrowthChart currentMonth={currentMonth} />
            </motion.div>
          ) : (
            <motion.div
              key="vaccination"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <VaccinationSchedule currentMonth={currentMonth} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
