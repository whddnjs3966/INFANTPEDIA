import type { HealthEvidence } from "@/lib/data/health-faq-data";
import { parentingTipRevisions } from "@/lib/data/parenting-tip-revisions";
import { getPracticalTip, practicalContent, practicalEvidence, type PracticalTip } from "@/lib/data/practical-tips-data";

// Exact editorial revision guards: a future DB edit must not inherit this review.
export const publicContentCorrections = [{
  table: "parenting_tips", id: 12,
  before: "수유 후 5~10분간 세워 안고 등을 가볍게 두드려 트림시켜 주세요. 트림이 안 나오면 옆으로 눕혀 재워도 됩니다.",
  after: "수유 후 깨어 있는 아기를 안아 편안하게 돌봐주세요. 잠잘 때는 트림 여부와 관계없이 등을 대고 단단하고 평평한 수면 면에 눕혀요. 옆으로 눕히거나 베개·수건으로 자세를 고정해 재우지 마세요.",
  source: { title: "NIH · 안전한 아기 수면 환경", url: "https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment" },
}, {
  table: "activities", id: 27,
  before: "6개월이 되면 영양학적으로 밤중 수유 없이 밤새 잘 수 있습니다. 밤중 수유를 줄이려면 잠들기 전 충분한 수유를 하고, 밤에 깼을 때 바로 수유 대신 토닥임으로 재우기를 시도하세요. 깨시는 120~150분이며, 낮잠은 하루 2~3회로 안정됩니다. 일관된 취침 시간(저녁 7~8시)을 정해 지키는 것이 좋습니다.",
  after: "밤에 깨거나 먹는 양상은 아기마다 달라요. 월령만으로 밤중 수유를 끊거나 줄이지 마세요. 배고픈 신호와 성장·섭취 상태를 살피고, 수유 조절이 필요하면 의료진과 상담하세요. 낮밤의 차이를 알려주는 편안한 돌봄 루틴을 만들어볼 수 있어요.",
  source: { title: "NHS · 아기 수면과 야간 돌봄", url: "https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/" },
}];

export function reviewedPublicContent<T extends { id?: number; content?: string; title?: string; month_id?: number; category?: string }>(table: string, row: T): T & { evidence?: HealthEvidence; practical?: PracticalTip } {
  const correction = publicContentCorrections.find(c => c.table === table && c.id === row.id && (row.content === c.before || row.content === c.after));
  if (!correction) {
    const revision = table === "parenting_tips" ? parentingTipRevisions.find(item => item.id === row.id && item.before === row.content && item.beforeTitle === row.title && item.month === row.month_id && item.category === row.category) : undefined;
    const tip = revision ? getPracticalTip(revision.key) : undefined;
    if (!tip) return row;
    return { ...row, title: tip.title, content: practicalContent(tip), practical: tip, evidence: practicalEvidence(tip) };
  }
  return { ...row, content: correction.after, evidence: { sources: [correction.source], checkedOn: "2026-11-04", scope: "이 내용의 수면 안전·야간 돌봄 표현" } };
}
