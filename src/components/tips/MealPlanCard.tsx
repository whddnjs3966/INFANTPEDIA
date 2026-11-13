"use client";

import Link from "next/link";
import { useReadingValue } from "@/components/reading/ReadingScope";
import { useId } from "react";
import { UtensilsCrossed, ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMealPlanForMonth, getMealSafety, mealPlanEvidence, mealPlanSafety } from "@/lib/data/meal-plan-data";
import HealthFAQEvidence from "@/components/encyclopedia/HealthFAQEvidence";

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
    <section className="tips-card" data-reading-anchor="meal" aria-label={`${month}개월 이유식 식단 예시`}>
      <h3><button id={`${panelId}-title`} type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setIsOpen(!isOpen)} className="tips-row">
        <span className="flex size-[36px] shrink-0 items-center justify-center rounded-xl bg-[var(--surface-peach)]"><UtensilsCrossed size={18} className="text-[var(--art-peach-ink)]" aria-hidden="true" /></span>
        <span className="tips-row-title">이유식 식단 예시 · {plan.stage}</span>
        <ChevronDown size={17} aria-hidden="true" className="tips-chevron" />
      </button></h3>
      <div id={panelId} role="region" aria-labelledby={`${panelId}-title`} hidden={!isOpen} className="tips-detail space-y-4">
        <p className="text-base leading-7 text-[var(--foreground)]">{mealPlanSafety.introduction}</p>

        <div role="group" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,44px),1fr))] gap-[6px]" aria-label="식단 요일 선택">
          {plan.weeklyPlan.map((day, index) => (
            <button key={day.day} type="button" aria-label={`${day.day}요일${index === today ? ", 오늘" : ""}`} aria-pressed={selectedDay === index} onClick={() => setSelectedDay(index)} className={cn("min-h-12 min-w-0 rounded-xl border px-1 py-2 text-sm font-bold transition-colors", selectedDay === index ? "border-[var(--brand)] bg-[var(--accent-soft)] text-[var(--brand)]" : "border-transparent bg-[var(--surface-bg)] text-[var(--muted-foreground)]")}>
              {day.day}
            </button>
          ))}
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 aria-live="polite" className="text-lg font-bold tracking-tight text-[var(--foreground)]">{dayPlan.day}요일 식단 예시</h4>{selectedDay !== today && <button type="button" onClick={() => setSelectedDay(today)} className="min-h-12 rounded-xl px-2 text-sm font-semibold text-[var(--brand)]">오늘로</button>}</div>
          <div className="divide-y divide-[var(--border)]">
            {dayPlan.meals.map((meal, index) => {
              const { allergens, prep, checkLabel } = getMealSafety(meal);
              return <article key={`${selectedDay}-${index}`} className="min-w-0 py-3" data-meal-item>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">{meal.meal}</p>
                <h5 className="mt-1 flex items-start gap-2 text-base font-semibold leading-7 text-[var(--foreground)]"><span aria-hidden="true">{meal.emoji}</span><span className="min-w-0 [overflow-wrap:anywhere]">{meal.menu}</span></h5>
                {!!allergens.length && <ul aria-label="표시된 재료의 알레르겐" className="mt-2 flex flex-wrap gap-1.5">{allergens.map(allergen => <li key={allergen} className="rounded-lg bg-[var(--surface-peach)] px-2 py-1 text-sm font-semibold text-[var(--content-caution)]">{allergen}</li>)}</ul>}
                <details className="group mt-2 text-sm leading-6">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-[var(--brand)] [&::-webkit-details-marker]:hidden"><ChevronDown size={16} className="shrink-0 group-open:rotate-180" aria-hidden="true" />재료와 손질 방법</summary>
                  <p className="mt-1 font-semibold [overflow-wrap:anywhere]">{meal.ingredients.join(" · ")}</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">{prep.map(tip => <li key={tip}>{tip}</li>)}</ul>
                  {checkLabel && <p className="mt-2 text-[var(--content-caution)]">{mealPlanSafety.packageCheck}</p>}
                </details>
              </article>;
            })}
          </div>
        </div>

        <Link scroll={false} href={`/encyclopedia?tab=babyfood&month=${month}`} className="flex min-h-12 items-center justify-center rounded-2xl border border-[var(--border)] px-4 py-3 text-base font-semibold text-[var(--brand)]">{month}개월 이유식·식재료 가이드 보기</Link>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>{mealPlanSafety.preparation}</li>{month < 12 && <li>{mealPlanSafety.underOne}</li>}
        </ul>
        <div className="flex items-start gap-2 border-l-2 border-[var(--content-urgent)] pl-3"><AlertTriangle size={18} aria-hidden="true" className="mt-1 shrink-0 text-[var(--content-urgent)]" /><p className="text-sm font-semibold leading-6 text-[var(--content-urgent)]">{mealPlanSafety.emergency}</p></div>
        <HealthFAQEvidence evidence={mealPlanEvidence} />
      </div>
    </section>
  );
}
