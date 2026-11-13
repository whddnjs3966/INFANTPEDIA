"use client";

import FormattedContent from "@/components/ui/FormattedContent";
import { getActivitiesForMonth } from "@/lib/data/recommended-activities-data";
import type { GuideArtworkKind } from "@/components/illustrations/GuideArtwork";
import { GuideAccordion, GuideCard, GuideContent, GuideStats } from "./GuidePresentation";

function activityArtwork(title: string): GuideArtworkKind {
  if (/책|이야기|노래|대화|옹알이/.test(title)) return "book";
  if (/딸랑|음악|소리/.test(title)) return "rattle";
  if (/거울|표정|얼굴|까꿍/.test(title)) return "cloud";
  return "play";
}

export default function RecommendedActivities({ month }: { month: number }) {
  const monthData = getActivitiesForMonth(month);
  if (!monthData?.activities.length) return <GuideCard><p>이 월령의 추천 놀이 정보가 아직 없어요</p></GuideCard>;
  return <GuideContent className="space-y-2">
    <p className="px-0.5 text-sm leading-[1.6] text-[var(--muted-foreground)]">이 월령에 함께 해볼 놀이 {monthData.activities.length}가지</p>
    {monthData.activities.map(activity => <GuideAccordion key={activity.id} title={activity.title} artwork={activityArtwork(activity.title)} meta={activity.duration} tone="amber">
      <section aria-label="놀이 방법"><h4 className="mb-2 text-sm font-semibold text-[var(--brand)]">이렇게 놀아요</h4><FormattedContent variant="prose" content={activity.description} /></section>
      <GuideStats items={[
        ...(activity.materials.length ? [{ label: "준비물", value: activity.materials.join(" · ") }] : []),
        { label: "살펴볼 발달", value: activity.developmentAreas.join(" · ") },
        { label: "권장 연령", value: activity.ageRange },
        { label: "난이도", value: activity.difficulty === "easy" ? "쉬움" : "보통" },
      ]} />
    </GuideAccordion>)}
  </GuideContent>;
}
