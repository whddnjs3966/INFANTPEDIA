"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  AlertTriangle,
  ChevronDown,
  Leaf,
  ShieldAlert,
  Lightbulb,
  ChefHat,
  Clock,
  Ruler,
  Apple,
  Wheat,
  Carrot,
  Beef,
  Milk,
  CircleDot,
  Check,
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

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; text: string }> = {
  grain: { label: "곡류", icon: Wheat, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300" },
  vegetable: { label: "채소", icon: Carrot, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300" },
  fruit: { label: "과일", icon: Apple, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-300" },
  protein: { label: "단백질", icon: Beef, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300" },
  dairy: { label: "유제품", icon: Milk, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/30", text: "text-sky-700 dark:text-sky-300" },
};

function AccordionSection({
  title,
  icon: Icon,
  iconBg,
  iconColor,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-[0_2px_8px_rgb(0,0,0,0.06)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full min-h-[48px] items-center gap-3 p-4 text-left"
      >
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0", iconBg)}>
          <Icon size={17} className={iconColor} />
        </div>
        <span className="flex-1 text-[14px] font-bold text-stone-800 dark:text-stone-100">
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageProgress({ stages, currentStage }: { stages: StageInfo[]; currentStage?: StageInfo }) {
  return (
    <div className="flex items-center gap-1.5">
      {stages.map((stage) => {
        const isCurrent = currentStage?.stage === stage.stage;
        const isPast = currentStage && stage.endMonth < currentStage.startMonth;
        return (
          <div key={stage.stage} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "w-full h-1.5 rounded-full transition-colors",
                isCurrent
                  ? "bg-orange-400 dark:bg-orange-500"
                  : isPast
                    ? "bg-orange-200 dark:bg-orange-800"
                    : "bg-gray-200 dark:bg-stone-700"
              )}
            />
            <span
              className={cn(
                "text-[11px] font-medium text-center leading-tight",
                isCurrent
                  ? "text-orange-600 dark:text-orange-400 font-bold"
                  : "text-stone-400 dark:text-stone-500"
              )}
            >
              {stage.stage.replace("초기 ", "").replace("단계", "")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function IngredientTag({ ingredient, isNew }: { ingredient: IngredientInfo; isNew: boolean }) {
  const config = categoryConfig[ingredient.category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium",
        config.bg,
        config.text,
        isNew && "ring-1 ring-orange-300 dark:ring-orange-700"
      )}
    >
      {ingredient.name}
      {isNew && <span className="text-[11px] text-orange-500 font-bold">NEW</span>}
      {ingredient.allergyRisk && <AlertTriangle size={9} className="text-red-400" />}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function BabyFoodGuide({ month }: BabyFoodGuideProps) {
  const guide = getBabyFoodGuide();
  const currentStage = getStageForMonth(month);
  const availableIngredients = getAvailableIngredients(month);
  const newIngredients = getNewIngredients(month);

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
      <div className="mb-4">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 text-center shadow-[0_2px_8px_rgb(0,0,0,0.06)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/40 mx-auto mb-3">
            <UtensilsCrossed size={22} className="text-orange-400" />
          </div>
          <p className="text-[14px] font-bold text-stone-800 dark:text-stone-100 mb-1">
            아직 이유식 시작 전이에요
          </p>
          <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed">
            이유식은 만 4~6개월 사이에 시작하는 것이 좋습니다.
            <br />
            목을 가눌 수 있고 음식에 관심을 보일 때 시작하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-4 space-y-3"
    >
      {/* Current Stage Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40">
            <UtensilsCrossed size={17} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-stone-800 dark:text-stone-100">
              이유식 종합 가이드
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {currentStage ? `현재: ${currentStage.stage}` : "완료기 이후"}
            </p>
          </div>
        </div>

        <StageProgress stages={guide.stages} currentStage={currentStage} />

        {currentStage && (
          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
            <p className="text-[13px] font-bold text-stone-800 dark:text-stone-100 mb-1">
              {currentStage.stage}
              <span className="text-[11px] font-normal text-gray-400 ml-2">{currentStage.monthRange}</span>
            </p>

            <FormattedContent content={currentStage.description} className="text-[12px] mb-3" />

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-gray-50 dark:bg-stone-800/60 p-2.5 text-center">
                <UtensilsCrossed size={13} className="mx-auto mb-1 text-orange-500" />
                <p className="text-[11px] font-bold text-stone-700 dark:text-stone-200 truncate">{currentStage.texture}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">형태</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-stone-800/60 p-2.5 text-center">
                <Clock size={13} className="mx-auto mb-1 text-blue-500" />
                <p className="text-[11px] font-bold text-stone-700 dark:text-stone-200 truncate">{currentStage.frequency}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">횟수</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-stone-800/60 p-2.5 text-center">
                <Ruler size={13} className="mx-auto mb-1 text-green-500" />
                <p className="text-[11px] font-bold text-stone-700 dark:text-stone-200 truncate">{currentStage.amount}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">1회량</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Ingredients Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5 shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/40">
            <Leaf size={17} className="text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-bold text-stone-800 dark:text-stone-100">
              사용 가능한 식재료
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {availableIngredients.length}가지
              {newIngredients.length > 0 && (
                <span className="text-orange-500 font-medium"> +{newIngredients.length} 새 재료</span>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {(["grain", "vegetable", "fruit", "protein", "dairy"] as const).map((cat) => {
            const items = groupedIngredients[cat];
            if (!items || items.length === 0) return null;
            const config = categoryConfig[cat];
            const CatIcon = config.icon;
            return (
              <div key={cat}>
                <div className="flex items-center gap-1.5 mb-2">
                  <CatIcon size={12} className={config.color} />
                  <p className={cn("text-[11px] font-bold", config.text)}>
                    {config.label}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((ing) => (
                    <IngredientTag
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
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-200 dark:border-stone-700">
          <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500">
            <span className="text-[11px] text-orange-500 font-bold">NEW</span> 이번 달 새 재료
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500">
            <AlertTriangle size={9} className="text-red-400" /> 알레르기 주의
          </span>
        </div>
      </motion.div>

      {/* Cooking Tips & Caution */}
      {currentStage && (
        <motion.div variants={itemVariants}>
          <AccordionSection
            title={`${currentStage.stage} 조리법 & 주의사항`}
            icon={ChefHat}
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            iconColor="text-amber-500"
          >
            {/* Cooking Tips */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Lightbulb size={13} className="text-amber-500" />
                <p className="text-[12px] font-bold text-stone-700 dark:text-stone-200">조리 팁</p>
              </div>
              <div className="space-y-2">
                {currentStage.cookingTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CircleDot size={8} className="text-amber-400 shrink-0 mt-1.5" />
                    <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Caution Points */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <ShieldAlert size={13} className="text-red-500" />
                <p className="text-[12px] font-bold text-stone-700 dark:text-stone-200">주의사항</p>
              </div>
              <div className="space-y-1.5">
                {currentStage.cautionPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-xl bg-red-50/60 dark:bg-red-950/20 p-2.5">
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
              <div className="flex items-center gap-1.5 mb-2.5">
                <UtensilsCrossed size={13} className="text-orange-500" />
                <p className="text-[12px] font-bold text-stone-700 dark:text-stone-200">추천 메뉴</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentStage.sampleMenu.map((menu, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-lg bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 text-[11px] font-medium text-orange-700 dark:text-orange-300"
                  >
                    {menu}
                  </span>
                ))}
              </div>
            </div>
          </AccordionSection>
        </motion.div>
      )}

      {/* Allergy Guide */}
      <motion.div variants={itemVariants}>
        <AccordionSection
          title="알레르기 안전 가이드"
          icon={ShieldAlert}
          iconBg="bg-red-50 dark:bg-red-950/40"
          iconColor="text-red-500"
        >
          <FormattedContent content={guide.allergyGuide.description} className="text-[12px] mb-4" />

          {/* High Risk Foods */}
          <div className="mb-4">
            <p className="text-[12px] font-bold text-stone-700 dark:text-stone-200 mb-2">
              고위험 식품
            </p>
            <div className="flex flex-wrap gap-1.5">
              {guide.allergyGuide.highRiskFoods.map((food, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-950/30 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:text-red-300"
                >
                  <AlertTriangle size={9} />
                  {food}
                </span>
              ))}
            </div>
          </div>

          {/* Testing Method */}
          <div className="mb-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb size={12} className="text-amber-500" />
              <p className="text-[12px] font-bold text-amber-700 dark:text-amber-300">테스트 방법</p>
            </div>
            <FormattedContent content={guide.allergyGuide.testingMethod} className="text-[12px]" />
          </div>

          {/* Emergency Signs */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={12} className="text-red-500" />
              <p className="text-[12px] font-bold text-red-700 dark:text-red-300">응급 증상 (즉시 병원 방문)</p>
            </div>
            <div className="space-y-1.5">
              {guide.allergyGuide.emergencySigns.map((sign, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-xl bg-red-50/60 dark:bg-red-950/20 p-2.5"
                >
                  <ShieldAlert size={11} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-700 dark:text-red-300 font-medium">
                    {sign}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AccordionSection>
      </motion.div>

      {/* General Tips */}
      <motion.div variants={itemVariants}>
        <AccordionSection
          title="이유식 일반 꿀팁"
          icon={Lightbulb}
          iconBg="bg-yellow-50 dark:bg-yellow-950/40"
          iconColor="text-yellow-500"
        >
          <div className="space-y-2">
            {guide.generalTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Check size={12} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </AccordionSection>
      </motion.div>
    </motion.div>
  );
}
