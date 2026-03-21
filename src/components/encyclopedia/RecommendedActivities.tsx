"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, Package, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import FormattedContent from "@/components/ui/FormattedContent";
import {
  getActivitiesForMonth,
  type RecommendedActivity,
} from "@/lib/data/recommended-activities-data";

interface RecommendedActivitiesProps {
  month: number;
}

const developmentAreaColors: Record<string, string> = {
  "시각 발달": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "청각 발달": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "촉각 발달": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "소근육 발달": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "대근육 발달": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "언어 발달": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "인지 발달": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "사회성 발달": "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "정서 안정": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "집중력": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "균형 감각": "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "창의력": "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
};

function getAreaColor(area: string): string {
  return (
    developmentAreaColors[area] ??
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
  );
}

function ActivityCard({ activity, index }: { activity: RecommendedActivity; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full rounded-2xl border text-left transition-all",
          "bg-gradient-to-br from-white to-sky-50/50 border-sky-100/60 shadow-sm",
          "dark:from-gray-800 dark:to-gray-800/80 dark:border-gray-700",
          isExpanded && "shadow-md border-sky-200/80 dark:border-cyan-800/60"
        )}
        whileTap={{ scale: 0.985 }}
      >
        {/* Collapsed header - always visible */}
        <div className="flex items-center gap-3 p-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl",
              "bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30"
            )}
          >
            {activity.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 truncate">
              {activity.title}
            </h3>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={12} className="text-cyan-500" />
                {activity.duration}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {activity.difficulty === "easy" ? "⭐" : "⭐⭐"}
              </span>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0"
          >
            <ChevronDown size={18} className="text-gray-400 dark:text-gray-500" />
          </motion.div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Divider */}
                <div className="h-px bg-gray-100 dark:bg-gray-700" />

                {/* Description */}
                <FormattedContent content={activity.description} />

                {/* Materials */}
                {activity.materials.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Package size={13} className="text-teal-500" />
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        준비물
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activity.materials.map((mat) => (
                        <span
                          key={mat}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs",
                            "bg-teal-50 text-teal-700 border border-teal-100",
                            "dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800/50"
                          )}
                        >
                          🧸 {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Development areas */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain size={13} className="text-cyan-500" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      발달 영역
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activity.developmentAreas.map((area) => (
                      <span
                        key={area}
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                          getAreaColor(area)
                        )}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Age range */}
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  권장 연령: {activity.ageRange}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

export default function RecommendedActivities({ month }: RecommendedActivitiesProps) {
  const monthData = getActivitiesForMonth(month);

  if (!monthData || monthData.activities.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="text-4xl mb-2">🎯</div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          이 월령의 추천 놀이 정보가 아직 없어요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-sm",
            "bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40"
          )}
        >
          🎯
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-gray-800 dark:text-gray-100">
            추천 놀이 활동
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {month}개월 아기에게 적합한 놀이 {monthData.activities.length}가지
          </p>
        </div>
      </div>

      {/* Activity cards */}
      {monthData.activities.map((activity, idx) => (
        <ActivityCard key={activity.id} activity={activity} index={idx} />
      ))}
    </div>
  );
}
