"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps { autoFocus?: boolean; backHref?: string; onSearch: (keyword: string) => void; initialValue?: string; }

export default function SearchBar({ onSearch, initialValue = "", autoFocus = true, backHref }: SearchBarProps) {
  const [draft, setDraft] = useState({ source: initialValue, value: initialValue });
  const value = draft.source === initialValue ? draft.value : initialValue;
  const setValue = (next: string) => setDraft({ source: initialValue, value: next });
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composingRef = useRef(false);
  const onSearchRef = useRef(onSearch);
  const router = useRouter();
  const cancelPending = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
  }, []);
  useEffect(() => { if (autoFocus) inputRef.current?.focus(); return cancelPending; }, [cancelPending, autoFocus]);
  useEffect(() => { onSearchRef.current = onSearch; }, [onSearch]);
  useEffect(() => { cancelPending(); }, [initialValue, cancelPending]);
  const schedule = (keyword: string) => {
    cancelPending();
    if (!keyword.trim()) { onSearch(""); return; }
    debounceRef.current = setTimeout(() => { debounceRef.current = null; onSearchRef.current(keyword); }, 300);
  };
  const clear = () => { cancelPending(); setValue(""); onSearch(""); inputRef.current?.focus(); };

  return (
    <header className="sticky top-0 z-20 bg-[var(--surface-bg)] px-[20px] pb-3 pt-safe">
      <form role="search" aria-label="육아 정보 검색" onSubmit={event => { event.preventDefault(); if (composingRef.current) return; cancelPending(); onSearch(value); }} className="flex items-center gap-[8px] pt-3">
        <button type="button" onClick={() => { cancelPending(); if (backHref) router.replace(backHref, { scroll: false }); else if (window.history.length > 1) router.back(); else router.replace("/encyclopedia"); }} className="flex h-12 w-[48px] shrink-0 items-center justify-center rounded-xl bg-white text-stone-700 dark:bg-[var(--card)] dark:text-stone-200" aria-label="이전 화면으로"><ArrowLeft size={21} aria-hidden="true" /></button>
        <div className="relative min-w-0 flex-1">
          <label htmlFor="content-search" className="sr-only">검색어</label>
          <Search size={19} aria-hidden="true" className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400" />
          <input ref={inputRef} id="content-search" type="search" autoComplete="off" maxLength={100} value={value} onChange={event => { setValue(event.target.value); if (!composingRef.current) schedule(event.target.value); }} onCompositionStart={() => { composingRef.current = true; cancelPending(); }} onCompositionEnd={event => { composingRef.current = false; schedule(event.currentTarget.value); }} placeholder="수면, 이유식, 증상 등을 검색" className="min-h-13 w-full min-w-0 appearance-none rounded-xl border border-stone-300 bg-white py-3 pl-[40px] pr-[48px] text-base text-stone-900 placeholder:text-stone-500 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/25 dark:border-stone-600 dark:bg-[var(--card)] dark:text-stone-100 dark:placeholder:text-stone-400 dark:focus:border-blue-300 dark:focus:ring-blue-300/30 [&::-webkit-search-cancel-button]:appearance-none" />
          {value && <button type="button" onClick={clear} aria-label="검색어 지우기" className="absolute right-0 top-1/2 flex h-12 w-[48px] -translate-y-1/2 items-center justify-center rounded-xl text-stone-600 dark:text-stone-300"><X size={20} aria-hidden="true" /></button>}
        </div>
      </form>
    </header>
  );
}
