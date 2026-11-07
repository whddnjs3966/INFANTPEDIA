import { getPracticalTip } from "@/lib/data/practical-tips-data";

const featuredKeys = ["night-light", "bottle-flow", "night-light", "turn-talk", "overstim", "ready", "first-food", "texture", "self-feed", "new-food", "milk-transition", "milk-transition", "self-feed"];

export function homeFeaturedTip(month: number) {
  const safeMonth = Number.isInteger(month) && month >= 0 ? Math.min(month, 12) : 0;
  const tip = getPracticalTip(featuredKeys[safeMonth]);
  return tip && tip.minMonth <= safeMonth ? tip : getPracticalTip("night-light")!;
}

export function homeGuideChoices(month: number) {
  return month >= 6
    ? [{ tab: "babyfood", title: "먹는 연습이 궁금할 때", description: "준비와 질감, 식재료 살펴보기", art: "feeding" as const, tone: "peach" }, { tab: "sleep", title: "우리 아기의 잠 살펴보기", description: "수면 환경과 돌봄 안내", art: "sleep" as const, tone: "sky" }]
    : [{ tab: "sleep", title: "우리 아기의 잠 살펴보기", description: "수면 환경과 돌봄 안내", art: "sleep" as const, tone: "sky" }, { tab: "feeding", title: "수유할 때 막히는 순간", description: "모유·젖병 수유 방법 알아보기", art: "feeding" as const, tone: "peach" }];
}
