"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Syringe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyStore } from "@/lib/store/baby-store";
import GrowthChart from "@/components/growth/GrowthChart";
import VaccinationSchedule from "@/components/growth/VaccinationSchedule";

type TabType = "growth" | "vaccination";

export default function GrowthPage() {
  const [activeTab, setActiveTab] = useState<TabType>("growth");
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
        className="px-5 pb-2 pt-12"
      >
        <h1 className="text-xl font-bold text-gray-800">
          성장 & 건강 📊
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {profile?.name ? `${profile.name}의 ` : "우리 아기의 "}
          성장 기록과 예방접종 일정
        </p>
      </motion.div>

      {/* Sub-Tab Switcher */}
      <div className="sticky top-0 z-20 bg-[var(--cream-bg)] px-5 pb-3 pt-2">
        <div className="flex gap-2 rounded-2xl bg-gray-100/80 p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all",
                  isActive ? "text-gray-800" : "text-gray-400"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="growth-tab-bg"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={16} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
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
