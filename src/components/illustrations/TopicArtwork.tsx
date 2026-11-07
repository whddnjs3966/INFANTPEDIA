import GuideArtwork, { type GuideArtworkKind } from "./GuideArtwork";

/** Decorative subject cues only; this never classifies a medical condition. */
export function artworkForLabel(label: string): GuideArtworkKind {
  if (/치아|치과|양치|이앓이/.test(label)) return "tooth";
  if (/소독|세척|위생|씻기|청결/.test(label)) return "wash";
  if (/보관|냉장|냉동|해동/.test(label)) return "storage";
  if (/이유식|식사|식재료|질감|식단/.test(label)) return "solids";
  if (/수면|잠|밤|졸림/.test(label)) return "moon";
  if (/수유|먹|분유|젖병|모유|트림/.test(label)) return "feeding";
  if (/발달|터미타임/.test(label)) return "rattle";
  if (/놀이|교감|달래기/.test(label)) return "play";
  if (/건강|진료|예방|접종|체온|열|FAQ/.test(label)) return "thermometer";
  if (/기록|측정|성장/.test(label)) return "record";
  if (/외출|여행/.test(label)) return "outing";
  if (/설정|계정|가족/.test(label)) return "cloud";
  return "book";
}

export default function TopicArtwork({ kind, label = "", className = "" }: { kind?: GuideArtworkKind; label?: string; className?: string }) {
  const art = kind ?? artworkForLabel(label);
  const surface = ["feeding", "health", "solids", "thermometer"].includes(art) ? "var(--surface-peach)" : ["play", "rattle", "moon", "wash"].includes(art) ? "var(--surface-lavender)" : "var(--surface-sky)";
  return <span aria-hidden="true" data-topic-art={art} className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl ${className}`} style={{ backgroundColor: surface }}><GuideArtwork kind={art} className="h-full w-full" /></span>;
}
