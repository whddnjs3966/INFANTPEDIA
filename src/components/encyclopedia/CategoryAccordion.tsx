"use client";

import HealthFAQEvidence from "@/components/encyclopedia/HealthFAQEvidence";
import type { HealthEvidence } from "@/lib/data/health-faq-data";
import FormattedContent from "@/components/ui/FormattedContent";
import { GuideAccordion } from "./GuidePresentation";

interface Activity {
  evidence?: HealthEvidence;
  id: number;
  title: string;
  content: string;
  category: string;
  month_id: number;
}

const categories = [
  { key: "development", label: "움직임과 발달", readingKey: "발달", artwork: "rattle", tone: "sage" },
  { key: "play", label: "함께 해볼 놀이", readingKey: "놀이", artwork: "play", tone: "amber" },
  { key: "sleep", label: "잠과 생활 리듬", readingKey: "수면", artwork: "moon", tone: "lilac" },
  { key: "food", label: "수유·먹기", readingKey: "이유식", artwork: "feeding", tone: "amber" },
] as const;

export default function CategoryAccordion({ activities, isLoading }: { activities: Activity[]; isLoading: boolean }) {
  if (isLoading) return <div role="status" aria-label="월령별 정보 불러오는 중" className="space-y-2.5">
    {categories.map(category => <div key={category.key} className="h-14 rounded-[20px] bg-[var(--surface-muted)] motion-safe:animate-pulse" />)}
  </div>;

  return <div className="space-y-2.5">
    {categories.map(category => {
      const items = activities.filter(activity => activity.category === category.key);
      return <GuideAccordion
        key={category.key}
        title={category.label}
        readingKey={category.readingKey}
        artwork={category.artwork}
        tone={category.tone}
        meta={items.length ? `${items.length}개 이야기` : "정보 없음"}
      >
        {items.length ? <div>{items.map(activity => <GuideAccordion
          key={activity.id}
          title={activity.title}
          readingKey={`monthly-article:${activity.id}`}
          headingLevel={4}
          compact
          flat
        >
          <FormattedContent variant="prose" content={activity.content} />
          {activity.evidence && <HealthFAQEvidence evidence={activity.evidence} />}
        </GuideAccordion>)}</div> : <p className="text-sm text-[var(--muted-foreground)]">이 월령의 정보가 아직 없어요.</p>}
      </GuideAccordion>;
    })}
  </div>;
}
