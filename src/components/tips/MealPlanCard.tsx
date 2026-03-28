"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { getMealPlanForMonth } from "@/lib/data/meal-plan-data";

interface MealPlanCardProps {
  month: number;
}

export default function MealPlanCard({ month }: MealPlanCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const plan = getMealPlanForMonth(month);

  if (!plan) return null;

  const dayPlan = plan.weeklyPlan[selectedDay];

  return (
    <div className="mx-4 mb-5">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full min-h-[56px] items-center gap-3 rounded-[28px] bg-orange-50/80 p-4 text-left transition-all",
          "dark:bg-orange-950/30",
          isOpen && "shadow-md ring-1 ring-black/5"
        )}
        whileTap={{ scale: 0.98 }}
      >
        <div className="rounded-xl bg-orange-100 dark:bg-orange-900/50 p-2">
          <UtensilsCrossed size={20} className="text-orange-500" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {"🍽️"} {plan.stage}
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{plan.texture}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-[28px] border border-gray-100 bg-white mt-2 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:border-gray-700/50 dark:bg-gray-900/90">
              {/* Description */}
              <p className="text-[13px] text-gray-600 dark:text-gray-300 mb-3">{plan.description}</p>

              {/* Total per meal & frequency badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-1 text-[11px] font-semibold text-orange-700 dark:text-orange-300">
                  📏 한끼 {plan.totalPerMeal}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  🕐 {plan.dailyFrequency}
                </span>
              </div>

              {/* Day selector */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {plan.weeklyPlan.map((day, idx) => (
                  <motion.button
                    key={day.day}
                    onClick={() => setSelectedDay(idx)}
                    whileTap={{ scale: 0.92 }}
                    className={cn(
                      "min-w-[44px] min-h-[44px] rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all flex items-center justify-center",
                      selectedDay === idx
                        ? "bg-orange-400 text-white shadow-sm"
                        : "bg-orange-50 text-orange-600 active:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:active:bg-orange-900/50"
                    )}
                  >
                    {day.day}
                  </motion.button>
                ))}
              </div>

              {/* Meals for selected day */}
              <div className="space-y-2">
                {dayPlan.meals.map((meal, idx) => (
                  <motion.div
                    key={`${selectedDay}-${idx}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-[20px] bg-orange-50/50 dark:bg-orange-950/20 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{meal.emoji}</span>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-orange-600 uppercase">
                          {meal.meal}
                        </p>
                        <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100">
                          {meal.menu}
                        </p>
                      </div>
                    </div>
                    {/* Ingredient tags */}
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                        {meal.ingredients.map((ing, ingIdx) => (
                          <span
                            key={ingIdx}
                            className="inline-flex items-center gap-0.5 rounded-lg bg-white/80 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300 shadow-[0_1px_3px_rgb(0,0,0,0.04)]"
                          >
                            <span className="text-[10px]">{ing.emoji}</span>
                            {ing.name} {ing.amount}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Tips */}
              <div className="mt-3 space-y-1.5">
                {plan.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[10px] mt-0.5">{"💡"}</span>
                    <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Allergy note */}
              {plan.allergyNote && (
                <div className="mt-3 flex items-start gap-2 rounded-2xl bg-red-50 dark:bg-red-950/30 p-3">
                  <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-700 dark:text-red-400 leading-relaxed font-medium">
                    {plan.allergyNote}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
