"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Ruler, X } from "lucide-react";
import { useMeasurementStore, type Measurement } from "@/lib/store/measurement-store";
import { useBabyStore } from "@/lib/store/baby-store";
import { getCalendarMonthsOld, getKoreaDate } from "@/lib/utils/date";

import { measurementDraftKey, readMeasurementDraft, writeMeasurementDraft, clearMeasurementDraft } from "@/lib/utils/measurement-draft";

interface MeasurementInputProps {
  currentMonth: number;
  onClose: () => void;
  initialMeasurement?: Measurement;
  onSaved?: (edited: boolean) => void;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export default function MeasurementInput({ onClose, initialMeasurement, onSaved }: MeasurementInputProps) {
  const profile = useBabyStore((state) => state.profile);
  const addMeasurement = useMeasurementStore((state) => state.addMeasurement);
  const updateMeasurement = useMeasurementStore((state) => state.updateMeasurement);
  const [seed] = useState(() => {
    const baseline = { date: initialMeasurement?.date || getKoreaDate(), height: initialMeasurement?.height?.toString() || "", weight: initialMeasurement?.weight?.toString() || "", head: initialMeasurement?.headCircumference?.toString() || "", memo: initialMeasurement?.memo || "" };
    const key = measurementDraftKey(profile?.id || "no-baby", initialMeasurement);
    const previous = profile ? readMeasurementDraft(key) : undefined;
    return { key, baseline, values: previous || baseline, restored: !!previous };
  });
  const [date, setDate] = useState(seed.values.date);
  const [height, setHeight] = useState(seed.values.height);
  const [weight, setWeight] = useState(seed.values.weight);
  const [head, setHead] = useState(seed.values.head);
  const [memo, setMemo] = useState(seed.values.memo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const savingRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const initial = seed.baseline;
  const dirty = date !== initial.date || height !== initial.height || weight !== initial.weight || head !== initial.head || memo !== initial.memo;
  useEffect(() => {
    if (dirty && profile) writeMeasurementDraft(seed.key, { date, height, weight, head, memo });
    else clearMeasurementDraft(seed.key);
  }, [date, height, weight, head, memo, dirty, seed.key, profile]);
  const discardAndClose = () => { clearMeasurementDraft(seed.key); onClose(); };
  const requestClose = useCallback(() => {
    if (savingRef.current) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  }, [dirty, onClose]);
  const closeRef = useRef(requestClose);
  useEffect(() => { closeRef.current = requestClose; }, [requestClose]);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    headingRef.current?.focus();
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex='0']") || []);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const nodes = focusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !nodes.includes(active as HTMLElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (active === last || !nodes.includes(active as HTMLElement))) {
        event.preventDefault(); first.focus();
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialogRef.current?.contains(event.target)) headingRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", containFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", containFocus);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const rawMonth = profile && isValidDate(date) ? getCalendarMonthsOld(profile.birthdate, date) : 0;
  const month = Math.max(0, Math.min(rawMonth, 12));

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (savingRef.current || !profile) return;
    const nextErrors: Record<string, string> = {};
    if (!isValidDate(date)) nextErrors.date = "측정한 날짜를 선택해 주세요.";
    else if (date > getKoreaDate()) nextErrors.date = "측정일은 오늘보다 늦을 수 없어요.";
    else if (date < profile.birthdate) nextErrors.date = "생년월일 이후의 날짜를 선택해 주세요.";
    const parsed = { height: height ? Number(height) : undefined, weight: weight ? Number(weight) : undefined, head: head ? Number(head) : undefined };
    if (!height && !weight && !head) nextErrors.form = "측정값을 한 가지 이상 입력해 주세요.";
    if (parsed.height !== undefined && (!Number.isFinite(parsed.height) || parsed.height < 30 || parsed.height > 90)) nextErrors.height = "키는 30~90cm 범위로 입력해 주세요.";
    if (parsed.weight !== undefined && (!Number.isFinite(parsed.weight) || parsed.weight < 1 || parsed.weight > 20)) nextErrors.weight = "몸무게는 1~20kg 범위로 입력해 주세요.";
    if (parsed.head !== undefined && (!Number.isFinite(parsed.head) || parsed.head < 25 || parsed.head > 55)) nextErrors.head = "머리둘레는 25~55cm 범위로 입력해 주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const values = { month, date, height: parsed.height, weight: parsed.weight, headCircumference: parsed.head, memo: memo.trim() || undefined };
      const saved = initialMeasurement ? updateMeasurement(initialMeasurement.id, values, profile.id) : addMeasurement(values, profile.id);
      if (!saved) throw new Error("The selected baby or record changed.");
      clearMeasurementDraft(seed.key);
      onSaved?.(!!initialMeasurement);
      onClose();
    } catch {
      savingRef.current = false;
      setSaving(false);
      setErrors({ form: "기록을 저장하지 못했어요. 입력한 내용을 확인하고 다시 시도해 주세요." });
    }
  };

  const fields = [
    { key: "height", label: "키", unit: "cm", value: height, setter: setHeight, min: 30, max: 90 },
    { key: "weight", label: "몸무게", unit: "kg", value: weight, setter: setWeight, min: 1, max: 20 },
    { key: "head", label: "머리둘레", unit: "cm", value: head, setter: setHead, min: 25, max: 55 },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4" onClick={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl dark:bg-[var(--card)] sm:rounded-3xl">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-200 px-5 py-4 dark:border-stone-700">
          <div>
            <h2 ref={headingRef} tabIndex={-1} id={`${id}-title`} className="flex items-center gap-2 text-lg font-bold text-stone-900 outline-none dark:text-stone-100"><Ruler size={20} aria-hidden />{initialMeasurement ? "성장 기록 수정" : "성장 기록 추가"}</h2>
            <p id={`${id}-description`} className="mt-1 text-sm text-stone-600 dark:text-stone-300">{profile?.name}의 기록 · 한 가지 값만 입력해도 돼요.</p>
          </div>
          <button type="button" onClick={requestClose} aria-label="성장 기록 입력 닫기" className="flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"><X size={22} aria-hidden /></button>
        </header>
        {seed.restored && !confirmClose && <p role="status" className="shrink-0 border-b border-stone-200 bg-[var(--accent-soft)] px-5 py-3 text-sm font-semibold text-[var(--brand)] dark:border-stone-700">이 아기의 입력하던 내용을 불러왔어요.</p>}
        {confirmClose ? (
          <div className="space-y-4 p-5" role="alert">
            <p className="text-base font-semibold text-stone-900 dark:text-stone-100">입력 중인 내용을 버릴까요?</p>
            <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">아직 저장하지 않은 내용이 있어요.</p>
            <button type="button" onClick={() => setConfirmClose(false)} className="min-h-12 w-full rounded-2xl bg-blue-700 px-4 font-bold text-white">계속 입력하기</button>
            <button type="button" onClick={discardAndClose} className="min-h-12 w-full rounded-2xl border border-stone-300 px-4 font-semibold text-stone-700 dark:border-stone-600 dark:text-stone-200">버리고 닫기</button>
          </div>
        ) : (
          <form onSubmit={handleSave} noValidate className="overflow-y-auto overscroll-contain">
            <div className="space-y-5 p-5">
              <div>
                <label htmlFor={`${id}-date`} className="mb-2 block text-sm font-semibold text-stone-800 dark:text-stone-200">측정일</label>
                <input id={`${id}-date`} type="date" value={date} min={profile?.birthdate} max={getKoreaDate()} onChange={(event) => setDate(event.target.value)} aria-invalid={!!errors.date} aria-describedby={`${id}-date-hint${errors.date ? ` ${id}-date-error` : ""}`} className="min-h-12 w-full rounded-xl border border-stone-300 bg-transparent px-3 text-base text-stone-900 dark:border-stone-600 dark:text-stone-100" />
                <p id={`${id}-date-hint`} className="mt-2 text-sm text-stone-600 dark:text-stone-300">선택한 날짜 기준 {rawMonth}개월{rawMonth > 12 ? " · 차트는 12개월 구간에 표시돼요." : ""}</p>
                {errors.date && <p id={`${id}-date-error`} className="mt-1 text-sm font-medium text-red-700 dark:text-red-300">{errors.date}</p>}
              </div>
              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={`${id}-${field.key}`} className="mb-2 block text-sm font-semibold text-stone-800 dark:text-stone-200">{field.label} ({field.unit})</label>
                    <div className="flex min-h-14 items-center gap-3 rounded-xl border border-stone-300 px-3 focus-within:ring-2 focus-within:ring-blue-600 dark:border-stone-600">
                      <input id={`${id}-${field.key}`} type="number" inputMode="decimal" step="0.1" min={field.min} max={field.max} value={field.value} onChange={(event) => field.setter(event.target.value)} placeholder="측정한 값" aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `${id}-${field.key}-error` : undefined} className="min-h-12 w-full min-w-0 bg-transparent text-lg font-bold text-stone-900 outline-none placeholder:font-normal placeholder:text-stone-500 dark:text-stone-100 dark:placeholder:text-stone-400" />
                      <span aria-hidden className="text-base text-stone-600 dark:text-stone-300">{field.unit}</span>
                    </div>
                    {errors[field.key] && <p id={`${id}-${field.key}-error`} className="mt-1 text-sm font-medium text-red-700 dark:text-red-300">{errors[field.key]}</p>}
                  </div>
                ))}
              </div>
              <div>
                <label htmlFor={`${id}-memo`} className="mb-2 block text-sm font-semibold text-stone-800 dark:text-stone-200">메모 (선택)</label>
                <textarea id={`${id}-memo`} value={memo} maxLength={100} onChange={(event) => setMemo(event.target.value)} placeholder="예: 소아과 정기검진에서 측정" rows={2} aria-describedby={`${id}-memo-hint`} className="w-full rounded-xl border border-stone-300 bg-transparent px-3 py-3 text-base text-stone-900 placeholder:text-stone-500 dark:border-stone-600 dark:text-stone-100 dark:placeholder:text-stone-400" />
                <p id={`${id}-memo-hint`} className="mt-1 text-right text-sm text-stone-600 dark:text-stone-300">{memo.length}/100</p>
              </div>
              {Object.keys(errors).length > 0 && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">{errors.form || "표시된 항목을 확인해 주세요."}</p>}
            </div>
            <footer className="sticky bottom-0 border-t border-stone-200 bg-white px-5 pt-3 pb-[max(env(safe-area-inset-bottom),20px)] dark:border-stone-700 dark:bg-[var(--card)]">
              <button type="submit" disabled={saving || (!height && !weight && !head)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 text-base font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-600 dark:disabled:bg-stone-700 dark:disabled:text-stone-300"><Check size={19} aria-hidden />{saving ? "저장 중…" : initialMeasurement ? "수정한 기록 저장" : "기기에 기록 저장"}</button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
