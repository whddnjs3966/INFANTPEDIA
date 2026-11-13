"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronDown, Pencil } from "lucide-react";
import { useReadingValue } from "@/components/reading/ReadingScope";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMilestoneStore } from "@/lib/store/milestone-store";
import { getKoreaDate } from "@/lib/utils/date";
import { recordDateError } from "@/lib/utils/record-date";
import type { MilestoneItem } from "@/lib/data/milestone-data";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  milestone: MilestoneItem;
  isCompleted: boolean;
  completedDate?: string;
  onNotice: (message: string) => void;
}
export default function MilestoneItemRow({ milestone, isCompleted, completedDate, onNotice }: Props) {
  const profile = useBabyStore(state => state.profile);
  const saveObservation = useMilestoneStore(state => state.saveObservation);
  const removeObservation = useMilestoneStore(state => state.removeObservation);
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [date, setDate] = useState(completedDate || getKoreaDate());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailsOpen, setDetailsOpen] = useReadingValue<boolean>(`milestone:details:${milestone.id}`, false);
  const savingRef = useRef(false);
  const actionRef = useRef<HTMLButtonElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const router = useRouter();
  const startEditing = () => {
    if (!profile) { router.push('/onboarding'); return; }
    setDate(completedDate || getKoreaDate()); setError(""); setConfirmRemove(false); setEditing(true);
  };
  const cancelEditing = () => { setEditing(false); setError(""); (isCompleted ? editRef : actionRef).current?.focus(); };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile || savingRef.current) return;
    const validation = recordDateError(date, profile.birthdate, '관찰일');
    if (validation) { setError(validation); return; }
    savingRef.current = true; setSaving(true);
    try {
      const result = saveObservation(milestone.id, date, profile.id);
      if (!result.ok) { setError(result.error || '기록을 확인한 뒤 다시 시도해 주세요.'); return; }
      setEditing(false); setError("");
      onNotice(`${profile.name}의 ‘${milestone.title}’ 관찰일(${date})을 이 기기에 저장했어요.`);
      actionRef.current?.focus();
    } catch { setError('기기에 저장하지 못했어요. 입력한 날짜를 확인하고 다시 시도해 주세요.'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  const remove = () => {
    if (!profile || savingRef.current) return;
    try {
      const result = removeObservation(milestone.id, profile.id);
      if (!result.ok) { setError(result.error || '기록을 확인해 주세요.'); return; }
      setConfirmRemove(false); setError("");
      onNotice(`${profile.name}의 ‘${milestone.title}’ 관찰 기록을 취소했어요.`);
      actionRef.current?.focus();
    } catch { setError('기기에 변경을 저장하지 못했어요. 다시 시도해 주세요.'); }
  };
  return <article data-reading-anchor={`milestone:${milestone.id}`} className="px-3 py-1.5">
    <div className="flex items-start gap-1">
      <button ref={actionRef} type="button" aria-pressed={isCompleted} aria-label={`${milestone.title}: ${isCompleted ? '관찰 취소' : '관찰 날짜 기록'}`} onClick={() => { if (!isCompleted) startEditing(); else { setEditing(false); setError(''); setConfirmRemove(true); } }} className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg">
        <span className={cn("flex h-[23px] w-[23px] items-center justify-center rounded-lg border-2", isCompleted ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-foreground)]" : "border-[var(--muted-foreground)]/60")}>{isCompleted && <Check size={15} strokeWidth={3} aria-hidden="true" />}</span>
      </button>
      <div className="min-w-0 flex-1">
        <h4>
          <button type="button" aria-expanded={detailsOpen} aria-controls={`${id}-description`} onClick={() => setDetailsOpen(value => !value)} className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg py-2 text-left text-base font-semibold leading-[1.5]">
            <span className="min-w-0 break-words">{milestone.title}</span>
            <ChevronDown size={15} aria-hidden className={cn("shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 motion-reduce:transition-none", detailsOpen && "rotate-180")} />
          </button>
        </h4>
        <p id={`${id}-description`} hidden={!detailsOpen} className="pb-2 text-base leading-[1.65] text-[var(--muted-foreground)]">{milestone.description}</p>
        {isCompleted && <div className="flex flex-wrap items-center gap-x-2 pb-1"><p className="text-sm font-semibold text-[var(--brand)]">{completedDate ? <><time dateTime={completedDate}>{completedDate}</time> 관찰</> : '관찰일이 아직 없어요'}</p><button ref={editRef} type="button" aria-label={`${milestone.title} 관찰일 수정`} onClick={startEditing} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-[var(--brand)]"><Pencil size={14} aria-hidden="true" />날짜 수정</button></div>}
      </div>
    </div>
    {editing && <form onSubmit={save} noValidate aria-label={`${milestone.title} 관찰 날짜`} className="mt-3 space-y-3 border-t border-stone-200 pt-4 dark:border-stone-700" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); cancelEditing(); } }}>
      <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{profile?.name}의 관찰 기록</p>
      <label htmlFor={`${id}-date`} className="block text-sm font-semibold text-stone-800 dark:text-stone-100">관찰한 날짜</label>
      <input autoFocus id={`${id}-date`} type="date" min={profile?.birthdate} max={getKoreaDate()} value={date} onChange={event => { setDate(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} className="min-h-12 w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 dark:border-stone-600 dark:bg-[var(--background)] dark:text-stone-100" />
      <p id={`${id}-hint`} className="text-sm leading-6 text-stone-600 dark:text-stone-300">실제로 관찰한 날짜를 기록해 주세요. 저장은 이 기기에 적용돼요.</p>
      {error && <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>}
      <div className="flex flex-wrap gap-2"><button type="submit" disabled={saving} className="min-h-12 rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-[var(--brand-foreground)] disabled:opacity-50">{saving ? '저장 중…' : '관찰일 저장'}</button><button type="button" onClick={cancelEditing} disabled={saving} className="min-h-12 rounded-xl px-4 text-sm font-semibold text-stone-700 dark:text-stone-200">취소</button></div>
    </form>}
    {confirmRemove && <div className="mt-3 space-y-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30"><p className="text-sm font-semibold leading-6 text-stone-800 dark:text-stone-100">{profile?.name}의 이 항목 관찰 기록을 취소할까요?</p>{error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}<div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setConfirmRemove(false); actionRef.current?.focus(); }} className="min-h-12 rounded-xl border border-stone-300 bg-white px-3 text-sm font-bold text-stone-800 dark:border-stone-700 dark:bg-[var(--card)] dark:text-stone-100">기록 유지</button><button type="button" onClick={remove} className="min-h-12 rounded-xl px-3 text-sm font-semibold text-red-700 dark:text-red-300">관찰 취소</button></div></div>}
  </article>;
}

