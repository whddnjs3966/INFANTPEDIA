"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Pencil, Syringe } from "lucide-react";
import { cn } from "@/lib/utils";
import { vaccinations, type Vaccination } from "@/lib/data/growth-data";
import { useVaccinationStore, type VaccinationRecord } from "@/lib/store/vaccination-store";
import { useBabyStore } from "@/lib/store/baby-store";
import { getKoreaDate } from "@/lib/utils/date";

interface VaccinationScheduleProps { currentMonth: number }
type View = "current" | "remaining" | "completed" | "all";
const viewLabels: Record<View, string> = { current: "이번 시기", remaining: "미완료", completed: "완료", all: "전체" };

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function VaccineCard({ vaccine, doses, records, currentMonth, babyId, birthdate, onNotice }: {
  vaccine: Vaccination;
  doses: Vaccination["doses"];
  records: VaccinationRecord[];
  currentMonth: number;
  babyId: string;
  birthdate: string;
  onNotice: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editorDose, setEditorDose] = useState<number | null>(null);
  const [deleteDose, setDeleteDose] = useState<number | null>(null);
  const [date, setDate] = useState(getKoreaDate());
  const [error, setError] = useState("");
  const savingRef = useRef(false);
  const id = useId();
  const getRecord = (dose: number) => records.find((record) => record.vaccineId === vaccine.id && record.doseNumber === dose);
  const done = doses.filter((dose) => getRecord(dose.doseNumber)).length;

  const save = (event: React.FormEvent, doseNumber: number) => {
    event.preventDefault();
    if (savingRef.current) return;
    if (!isValidDate(date)) { setError("실제 접종일을 선택해 주세요."); return; }
    if (date > getKoreaDate()) { setError("접종일은 오늘보다 늦을 수 없어요."); return; }
    if (date < birthdate) { setError("생년월일 이후의 접종일을 선택해 주세요."); return; }
    savingRef.current = true;
    try {
      const result = useVaccinationStore.getState().saveVaccination(vaccine.id, doseNumber, date, babyId);
      if (!result.ok) { setError(result.error || "기록을 확인해 주세요."); return; }
      setEditorDose(null); setError("");
      onNotice(`${vaccine.name} ${doseNumber}차 접종일(${date})을 이 기기에 저장했어요.`);
    } catch {
      setError("기록을 저장하지 못했어요. 입력한 날짜를 확인하고 다시 시도해 주세요.");
    } finally { savingRef.current = false; }
  };

  const remove = (doseNumber: number) => {
    try {
      const result = useVaccinationStore.getState().removeVaccination(vaccine.id, doseNumber, babyId);
      if (!result.ok) { setError(result.error || "기록을 확인해 주세요."); return; }
      setDeleteDose(null); setError("");
      onNotice(`${vaccine.name} ${doseNumber}차 접종 완료 기록을 삭제했어요.`);
    } catch { setError("기기에 변경을 저장하지 못했어요. 다시 시도해 주세요."); }
  };

  return (
    <section className="@container surface-card overflow-hidden">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={`${id}-doses`} onClick={() => setOpen(!open)} className="flex min-h-16 w-full items-start gap-3 p-5 text-left transition-colors hover:bg-[var(--surface-bg)] @max-[16rem]:gap-2 @max-[16rem]:px-3">
          <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-peach)] text-[var(--brand)] @max-[16rem]:hidden"><Syringe size={20} aria-hidden /></span>
          <span className="min-w-0 flex-1">
            <span className="block break-words text-lg font-semibold leading-7 tracking-tight text-[var(--foreground)]">{vaccine.name}</span>
            <span className="mt-1 block break-words text-sm leading-6 text-[var(--muted-foreground)]">{vaccine.nameEn} · {vaccine.description}</span>
            <span className="mt-3 inline-flex max-w-full break-words rounded-lg bg-[var(--surface-sky)] px-2.5 py-1 text-sm font-semibold leading-6 text-[var(--brand)]">표시된 {doses.length}회 중 {done}회 완료</span>
          </span>
          <ChevronDown size={20} aria-hidden className={cn("mt-3 shrink-0 text-stone-600 transition-transform dark:text-stone-300", open && "rotate-180")} />
        </button>
      </h3>
      {open && (
        <div id={`${id}-doses`} className="space-y-3 border-t border-[var(--border)] p-5 @max-[16rem]:p-2">
          {doses.map((dose) => {
            const record = getRecord(dose.doseNumber);
            const current = currentMonth >= dose.monthStart && currentMonth <= dose.monthEnd;
            const dateId = `${id}-${dose.doseNumber}-date`;
            return (
              <div key={dose.doseNumber} className="min-w-0 rounded-2xl bg-[var(--surface-bg)] p-4 @max-[16rem]:p-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-base font-bold text-[var(--foreground)]">{record && <Check size={17} aria-hidden className="text-[var(--brand)]" />}{dose.doseLabel}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{dose.monthStart === dose.monthEnd ? `${dose.monthStart}개월` : `${dose.monthStart}~${dose.monthEnd}개월`}{current && !record ? " · 이번 접종 시기" : ""}</p>
                    {dose.note && <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{dose.note}</p>}
                    {record && <p className="mt-2 text-sm font-semibold leading-6 text-[var(--brand)]">접종 완료 · {record.completedDate}</p>}
                  </div>
                  <button type="button" aria-label={`${vaccine.name} ${dose.doseLabel} ${record ? "접종일 수정" : "접종 완료 기록"}`} aria-expanded={editorDose === dose.doseNumber} onClick={() => { setEditorDose(dose.doseNumber); setDeleteDose(null); setDate(record?.completedDate || getKoreaDate()); setError(""); }} className={cn("flex min-h-12 min-w-0 max-w-full flex-wrap items-center justify-center gap-1.5 break-words rounded-xl px-3 py-2 text-sm font-semibold transition-colors @max-[16rem]:[&>svg]:hidden", record ? "border border-[var(--border)] bg-[var(--card)] text-[var(--brand)]" : "bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-pressed)]")}>
                    {record ? <Pencil size={15} aria-hidden /> : <Check size={16} aria-hidden />}{record ? "접종일 수정" : "완료 기록"}
                  </button>
                </div>
                {editorDose === dose.doseNumber && (
                  <form onSubmit={(event) => save(event, dose.doseNumber)} noValidate className="mt-4 space-y-3 border-t border-stone-200 pt-3 dark:border-stone-600 @max-[16rem]:-mx-2">
                    <label htmlFor={dateId} className="block text-sm font-semibold text-stone-800 dark:text-stone-200">실제 접종일</label>
                    <input id={dateId} type="date" min={birthdate} max={getKoreaDate()} value={date} onChange={(event) => { setDate(event.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? `${dateId}-error` : undefined} className="min-h-12 min-w-0 max-w-full w-full rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 dark:border-stone-600 dark:bg-[var(--card)] dark:text-stone-100 @max-[16rem]:px-2" />
                    {date && <p className="break-words text-sm leading-6 text-[var(--muted-foreground)]">선택한 날짜: <time dateTime={date}>{date}</time></p>}
                    {error && <p id={`${dateId}-error`} role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>}
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" className="min-h-12 min-w-0 max-w-full break-words rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-foreground)] hover:bg-[var(--brand-pressed)] @max-[16rem]:w-full">접종일 저장</button>
                      <button type="button" onClick={() => { setEditorDose(null); setError(""); }} className="min-h-12 min-w-0 max-w-full rounded-xl px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 @max-[16rem]:w-full">취소</button>
                    </div>
                    {record && <button type="button" onClick={() => { setEditorDose(null); setDeleteDose(dose.doseNumber); }} className="min-h-12 min-w-0 max-w-full break-words rounded-xl px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300">이 접종 완료 기록 삭제</button>}
                  </form>
                )}
                {deleteDose === dose.doseNumber && (
                  <div className="mt-3 rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
                    <p role="alert" className="text-sm font-semibold text-red-800 dark:text-red-200">{dose.doseLabel} 완료 기록을 삭제할까요?</p>{error && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
                    <div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => setDeleteDose(null)} className="min-h-12 min-w-0 max-w-full break-words rounded-xl bg-white px-3 py-2 text-sm font-semibold text-stone-800 dark:bg-[var(--surface-muted)] dark:text-stone-100">기록 유지</button><button type="button" onClick={() => remove(dose.doseNumber)} className="min-h-12 min-w-0 max-w-full break-words rounded-xl bg-red-700 px-3 py-2 text-sm font-semibold text-white">삭제하기</button></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function VaccinationSchedule({ currentMonth }: VaccinationScheduleProps) {
  const profile = useBabyStore((state) => state.profile);
  const legacyOwnerId = useBabyStore((state) => state.legacyOwnerId);
  const allRecords = useVaccinationStore((state) => state.records);
  const [view, setView] = useState<View>("current");
  const [notice, setNotice] = useState("");
  const profileId = profile?.id;
  const records = useMemo(() => allRecords.filter((record) => !!profileId && (record.babyId === profileId || (!record.babyId && legacyOwnerId === profileId))), [allRecords, profileId, legacyOwnerId]);
  const completed = (vaccineId: string, doseNumber: number) => records.some((record) => record.vaccineId === vaccineId && record.doseNumber === doseNumber);
  const total = vaccinations.reduce((sum, vaccine) => sum + vaccine.doses.length, 0);
  const done = vaccinations.reduce((sum, vaccine) => sum + vaccine.doses.filter((dose) => completed(vaccine.id, dose.doseNumber)).length, 0);
  const due = vaccinations.reduce((sum, vaccine) => sum + vaccine.doses.filter((dose) => currentMonth >= dose.monthStart && currentMonth <= dose.monthEnd && !completed(vaccine.id, dose.doseNumber)).length, 0);
  const groups = vaccinations.map((vaccine) => ({ vaccine, doses: vaccine.doses.filter((dose) => {
    const isDone = completed(vaccine.id, dose.doseNumber);
    if (view === "all") return true;
    if (view === "completed") return isDone;
    if (view === "remaining") return !isDone;
    return !isDone && currentMonth >= dose.monthStart && currentMonth <= dose.monthEnd;
  }) })).filter((group) => group.doses.length > 0);

  if (!profile) return null;

  return (
    <div className="@container space-y-6 pb-8" key={profile.id}>
      <section aria-labelledby="vaccination-summary-title" className="surface-card p-5">
        <h2 id="vaccination-summary-title" className="break-words text-xl font-semibold tracking-tight text-[var(--foreground)]">{profile.name}의 접종 기록</h2>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[var(--muted-foreground)]">이번 월령에 확인할 미완료 접종</p><p className="mt-1 text-base font-medium text-[var(--foreground)]"><strong className="mr-1 text-4xl font-bold leading-tight tracking-tight tabular-nums text-[var(--brand)]">{due}</strong>회</p></div><span className="rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--brand)]">{currentMonth}개월 기준</span></div>
        <div className="mt-5 border-t border-[var(--border)] pt-4"><p className="flex flex-wrap justify-between gap-2 text-sm text-[var(--muted-foreground)]"><span>전체 {total}회 중 <strong className="font-semibold text-[var(--foreground)]">{done}회 기록</strong></span><span>{total - done}회 미완료</span></p>
        <div role="progressbar" aria-label="예방접종 기록 진행률" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-valuetext={`${total}회 중 ${done}회 완료 기록`} className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${done / total * 100}%` }} /></div></div>
      </section>
      <div role="group" aria-label="예방접종 목록 선택" className="grid grid-cols-4 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-1 @max-[16rem]:grid-cols-2">
        {(Object.keys(viewLabels) as View[]).map((key) => <button type="button" key={key} aria-pressed={view === key} onClick={() => { setView(key); setNotice(""); }} className={cn("min-h-12 rounded-xl px-1 text-sm font-bold transition-colors", view === key ? "bg-[var(--card)] text-[var(--brand)] shadow-sm" : "text-[var(--muted-foreground)]")}>{viewLabels[key]}</button>)}
      </div>
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">백신을 열고 실제 접종일을 기록해 주세요. 일정은 참고 정보이며 실제 접종은 소아과 전문의와 상담하세요.</p>
      {notice && <p role="status" className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">{notice}</p>}
      {groups.length === 0 ? <div className="surface-card p-5"><p className="text-base leading-7 text-[var(--muted-foreground)]">{view === "current" ? "이번 월령에 남은 접종 기록이 없어요." : "이 목록에 표시할 접종 기록이 없어요."}</p><button type="button" onClick={() => setView("all")} className="mt-3 min-h-12 min-w-0 max-w-full break-words rounded-xl bg-[var(--accent-soft)] px-4 py-2 text-base font-semibold text-[var(--brand)]">전체 접종 일정 보기</button></div> : <div className="space-y-3">{groups.map(({ vaccine, doses }) => <VaccineCard key={`${profile.id}-${view}-${vaccine.id}`} vaccine={vaccine} doses={doses} currentMonth={currentMonth} records={records} babyId={profile.id} birthdate={profile.birthdate} onNotice={setNotice} />)}</div>}
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">질병관리청(KDCA) 국가예방접종 일정 기준 · 기록은 이 기기에 저장돼요.</p>
    </div>
  );
}

