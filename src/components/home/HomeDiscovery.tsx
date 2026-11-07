"use client";

import Link from "next/link";
import { ArrowRight, HeartPulse, Plus } from "lucide-react";
import GuideArtwork from "@/components/illustrations/GuideArtwork";
import { homeFeaturedTip, homeGuideChoices } from "@/lib/utils/home-guide-view";

export function HomeFeaturedGuide({ month }: { month: number }) {
  const tip = homeFeaturedTip(month);
  return <section aria-label="지금 알아두면 좋은 요령" data-home-featured className="home-featured relative overflow-hidden rounded-[24px] bg-[var(--surface-peach)] p-5">
    <div className="relative z-10 max-w-[64%] @max-[18rem]:max-w-full">
      <p className="text-sm font-semibold text-[var(--brand)]">지금 알아두면</p>
      <h2 className="mt-2 break-words text-xl font-semibold leading-7 tracking-tight">{tip.title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{tip.takeaway}</p>
      <Link href={`/tips?month=${month}&tip=${tip.key}`} scroll={false} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-[var(--brand)]">방법 살펴보기<ArrowRight size={15} aria-hidden /></Link>
    </div>
    <GuideArtwork kind="cloud" className="home-cloud pointer-events-none absolute -right-4 bottom-2 w-[40%] @max-[18rem]:hidden" />
  </section>;
}

export function HomeQuickActions({ month }: { month: number }) {
  return <nav aria-label="빠른 육아 행동" className="grid grid-cols-2 gap-3 @max-[17rem]:grid-cols-1">
    <Link href="/growth?record=add" className="surface-card flex min-h-14 items-center justify-center gap-2 px-3 py-3 text-base font-semibold text-[var(--brand)]"><Plus size={19} aria-hidden />성장 기록</Link>
    <Link href={`/encyclopedia?tab=health&month=${month}`} scroll={false} className="surface-card flex min-h-14 items-center justify-center gap-2 px-3 py-3 text-base font-semibold text-[var(--brand)]"><HeartPulse size={19} aria-hidden />건강 질문</Link>
  </nav>;
}

export function HomeGuideSuggestions({ month }: { month: number }) {
  return <section aria-labelledby="home-guide-title" className="space-y-3" data-home-suggestions>
    <div className="flex flex-wrap items-center justify-between gap-x-2"><h2 id="home-guide-title" className="text-xl font-semibold tracking-tight">이 시기에 궁금한 것</h2><Link href={`/encyclopedia?tab=encyclopedia&month=${month}`} scroll={false} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--brand)]">전체 보기<ArrowRight size={14} aria-hidden /></Link></div>
    <div className="space-y-3">{homeGuideChoices(month).map(guide => <Link key={guide.tab} href={`/encyclopedia?tab=${guide.tab}&month=${month}`} scroll={false} className="surface-card flex items-center gap-3 p-4 transition-colors hover:bg-[var(--surface-sky)] @max-[18rem]:p-3 @max-[18rem]:[&>svg]:hidden">
      <span className={`flex h-20 max-h-[80px] w-20 max-w-[80px] shrink-0 items-center justify-center rounded-2xl @max-[18rem]:hidden ${guide.tone === "peach" ? "bg-[var(--surface-peach)]" : "bg-[var(--surface-sky)]"}`}><GuideArtwork kind={guide.art} className="h-full w-full" /></span>
      <span className="min-w-0 flex-1"><span className="block break-words text-base font-semibold leading-6">{guide.title}</span><span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">{guide.description}</span></span><ArrowRight size={15} className="shrink-0 text-[var(--brand)]" aria-hidden />
    </Link>)}</div>
    <nav aria-label="다른 생활 가이드" className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-[var(--brand)]"><Link href={`/encyclopedia?tab=activities&month=${month}`} scroll={false} className="inline-flex min-h-11 items-center gap-1">놀이·발달<ArrowRight size={14} aria-hidden /></Link><Link href={`/encyclopedia?tab=${month >= 6 ? "feeding" : "babyfood"}&month=${month}`} scroll={false} className="inline-flex min-h-11 items-center gap-1">{month >= 6 ? "수유 가이드" : "이유식 알아보기"}<ArrowRight size={14} aria-hidden /></Link></nav>
  </section>;
}
