"use client";

import { useId } from "react";
import { ChevronDown, Lightbulb, List, Moon, Sun, Sunset, ArrowUpRight } from "lucide-react";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import { getPracticalTip } from "@/lib/data/practical-tips-data";
import PracticalTipBody from "./PracticalTipBody";
import { cn } from "@/lib/utils";
import { useReadingValue } from "@/components/reading/ReadingScope";
import type { DailySchedule, ScheduleItem } from "@/lib/data/daily-schedule-data";
import { schedulePeriodForTime, schedulePeriods } from "@/lib/utils/daily-schedule-view";

const activityTypes = {
  feed: { label: "수유", dot: "bg-rose-500" },
  meal: { label: "식사", dot: "bg-amber-500" },
  nap: { label: "낮잠", dot: "bg-violet-500" },
  sleep: { label: "수면", dot: "bg-indigo-500" },
  play: { label: "놀이·돌봄", dot: "bg-blue-500" },
  bath: { label: "목욕", dot: "bg-sky-500" },
};

const filters = [
  { key: "all", label: "전체" },
  { key: "feed", label: "수유·식사" },
  { key: "sleep", label: "잠" },
  { key: "care", label: "놀이·돌봄" },
];

function matchesActivity(item: ScheduleItem, filter: string) {
  if (filter === "feed") return item.type === "feed" || item.type === "meal";
  if (filter === "sleep") return item.type === "nap" || item.type === "sleep";
  if (filter === "care") return item.type === "play" || item.type === "bath";
  return true;
}

