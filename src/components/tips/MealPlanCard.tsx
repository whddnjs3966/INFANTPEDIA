"use client";

import Link from "next/link";
import { useReadingValue } from "@/components/reading/ReadingScope";
import { useId } from "react";
import { UtensilsCrossed, ChevronDown, AlertTriangle, Clock, Ruler, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMealPlanForMonth } from "@/lib/data/meal-plan-data";

interface MealPlanCardProps { month: number; }

function getKstDayIndex() {
  const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return (kstDate.getUTCDay() + 6) % 7;
}

export default function MealPlanCard({ month }: MealPlanCardProps) {
  const [isOpen, setIsOpen] = useReadingValue<boolean>("meal:open", false);
  const [day, setDay] = useReadingValue("meal:day", String(getKstDayIndex()));
  const selectedDay = /^[0-6]$/.test(day) ? Number(day) : getKstDayIndex();
  const setSelectedDay = (index: number) => setDay(String(index));
  const panelId = useId();
  const plan = getMealPlanForMonth(month);
  const today = getKstDayIndex();
  if (month < 6 || !plan || !plan.weeklyPlan.length) return null;
  const dayPlan = plan.weeklyPlan[selectedDay] || plan.weeklyPlan[0];

  return (
    <section className="surface-card mx-5 mb-3 overflow-hidden" data-reading-anchor="meal" aria-label={`${month}개월 이유식 식단 예시`}>
      <h3><button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setIsOpen(!isOpen)} className="flex min-h-12 w-full items-center gap-3 p-5 text-left transition-colors hover:bg-[var(--surface-bg)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-muted)]"><UtensilsCrossed size={21} className="text-[var(--brand)]" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1"><span className="block text-base font-bold text-[var(--foreground)]">이유식 식단 · {plan.stage}</span><span className="mt-1 block text-sm font-normal leading-6 text-[var(--muted-foreground)]">{plan.texture}</span></span>
        <ChevronDown size={20} aria-hidden="true" className={cn("shrink-0 text-stone-500 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
      </button></h3>
      <div id={panelId} hidden={!isOpen} className="space-y-5 border-t border-[var(--border)] p-5">
        <p className="text-base leading-7 text-stone-700 dark:text-stone-200">{plan.description}</p><p className="text-sm leading-6 text-[var(--muted-foreground)]">음식 조합을 보는 예시예요. 양·횟수·질감은 권장 목표가 아니며, 준비 상태와 의료진의 개별 안내가 우선이에요.</p>
        <details className="rounded-2xl bg-[var(--surface-bg)] p-3"><summary className="min-h-11 cursor-pointer py-2 text-sm font-medium">예시 수치 보기</summary><p className="mb-3 text-sm leading-6 text-[var(--muted-foreground)]">기존 식단에 적힌 예시 수치예요. 권장 섭취량이나 목표가 아니에요.</p><dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--surface-bg)] p-3"><dt className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]"><Ruler size={16} aria-hidden="true" />예시 한 끼 양</dt><dd className="mt-1 text-base font-bold text-[var(--foreground)]">{plan.totalPerMeal}</dd></div>
          <div className="rounded-2xl bg-[var(--surface-bg)] p-3"><dt className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]"><Clock size={16} aria-hidden="true" />예시 횟수</dt><dd className="mt-1 text-base font-bold text-[var(--foreground)]">{plan.dailyFrequency}</dd></div>
        </dl></details>

        <div role="group" className="flex flex-wrap gap-2" aria-label="식단 요일 선택">
          {plan.weeklyPlan.map((day, index) => (
            <button key={day.day} type="button" aria-label={`${day.day}요일${index === today ? ", 오늘" : ""}`} aria-pressed={selectedDay === index} onClick={() => setSelectedDay(index)} className={cn("flex min-h-14 min-w-12 flex-col items-center justify-center rounded-xl border px-2 py-2 text-sm font-bold transition-colors", selectedDay === index ? "border-[var(--brand)] bg-[var(--accent-soft)] text-[var(--brand)]" : "border-transparent bg-[var(--surface-bg)] text-[var(--muted-foreground)]")}>
              <span>{day.day}</span>{index === today && <span className="text-sm font-medium">오늘</span>}
            </button>
          ))}
        </div>

        <div aria-live="polite" aria-atomic="true"><p className="mb-3 text-sm leading-6 text-[var(--muted-foreground)]">메뉴 이름은 조리법이 아니에요. 과일·채소는 먹는 능력에 맞게 익혀 으깨거나 안전한 모양·질감으로 준비하고, 고기·생선의 뼈와 질긴 부분은 제거해요. 달걀·육류·생선은 충분히 익혀요. 조리용 우유와 마시는 일반 우유는 구분해요.</p>
          <div className="mb-3 flex items-center justify-between gap-2"><h4 className="text-lg font-bold tracking-tight text-[var(--foreground)]">{dayPlan.day}요일 식단 예시</h4>{selectedDay !== today && <button type="button" onClick={() => setSelectedDay(today)} className="min-h-12 rounded-xl px-2 text-sm font-semibold text-[var(--brand)]">오늘로</button>}</div>
          <div className="space-y-3">
            {dayPlan.meals.map((meal, index) => (
              <div key={`${selectedDay}-${index}`} className="rounded-2xl bg-[var(--surface-bg)] p-4">
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">{meal.meal}</p><p className="mt-1 text-base font-semibold leading-7 text-stone-900 dark:text-stone-100">{meal.menu}</p>
                {!!meal.ingredients?.length && <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm leading-6 text-stone-700 dark:text-stone-200">{meal.ingredients.map((ingredient, ingredientIndex) => <li key={ingredientIndex}>{ingredient.name} {ingredient.amount}</li>)}</ul>}
              </div>
            ))}
          </div>
        </div>

        <Link scroll={false} href={`/encyclopedia?tab=babyfood&month=${month}`} className="flex min-h-12 items-center justify-center rounded-2xl border border-[var(--border)] px-4 py-3 text-base font-semibold text-[var(--brand)]">{month}개월 이유식·식재료 가이드 보기</Link>
        {!!plan.tips.length && <ul className="space-y-3">{plan.tips.map((tip, index) => <li key={index} className="flex items-start gap-2 text-base leading-7 text-stone-700 dark:text-stone-200"><Lightbulb size={18} aria-hidden="true" className="mt-1 shrink-0 text-amber-700 dark:text-amber-300" /><span>{tip}</span></li>)}</ul>}
        {plan.allergyNote && <div className="flex items-start gap-2 border-l-2 border-[var(--content-caution)] pl-3"><AlertTriangle size={20} aria-hidden="true" className="mt-1 shrink-0 text-[var(--content-caution)]" /><p className="text-sm leading-6 text-[var(--content-caution)]">{plan.allergyNote}</p></div>}
        <details className="text-sm leading-6 text-[var(--muted-foreground)]">
          <summary className="min-h-11 cursor-pointer py-2.5">참고 자료</summary>
          <p>2026-11-06 식재료 소개·질식 예방·돌 전 우유 표현을 대조했어요. 메뉴와 수치는 아기의 실제 식사량이나 개별 영양 안내를 대신하지 않아요.</p>
          {[
            { title: "CDC · 이유식 시작", url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-what-and-how-to-introduce-solid-foods.html" },
            { title: "CDC · 질식 예방", url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html" },
            { title: "CDC · 피해야 할 음식과 음료", url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/foods-and-drinks-to-avoid-or-limit.html" },
            { title: "NHS · 아기 음료와 컵", url: "https://www.nhs.uk/baby/weaning-and-feeding/drinks-and-cups-for-babies-and-young-children/" },
            { title: "CDC · 어린이 식품 안전", url: "https://www.cdc.gov/food-safety/foods/children-under-5.html" },
          ].map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center font-medium text-[var(--brand)] underline">{source.title} (새 창)</a>)}
        </details>
      </div>
    </section>
  );
}
