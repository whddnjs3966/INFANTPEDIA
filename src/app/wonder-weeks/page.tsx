"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, Sparkles } from "lucide-react";
import { useBabyStore } from "@/lib/store/baby-store";
import { getAllWonderWeeks } from "@/lib/queries/months";

interface WonderTopic {
  id: number;
  title: string;
}

export default function WonderWeeksPage() {
  const month = useBabyStore(state => state.getMonthsOld());
  const [retry, setRetry] = useState(0);
  const [topics, setTopics] = useState<WonderTopic[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getAllWonderWeeks({ throwOnError: true, signal: controller.signal })
      .then(rows => { if (!controller.signal.aborted) setTopics(rows); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [retry]);

  return (
    <div className="min-h-screen space-y-4 px-5 pb-10 pt-safe [overflow-wrap:anywhere]" style={{ backgroundColor: "var(--surface-bg)" }}>
      <Link href="/" className="inline-flex min-h-12 items-center gap-1 rounded-xl text-sm font-semibold text-[var(--brand)]"><ChevronLeft size={18} aria-hidden />홈으로</Link>
      <header className="rounded-3xl bg-[var(--surface-lavender)] p-5">
        <Sparkles size={21} aria-hidden className="mb-2 text-[var(--brand)]" />
        <h1 className="text-[1.375rem] font-bold leading-snug">원더윅스 살펴보기</h1>
        <p className="mt-2 text-base leading-7">원더윅스는 아기의 행동이 일정한 시기에 달라진다는 가설이에요. 발달 변화가 나타나는 시기는 아기마다 다르고, 정해진 주차로 개별 아기의 변화를 예측할 근거는 제한적이에요.</p>
      </header>

      <section className="surface-card space-y-2 p-5" aria-labelledby="observe-development">
        <h2 id="observe-development" className="text-base font-bold">아기의 변화를 관찰해 보세요</h2>
        <p className="text-base leading-7">평소와 달라진 움직임이나 반응을 짧게 기록해 보세요. 이전에 하던 행동을 잃거나 발달이 걱정되면 소아청소년과에 상담해 주세요.</p>
        <Link href={`/encyclopedia?tab=milestone&month=${month}`} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-[var(--brand)] underline underline-offset-4">월령별 발달 관찰 보기</Link>
      </section>

      <details className="surface-card group px-5">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 py-2 font-semibold">
          <span>원더윅스에서 소개한 주제</span>
          <ChevronDown size={18} aria-hidden className="shrink-0 group-open:rotate-180" />
        </summary>
        <div className="border-t border-[var(--border)] pb-4 pt-3">
          {failed ? <div>
            <p role="status">주제를 불러오지 못했어요.</p>
            <button type="button" className="min-h-11 text-sm font-semibold text-[var(--brand)]" onClick={() => { setFailed(false); setRetry(value => value + 1); }}>다시 시도</button>
          </div> : !topics ? <p role="status">주제를 불러오는 중이에요.</p> : topics.length === 0 ? <p>표시할 주제가 없어요.</p> :
            <ul className="grid gap-2 sm:grid-cols-2">{topics.map(topic => <li key={topic.id} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm">{topic.title}</li>)}</ul>}
        </div>
      </details>

      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-[var(--brand)]">
        <a href="https://pubmed.ncbi.nlm.nih.gov/26971740/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">원더윅스 가설 관련 논문</a>
        <a href="https://www.cdc.gov/act-early/milestones/index.html" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">CDC 발달 관찰 자료</a>
      </p>
    </div>
  );
}
