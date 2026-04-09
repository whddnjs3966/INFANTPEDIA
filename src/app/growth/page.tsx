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
    <div className="min-h-screen dark:bg-stone-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pb-2 pt-6"
      >
        <p className="text-[12px] font-medium text-stone-400 dark:text-stone-500">
          {profile?.name ? `${profile.name}의 ` : ""}성장 기록
        </p>
        <h1 className="mt-0.5 text-[22px] font-extrabold text-stone-800 dark:text-stone-100 tracking-tight">
          성장 & 건강
        </h1>
      </motion.div>

      {/* Sub-Tab Switcher */}
      <div className="sticky top-0 z-20 bg-[var(--surface-bg)] dark:bg-stone-950 px-4 pb-3 pt-1">
        <div className="flex gap-2 rounded-2xl bg-stone-100/80 dark:bg-stone-800 p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all",
                  isActive ? "text-stone-800 dark:text-stone-100" : "text-stone-400 dark:text-stone-500"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="growth-tab-bg"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-stone-700 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={15} />
                  {tab.label}
                </span>
              </button>
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
