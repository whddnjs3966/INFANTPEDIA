"use client";

import { useId, useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useReadingValue } from "@/components/reading/ReadingScope";
import TopicArtwork from "@/components/illustrations/TopicArtwork";
import type { GuideArtworkKind } from "@/components/illustrations/GuideArtwork";
import { domainInfo, getMilestonesForMonth, type MilestoneDomain } from "@/lib/data/milestone-data";
import { useBabyStore } from "@/lib/store/baby-store";
import { activeMilestoneProgress, useMilestoneStore } from "@/lib/store/milestone-store";
import { cn } from "@/lib/utils";
import MilestoneItemRow from "./MilestoneItemRow";

const domains: { id: MilestoneDomain; art: GuideArtworkKind }[] = [
  { id: "gross_motor", art: "rattle" },
  { id: "fine_motor", art: "play" },
  { id: "language", art: "book" },
  { id: "social", art: "cloud" },
];

export default function MilestoneChecklist({ month }: { month: number }) {
  const id = useId();
  const [openDomain, setOpenDomain] = useReadingValue<MilestoneDomain | null>("milestone:domain", null);
  const profile = useBabyStore(state => state.profile);
  const store = useMilestoneStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState("");
  const { completedMilestones, completedDates } = activeMilestoneProgress(store);
  const milestones = getMilestonesForMonth(month)?.milestones ?? [];
  const completedCount = milestones.filter(item => completedMilestones[item.id]).length;

  if (!milestones.length) {
    return <p className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)]">이 월령의 발달 이정표 데이터가 없습니다.</p>;
  }

  function resetMonth() {
    if (!profile) return;
    store.resetMonth(month, profile.id);
    setConfirmReset(false);
  }

  return <div className="@container space-y-3 pb-6">
    <section aria-label="발달 관찰 기록" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 pb-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3">
        <p className="min-w-0 py-2 text-base font-semibold">
          관찰한 변화 <span className="tabular-nums text-[var(--brand)]">{completedCount}/{milestones.length}</span>
        </p>
        <button type="button" disabled={!profile || completedCount === 0} title="이 월령 초기화" onClick={() => setConfirmReset(true)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[var(--muted-foreground)] disabled:opacity-50">
          <RotateCcw size={14} aria-hidden />초기화
        </button>
      </div>
      <div role="progressbar" aria-label="관찰한 발달 변화" aria-valuemin={0} aria-valuemax={milestones.length} aria-valuenow={completedCount} className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${completedCount / milestones.length * 100}%` }} />
      </div>
      <p className="mt-2 text-sm leading-[1.6] text-[var(--muted-foreground)]">
        {profile ? `${profile.name}의 관찰 기록이에요. 관찰한 날짜를 기록해요.` : "아기를 등록하면 관찰 날짜를 기록할 수 있어요."}
      </p>
    </section>
    {notice && <p role="status" className="rounded-xl bg-[var(--accent-soft)] px-3.5 py-3 text-sm font-semibold leading-[1.6] text-[var(--brand)]">{notice}</p>}
    {confirmReset && <div role="alert" className="rounded-xl border border-amber-300 bg-[var(--card)] p-4 text-sm dark:border-amber-800">
      <p>{profile?.name}의 {month}개월 관찰 기록만 초기화할까요?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-lg border border-[var(--border)] px-3" onClick={() => setConfirmReset(false)}>취소</button>
        <button type="button" className="min-h-11 rounded-lg bg-amber-800 px-3 text-white dark:bg-amber-300 dark:text-amber-950" onClick={resetMonth}>관찰 기록 초기화</button>
      </div>
    </div>}
    {domains.map(({ id: domain, art }) => {
      const items = milestones.filter(item => item.domain === domain);
      if (!items.length) return null;
      const count = items.filter(item => completedMilestones[item.id]).length;
      const isOpen = openDomain === domain;
      const heading = `${id}-${domain}-heading`;
      const body = `${id}-${domain}-body`;
      return <section key={domain} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]">
        <h3>
          <button id={heading} type="button" aria-expanded={isOpen} aria-controls={body} onClick={() => setOpenDomain(isOpen ? null : domain)} className={cn("flex min-h-14 w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left", isOpen && "rounded-b-none bg-[var(--surface-sky)]")}>
            <TopicArtwork kind={art} className="h-9 w-9 rounded-xl @max-[14rem]:hidden" />
            <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="break-words text-base font-semibold">{domainInfo[domain].label}</span>
              <span className="text-sm tabular-nums text-[var(--muted-foreground)]">{count}/{items.length}</span>
            </span>
            <ChevronDown size={17} aria-hidden className={cn("shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 motion-reduce:transition-none", isOpen && "rotate-180 text-[var(--brand)]")} />
          </button>
        </h3>
        <div id={body} role="region" aria-labelledby={heading} hidden={!isOpen} className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {isOpen && items.map(milestone => <MilestoneItemRow
            key={milestone.id}
            milestone={milestone}
            isCompleted={!!completedMilestones[milestone.id]}
            completedDate={completedDates[milestone.id]}
            onNotice={setNotice}
          />)}
        </div>
      </section>;
    })}
  </div>;
}