"use client";

import { Gamepad2 } from "lucide-react";
import FormattedContent from "@/components/ui/FormattedContent";
import { getActivitiesForMonth } from "@/lib/data/recommended-activities-data";
import type { GuideArtworkKind } from "@/components/illustrations/GuideArtwork";
import { GuideAccordion, GuideCard, GuideContent, GuideHeading, GuideStats } from "./GuidePresentation";

function activityArtwork(title: string): GuideArtworkKind {
  if (/책|이야기|노래|대화|옹알이/.test(title)) return "book";
  if (/딸랑|음악|소리/.test(title)) return "rattle";
  if (/거울|표정|얼굴|까꿍/.test(title)) return "cloud";
  return "play";
}

export default function RecommendedActivities({ month }: { month: number }) {
  const monthData = getActivitiesForMonth(month);
  if (!monthData?.activities.length) return <GuideCard><p>이 월령의 추천 놀이 정보가 아직 없어요</p></GuideCard>;
  return <GuideContent>
    <GuideHeading title="추천 놀이" description={`${month}개월 · ${monthData.activities.length}가지`} icon={<Gamepad2 size={21} />} tone="amber" />
    <div className="space-y-3">{monthData.activities.map(activity => <GuideAccordion key={activity.id} title={activity.title} artwork={activityArtwork(activity.title)} meta={<><span>{activity.duration}</span><span>{activity.difficulty === "easy" ? "쉬움" : "보통"}</span></>}>
      <section aria-label="놀이 방법"><h4 className="mb-2 text-sm font-semibold text-[var(--brand)]">이렇게 놀아요</h4><FormattedContent variant="prose" content={activity.description} /></section>
      <GuideStats items={[...(activity.materials.length ? [{ label: "준비물", value: activity.materials.join(" · ") }] : []), { label: "살펴볼 발달", value: activity.developmentAreas.join(" · ") }, { label: "권장 연령", value: activity.ageRange }]} />
    </GuideAccordion>)}</div>
  </GuideContent>;
}
