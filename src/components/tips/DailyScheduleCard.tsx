"use client";

import { useId } from "react";
import Link from "next/link";
import { ArrowRight, Bath, ChevronDown, Clock3, Milk, Moon, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReadingValue } from "@/components/reading/ReadingScope";
import { getScheduleForMonth, type DailySchedule } from "@/lib/data/daily-schedule-data";
import { nightWindows, scheduleSegments, splitAtMidnight } from "@/lib/utils/daily-schedule-view";

import ScheduleActivityList from "./ScheduleActivityList";

const types = {
  feed: { label: "수유", icon: Milk, color: "bg-rose-400", surface: "bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200" },
  meal: { label: "식사", icon: Milk, color: "bg-amber-400", surface: "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200" },
  nap: { label: "낮잠", icon: Moon, color: "bg-violet-400", surface: "bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-200" },
  sleep: { label: "수면", icon: Moon, color: "bg-indigo-400", surface: "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200" },
  play: { label: "놀이·돌봄", icon: Smile, color: "bg-blue-400", surface: "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200" },
  bath: { label: "목욕", icon: Bath, color: "bg-sky-400", surface: "bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200" },
};

function DayChart({ schedule }: { schedule: DailySchedule }) {
  const segments = scheduleSegments(schedule), night = nightWindows(schedule);
  const lanes = [{ label: "밤 시간", kinds: ["night"] }, { label: "낮잠", kinds: ["nap"] }, { label: "수유·식사", kinds: ["feed", "meal"] }, { label: "놀이·돌봄", kinds: ["play", "bath"] }];
  return <figure className="rounded-2xl border border-[var(--border)] bg-[var(--surface-bg)] p-4" aria-label="24시간 참고 일과 그래프">
    <figcaption className="mb-4 text-sm font-bold">하루 리듬 한눈에 <span className="ml-1 text-sm font-normal text-[var(--muted-foreground)]">시각 예시</span></figcaption>
    <div className="flex justify-between text-[11px] tabular-nums text-[var(--muted-foreground)]" aria-hidden>{["00", "06", "12", "18", "24"].map(t => <span key={t}>{t}</span>)}</div>
    <div className="mt-2 space-y-3" aria-hidden>{lanes.map(lane => <div key={lane.label} className="space-y-1.5"><span className="block break-words text-sm font-semibold">{lane.label}</span><div className="relative h-8 overflow-hidden rounded-lg bg-[var(--card)] ring-1 ring-[var(--border)]">
      {[25, 50, 75].map(left => <span key={left} className="absolute inset-y-0 border-l border-dashed border-[var(--border)]" style={{ left: `${left}%` }} />)}
      {lane.kinds[0] === "night" ? night.map((n, i) => <span key={i} className="absolute inset-y-0 border border-dashed border-indigo-300 bg-indigo-100/70 dark:border-indigo-700 dark:bg-indigo-950/80" style={{ left: `${n.start / 14.4}%`, width: `${(n.end - n.start) / 14.4}%`, backgroundImage: "repeating-linear-gradient(135deg,transparent,transparent 5px,rgba(99,102,241,.15) 5px,rgba(99,102,241,.15) 7px)" }} />) : segments.filter(s => lane.kinds.includes(s.type)).map(s => <span key={s.index}>{splitAtMidnight(s.start, s.maxEnd).map((p, i) => <span key={`max-${i}`} className={cn("absolute inset-y-1 rounded-sm opacity-25", types[s.type as keyof typeof types].color)} style={{ left: `${p.start / 14.4}%`, width: `${(p.end - p.start) / 14.4}%` }} />)}{splitAtMidnight(s.start, s.minEnd).map((p, i) => <span key={`min-${i}`} className={cn("absolute inset-y-1 rounded-sm", types[s.type as keyof typeof types].color)} style={{ left: `${p.start / 14.4}%`, width: `${(p.end - p.start) / 14.4}%` }} />)}</span>)}
    </div></div>)}</div>
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-5 text-[var(--muted-foreground)]"><span className="flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm bg-blue-400" />활동 시간 예시</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm bg-blue-400/25" />소요시간의 변동 범위</span></div>
    <p className="mt-3 text-sm leading-5 text-indigo-800 dark:text-indigo-200">빗금은 밤 시간대예요. 수면·깸·수유가 섞일 수 있으며 연속 수면을 뜻하지 않아요.</p>
    <p className="sr-only">시간축은 0시부터 24시까지입니다. 활동 막대는 명시된 소요시간을 나타냅니다. 빈 구간은 활동이 지정되지 않았으며, 밤 시간대는 실제 수면량이 아닙니다. 아래 목록에서 각 시각과 활동 시간을 확인할 수 있습니다.</p>
  </figure>;
}

