"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, HeartPulse, Plus } from "lucide-react";
import { homeFeaturedTip } from "@/lib/utils/home-guide-view";
import "./home.css";

export function HomeFeaturedGuide({ month }: { month: number }) {
  const tip = homeFeaturedTip(month);
  return <section aria-label="지금 알아두면 좋은 요령" data-home-featured className="home-hero">
    <h2>오늘도 함께 자라요</h2>
    <p className="mt-1">우리 아기에게 필요한 이야기</p>
    <Link href={`/tips?month=${month}&tip=${tip.key}`} scroll={false} className="home-hero-link" aria-label={`${tip.title} · 오늘의 팁 보기`}>
      오늘의 팁 보기<ArrowRight size={14} className="shrink-0" aria-hidden />
    </Link>
    <Image src="/images/home/family.webp" alt="" aria-hidden width={440} height={300} priority className="home-hero-art" />
  </section>;
}

export function HomeQuickActions({ month }: { month: number }) {
  return <nav aria-label="빠른 육아 행동" className="grid grid-cols-2 gap-2.5 @max-[16rem]:grid-cols-1">
    <Link href="/growth?record=add" className="home-quick-link"><Plus size={17} aria-hidden />성장 기록 추가</Link>
    <Link href={`/encyclopedia?tab=health&month=${month}`} scroll={false} className="home-quick-link"><HeartPulse size={17} aria-hidden />건강 질문</Link>
  </nav>;
}

export function HomeGuideSuggestions({ month }: { month: number }) {
  return <section aria-labelledby="home-guide-title" className="space-y-3" data-home-suggestions>
    <h2 id="home-guide-title" className="home-section-title">이 시기에 궁금한 것</h2>
    <div className="home-guide-grid">
      <Link href={`/encyclopedia?tab=feeding&month=${month}`} scroll={false} className="home-guide home-guide--feeding" aria-label="수유 알아보기">
        <Image src="/images/home/bottle.webp" alt="" aria-hidden width={128} height={148} className="home-guide-art" />
        <span className="home-guide-copy">수유<br /> 알아보기</span><ChevronRight className="home-guide-arrow" aria-hidden />
      </Link>
      <Link href={`/encyclopedia?tab=sleep&month=${month}`} scroll={false} className="home-guide home-guide--sleep" aria-label="잠 알아보기">
        <Image src="/images/home/moon.webp" alt="" aria-hidden width={128} height={148} className="home-guide-art" />
        <span className="home-guide-copy">잠<br /> 알아보기</span><ChevronRight className="home-guide-arrow" aria-hidden />
      </Link>
    </div>
  </section>;
}