export default function ScheduleActivityList({ schedule }: { schedule: DailySchedule }) {
  const id = useId();
  const responsive = schedule.mode === "responsive";
  const [storedPeriod, setPeriod] = useReadingValue<string>("schedule:v3:period", "morning");
  const [expanded, setExpanded] = useReadingValue<string | null>("schedule:v2:item", null);
  const [filter, setFilter] = useReadingValue<string>("schedule:v2:filter", "all");
  const period = ["all", ...schedulePeriods.map(p => p.key)].includes(storedPeriod) ? storedPeriod : "morning";
  const items = schedule.items.map((item, index) => ({ item, index })).filter(({ item }) => matchesActivity(item, filter));
  const groups = responsive
    ? [{ key: "signals", label: "신호에 따른 돌봄", range: "", entries: items }]
    : [...schedulePeriods.map(p => ({ ...p, entries: items.filter(({ item }) => schedulePeriodForTime(item.time) === p.key) })),
      { key: "unspecified", label: "시각 미정", range: "", entries: items.filter(({ item }) => schedulePeriodForTime(item.time) === null) }]
      .filter(p => period === "all" || p.key === period)
      // Midnight entries precede morning when viewing the whole day.
      .sort((a, b) => a.key === "night" ? -1 : b.key === "night" ? 1 : 0);
  const count = groups.reduce((sum, group) => sum + group.entries.length, 0);
  const periodChoices = schedulePeriods.filter(p => p.key !== "night" || schedule.items.some(item => schedulePeriodForTime(item.time) === "night"));

  if (responsive) return <section aria-label="상황별 작은 요령" data-schedule-activities className="@container">
    <p className="mb-3 text-sm font-medium text-[var(--muted-foreground)]">궁금한 순간을 골라보세요</p>
    <ol data-schedule-list aria-label="신호에 따른 돌봄 활동" className="grid grid-cols-2 gap-2.5 @max-[16rem]:grid-cols-1">
      {schedule.items.map((item, index) => { const open = expanded === String(index), tip = getPracticalTip(item.practicalKey || ""), art = (["feeding", "cloud", "play", "sleep"] as const)[index] ?? "cloud"; return <li key={index} data-reading-anchor={`schedule:item:${index}`} className={cn("min-w-0 overflow-hidden rounded-[20px] bg-[var(--surface-bg)]", open && "col-span-full ring-1 ring-[var(--brand)]/20")}>
        <button type="button" aria-expanded={open} aria-controls={`${id}-item-${index}`} onClick={() => setExpanded(open ? null : String(index))} className="flex min-h-36 w-full flex-col p-4 text-left"><span className="mb-3 flex w-full items-center justify-between gap-2"><TopicArtwork kind={art} className="h-[48px] w-[48px]" /><ArrowUpRight size={16} aria-hidden className={cn("shrink-0 text-[var(--muted-foreground)] transition-transform motion-reduce:transition-none", open && "rotate-90")} /></span><span className="block break-words text-base font-semibold leading-6 tracking-tight">{item.activity}</span></button>
        <div id={`${id}-item-${index}`} hidden={!open} className="px-4 pb-4">{tip ? <><p className="mb-4 text-base font-semibold leading-7 text-[var(--brand)]">{tip.takeaway}</p><PracticalTipBody tip={tip} /></> : <p className="whitespace-pre-line text-base leading-7">{item.tip}</p>}</div>
      </li>; })}
    </ol>
  </section>;

  return <section aria-labelledby={`${id}-title`} data-schedule-activities className="@container space-y-3">
    <div>
      <h4 id={`${id}-title`} className="text-base font-bold">{responsive ? "신호에 맞춰 돌보기" : "시간대별로 살펴보기"}</h4>
      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{responsive ? "활동을 누르면 돌봄 팁을 볼 수 있어요." : "시간대를 고르고, 활동을 눌러 돌봄 팁을 확인해요."}</p>
    </div>

    {!responsive && <div role="group" aria-label="일과 시간대 선택" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,5rem),1fr))] gap-1 rounded-2xl bg-[var(--surface-muted)] p-1">
      {periodChoices.map(p => {
        const Icon = p.key === "morning" ? Sun : p.key === "afternoon" ? Sunset : Moon;
        return <button key={p.key} type="button" aria-pressed={period === p.key} onClick={() => setPeriod(p.key)} className={cn("flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center transition-colors", period === p.key ? "bg-[var(--card)] text-[var(--brand)] shadow-sm" : "text-[var(--foreground)] hover:bg-[var(--accent-soft)]")}>
          <span className="flex flex-wrap items-center justify-center gap-1 text-base font-bold"><Icon size={16} aria-hidden />{p.label}</span>
          <span className="text-sm leading-5 tabular-nums">{p.range}</span>
        </button>;
      })}
    </div>}

    <div role="group" aria-label="일과 활동 필터" className="flex flex-wrap gap-1.5">
      {filters.map(f => <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)} className={cn("min-h-11 rounded-full px-3 py-2 text-sm font-semibold transition-colors", filter === f.key ? "bg-[var(--accent-soft)] text-[var(--brand)]" : "bg-[var(--surface-bg)] text-[var(--muted-foreground)] hover:bg-[var(--surface-bg)]")}>{f.label}</button>)}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-x-2">
      <p role="status" aria-live="polite" aria-atomic="true" className="py-2 text-sm leading-6 text-[var(--muted-foreground)]">
        <span className="font-semibold text-[var(--foreground)]">{responsive ? "돌봄 흐름" : period === "all" ? "하루 전체" : schedulePeriods.find(p => p.key === period)?.label}</span> · {count}개 활동{filter !== "all" && ` · ${filters.find(f => f.key === filter)?.label ?? "전체"}`}
      </p>
      {!responsive && <button type="button" aria-pressed={period === "all"} onClick={() => setPeriod(period === "all" ? "morning" : "all")} className="inline-flex min-h-12 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-[var(--brand)] underline decoration-[var(--brand)]/40 underline-offset-4"><List size={16} aria-hidden />{period === "all" ? "오전만 보기" : "하루 전체"}</button>}
    </div>

    <div data-schedule-list className="overflow-hidden">
      {groups.filter(group => group.entries.length > 0).map(group => <div key={group.key}>
        {!responsive && <h5 className="flex flex-wrap items-baseline gap-x-2 border-b border-[var(--border)] bg-[var(--surface-bg)] px-3 py-2.5 text-sm leading-6"><span className="font-bold">{group.label}</span><span className="text-[var(--muted-foreground)]">{group.range}</span></h5>}
        <ol aria-label={responsive ? "신호에 따른 돌봄 활동" : `${group.label} 활동`} className="divide-y divide-[var(--border)]">
          {group.entries.map(({ item, index }) => {
            const config = activityTypes[item.type], open = expanded === String(index);
            const duration = item.duration && item.duration !== "~" ? item.duration : null;
            const title = duration ? item.activity.replace(` (${duration})`, "") : item.activity;
            return <li key={index} data-reading-anchor={`schedule:item:${index}`}>
              <button type="button" aria-expanded={open} aria-controls={`${id}-item-${index}`} onClick={() => setExpanded(open ? null : String(index))} className={cn("grid min-h-16 w-full items-start gap-x-3 gap-y-1 px-3 py-3 text-left transition-colors hover:bg-[var(--surface-bg)]", responsive ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-[3.5rem_minmax(0,1fr)_auto] @max-[16rem]:grid-cols-[minmax(0,1fr)_auto]", open && "bg-[var(--accent-soft)]")}>
                {!responsive && <time dateTime={item.time} className="pt-0.5 text-base font-bold leading-6 tabular-nums @max-[16rem]:col-span-2">{item.time}</time>}
                <span className="min-w-0 flex-1">
                  {responsive && <span className="mb-1 block text-sm leading-6 text-[var(--muted-foreground)]">{item.time}</span>}
                  <span className="block break-words text-base font-semibold leading-6">{title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5 text-[var(--muted-foreground)]"><span className="inline-flex items-center gap-1.5"><span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)} />{config.label}</span>{duration && <span>{duration}</span>}</span>
                </span>
                <ChevronDown size={17} aria-hidden className={cn("mt-1 shrink-0 text-[var(--muted-foreground)] transition-transform motion-reduce:transition-none", open && "rotate-180")} />
              </button>
              <div id={`${id}-item-${index}`} hidden={!open} className="rounded-2xl bg-[var(--surface-bg)] px-4 py-4">
                {getPracticalTip(item.practicalKey || "") ? <PracticalTipBody tip={getPracticalTip(item.practicalKey || "")!} /> : <><p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[var(--brand)]"><Lightbulb size={16} aria-hidden />돌봄 팁</p><p className="whitespace-pre-line break-words text-base leading-7">{item.tip || "아기의 신호와 개별 돌봄 안내에 맞춰 조절해주세요."}</p></>}
              </div>
            </li>;
          })}
        </ol>
      </div>)}
      {!count && <div className="p-4 text-sm leading-6 text-[var(--muted-foreground)]"><p>이 조건에 맞는 예시 활동이 없어요. 실제 돌봄은 아기의 신호를 따라주세요.</p>{!responsive && period !== "all" && <button type="button" onClick={() => setPeriod("all")} className="mt-2 min-h-12 font-semibold text-[var(--brand)] underline">모든 시간대에서 찾아보기</button>}{filter !== "all" && <button type="button" onClick={() => setFilter("all")} className="mt-2 block min-h-12 font-semibold text-[var(--brand)] underline">활동 필터 초기화</button>}</div>}
    </div>
  </section>;
}

