"use client";

import { type ReactNode } from "react";
import { AlertTriangle, Check, ChevronDown, Wheat, Carrot, Apple, Beef, Milk } from "lucide-react";
import { cn } from "@/lib/utils";
import FormattedContent from "@/components/ui/FormattedContent";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import { GuideAccordion, GuideStats } from "./GuidePresentation";
import { getBabyFoodGuide, getStageForMonth, getAvailableIngredients, getNewIngredients, type IngredientInfo, type StageInfo } from "@/lib/data/baby-food-guide-data";

const categoryConfig = {
  grain: { label: "곡류", icon: Wheat, surface: "bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200" },
  vegetable: { label: "채소", icon: Carrot, surface: "bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-200" },
  fruit: { label: "과일", icon: Apple, surface: "bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200" },
  protein: { label: "단백질", icon: Beef, surface: "bg-orange-50 text-orange-900 dark:bg-orange-950/30 dark:text-orange-200" },
  dairy: { label: "유제품", icon: Milk, surface: "bg-sky-50 text-sky-900 dark:bg-sky-950/30 dark:text-sky-200" },
};

function ReadingSection({ title, children, caution = false }: { title: string; children: ReactNode; caution?: boolean }) {
  return <section className="space-y-3"><h4 className={cn("text-base font-semibold", caution ? "text-[var(--content-caution)]" : "text-[var(--foreground)]")}>{title}</h4>{children}</section>;
}

function StageProgress({ stages, currentStage }: { stages: StageInfo[]; currentStage?: StageInfo }) {
  return <ol aria-label="이유식 단계" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,2.5rem),1fr))] gap-2">{stages.map(stage => <li key={stage.stage} className="min-w-0 space-y-2 text-center"><span aria-hidden className={cn("block h-1.5 rounded-full", currentStage?.stage === stage.stage ? "bg-[var(--brand)]" : currentStage && stage.endMonth < currentStage.startMonth ? "bg-blue-200 dark:bg-blue-800" : "bg-[var(--surface-muted)]")} /><span className={cn("block break-words text-sm leading-5", currentStage?.stage === stage.stage ? "font-semibold text-[var(--brand)]" : "text-[var(--muted-foreground)]")}>{stage.stage.replace("초기 ", "").replace("단계", "")}</span></li>)}</ol>;
}

function IngredientTag({ ingredient, isNew }: { ingredient: IngredientInfo; isNew: boolean }) {
  return <span className={cn("inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm leading-5", categoryConfig[ingredient.category].surface)}>{ingredient.name}{isNew && <span className="font-semibold">NEW</span>}{ingredient.allergyRisk && <AlertTriangle size={13} aria-label="알레르기 주의" className="shrink-0 text-[var(--content-caution)]" />}</span>;
}

