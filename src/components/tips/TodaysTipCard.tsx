"use client";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getTipsForMonth } from "@/lib/data/daily-tips-data";
import { useReadingValue } from "@/components/reading/ReadingScope";
import PracticalTipBody from "./PracticalTipBody";

export default function TodaysTipCard({ month = 0 }: { month?: number }) {
  const eligible = getTipsForMonth(month);
  const [tipId, setTipId] = useReadingValue<string | null>("general:tip", null);
  const [open, setOpen] = useState(false);
  const tip = eligible.find(item => String(item.id) === tipId) ?? eligible.find(item => item.practical.key === "bag") ?? eligible[0];
  const id = useId();
  return <section className="mx-5 mb-6 rounded-[24px] bg-[var(--surface-peach)] p-5" data-reading-anchor="tips:general" aria-label="일반 육아 팁">
    <div className="flex items-center gap-2 text-[var(--brand)]"><TopicArtwork kind="cloud" className="h-10 w-10" /><h2 className="text-sm font-semibold">하나 더 알아두면</h2></div>
    <div aria-live="polite" aria-atomic="true"><h3 className="mt-3 text-lg font-semibold leading-7 tracking-tight">{tip.title}</h3><p className="mt-2 text-base leading-7 text-[var(--foreground)]">{tip.practical.takeaway}</p></div>
    <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--brand)]">{open ? "접기" : "방법 살펴보기"}<ArrowRight size={15} aria-hidden /></button>
    <div id={id} hidden={!open} className="mt-3"><PracticalTipBody tip={tip.practical} /></div>
    <button type="button" onClick={() => { const alternatives = eligible.filter(item => item.id !== tip.id); if (alternatives.length) { setTipId(String(alternatives[Math.floor(Math.random() * alternatives.length)].id)); setOpen(false); } }} className="mt-3 block min-h-11 text-sm font-medium text-[var(--muted-foreground)] underline underline-offset-4">다른 팁 보기</button>
  </section>;
}
