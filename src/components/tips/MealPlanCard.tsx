"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  ChevronDown,
  AlertTriangle,
  Clock,
  Ruler,
  Lightbulb,
} from "lucide-react";
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
    <div className="mx-4 mb-3">
      <div className="rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_2px_12px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full min-h-[48px] items-center gap-3 p-4 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40 shrink-0">
            <UtensilsCrossed size={17} className="text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-gray-800 dark:text-gray-100">
              {plan.stage}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              {plan.texture}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-gray-400" />
          </motion.div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* Description */}
                <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">
                  {plan.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5">
                    <div className="flex items-center gap-2">
                      <Ruler size={14} className="text-orange-500 shrink-0" />
                      <div>
                        <p className="text-[9px] text-gray-400">한끼 양</p>
                        <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">
                          {plan.totalPerMeal}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[9px] text-gray-400">횟수</p>
                        <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">
                          {plan.dailyFrequency}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day selector */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                  {plan.weeklyPlan.map((day, idx) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(idx)}
                      className={cn(
                        "min-w-[42px] min-h-[36px] rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-all flex items-center justify-center shrink-0",
                        selectedDay === idx
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {day.day}
                    </button>
                  ))}
                </div>

                {/* Meals */}
                <div className="space-y-2">
                  {dayPlan.meals.map((meal, idx) => (
                    <motion.div
                      key={`${selectedDay}-${idx}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30 shrink-0">
                          <UtensilsCrossed size={14} className="text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-orange-500 uppercase">
                            {meal.meal}
                          </p>
                          <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {meal.menu}
                          </p>
                        </div>
                      </div>
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 ml-[42px]">
                          {meal.ingredients.map((ing, ingIdx) => (
                            <span
                              key={ingIdx}
                              className="inline-flex items-center rounded-lg bg-white dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-600"
                            >
                              {ing.name} {ing.amount}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Tips */}
                {plan.tips.length > 0 && (
                  <div className="space-y-1.5">
                    {plan.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <Lightbulb size={11} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Allergy note */}
                {plan.allergyNote && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50/60 dark:bg-red-950/20 p-3">
                    <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-700 dark:text-red-300 leading-relaxed font-medium">
                      {plan.allergyNote}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
