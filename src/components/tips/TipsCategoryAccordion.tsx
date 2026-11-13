"use client";
import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import { useReadingValue } from "@/components/reading/ReadingScope";
import FormattedContent from "@/components/ui/FormattedContent";
import HealthFAQEvidence from "@/components/encyclopedia/HealthFAQEvidence";
import type { HealthEvidence } from "@/lib/data/health-faq-data";
import type { PracticalTip } from "@/lib/data/practical-tips-data";
import PracticalTipBody from "./PracticalTipBody";

interface Tip { evidence?: HealthEvidence; practical?: PracticalTip; id: number; title: string; content: string; category: string; month_id: number; }

const categories = [
  { key: "sleep_tips", label: "잠", short: "잠", icons: ["sleep", "moon"], feature: "잠들기 전 루틴", caption: "부담 없이 이어가는 작은 준비", tip: "sleep-reset" },
  { key: "feeding_tips", label: "먹기", short: "먹기", icons: ["feeding", "solids"], feature: "젖병으로 먹일 때", caption: "자세와 흐르는 속도 살펴보기", tip: "bottle-flow" },
  { key: "crying_tips", label: "교감·달래기", short: "교감", icons: ["play", "rattle"], feature: "아기와 대화하는 시간", caption: "작은 소리와 표정에 답하기", tip: "turn-talk" },
  { key: "outing_tips", label: "외출", short: "외출", icons: ["outing", "storage"], feature: "기저귀 가방 준비", caption: "자주 쓰는 물건을 한곳에", tip: "bag" },
] as const;

export default function TipsCategoryAccordion({ tips, month }: { tips: Tip[]; month: number }) {
  const [storedCategory, setCategory] = useReadingValue<string | null>("tips:category", null);
  const [openTip, setOpenTip] = useReadingValue<string | null>("tips:v4:detail", null);
  const active = categories.find(category => category.key === storedCategory) ?? categories[0];
  const id = useId();
  const items = tips.filter(tip => tip.category === active.key);

  return <section aria-labelledby="month-tips-heading" className="space-y-3.5" data-practical-topics>
    <div role="group" aria-label="팁 주제 선택" className="tips-topics">
      {categories.map(({ key, label, short }) => <button key={key} type="button" aria-label={label} aria-pressed={active.key === key} onClick={() => setCategory(key)} className="tips-pill">{short}</button>)}
    </div>
    <Link href={`/tips?month=${month}&tip=${active.tip}`} className="tips-feature">
      {active.key === "sleep_tips" ? <Image src="/images/home/moon.webp" alt="" data-feature-art width={55} height={55} className="h-[55px] w-[55px] object-contain" /> : <span data-feature-art className="h-[55px] w-[55px]"><TopicArtwork kind={active.icons[0]} className="h-full w-full" /></span>}
      <span className="min-w-0">
        <span className="block break-words text-base font-bold leading-snug">{active.feature}</span>
        <span className="mt-1 block break-words text-sm leading-snug text-[var(--muted-foreground)]">{active.caption}</span>
      </span>
      <ChevronRight size={17} aria-hidden />
    </Link>
    <div className="space-y-2">
      <h2 id="month-tips-heading" className="tips-heading">궁금한 순간 골라보기</h2>
      <p className="sr-only" role="status">{active.label} 팁 {items.length}개</p>
      {items.length ? items.map((tip, index) => {
        const open = openTip === String(tip.id);
        const panel = `${id}-${tip.id}`;
        return <article key={tip.id} data-reading-anchor={`tips:item:${tip.id}`} className="tips-card">
          <h3><button id={`${panel}-title`} type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpenTip(open ? null : String(tip.id))} className="tips-row">
            <TopicArtwork kind={active.icons[index % active.icons.length]} className="h-9 w-9" />
            <span className="tips-row-title">{tip.title}</span>
            <ChevronDown className="tips-chevron" size={17} aria-hidden />
          </button></h3>
          <div id={panel} role="region" aria-labelledby={`${panel}-title`} hidden={!open} className="tips-detail">
            {tip.practical ? <PracticalTipBody tip={tip.practical} /> : <>
              <FormattedContent content={tip.content} variant="prose" />
              {tip.evidence && <HealthFAQEvidence evidence={tip.evidence} />}
            </>}
          </div>
        </article>;
      }) : <p className="text-sm leading-6 text-[var(--muted-foreground)]">이 월령의 팁이 아직 없어요. 다른 주제를 골라보세요.</p>}
    </div>
  </section>;
}