export default function DailyScheduleCard({ month }: { month: number }) {
  const [isOpen, setIsOpen] = useReadingValue<boolean>("schedule:open", false);
  const [showGraph, setShowGraph] = useReadingValue<boolean>("schedule:v4:graph", false);
  const id = useId(), schedule = getScheduleForMonth(month);
  if (!schedule) return null;
  const responsive = schedule.mode === "responsive";
  return <section className="tips-card" data-reading-anchor="schedule" aria-label={`${month}개월 하루 리듬`}>
    <h3><button id={`${id}-title`} type="button" aria-expanded={isOpen} aria-controls={`${id}-body`} onClick={() => setIsOpen(!isOpen)} className="tips-row">
      <span aria-hidden className="flex size-[36px] shrink-0 items-center justify-center rounded-xl bg-[var(--surface-peach)] text-[var(--art-peach-ink)]"><Clock3 size={19} strokeWidth={1.8} /></span>
      <span className="tips-row-title">하루 리듬 살펴보기</span>
      <ChevronDown size={17} aria-hidden className="tips-chevron" />
    </button></h3>
    {responsive && <p className="px-3.5 pb-3 text-sm leading-relaxed text-[var(--muted-foreground)]"><strong className="font-semibold text-[var(--foreground)]">밤에도 깨거나 먹을 수 있어요.</strong> 통잠을 목표로 수유를 미루지 않아요. 아기의 상태와 의료진의 개별 안내가 우선이에요.</p>}
    <div id={`${id}-body`} role="region" aria-labelledby={`${id}-title`} hidden={!isOpen} className="tips-detail space-y-4">
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{responsive ? "시간표 대신, 자주 막히는 순간의 작은 요령" : "정해진 목표가 아닌, 조절해서 보는 일과 예시"}</p>
      <ScheduleActivityList schedule={schedule} />
      {!responsive && <div><button type="button" aria-expanded={showGraph} aria-controls={`${id}-graph`} onClick={() => setShowGraph(!showGraph)} className="tips-row bg-[var(--surface-sky)]"><span className="tips-row-title">하루 전체 그래프</span><ChevronDown size={16} aria-hidden className="tips-chevron" /></button><div id={`${id}-graph`} hidden={!showGraph} className="mt-3"><DayChart schedule={schedule} /><p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">시각·소요시간은 참고 예시예요. 낮잠·먹기의 권장 횟수나 연속 수면량이 아니에요. 다음 시각은 아기의 상태에 따라 달라져요.</p></div></div>}
      <nav aria-label="일과 관련 가이드" className="flex flex-wrap gap-x-5 gap-y-1">{[{ tab: "sleep", label: "수면 가이드" }, { tab: "feeding", label: "수유 가이드" }].map(link => <Link key={link.tab} href={`/encyclopedia?tab=${link.tab}&month=${month}`} scroll={false} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--brand)]">{link.label}<ArrowRight size={14} aria-hidden /></Link>)}</nav>
      <details className="border-t border-[var(--border)] pt-1 text-sm leading-6 text-[var(--muted-foreground)]"><summary className="min-h-11 cursor-pointer py-2.5">일과 예시 참고 자료</summary><p>돌봄 팁은 2026-11-06 공개 자료와 대조했어요. 월령별 시각과 수치는 참고 예시이며 개별 돌봄 안내를 우선해요.</p><a href="https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-medium text-[var(--brand)] underline">NHS · 아기 수면 안내 (새 창)</a><br /><a href="https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-medium text-[var(--brand)] underline">NIH · 안전한 수면 환경 (새 창)</a></details>
    </div>
  </section>;
}
