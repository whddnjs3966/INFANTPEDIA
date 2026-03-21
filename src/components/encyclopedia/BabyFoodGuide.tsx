"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Leaf,
  ShieldAlert,
  Lightbulb,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import FormattedContent from "@/components/ui/FormattedContent";
import {
  getBabyFoodGuide,
  getStageForMonth,
  getAvailableIngredients,
  getNewIngredients,
  type IngredientInfo,
  type StageInfo,
} from "@/lib/data/baby-food-guide-data";

interface BabyFoodGuideProps {
  month: number;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  grain: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  vegetable: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  fruit: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
  protein: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  dairy: { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
};

const categoryLabels: Record<string, string> = {
  grain: '곡류',
  vegetable: '채소',
  fruit: '과일',
  protein: '단백질',
  dairy: '유제품',
};

function ExpandableSection({
  title,
  icon: Icon,
  iconColor,
  gradientFrom,
  gradientTo,
  borderColor,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full min-h-[48px] items-center gap-3 rounded-2xl border bg-gradient-to-r p-3.5 text-left transition-all",
          gradientFrom,
          gradientTo,
          borderColor,
          isOpen && "shadow-md"
        )}
        whileTap={{ scale: 0.98 }}
      >
        <div className={cn("rounded-xl p-2", iconColor)}>
          <Icon size={18} />
        </div>
        <span className="flex-1 text-sm font-bold text-gray-700 dark:text-gray-200">
          {title}
        </span>
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
            <div className="rounded-2xl border border-orange-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 mt-2 p-4 shadow-sm">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageProgressBar({ stages, currentStage }: { stages: StageInfo[]; currentStage?: StageInfo }) {
  return (
    <div className="flex items-center gap-1 mb-4">
      {stages.map((stage, idx) => {
        const isCurrent = currentStage?.stage === stage.stage;
        const isPast = currentStage && stage.endMonth < currentStage.startMonth;
        return (
          <div key={stage.stage} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className={cn(
                "w-full h-2 rounded-full transition-colors",
                isCurrent
                  ? "bg-orange-400 dark:bg-orange-500"
                  : isPast
                    ? "bg-orange-200 dark:bg-orange-800"
                    : "bg-gray-200 dark:bg-gray-700"
              )}
              initial={isCurrent ? { scale: 0.8 } : {}}
              animate={isCurrent ? { scale: [0.8, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            />
            <span
              className={cn(
                "text-[9px] font-medium text-center leading-tight",
                isCurrent
                  ? "text-orange-600 dark:text-orange-400 font-bold"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              {stage.emoji} {stage.stage.replace('초기 ', '').replace('단계', '')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function IngredientChip({ ingredient, isNew }: { ingredient: IngredientInfo; isNew: boolean }) {
  const colors = categoryColors[ingredient.category];
  return (
    <motion.div
      initial={isNew ? { scale: 0.8, opacity: 0 } : { opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-medium relative",
        colors.bg,
        colors.text,
        colors.border,
        isNew && "ring-2 ring-orange-300 dark:ring-orange-600"
      )}
    >
      {isNew && (
        <Sparkles size={10} className="text-orange-400 absolute -top-1.5 -right-1.5" />
      )}
      <span className="text-sm">{ingredient.emoji}</span>
      <span>{ingredient.name}</span>
      {ingredient.allergyRisk && (
        <AlertTriangle size={10} className="text-red-400 ml-0.5" />
      )}
    </motion.div>
  );
}

export default function BabyFoodGuide({ month }: BabyFoodGuideProps) {
  const guide = getBabyFoodGuide();
  const currentStage = getStageForMonth(month);
  const availableIngredients = getAvailableIngredients(month);
  const newIngredients = getNewIngredients(month);

  // Group ingredients by category
  const groupedIngredients = availableIngredients.reduce<Record<string, IngredientInfo[]>>(
    (acc, ing) => {
      if (!acc[ing.category]) acc[ing.category] = [];
      acc[ing.category].push(ing);
      return acc;
    },
    {}
  );

  if (month < 4) {
    return (
      <div className="mx-4 mb-4">
        <div className="rounded-2xl border border-orange-200/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 dark:border-orange-800/30 p-5 text-center">
          <span className="text-3xl mb-2 block">🍼</span>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
            아직 이유식 시작 전이에요
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            이유식은 만 4~6개월 사이에 시작하는 것이 좋습니다.
            <br />
            목을 가눌 수 있고 음식에 관심을 보일 때 시작하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 space-y-3">
      {/* Section 1: Current Stage Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-orange-200/50 dark:border-orange-800/30 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-xl bg-orange-100 dark:bg-orange-900/50 p-2">
            <UtensilsCrossed size={20} className="text-orange-500 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              이유식 종합 가이드
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {currentStage ? `현재 단계: ${currentStage.stage}` : '완료기 이후'}
            </p>
          </div>
        </div>

        {/* Stage Progress */}
        <StageProgressBar stages={guide.stages} currentStage={currentStage} />

        {currentStage && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentStage.emoji}</span>
              <div>
                <p className="text-[13px] font-bold text-orange-700 dark:text-orange-300">
                  {currentStage.stage}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {currentStage.monthRange}
                </p>
              </div>
            </div>

            <FormattedContent content={currentStage.description} className="text-[12px]" />

            {/* Key info badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-1 text-[10px] font-semibold text-orange-700 dark:text-orange-300">
                🥣 {currentStage.texture}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                🕐 {currentStage.frequency}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 px-2.5 py-1 text-[10px] font-semibold text-yellow-700 dark:text-yellow-300">
                📏 {currentStage.amount}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Section 2: Available Ingredients */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-green-200/50 dark:border-green-800/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-xl bg-green-100 dark:bg-green-900/50 p-2">
            <Leaf size={18} className="text-green-500 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              사용 가능한 식재료
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {availableIngredients.length}가지 식재료
              {newIngredients.length > 0 && ` (새로 추가: ${newIngredients.length}가지)`}
            </p>
          </div>
        </div>

        {/* Category groups */}
        <div className="space-y-3">
          {(['grain', 'vegetable', 'fruit', 'protein', 'dairy'] as const).map((cat) => {
            const items = groupedIngredients[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat}>
                <p className={cn("text-[10px] font-bold mb-1.5 uppercase tracking-wider", categoryColors[cat].text)}>
                  {categoryLabels[cat]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((ing) => (
                    <IngredientChip
                      key={ing.name}
                      ingredient={ing}
                      isNew={newIngredients.some((n) => n.name === ing.name)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-green-200/50 dark:border-green-800/30">
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            <Sparkles size={10} className="text-orange-400" /> 이번 달 새 재료
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            <AlertTriangle size={10} className="text-red-400" /> 알레르기 주의
          </span>
        </div>
      </motion.div>

      {/* Section 3: Stage Details (expandable) */}
      {currentStage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ExpandableSection
            title={`${currentStage.emoji} ${currentStage.stage} 조리법 & 주의사항`}
            icon={ChefHat}
            iconColor="bg-amber-100 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400"
            gradientFrom="from-amber-50 dark:from-amber-950/20"
            gradientTo="to-orange-50 dark:to-orange-950/20"
            borderColor="border-amber-200/50 dark:border-amber-800/30"
          >
            {/* Cooking Tips */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1">
                <Lightbulb size={12} /> 조리 팁
              </p>
              <div className="space-y-1.5">
                {currentStage.cookingTips.map((tip, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-[10px] text-amber-400 mt-0.5">&#9679;</span>
                    <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">
                      {tip}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Caution Points */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                <ShieldAlert size={12} /> 주의사항
              </p>
              <div className="space-y-1.5">
                {currentStage.cautionPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-lg bg-red-50/50 dark:bg-red-950/20 p-2">
                    <AlertTriangle size={11} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-700 dark:text-red-300 leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Menu */}
            <div>
              <p className="text-[11px] font-bold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-1">
                <UtensilsCrossed size={12} /> 추천 메뉴 예시
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentStage.sampleMenu.map((menu, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-1 text-[11px] font-medium text-orange-700 dark:text-orange-300"
                  >
                    {menu}
                  </motion.span>
                ))}
              </div>
            </div>
          </ExpandableSection>
        </motion.div>
      )}

      {/* Section 4: Allergy Guide (expandable) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ExpandableSection
          title="알레르기 안전 가이드"
          icon={ShieldAlert}
          iconColor="bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400"
          gradientFrom="from-red-50 dark:from-red-950/20"
          gradientTo="to-rose-50 dark:to-rose-950/20"
          borderColor="border-red-200/50 dark:border-red-800/30"
        >
          <div className="mb-3">
            <FormattedContent content={guide.allergyGuide.description} className="text-[12px]" />
          </div>

          {/* High Risk Foods */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-red-600 dark:text-red-400 mb-2">
              고위험 식품
            </p>
            <div className="flex flex-wrap gap-1.5">
              {guide.allergyGuide.highRiskFoods.map((food, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:text-red-300"
                >
                  <AlertTriangle size={10} />
                  {food}
                </span>
              ))}
            </div>
          </div>

          {/* Testing Method */}
          <div className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 p-3">
            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1">
              <Lightbulb size={12} /> 알레르기 테스트 방법
            </p>
            <FormattedContent content={guide.allergyGuide.testingMethod} className="text-[12px]" />
          </div>

          {/* Emergency Signs */}
          <div>
            <p className="text-[11px] font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
              <AlertTriangle size={12} /> 응급 증상 (즉시 병원 방문)
            </p>
            <div className="space-y-1.5">
              {guide.allergyGuide.emergencySigns.map((sign, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-2"
                >
                  <span className="text-red-500 text-[10px] mt-0.5">&#9888;</span>
                  <p className="text-[12px] text-red-700 dark:text-red-300 font-medium">
                    {sign}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ExpandableSection>
      </motion.div>

      {/* General Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <ExpandableSection
          title="이유식 일반 꿀팁"
          icon={Lightbulb}
          iconColor="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400"
          gradientFrom="from-yellow-50 dark:from-yellow-950/20"
          gradientTo="to-amber-50 dark:to-amber-950/20"
          borderColor="border-yellow-200/50 dark:border-yellow-800/30"
        >
          <div className="space-y-2">
            {guide.generalTips.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-start gap-2"
              >
                <span className="text-[10px] text-yellow-500 mt-1">&#10003;</span>
                <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tip}
                </p>
              </motion.div>
            ))}
          </div>
        </ExpandableSection>
      </motion.div>
    </div>
  );
}
