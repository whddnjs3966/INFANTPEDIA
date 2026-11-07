import type { HealthEvidence } from "@/lib/data/health-faq-data";

/** Shared labels for linked reference material. */
export function healthEvidenceView(evidence?: HealthEvidence) {
  const sources = evidence?.sources?.filter(source => /^https:\/\//.test(source.url)) ?? [];
  return { sources, sourceCount: sources.length, compact: sources.length ? `참고 자료 ${sources.length}개` : "" };
}
