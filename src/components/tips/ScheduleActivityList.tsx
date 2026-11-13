"use client";

import { useId } from "react";
import { ChevronDown, Moon, Sun, Sunset } from "lucide-react";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import { getPracticalTip } from "@/lib/data/practical-tips-data";
import PracticalTipBody from "./PracticalTipBody";
import { cn } from "@/lib/utils";
import { useReadingValue } from "@/components/reading/ReadingScope";
import type { DailySchedule, ScheduleItem } from "@/lib/data/daily-schedule-data";
import { clockMinutes, schedulePeriodForTime, schedulePeriods } from "@/lib/utils/daily-schedule-view";

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
  const groups = [...schedulePeriods.map(p => ({ ...p, entries: items.filter(({ item }) => schedulePeriodForTime(item.time) === p.key) })),
    { key: "unspecified", label: "시각 미정", range: "", entries: items.filter(({ item }) => schedulePeriodForTime(item.time) === null) }]
    .filter(p => period === "all" || p.key === period)
    // Midnight entries precede morning when viewing the whole day.
    .sort((a, b) => a.key === "night" ? -1 : b.key === "night" ? 1 : 0);
  const count = groups.reduce((sum, group) => sum + group.entries.length, 0);
  const periodChoices = schedulePeriods.filter(p => p.key !== "night" || schedule.items.some(item => schedulePeriodForTime(item.time) === "night"));

  if (responsive) return <section aria-label="상황별 작은 요령" data-schedule-activities>
    <h4 className="mb-2 text-sm font-semibold">신호에 맞춰 돌보기</h4>
    <ol data-schedule-list aria-label="신호에 따른 돌봄 활동" className="divide-y divide-[var(--border)]">
      {schedule.items.map((item, index) => {
        const open = expanded === String(index);
        const tip = getPracticalTip(item.practicalKey || "");
        const art = (["feeding", "cloud", "play", "sleep"] as const)[index] ?? "cloud";
        const panel = `${id}-item-${index}`;
        return <li key={index} data-reading-anchor={`schedule:item:${index}`}>
          <button id={`${panel}-title`} type="button" aria-expanded={open} aria-controls={panel} onClick={() => setExpanded(open ? null : String(index))} className="tips-row">
            <TopicArtwork kind={art} className="h-8 w-8" />
            <span className="tips-row-title">{item.activity}</span>
            <ChevronDown size={16} className="tips-chevron" aria-hidden />
          </button>
          <div id={panel} role="region" aria-labelledby={`${panel}-title`} hidden={!open} className="tips-detail">
            {tip ? <PracticalTipBody tip={tip} /> : <p className="whitespace-pre-line text-base leading-[1.65]">{item.tip}</p>}
          </div>
        </li>;
      })}
    </ol>
  </section>;

  return <section aria-labelledby={`${id}-title`} data-schedule-activities className="@container space-y-2.5">
    <div>
      <h4 id={`${id}-title`} className="text-base font-semibold">시간대별로 살펴보기</h4>
      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">시간대를 고르고, 활동을 눌러 돌봄 팁을 확인해요.</p>
    </div>

    <div role="group" aria-label="일과 시간대 선택" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,4.5rem),1fr))] gap-1.5">
      {periodChoices.map(p => {
        const Icon = p.key === "morning" ? Sun : p.key === "afternoon" ? Sunset : Moon;
        return <button key={p.key} type="button" aria-label={`${p.label} ${p.range}`} aria-pressed={period === p.key} onClick={() => setPeriod(p.key)} className="tips-pill flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-center">
          <span className="flex flex-wrap items-center justify-center gap-1 font-semibold"><Icon size={14} aria-hidden />{p.label}</span>
          <span className="text-xs leading-snug tabular-nums">{p.range}</span>
        </button>;
      })}
    </div>

    <div role="group" aria-label="일과 활동 필터" className="flex flex-wrap gap-1.5">
      {filters.map(f => <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)} className="tips-pill tips-filter">{f.label}</button>)}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-x-2">
      <p role="status" aria-live="polite" aria-atomic="true" className="py-2 text-sm leading-6 text-[var(--muted-foreground)]">
        <span className="font-semibold text-[var(--foreground)]">{period === "all" ? "하루 전체" : schedulePeriods.find(p => p.key === period)?.label}</span> · {count}개 활동{filter !== "all" && ` · ${filters.find(f => f.key === filter)?.label ?? "전체"}`}
      </p>
      <button type="button" aria-pressed={period === "all"} onClick={() => setPeriod(period === "all" ? "morning" : "all")} className="inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-semibold text-[var(--brand)] underline decoration-[var(--brand)]/40 underline-offset-4">{period === "all" ? "오전만 보기" : "하루 전체"}</button>
    </div>

    <div data-schedule-list className="space-y-2">
      {groups.filter(group => group.entries.length > 0).map(group => <div key={group.key}>
        <h5 className="flex flex-wrap items-baseline gap-x-2 border-b border-[var(--border)] px-1 py-2 text-sm leading-6"><span className="font-semibold">{group.label}</span><span className="text-[var(--muted-foreground)]">{group.range}</span></h5>
        <ol aria-label={`${group.label} 활동`} className="divide-y divide-[var(--border)]">
          {group.entries.map(({ item, index }) => {
            const config = activityTypes[item.type];
            const open = expanded === String(index);
            const duration = item.duration && item.duration !== "~" ? item.duration : null;
            const title = duration ? item.activity.replace(` (${duration})`, "") : item.activity;
            const panel = `${id}-item-${index}`;
            const tip = getPracticalTip(item.practicalKey || "");
            return <li key={index} data-reading-anchor={`schedule:item:${index}`}>
              <button id={`${panel}-title`} type="button" aria-expanded={open} aria-controls={panel} onClick={() => setExpanded(open ? null : String(index))} className="tips-row tips-timeline-row">
                <span className="tips-timeline-time text-sm font-bold leading-6 tabular-nums text-[var(--brand)]">{clockMinutes(item.time) === null ? item.time : <time dateTime={item.time}>{item.time}</time>}</span>
                <span className="min-w-0 flex-1">
                  <span className="tips-row-title">{title}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-snug text-[var(--muted-foreground)]"><span className="inline-flex items-center gap-1.5"><span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)} />{config.label}</span>{duration && <span>{duration}</span>}</span>
                </span>
                <ChevronDown size={16} className="tips-chevron" aria-hidden />
              </button>
              <div id={panel} role="region" aria-labelledby={`${panel}-title`} hidden={!open} className="tips-detail">
                {tip ? <PracticalTipBody tip={tip} /> : <p className="whitespace-pre-line break-words text-base leading-[1.65]">{item.tip || "아기의 신호와 개별 돌봄 안내에 맞춰 조절해주세요."}</p>}
              </div>
            </li>;
          })}
        </ol>
      </div>)}
      {!count && <div className="px-1 py-2 text-sm leading-6 text-[var(--muted-foreground)]"><p>이 조건에 맞는 예시 활동이 없어요. 실제 돌봄은 아기의 신호를 따라주세요.</p>{period !== "all" && <button type="button" onClick={() => setPeriod("all")} className="mt-1 min-h-11 font-semibold text-[var(--brand)] underline">모든 시간대에서 찾아보기</button>}{filter !== "all" && <button type="button" onClick={() => setFilter("all")} className="mt-1 block min-h-11 font-semibold text-[var(--brand)] underline">활동 필터 초기화</button>}</div>}
    </div>
  </section>;
}

