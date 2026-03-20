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
    <div className="mx-4 mb-4">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full min-h-[56px] items-center gap-3 rounded-2xl border bg-gradient-to-r p-4 text-left transition-all",
          "from-orange-50 to-amber-50 border-orange-200/50",
          isOpen && "shadow-md"
        )}
        whileTap={{ scale: 0.98 }}
      >
        <div className="rounded-xl bg-orange-100 p-2">
          <UtensilsCrossed size={20} className="text-orange-500" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-gray-700">
            {"🍽️"} {plan.stage}
          </span>
          <p className="text-xs text-gray-400 mt-0.5">{plan.texture}</p>
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
            <div className="rounded-2xl border border-orange-100 bg-white/80 mt-2 p-4 shadow-sm">
              {/* Description */}
              <p className="text-[13px] text-gray-600 mb-3">{plan.description}</p>

              {/* Total per meal & frequency badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                  📏 한끼 {plan.totalPerMeal}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  🕐 {plan.dailyFrequency}
                </span>
              </div>

              {/* Day selector */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {plan.weeklyPlan.map((day, idx) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(idx)}
                    className={cn(
                      "min-w-[40px] rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all",
                      selectedDay === idx
                        ? "bg-orange-400 text-white shadow-sm"
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    )}
                  >
                    {day.day}
                  </button>
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
                    className="rounded-xl border border-orange-100 bg-orange-50/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{meal.emoji}</span>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-orange-600 uppercase">
                          {meal.meal}
                        </p>
                        <p className="text-[14px] font-semibold text-gray-800">
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
                            className="inline-flex items-center gap-0.5 rounded-md bg-white border border-orange-200/60 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
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
                    <p className="text-[12px] text-gray-600 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Allergy note */}
              {plan.allergyNote && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-2.5">
                  <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-700 leading-relaxed font-medium">
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
