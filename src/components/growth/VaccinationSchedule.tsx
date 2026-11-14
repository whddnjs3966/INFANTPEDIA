"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Pencil, Syringe } from "lucide-react";
import { cn } from "@/lib/utils";
import { isVaccinationDue, vaccinations, type Vaccination } from "@/lib/data/growth-data";
import { useVaccinationStore, type VaccinationRecord } from "@/lib/store/vaccination-store";
import { useBabyStore } from "@/lib/store/baby-store";
import { getKoreaDate } from "@/lib/utils/date";
import { INFLUENZA_VACCINE_ID, influenzaSeason, influenzaSeasonLabel } from "@/lib/utils/vaccination-season";

interface VaccinationScheduleProps { currentMonth: number }
type View = "current" | "remaining" | "completed" | "all";
const viewLabels: Record<View, string> = { current: "이번 시기", remaining: "미완료", completed: "완료", all: "전체" };

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function VaccineCard({ vaccine, doses, records, currentMonth, babyId, birthdate, onNotice, season, seasons, onSeasonChange, completedOnly }: {
  vaccine: Vaccination;
  doses: Vaccination["doses"];
  records: VaccinationRecord[];
  currentMonth: number;
  babyId: string;
  birthdate: string;
  onNotice: (message: string) => void;
  season?: number;
  seasons?: number[];
  onSeasonChange?: (season: number) => void;
  completedOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editorDose, setEditorDose] = useState<number | null>(null);
  const [deleteDose, setDeleteDose] = useState<number | null>(null);
  const [date, setDate] = useState(getKoreaDate());
  const [error, setError] = useState("");
  const savingRef = useRef(false);
  const id = useId();
  const today = getKoreaDate();
  const seasonStart = season === undefined ? undefined : `${season}-09-01`;
  const seasonEnd = season === undefined ? undefined : `${season + 1}-08-31`;
  const minDate = seasonStart && seasonStart > birthdate ? seasonStart : birthdate;
  const maxDate = seasonEnd && seasonEnd < today ? seasonEnd : today;
  const getRecord = (dose: number) => records.find((record) => record.vaccineId === vaccine.id && record.doseNumber === dose && (season === undefined || influenzaSeason(record.completedDate) === season));
  const shownDoses = completedOnly ? doses.filter(dose => getRecord(dose.doseNumber)) : doses;
  const done = shownDoses.filter((dose) => getRecord(dose.doseNumber)).length;
  const current = doses.some((dose) => !getRecord(dose.doseNumber) && isVaccinationDue(dose, currentMonth));
  const status = season !== undefined ? `${done}회 기록` : done === doses.length ? "완료" : current ? "이번 시기" : done ? `${done}회 기록` : doses.every(dose => dose.conditional) ? "조건 확인" : "미완료";

  const save = (event: React.FormEvent, doseNumber: number) => {
    event.preventDefault();
    if (savingRef.current) return;
    if (!isValidDate(date)) { setError("실제 접종일을 선택해 주세요."); return; }
    if (date > getKoreaDate()) { setError("접종일은 오늘보다 늦을 수 없어요."); return; }
    if (date < birthdate) { setError("생년월일 이후의 접종일을 선택해 주세요."); return; }
    savingRef.current = true;
    try {
      const result = useVaccinationStore.getState().saveVaccination(vaccine.id, doseNumber, date, babyId, season);
      if (!result.ok) { setError(result.error || "기록을 확인해 주세요."); return; }
      setEditorDose(null); setError("");
      onNotice(`${vaccine.name} ${doseNumber}차 접종일(${date})을 이 기기에 저장했어요.`);
    } catch {
      setError("기록을 저장하지 못했어요. 입력한 날짜를 확인하고 다시 시도해 주세요.");
    } finally { savingRef.current = false; }
  };

  const remove = (doseNumber: number) => {
    try {
      const result = useVaccinationStore.getState().removeVaccination(vaccine.id, doseNumber, babyId, season);
      if (!result.ok) { setError(result.error || "기록을 확인해 주세요."); return; }
      setDeleteDose(null); setError("");
      onNotice(`${vaccine.name} ${doseNumber}차 접종 완료 기록을 삭제했어요.`);
    } catch { setError("기기에 변경을 저장하지 못했어요. 다시 시도해 주세요."); }
  };

  return (
    <section data-vaccine-card={vaccine.id} className="@container surface-card">
      <h3>
        <button id={`${id}-title`} type="button" aria-expanded={open} aria-controls={`${id}-doses`} onClick={() => setOpen(!open)} className={cn("flex min-h-[56px] w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors motion-reduce:transition-none", open ? "rounded-t-[23px] bg-[var(--surface-sky)]" : "rounded-[23px] hover:bg-[var(--surface-sky)]")}>
          <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <span className="min-w-0 break-words text-base font-semibold leading-snug">{vaccine.name}</span>
            <span className={cn("text-sm font-medium leading-snug", done === doses.length || current ? "text-[var(--brand)]" : "text-[var(--muted-foreground)]")}>{status}</span>
          </span>
          <ChevronDown size={17} aria-hidden className={cn("shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} />
        </button>
      </h3>
        <div id={`${id}-doses`} hidden={!open} role="region" aria-labelledby={`${id}-title`} className="space-y-3 border-t border-[var(--border)] px-4 py-3">
          <div className="space-y-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <p className="break-words">{vaccine.nameEn} · {vaccine.description}</p>
            <p>{done}회 기록{doses.some(dose => dose.conditional) ? " · 해당하는 차수만 기록해 주세요." : ` · 표시된 일정 ${doses.length}회`}</p>
          </div>
          {season !== undefined && <div className="space-y-2">
            <label htmlFor={`${id}-season`} className="block text-sm font-semibold">접종 절기</label>
            <select id={`${id}-season`} value={season} onChange={event => {
              onSeasonChange?.(Number(event.target.value));
              setEditorDose(null);
              setDeleteDose(null);
              setError("");
            }} className="min-h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2 text-sm">
              {seasons?.map(item => <option key={item} value={item}>{influenzaSeasonLabel(item)}</option>)}
            </select>
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">접종일을 9월부터 다음 해 8월까지 묶어 보여드려요. 접종 대상과 지원 일정은 <a href="https://nip.kdca.go.kr/irhp/infm/goVcntInfo.do?menuCd=134&menuLv=1" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--brand)] underline">질병관리청</a>에서 확인해 주세요.</p>
          </div>}
          {shownDoses.map((dose) => {
            const record = getRecord(dose.doseNumber);
            const current = isVaccinationDue(dose, currentMonth);
            const dateId = `${id}-${dose.doseNumber}-date`;
            return (
              <div key={dose.doseNumber} className="min-w-0 border-t border-[var(--border)] pt-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-base font-bold text-[var(--foreground)]">{record && <Check size={17} aria-hidden className="text-[var(--brand)]" />}{dose.doseLabel}</p>
                    {vaccine.id !== "flu" && <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{dose.monthStart === dose.monthEnd ? `${dose.monthStart}개월` : `${dose.monthStart}~${dose.monthEnd}개월`}{current && !record ? " · 이번 접종 시기" : ""}</p>}
                    {dose.note && <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{dose.note}</p>}
                    {record && <p className="mt-2 text-sm font-semibold leading-6 text-[var(--brand)]">접종 완료 · {record.completedDate}</p>}
                  </div>
                  <button type="button" aria-label={`${vaccine.name} ${dose.doseLabel} ${record ? "접종일 수정" : "접종 완료 기록"}`} aria-expanded={editorDose === dose.doseNumber} onClick={() => { setEditorDose(dose.doseNumber); setDeleteDose(null); setDate(record?.completedDate ?? (maxDate === today ? today : "")); setError(""); }} className={cn("flex min-h-12 min-w-0 max-w-full flex-wrap items-center justify-center gap-1.5 break-words rounded-xl px-3 py-2 text-sm font-semibold transition-colors @max-[16rem]:[&>svg]:hidden", record ? "border border-[var(--border)] bg-[var(--card)] text-[var(--brand)]" : "bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-pressed)]")}>
                    {record ? <Pencil size={15} aria-hidden /> : <Check size={16} aria-hidden />}{record ? "접종일 수정" : "완료 기록"}
                  </button>
                </div>
                {editorDose === dose.doseNumber && (
                  <form onSubmit={(event) => save(event, dose.doseNumber)} noValidate className="mt-4 space-y-3 border-t border-stone-200 pt-3 dark:border-stone-600 @max-[16rem]:-mx-2">
                    <label htmlFor={dateId} className="block text-sm font-semibold text-stone-800 dark:text-stone-200">실제 접종일</label>
                    <input id={dateId} type="date" min={minDate} max={maxDate} value={date} onChange={(event) => { setDate(event.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? `${dateId}-error` : undefined} className="min-h-12 min-w-0 max-w-full w-full rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 dark:border-stone-600 dark:bg-[var(--card)] dark:text-stone-100 @max-[16rem]:px-2" />
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
    </section>
  );
}

export default function VaccinationSchedule({ currentMonth }: VaccinationScheduleProps) {
  const profile = useBabyStore((state) => state.profile);
  const legacyOwnerId = useBabyStore((state) => state.legacyOwnerId);
  const allRecords = useVaccinationStore((state) => state.records);
  const [view, setView] = useState<View>("current");
  const [notice, setNotice] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number>();
  const profileId = profile?.id;
  const records = useMemo(() => allRecords.filter((record) => !!profileId && (record.babyId === profileId || (!record.babyId && legacyOwnerId === profileId))), [allRecords, profileId, legacyOwnerId]);
  const currentSeason = influenzaSeason(getKoreaDate())!;
  const birthSeason = (profile && influenzaSeason(profile.birthdate)) || currentSeason;
  const recordedSeasons = [...new Set(records.filter(record => record.vaccineId === INFLUENZA_VACCINE_ID).flatMap(record => influenzaSeason(record.completedDate) ?? []))].sort((a, b) => b - a);
  const seasonOptions = view === "completed" ? recordedSeasons : [...new Set([
    ...Array.from({ length: Math.max(1, currentSeason - birthSeason + 1) }, (_, index) => currentSeason - index),
    ...recordedSeasons,
  ])].sort((a, b) => b - a);
  const season = selectedSeason !== undefined && seasonOptions.includes(selectedSeason) ? selectedSeason : seasonOptions[0];
  const completed = (vaccineId: string, doseNumber: number) => records.some((record) => record.vaccineId === vaccineId && record.doseNumber === doseNumber);
  const total = vaccinations.reduce((sum, vaccine) => sum + vaccine.doses.filter(dose => !dose.conditional).length, 0);
  const done = vaccinations.reduce((sum, vaccine) => sum + vaccine.doses.filter(dose => !dose.conditional && completed(vaccine.id, dose.doseNumber)).length, 0);
  const due = vaccinations.reduce((sum, vaccine) => sum + vaccine.doses.filter(dose => isVaccinationDue(dose, currentMonth) && !completed(vaccine.id, dose.doseNumber)).length, 0);
  const groups = vaccinations.map((vaccine) => ({ vaccine, doses: vaccine.doses.filter((dose) => {
    if (vaccine.id === INFLUENZA_VACCINE_ID) return view === "all" || (view === "completed" && recordedSeasons.length > 0);
    const isDone = completed(vaccine.id, dose.doseNumber);
    if (view === "all") return true;
    if (view === "completed") return isDone;
    if (view === "remaining") return !isDone && !dose.conditional;
    return !isDone && isVaccinationDue(dose, currentMonth);
  }) })).filter((group) => group.doses.length > 0);

  if (!profile) return null;

  return (
    <div data-vaccination-redesign className="@container space-y-3 pb-8" key={profile.id}>
      <section aria-labelledby="vaccination-summary-title" className="surface-card p-4">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="flex size-[36px] shrink-0 items-center justify-center rounded-xl bg-[var(--surface-peach)] text-[var(--art-peach-ink)]"><Syringe size={19} /></span>
          <h2 id="vaccination-summary-title" className="min-w-0 break-words text-base font-semibold">{profile.name}의 접종 기록</h2>
        </div>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm text-[var(--muted-foreground)]">이번 월령에 확인할 접종 <strong className="text-2xl font-bold tabular-nums text-[var(--brand)]">{due}회</strong><span>{currentMonth}개월 기준</span></p>
        <div className="mt-2 border-t border-[var(--border)] pt-2"><p className="flex flex-wrap justify-between gap-1 text-sm text-[var(--muted-foreground)]"><span>공통 일정 {total}회 중 <strong className="font-semibold text-[var(--foreground)]">{done}회 기록</strong></span><span>{total - done}회 미완료</span></p>
        <div role="progressbar" aria-label="예방접종 기록 진행률" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-valuetext={`${total}회 중 ${done}회 완료 기록`} className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${done / total * 100}%` }} /></div></div>
      </section>
      <div role="group" aria-label="예방접종 목록 선택" className="grid grid-cols-4 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-1 @max-[16rem]:grid-cols-2">
        {(Object.keys(viewLabels) as View[]).map((key) => <button type="button" key={key} aria-pressed={view === key} onClick={() => { setView(key); setNotice(""); }} className={cn("min-h-12 rounded-xl px-1 text-sm font-bold transition-colors", view === key ? "bg-[var(--card)] text-[var(--brand)] shadow-sm" : "text-[var(--muted-foreground)]")}>{viewLabels[key]}</button>)}
      </div>
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">백신을 열고 실제 접종일을 기록해 주세요. 접종 일정은 아기의 접종 이력과 백신 제품에 따라 달라질 수 있어요.</p>
      {view !== "all" && <button type="button" onClick={() => { setView("all"); setNotice(""); }} className="min-h-11 max-w-full break-words rounded-lg text-left text-sm font-semibold text-[var(--brand)] underline underline-offset-4">인플루엔자와 제품별 접종 기록 보기</button>}
      {notice && <p role="status" className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">{notice}</p>}
      {groups.length === 0 ? <div className="surface-card p-5"><p className="text-base leading-7 text-[var(--muted-foreground)]">{view === "current" ? "이번 월령에 남은 접종 기록이 없어요." : "이 목록에 표시할 접종 기록이 없어요."}</p><button type="button" onClick={() => setView("all")} className="mt-3 min-h-12 min-w-0 max-w-full break-words rounded-xl bg-[var(--accent-soft)] px-4 py-2 text-base font-semibold text-[var(--brand)]">전체 접종 일정 보기</button></div> : <div className="space-y-3">{groups.map(({ vaccine, doses }) => <VaccineCard key={`${profile.id}-${view}-${vaccine.id}`} vaccine={vaccine} doses={doses} currentMonth={currentMonth} records={records} babyId={profile.id} birthdate={profile.birthdate} onNotice={setNotice}
        season={vaccine.id === INFLUENZA_VACCINE_ID ? season : undefined} seasons={seasonOptions} onSeasonChange={next => { setSelectedSeason(next); setNotice(""); }} completedOnly={vaccine.id === INFLUENZA_VACCINE_ID && view === "completed"} />)}</div>}
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">기록은 이 기기에 저장돼요. <a href="https://nip.kdca.go.kr/irhp/infm/goVcntInfo.do?menuCd=115&menuLv=1" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--brand)] underline underline-offset-4">질병관리청 표준 예방접종 일정표</a></p>
    </div>
  );
}

