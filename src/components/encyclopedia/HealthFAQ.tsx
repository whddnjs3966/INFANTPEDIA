"use client";

import { useId, useMemo, useRef } from "react";
import { BookOpen, ChevronDown, CircleHelp, Search, ShieldAlert, Stethoscope, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFAQsForMonth, faqCategories, type FAQCategory } from "@/lib/data/health-faq-data";
import { useReadingValue } from "@/components/reading/ReadingScope";
import EmphasizedText from "@/components/ui/EmphasizedText";
import { healthEvidenceView } from "@/lib/utils/health-evidence-view";
import HealthFAQEvidence from "./HealthFAQEvidence";
import HealthCareAnswer from "./HealthCareAnswer";
import EmergencyCareNotice from "./EmergencyCareNotice";

const groups = [
  { key: "emergency" as const, label: "먼저 확인할 정보", icon: ShieldAlert, color: "text-[var(--content-urgent)]" },
  { key: "caution" as const, label: "진료·상담과 돌봄", icon: Stethoscope, color: "text-[var(--content-caution)]" },
  { key: "info" as const, label: "알아두면 좋은 정보", icon: CircleHelp, color: "text-[var(--brand)]" },
];

export default function HealthFAQ({ month }: { month: number }) {
  const id = useId();
  const filterRef = useRef<HTMLButtonElement>(null);
  const [storedCategory, setCategory] = useReadingValue<FAQCategory | "all">("health:category", "all");
  const category = faqCategories.some(c => c.id === storedCategory) ? storedCategory : "all";
  const [query, setQuery] = useReadingValue<string>("health:query", "");
  const [open, setOpen] = useReadingValue<string | null>("health:open", null);
  const [urgentOnly, setUrgentOnly] = useReadingValue<boolean>("health:urgent", false);
  const [expanded, setExpanded] = useReadingValue<Record<string, boolean>>("health:groups", {});
  const [filtersOpen, setFiltersOpen] = useReadingValue<boolean>("health:filters", false);
  const monthFAQs = useMemo(() => getFAQsForMonth(month), [month]);
  const keyword = query.trim().toLowerCase();
  const filtered = monthFAQs.filter(f => (category === "all" || f.category === category) && (!urgentOnly || f.urgency === "emergency") && (!keyword || [f.question, f.answer, ...f.tags].some(s => s.toLowerCase().includes(keyword))));
  const linked = monthFAQs.filter(f => f.evidence?.sources.length).length;
  const categoryLabel = faqCategories.find(c => c.id === category)?.label ?? "전체";
  function reset() { setQuery(""); setCategory("all"); setUrgentOnly(false); setOpen(null); setExpanded({}); setFiltersOpen(false); }

  return <div className="space-y-3 pb-6" data-health-faq onKeyDown={event => {
    if (event.key === "Escape" && filtersOpen) { setFiltersOpen(false); filterRef.current?.focus(); }
  }}>
    <EmergencyCareNotice />
    <div>
      <label htmlFor={`${id}-search`} className="sr-only">증상이나 궁금한 점 검색</label>
      <div className="relative">
        <Search size={19} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input id={`${id}-search`} type="search" value={query} onChange={e => { setQuery(e.target.value); setOpen(null); }} placeholder="체온, 코막힘, 수유…" className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 pl-10 pr-14 text-base" />
        {query && <button type="button" aria-label="검색어 지우기" onClick={() => { setQuery(""); setOpen(null); }} className="absolute right-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg"><X size={18} aria-hidden /></button>}
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <button ref={filterRef} type="button" aria-label={`주제: ${categoryLabel}`} aria-describedby={`${id}-results`} aria-expanded={filtersOpen} aria-controls={`${id}-categories`} onClick={() => setFiltersOpen(value => !value)} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-semibold">
          주제: {categoryLabel}<span aria-hidden className="font-normal tabular-nums text-[var(--muted-foreground)]">{filtered.length}개</span><ChevronDown size={16} aria-hidden className={cn("shrink-0 text-[var(--muted-foreground)] transition-transform motion-reduce:transition-none", filtersOpen && "rotate-180")} />
        </button>
        <button type="button" aria-pressed={urgentOnly} onClick={() => {
          if (!urgentOnly) { setCategory("all"); setQuery(""); }
          setUrgentOnly(!urgentOnly); setOpen(null); setExpanded({});
        }} className={cn("min-h-12 rounded-xl px-2 py-2 text-sm font-semibold", urgentOnly ? "bg-rose-50 text-[var(--content-urgent)] dark:bg-rose-950/40" : "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]")}>
          {urgentOnly ? "전체 분류 보기" : "긴급 상황 질문만"}
        </button>
      </div>
      <div id={`${id}-categories`} hidden={!filtersOpen}>
        <div role="group" aria-label="건강 정보 주제" className="flex flex-wrap gap-2 rounded-xl bg-[var(--surface-muted)] p-2">
          {[{ id: "all" as const, label: "전체" }, ...faqCategories].map(c => {
            const count = c.id === "all" ? monthFAQs.length : monthFAQs.filter(f => f.category === c.id).length;
            return <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => {
              setCategory(c.id); setOpen(null); setExpanded({}); setFiltersOpen(false); filterRef.current?.focus();
            }} className={cn("min-h-12 rounded-lg px-3 py-2 text-sm font-semibold", category === c.id ? "bg-[var(--card)] text-[var(--brand)]" : "text-[var(--foreground)]")}>
              {c.label} <span className="font-normal tabular-nums text-[var(--muted-foreground)]">{count}</span>
            </button>;
          })}
        </div>
      </div>
      <p id={`${id}-results`} role="status" aria-live="polite" aria-atomic="true" className="sr-only">{month}개월 · {keyword ? "검색 결과 " : "질문 "}<strong className="font-semibold text-[var(--foreground)]">{filtered.length}개</strong>{category !== "all" && ` · ${categoryLabel}`}</p>
    </div>

    <div className="space-y-5">
      {!filtered.length ? <div className="rounded-2xl border border-[var(--border)] p-4">
        <p className="font-semibold">해당 조건의 질문이 없어요</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">다른 검색어를 쓰거나 주제와 분류를 바꿔보세요.</p>
        <button type="button" onClick={reset} className="mt-2 min-h-12 font-semibold text-[var(--brand)]">검색 조건 초기화</button>
      </div> : groups.map(group => {
        const items = filtered.filter(f => f.urgency === group.key);
        if (!items.length) return null;
        const showAll = !!keyword || category !== "all" || urgentOnly || !!expanded[group.key];
        const visible = showAll ? items : items.filter((f, index) => index < 2 || f.id === open);
        const Icon = group.icon;
        return <section key={group.key} aria-labelledby={`${id}-${group.key}`} className="space-y-2">
          <h3 id={`${id}-${group.key}`} className="flex items-center gap-2 text-sm font-semibold"><Icon size={17} aria-hidden className={cn("shrink-0", group.color)} />{group.label} <span className="font-normal tabular-nums text-[var(--muted-foreground)]">{items.length}</span></h3>
          {visible.map(faq => {
            const isOpen = open === faq.id;
            const topic = faqCategories.find(c => c.id === faq.category)?.label;
            const preview = faq.care?.summary ?? (faq.urgency === "emergency" ? faq.answer : null);
            return <article key={faq.id} data-reading-anchor={`faq:${faq.id}`} className={cn("rounded-2xl border bg-[var(--card)]", isOpen ? "border-[var(--brand)]" : "border-[var(--border)]")}>
              <h4><button id={`${id}-${faq.id}-question`} type="button" aria-label={faq.question} aria-describedby={`${id}-${faq.id}-status`} aria-expanded={isOpen} aria-controls={`${id}-${faq.id}-answer`} onClick={() => setOpen(isOpen ? null : faq.id)} className="flex min-h-12 w-full items-start gap-3 rounded-2xl px-4 py-3 text-left">
                <span className="min-w-0 flex-1"><span className="block break-words text-base font-semibold leading-7">{faq.question}</span><span id={`${id}-${faq.id}-status`} className="mt-1 block text-sm font-normal leading-6 text-[var(--muted-foreground)]">{topic}{healthEvidenceView(faq.evidence).compact && ` · ${healthEvidenceView(faq.evidence).compact}`}</span></span>
                <ChevronDown size={17} aria-hidden className={cn("mt-1 shrink-0 text-[var(--muted-foreground)] transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
              </button></h4>
              {preview && <div hidden={isOpen} className="px-4 pb-4" data-faq-preview><p className="whitespace-pre-line break-words text-base leading-7"><EmphasizedText text={preview} /></p></div>}
              <div id={`${id}-${faq.id}-answer`} role="region" aria-labelledby={`${id}-${faq.id}-question`} hidden={!isOpen} className="border-t border-[var(--border)] p-4">
                <HealthCareAnswer faq={faq} />
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">대상: {faq.applicableMonths.length ? `${faq.applicableMonths.join("·")}개월` : "월령 공통"} · 아기의 현재 상태를 진단하는 결과는 아니에요.</p>
                <HealthFAQEvidence evidence={faq.evidence} />
              </div>
            </article>;
          })}
          {!keyword && category === "all" && !urgentOnly && items.length > 2 && <button type="button" aria-expanded={!!expanded[group.key]} onClick={() => {
            if (expanded[group.key]) setOpen(null);
            setExpanded(old => ({ ...old, [group.key]: !old[group.key] }));
          }} className="min-h-12 w-full rounded-xl px-3 text-sm font-semibold text-[var(--brand)] hover:bg-[var(--accent-soft)]">
            {expanded[group.key] ? "간단히 보기" : `${group.label} ${items.length}개 모두 보기`}
          </button>}
        </section>;
      })}
    </div>
    <aside aria-label="건강 정보 참고 안내" className="border-t border-[var(--border)] pt-4 text-sm leading-6 text-[var(--muted-foreground)]">
      <p className="flex items-start gap-2"><BookOpen size={16} aria-hidden className="mt-1 shrink-0" /><span>이 월령 질문 {monthFAQs.length}개 중 {linked}개에 참고 자료가 연결돼 있어요.</span></p>
      <p className="mt-2">각 답변에서 참고 자료를 확인할 수 있어요. 질문의 분류는 아기의 현재 상태에 대한 판단이 아니에요.</p>
    </aside>
  </div>;
}