export default function BabyFoodGuide({ month }: { month: number }) {
  const guide = getBabyFoodGuide(), currentStage = getStageForMonth(month);
  const availableIngredients = getAvailableIngredients(month), newIngredients = getNewIngredients(month);
  const grouped = availableIngredients.reduce<Partial<Record<IngredientInfo["category"], IngredientInfo[]>>>((result, ingredient) => { (result[ingredient.category] ??= []).push(ingredient); return result; }, {});

  if (month < 4) return <div className="surface-card space-y-3 p-5"><div className="flex items-center gap-3"><TopicArtwork kind="solids" className="h-[56px] w-[56px]" /><h3 className="text-lg font-semibold">아직 이유식 시작 전이에요</h3></div><p className="text-base leading-7 text-[var(--muted-foreground)]">생후 6개월 무렵, 목을 가누고 음식을 삼킬 준비가 됐는지 함께 살펴보세요. 개별 시작 시기는 의료진과 상의하세요.</p><a href="https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-what-and-how-to-introduce-solid-foods.html" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--brand)] underline underline-offset-4">CDC · 이유식 시작 안내<span className="sr-only"> (새 창)</span></a></div>;

  return <div className="space-y-4 pb-6 text-base leading-7 text-[var(--foreground)]">
    <section className="surface-card space-y-4 p-5">
      <div className="flex items-center gap-3"><TopicArtwork kind="solids" className="h-[56px] w-[56px]" /><div className="min-w-0"><h3 className="text-lg font-semibold">이유식 종합 가이드</h3><p className="text-sm leading-6 text-[var(--muted-foreground)]">{currentStage ? `선택 월령 참고: ${currentStage.stage}` : "완료기 이후"}</p></div></div>
      <StageProgress stages={guide.stages} currentStage={currentStage} /><p className="text-sm leading-6 text-[var(--muted-foreground)]">월령만으로 시작 시기와 섭취량을 정하지 않아요. 생후 6개월 무렵의 준비 신호와 개별 안내를 함께 살펴보세요.</p>
      {currentStage && <div className="space-y-3 border-t border-[var(--border)] pt-4"><h4 className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold">{currentStage.stage}<span className="text-sm font-normal text-[var(--muted-foreground)]">{currentStage.monthRange}</span></h4><FormattedContent variant="prose" content={currentStage.description} className="text-base leading-7" /><details className="group border-t border-[var(--border)] pt-1"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--brand)]">질감·횟수·양 보기<ChevronDown size={16} aria-hidden className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary><div className="pb-1 pt-2"><GuideStats items={[{ label: "형태", value: currentStage.texture }, { label: "횟수", value: currentStage.frequency }, { label: "1회량", value: currentStage.amount }]} /></div></details></div>}
    </section>

    <section className="surface-card p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-lg font-semibold">사용 가능한 식재료</h3><p className="text-sm text-[var(--muted-foreground)]">{availableIngredients.length}가지{newIngredients.length > 0 && <span className="ml-2 font-medium text-[var(--brand)]">+{newIngredients.length} 새 재료</span>}</p></div>
      <div className="divide-y divide-[var(--border)]">{(Object.keys(categoryConfig) as IngredientInfo["category"][]).map(category => { const ingredients = grouped[category]; if (!ingredients?.length) return null; const config = categoryConfig[category], Icon = config.icon; return <details key={category} className="group" open={category === "grain"}><summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 text-base font-medium"><Icon size={18} aria-hidden className="shrink-0 text-[var(--brand)]" /><span className="min-w-0 flex-1">{config.label}<span className="ml-2 text-sm font-normal tabular-nums text-[var(--muted-foreground)]">{ingredients.length}가지</span></span><ChevronDown size={16} aria-hidden className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary><div className="flex flex-wrap gap-2 pb-4 pt-1">{ingredients.map(ingredient => <IngredientTag key={ingredient.name} ingredient={ingredient} isNew={newIngredients.some(item => item.name === ingredient.name)} />)}</div></details>; })}</div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--border)] pt-3 text-sm leading-6 text-[var(--muted-foreground)]"><span><strong className="font-semibold">NEW</strong> 이번 달 새 재료</span><span className="inline-flex items-center gap-1"><AlertTriangle size={13} aria-hidden />알레르기 주의</span></p>
    </section>

    {currentStage && <GuideAccordion title="조리·주의·메뉴" readingKey={`${currentStage.stage} 조리법 & 주의사항`} description={currentStage.stage} artwork="solids">
      <ReadingSection title="조리 팁"><ul className="space-y-3">{currentStage.cookingTips.map(tip => <li key={tip} className="flex items-start gap-2.5"><Check size={17} aria-hidden className="mt-1 shrink-0 text-[var(--brand)]" /><span>{tip}</span></li>)}</ul></ReadingSection>
      <ReadingSection title="주의사항" caution><ul className="space-y-3 border-l-2 border-[var(--content-caution)] pl-4 text-[var(--content-caution)]">{currentStage.cautionPoints.map(point => <li key={point}>{point}</li>)}</ul></ReadingSection>
      <ReadingSection title="추천 메뉴"><ul className="flex flex-wrap gap-2">{currentStage.sampleMenu.map(menu => <li key={menu} className="rounded-lg bg-[var(--surface-peach)] px-3 py-1.5 text-sm text-[var(--art-peach-ink)]">{menu}</li>)}</ul></ReadingSection>
    </GuideAccordion>}

    <GuideAccordion title="알레르기 안전 가이드" description="식품·확인 방법·응급 증상" artwork="thermometer">
      <FormattedContent variant="prose" content={guide.allergyGuide.description} className="text-base leading-7" />
      <ReadingSection title="고위험 식품"><ul className="flex flex-wrap gap-2">{guide.allergyGuide.highRiskFoods.map(food => <li key={food} className="rounded-lg bg-[var(--surface-peach)] px-3 py-1.5 text-sm text-[var(--content-caution)]">{food}</li>)}</ul></ReadingSection>
      <ReadingSection title="테스트 방법"><FormattedContent variant="prose" content={guide.allergyGuide.testingMethod} className="text-base leading-7" /></ReadingSection>
      <section className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[var(--content-urgent)] dark:border-rose-900 dark:bg-rose-950/30"><h4 className="flex items-start gap-2 text-base font-semibold"><AlertTriangle size={18} aria-hidden className="mt-1 shrink-0" />응급 증상 (즉시 병원 방문)</h4><ul className="space-y-2">{guide.allergyGuide.emergencySigns.map(sign => <li key={sign}>{sign}</li>)}</ul></section>
    </GuideAccordion>

    <GuideAccordion title="먹는 연습을 도와요" readingKey="이유식 일반 꿀팁" description="일상에서 참고할 방법" artwork="book"><ul className="space-y-3">{guide.generalTips.map(tip => <li key={tip} className="flex items-start gap-2.5"><Check size={17} aria-hidden className="mt-1 shrink-0 text-[var(--brand)]" /><span>{tip}</span></li>)}</ul></GuideAccordion>
  </div>;
}

