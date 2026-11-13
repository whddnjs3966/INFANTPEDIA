"use client";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import { useId, useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { getTipsForMonth } from "@/lib/data/daily-tips-data";
import { useReadingValue } from "@/components/reading/ReadingScope";
import PracticalTipBody from "./PracticalTipBody";

export default function TodaysTipCard({ month = 0 }: { month?: number }) {
  const eligible = getTipsForMonth(month);
  const [tipId, setTipId] = useReadingValue<string | null>("general:tip", null);
  const [open, setOpen] = useState(false);
  const tip = eligible.find(item => String(item.id) === tipId) ?? eligible.find(item => item.practical.key === "bag") ?? eligible[0];
  const id = useId();
  return <section className="tips-card" data-reading-anchor="tips:general" aria-label="일반 육아 팁">
    <div className="flex flex-wrap items-center justify-between gap-x-2 px-3.5 pt-1">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">하나 더 알아두면</h2>
      <button type="button" onClick={() => { const alternatives = eligible.filter(item => item.id !== tip.id); if (alternatives.length) { setTipId(String(alternatives[Math.floor(Math.random() * alternatives.length)].id)); setOpen(false); } }} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--brand)]"><RefreshCw size={14} aria-hidden />다른 팁 보기</button>
    </div>
    <h3 aria-live="polite"><button id={`${id}-title`} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="tips-row">
      <TopicArtwork kind="outing" className="h-9 w-9" />
      <span className="tips-row-title">{tip.title}</span>
      <ChevronDown size={17} aria-hidden className="tips-chevron" />
    </button></h3>
    <div id={id} role="region" aria-labelledby={`${id}-title`} hidden={!open} className="tips-detail"><PracticalTipBody tip={tip.practical} /></div>
  </section>;
}
