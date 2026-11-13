"use client";

import { type ReactNode } from "react";
import { AlertTriangle, Check, ChevronDown, Wheat, Carrot, Apple, Beef, Milk } from "lucide-react";
import { cn } from "@/lib/utils";
import FormattedContent from "@/components/ui/FormattedContent";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import { GuideAccordion, GuideContent, GuideStats } from "./GuidePresentation";
import { babyFoodStorage, getBabyFoodGuide, getStageForMonth, getAvailableIngredients, solidFoodEvidence, solidFoodPreparation, type IngredientInfo, type StageInfo } from "@/lib/data/baby-food-guide-data";
import HealthFAQEvidence from "./HealthFAQEvidence";

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

function IngredientTag({ ingredient }: { ingredient: IngredientInfo }) {
  return <span className={cn("inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm leading-5", categoryConfig[ingredient.category].surface)}>{ingredient.name}{ingredient.allergyRisk && <AlertTriangle size={13} aria-label="알레르기 주의" className="shrink-0 text-[var(--content-caution)]" />}</span>;
}

export default function BabyFoodGuide({ month }: { month: number }) {
  const guide = getBabyFoodGuide(), currentStage = getStageForMonth(month);
  const availableIngredients = getAvailableIngredients(month);
  const grouped = availableIngredients.reduce<Partial<Record<IngredientInfo["category"], IngredientInfo[]>>>((result, ingredient) => { (result[ingredient.category] ??= []).push(ingredient); return result; }, {});

  if (month < 6) return <div className="surface-card space-y-3 p-5">
    <div className="flex items-center gap-3"><TopicArtwork kind="solids" className="h-[56px] w-[56px] shrink-0" /><h3 className="text-lg font-semibold">이유식 준비 신호 살펴보기</h3></div>
    <p className="text-base leading-7 text-[var(--muted-foreground)]">{solidFoodPreparation}</p>
    <p className="text-sm leading-6">미숙아의 시작 시기나 알레르기 위험이 걱정되면 소아청소년과에 미리 상담하세요.</p>
    <HealthFAQEvidence evidence={solidFoodEvidence} />
  </div>;

  return <GuideContent>
    <p className="rounded-xl bg-[var(--surface-peach)] px-3.5 py-3 text-sm text-[var(--foreground)]">
      월령만으로 시작 시기와 섭취량을 정하지 않아요. 생후 6개월 무렵의 준비 신호와 개별 안내를 함께 살펴보세요.
    </p>
    <GuideAccordion title="준비 신호·이유식 단계" artwork="solids" tone="amber">
      <StageProgress stages={guide.stages} currentStage={currentStage} />
      {currentStage ? <>
        <h4 className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold">
          {currentStage.stage}<span className="text-sm font-normal text-[var(--muted-foreground)]">{currentStage.monthRange}</span>
        </h4>
        <FormattedContent variant="prose" content={currentStage.description} />
        <GuideStats items={[{ label: "먹기 좋은 형태", value: currentStage.texture }, { label: "식사 기회", value: currentStage.frequency }]} />
        <HealthFAQEvidence evidence={solidFoodEvidence} />
      </> : <p className="text-sm text-[var(--muted-foreground)]">완료기 이후</p>}
    </GuideAccordion>

    <GuideAccordion title="식재료 예시" readingKey="사용 가능한 식재료" artwork="play">
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">아기가 먹을 수 있는 질감과 알레르기 이력에 맞춰 골라요.</p>
      <div className="divide-y divide-[var(--border)]">
        {(Object.keys(categoryConfig) as IngredientInfo["category"][]).map(category => {
          const ingredients = grouped[category];
          if (!ingredients?.length) return null;
          const { label, icon: Icon } = categoryConfig[category];
          return <details key={category} className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 py-2.5 text-base font-medium [&::-webkit-details-marker]:hidden">
              <Icon size={18} aria-hidden className="shrink-0 text-[var(--brand)]" />
              <span className="min-w-0 flex-1">{label}<span className="ml-2 text-sm font-normal tabular-nums text-[var(--muted-foreground)]">{ingredients.length}가지</span></span>
              <ChevronDown size={16} aria-hidden className="shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="flex flex-wrap gap-2 pb-3">{ingredients.map(ingredient => <IngredientTag key={ingredient.name} ingredient={ingredient} />)}</div>
          </details>;
        })}
      </div>
      <p className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)]"><AlertTriangle size={13} aria-hidden />알레르기 주의</p>
    </GuideAccordion>

    {currentStage && <GuideAccordion title="조리·주의·메뉴" readingKey={`${currentStage.stage} 조리법 & 주의사항`} description={currentStage.stage} artwork="storage">
      <ReadingSection title="조리 팁"><ul className="space-y-3">{currentStage.cookingTips.map(tip => <li key={tip} className="flex items-start gap-2.5"><Check size={17} aria-hidden className="mt-1 shrink-0 text-[var(--brand)]" /><span>{tip}</span></li>)}</ul></ReadingSection>
      <ReadingSection title="주의사항" caution><ul className="space-y-3 border-l-2 border-[var(--content-caution)] pl-4 text-[var(--content-caution)]">{currentStage.cautionPoints.map(point => <li key={point}>{point}</li>)}</ul></ReadingSection>
      <ReadingSection title="추천 메뉴"><ul className="flex flex-wrap gap-2">{currentStage.sampleMenu.map(menu => <li key={menu} className="rounded-lg bg-[var(--surface-peach)] px-3 py-1.5 text-sm text-[var(--art-peach-ink)]">{menu}</li>)}</ul></ReadingSection>
    </GuideAccordion>}

    <GuideAccordion title="알레르기 안전 가이드" artwork="thermometer">
      <FormattedContent variant="prose" content={guide.allergyGuide.description} className="text-base leading-7" />
      <ReadingSection title="알레르기를 일으킬 수 있는 식품"><ul className="flex flex-wrap gap-2">{guide.allergyGuide.highRiskFoods.map(food => <li key={food} className="rounded-lg bg-[var(--surface-peach)] px-3 py-1.5 text-sm text-[var(--content-caution)]">{food}</li>)}</ul></ReadingSection>
      <ReadingSection title="처음 먹일 때"><FormattedContent variant="prose" content={guide.allergyGuide.introduction} className="text-base leading-7" /></ReadingSection>
      <ReadingSection title="먼저 상담이 필요한 경우" caution><p>{guide.allergyGuide.higherRisk}</p></ReadingSection>
      <HealthFAQEvidence evidence={guide.allergyGuide.evidence} />
    </GuideAccordion>

    <aside className="space-y-2 rounded-xl border-l-2 border-l-[var(--content-urgent)] bg-rose-50 px-3.5 py-3 dark:bg-rose-950/30">
      <h3 className="flex items-start gap-2 text-base font-semibold text-[var(--content-urgent)]">
        <AlertTriangle size={17} aria-hidden className="mt-1 shrink-0" />알레르기 응급 신호
      </h3>
      <p className="font-semibold text-[var(--content-urgent)]">{guide.allergyGuide.emergencyAction}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--foreground)] marker:text-[var(--content-urgent)]">
        {guide.allergyGuide.emergencySigns.map(sign => <li key={sign}>{sign}</li>)}
      </ul>
    </aside>

    <GuideAccordion title={babyFoodStorage.title} artwork="storage">
      <dl className="divide-y divide-[var(--border)]">{babyFoodStorage.entries.map(({ label, text }) => <div key={label} className="space-y-1 py-3 first:pt-0 last:pb-0"><dt className="font-semibold">{label}</dt><dd className="leading-7">{text}</dd></div>)}</dl>
      <HealthFAQEvidence evidence={babyFoodStorage.evidence} />
    </GuideAccordion>

    <GuideAccordion title="먹는 연습을 도와요" readingKey="이유식 일반 꿀팁" artwork="book"><ul className="space-y-3">{guide.generalTips.map(tip => <li key={tip} className="flex items-start gap-2.5"><Check size={17} aria-hidden className="mt-1 shrink-0 text-[var(--brand)]" /><span>{tip}</span></li>)}</ul></GuideAccordion>
  </GuideContent>;
}

