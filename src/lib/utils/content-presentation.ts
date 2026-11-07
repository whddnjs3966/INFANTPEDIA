import { monthSummaryPresentation } from "@/lib/data/month-summary-presentation";
import { careTextPresentation } from "@/lib/data/care-text-presentation";

export type ContentEmphasisKind = "key" | "condition" | "action" | "caution" | "urgent";
export interface ContentEmphasisMark { text: string; kind: ContentEmphasisKind; }
export interface ContentTextSegment { text: string; kind?: ContentEmphasisKind; }

const priority: Record<ContentEmphasisKind, number> = { key: 0, action: 1, condition: 2, caution: 3, urgent: 4 };

/** Explicit phrases only. Splitting never changes, drops, or rewrites source text. */
export function splitContentEmphasis(text: string, marks: readonly ContentEmphasisMark[]): ContentTextSegment[] {
  const candidates: { start: number; end: number; kind: ContentEmphasisKind }[] = [];
  for (const mark of marks) {
    if (!mark.text || !Object.prototype.hasOwnProperty.call(priority, mark.kind)) continue;
    let start = text.indexOf(mark.text);
    while (start !== -1) {
      candidates.push({ start, end: start + mark.text.length, kind: mark.kind });
      start = text.indexOf(mark.text, start + mark.text.length);
    }
  }
  candidates.sort((a, b) => priority[b.kind] - priority[a.kind] || (b.end - b.start) - (a.end - a.start) || a.start - b.start);
  const ranges: typeof candidates = [];
  for (const range of candidates) if (!ranges.some(r => range.start < r.end && range.end > r.start)) ranges.push(range);
  ranges.sort((a, b) => a.start - b.start);
  const result: ContentTextSegment[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (cursor < range.start) result.push({ text: text.slice(cursor, range.start) });
    result.push({ text: text.slice(range.start, range.end), kind: range.kind });
    cursor = range.end;
  }
  if (cursor < text.length || !result.length) result.push({ text: text.slice(cursor) });
  return result;
}

/** A changed paragraph gets no inherited medical emphasis. */
export function emphasisForCareText(text: string): readonly ContentEmphasisMark[] {
  return Object.prototype.hasOwnProperty.call(careTextPresentation, text) ? careTextPresentation[text] : [];
}

/** A changed/unknown monthly source remains fully visible instead of receiving an old preview. */
export function presentationForMonth(month: number, source: string) {
  if (!Number.isInteger(month) || month < 0 || month > 12) return null;
  const presentation = monthSummaryPresentation[month];
  return presentation?.source === source ? presentation : null;
}
