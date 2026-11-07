"use client";

import TopicArtwork from "@/components/illustrations/TopicArtwork";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useBabyStore } from "@/lib/store/baby-store";
import PageHeader from "@/components/layout/PageHeader";

import RecordBabySelector from "@/components/growth/RecordBabySelector";

const GrowthChart = dynamic(() => import("@/components/growth/GrowthChart"), { ssr: false });
const VaccinationSchedule = dynamic(() => import("@/components/growth/VaccinationSchedule"), { ssr: false });
type TabType = "growth" | "vaccination";

export default function GrowthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profile = useBabyStore((state) => state.profile);
  const currentMonth = useBabyStore((state) => state.getMonthsOld());
  const activeTab: TabType = searchParams.get("record") === "add" ? "growth" : searchParams.get("tab") === "vaccination" ? "vaccination" : "growth";

  const selectTab = (tab: TabType) => {
    if (activeTab === tab && !searchParams.has("record")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("record");
    router.push(`/growth?${params}`, { scroll: false });
  };

  return (
    <div className="min-h-screen dark:bg-[var(--background)]">
      <PageHeader eyebrow={profile?.name ? `${profile.name}의 기록` : "성장 기록"} title="성장 기록" description="성장 변화와 예방접종 기록을 확인하고 추가하세요." />
      <RecordBabySelector />
      <div className="sticky top-0 z-20 bg-[var(--surface-bg)]/95 px-5 pt-1 pb-5 backdrop-blur-lg">
        <div role="group" aria-label="성장 기록 종류 선택" className="@container flex gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5">
          {([{ id: "growth", label: "성장 그래프", art: "record" }, { id: "vaccination", label: "예방접종", art: "health" }] as const).map((tab) => {
            return (
              <button key={tab.id} type="button" aria-pressed={activeTab === tab.id} onClick={() => selectTab(tab.id)} className={cn("flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-2 text-base font-semibold transition-colors @max-[20rem]:flex-col @max-[20rem]:py-2", activeTab === tab.id ? "bg-[var(--accent-soft)] text-[var(--brand)]" : "text-[var(--muted-foreground)] hover:bg-[var(--surface-bg)]")}><TopicArtwork kind={tab.art} className="h-[40px] w-[40px]" />{tab.label}</button>
            );
          })}
        </div>
      </div>
      <div className="px-5">{activeTab === "growth" ? <GrowthChart key={profile?.id || "no-baby"} currentMonth={currentMonth} /> : <VaccinationSchedule key={profile?.id || "no-baby"} currentMonth={currentMonth} />}</div>
    </div>
  );
}

