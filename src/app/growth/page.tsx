"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyStore } from "@/lib/store/baby-store";
import RecordBabySelector from "@/components/growth/RecordBabySelector";
import "./growth.css";

const GrowthChart = dynamic(() => import("@/components/growth/GrowthChart"), { ssr: false });
const VaccinationSchedule = dynamic(() => import("@/components/growth/VaccinationSchedule"), { ssr: false });
type TabType = "growth" | "vaccination";

export default function GrowthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profile = useBabyStore((state) => state.profile);
  const currentMonth = useBabyStore((state) => state.getMonthsOld());
  const realMonth = useBabyStore((state) => state.getRealMonthsOld());
  const activeTab: TabType = searchParams.get("record") === "add" ? "growth" : searchParams.get("tab") === "vaccination" ? "vaccination" : "growth";

  const selectTab = (tab: TabType) => {
    if (activeTab === tab && !searchParams.has("record")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("record");
    router.push(`/growth?${params}`, { scroll: false });
  };

  return (
    <div data-growth-redesign className="min-h-screen">
      <header data-page-header className="record-header">
        <h1 className="text-[1.375rem] font-bold leading-snug tracking-tight">성장 기록</h1>
        <div className="mt-3 flex items-center gap-2">
          <RecordBabySelector />
          <Link href="/search" className="header-action" aria-label="육아 정보 검색">
            <Search size={19} strokeWidth={1.8} aria-hidden />
          </Link>
        </div>
      </header>
      <div className="record-sticky-tabs sticky top-0 z-20 py-2 backdrop-blur-lg">
        <div role="group" aria-label="성장 기록 종류 선택" className="flex gap-1 rounded-2xl bg-[var(--surface-muted)] p-1">
          {([{ id: "growth", label: "성장 그래프" }, { id: "vaccination", label: "예방접종" }] as const).map((tab) => (
            <button key={tab.id} type="button" aria-pressed={activeTab === tab.id} onClick={() => selectTab(tab.id)} className={cn("min-h-11 min-w-0 flex-1 rounded-xl px-2 py-1.5 text-sm font-semibold transition-colors motion-reduce:transition-none", activeTab === tab.id ? "bg-[var(--brand)] text-[var(--brand-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--card)]")}>{tab.label}</button>
          ))}
        </div>
      </div>
      <div className="mt-2">{activeTab === "growth" ? <GrowthChart key={profile?.id || "no-baby"} currentMonth={currentMonth} /> : <VaccinationSchedule key={profile?.id || "no-baby"} currentMonth={realMonth} />}</div>
    </div>
  );
}

