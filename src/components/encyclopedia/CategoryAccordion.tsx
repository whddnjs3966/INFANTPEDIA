"use client";
import HealthFAQEvidence from "@/components/encyclopedia/HealthFAQEvidence";
import type { HealthEvidence } from "@/lib/data/health-faq-data";

import { Baby, Gamepad2, Moon, UtensilsCrossed } from "lucide-react";
import FormattedContent from "@/components/ui/FormattedContent";
import { GuideAccordion, GuideContent } from "./GuidePresentation";

interface Activity { evidence?: HealthEvidence; id: number; title: string; content: string; category: string; month_id: number; }
interface CategoryAccordionProps { activities: Activity[]; isLoading: boolean; }
const categories = [
  { key: "development", label: "발달", icon: Baby, tone: "sage" },
  { key: "play", label: "놀이", icon: Gamepad2, tone: "amber" },
  { key: "sleep", label: "수면", icon: Moon, tone: "lilac" },
  { key: "food", label: "수유·먹기", icon: UtensilsCrossed, tone: "sage" },
] as const;

export default function CategoryAccordion({ activities, isLoading }: CategoryAccordionProps) {
  if (isLoading) return <div role="status" aria-label="월령별 정보 불러오는 중" className="space-y-3 px-5">{categories.map(category => <div key={category.key} className="h-24 animate-pulse rounded-[24px] bg-stone-200/60 dark:bg-[var(--surface-muted)]/60" />)}</div>;
  return <GuideContent className="space-y-3 px-5">
    {categories.map(category => {
      const items = activities.filter(activity => activity.category === category.key);
      const Icon = category.icon;
      return <GuideAccordion key={category.key} title={category.label} readingKey={category.key === "food" ? "이유식" : category.label} icon={<Icon size={21} />} tone={category.tone} description={items.length ? `${items.length}개 이야기 · ${items[0].title}` : "이 월령의 정보가 아직 없어요"}>
        {items.length ? <div className="divide-y divide-stone-100 dark:divide-[var(--border)]">{items.map((activity, index) => <article key={activity.id} className="space-y-4 py-5 first:pt-0 last:pb-0"><h4 className="flex items-start gap-3 text-base font-bold leading-7 text-stone-900 dark:text-stone-100"><span aria-hidden="true" className="pt-0.5 text-sm font-medium tabular-nums text-blue-800 dark:text-blue-300">{String(index + 1).padStart(2, "0")}</span>{activity.title}</h4><FormattedContent variant="prose" content={activity.content} />{activity.evidence && <HealthFAQEvidence evidence={activity.evidence} />}</article>)}</div> : <p>이 월령의 {category.label} 정보가 아직 없어요</p>}
      </GuideAccordion>;
    })}
  </GuideContent>;
}
