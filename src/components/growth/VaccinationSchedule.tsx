"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, Syringe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { vaccinations, type Vaccination } from "@/lib/data/growth-data";
import { useVaccinationStore } from "@/lib/store/vaccination-store";

interface VaccinationScheduleProps {
  currentMonth: number;
}

const VACCINE_MONTHS = [0, 1, 2, 4, 6, 12];

function VaccineCard({
  vaccine,
  currentMonth,
  index,
}: {
  vaccine: Vaccination;
  currentMonth: number;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const records = useVaccinationStore((s) => s.records);
  const toggleVaccination = useVaccinationStore((s) => s.toggleVaccination);

  const isCompleted = (vaccineId: string, doseNumber: number) =>
    records.some((r) => r.vaccineId === vaccineId && r.doseNumber === doseNumber);
  const getRecord = (vaccineId: string, doseNumber: number) =>
    records.find((r) => r.vaccineId === vaccineId && r.doseNumber === doseNumber);

  useEffect(() => { setMounted(true); }, []);

  const allDone = vaccine.doses.every((d) =>
    mounted ? isCompleted(vaccine.id, d.doseNumber) : currentMonth > d.monthEnd
  );
  const hasCurrent = vaccine.doses.some(
    (d) => currentMonth >= d.monthStart && currentMonth <= d.monthEnd
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-2xl bg-white dark:bg-stone-900 transition-all",
        hasCurrent && !allDone
          ? "shadow-[0_8px_30px_rgb(251,191,36,0.12)] ring-1 ring-amber-200/50 bg-amber-50/40 dark:ring-amber-900/50 dark:bg-amber-950/20"
          : allDone
          ? "shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-green-50/30 dark:bg-green-950/20 ring-1 ring-green-100/50 dark:ring-green-900/30"
          : "shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
      )}
    >
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center gap-3 p-4">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl",
          allDone ? "bg-green-50 dark:bg-green-900/40" : hasCurrent ? "bg-amber-50 dark:bg-amber-900/40" : "bg-gray-50 dark:bg-stone-700"
        )}>
          {allDone ? (
            <Check size={18} className="text-green-500" />
          ) : hasCurrent ? (
            <AlertCircle size={18} className="text-amber-500" />
          ) : (
            <Syringe size={18} className="text-stone-400" />
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{vaccine.name}</span>
            <span className="rounded-full bg-stone-100 dark:bg-stone-700 px-2 py-0.5 text-[11px] font-medium text-stone-500 dark:text-stone-400">
              {vaccine.nameEn}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">{vaccine.description}</p>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-stone-400" />
        </motion.div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="dark:px-4 pb-4 pt-3"
        >
          <div className="space-y-2">
            {vaccine.doses.map((dose) => {
              const completed = mounted && isCompleted(vaccine.id, dose.doseNumber);
              const record = mounted ? getRecord(vaccine.id, dose.doseNumber) : undefined;
              const isCurrent = currentMonth >= dose.monthStart && currentMonth <= dose.monthEnd;

              return (
                <div
                  key={`${vaccine.id}-${dose.doseNumber}`}
                  className={cn(
                    "flex items-center gap-3 rounded-[16px] px-3 py-2",
                    completed ? "bg-green-50/50 dark:bg-green-900/20" : isCurrent ? "bg-amber-50 dark:bg-amber-900/20" : "bg-gray-50/80 dark:bg-stone-800/50"
                  )}
                >
                  {/* Checkbox — padded for 48px touch target */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVaccination(vaccine.id, dose.doseNumber);
                    }}
                    className="shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2.5"
                  >
                    {completed ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-400">
                        <Check size={12} className="text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400">
                        <Clock size={12} className="text-white" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2" />
                    )}
                  </button>

                  <div className="flex-1">
                    <span className={cn(
                      "text-xs font-medium",
                      completed ? "text-green-700 dark:text-green-400 line-through" : isCurrent ? "text-amber-700 dark:text-amber-400" : "text-stone-500 dark:text-stone-400"
                    )}>
                      {dose.doseLabel}
                    </span>
                    {dose.note && (
                      <span className="ml-2 text-[11px] text-stone-400 dark:text-stone-500">({dose.note})</span>
                    )}
                    {record && (
                      <span className="ml-2 text-[11px] text-green-500">{record.completedDate}</span>
                    )}
                  </div>

                  <span className="text-[11px] text-stone-400 dark:text-stone-500">
                    {dose.monthStart === dose.monthEnd
                      ? `${dose.monthStart}개월`
                      : `${dose.monthStart}~${dose.monthEnd}개월`}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function VaccinationSchedule({ currentMonth }: VaccinationScheduleProps) {
  const [mounted, setMounted] = useState(false);
  const completedCount = useVaccinationStore((s) => s.getCompletedCount());

  useEffect(() => { setMounted(true); }, []);

  const totalDoses = vaccinations.reduce((sum, v) => sum + v.doses.length, 0);
  const currentDoses = vaccinations.reduce(
    (sum, v) =>
      sum + v.doses.filter((d) => currentMonth >= d.monthStart && currentMonth <= d.monthEnd).length,
    0
  );
  const done = mounted ? completedCount : 0;
  const remaining = totalDoses - done;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[20px] bg-green-50/80 dark:bg-green-950/30 p-3.5 text-center">
          <p className="text-xl font-extrabold text-green-600 dark:text-green-400">{done}</p>
          <p className="text-[11px] font-medium text-green-600/70 dark:text-green-400/70 mt-0.5">접종 완료</p>
        </div>
        <div className="rounded-[20px] bg-amber-50/80 dark:bg-amber-950/30 p-3.5 text-center">
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{currentDoses}</p>
          <p className="text-[11px] font-medium text-amber-600/70 dark:text-amber-400/70 mt-0.5">접종 시기</p>
        </div>
        <div className="rounded-[20px] bg-gray-50 dark:bg-stone-800/50 p-3.5 text-center">
          <p className="text-xl font-extrabold text-stone-500 dark:text-stone-400">{remaining}</p>
          <p className="text-[11px] font-medium text-gray-400 md:text-gray-500 mt-0.5">남은 접종</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">접종 진행률</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{Math.round((done / totalDoses) * 100)}%</p>
        </div>
        <div className="h-3 rounded-full bg-stone-100 dark:bg-stone-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(done / totalDoses) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-3 rounded-full bg-[#14B8A6]"
          />
        </div>
        <div className="mt-3 flex justify-between">
          {VACCINE_MONTHS.map((m) => (
            <div key={m} className={cn(
              "flex flex-col items-center",
              m <= currentMonth ? "text-green-500" : "text-gray-300 dark:text-gray-600"
            )}>
              <div className={cn(
                "h-2.5 w-2.5 rounded-full border-2",
                m < currentMonth ? "bg-green-400"
                  : m === currentMonth ? "bg-amber-400"
                  : "bg-white dark:bg-stone-800"
              )} />
              <span className="mt-1 text-[11px]">{m}m</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/30 px-4 py-3">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          💡 각 접종 항목을 탭하여 열고, 완료된 접종을 체크하세요. 접종 기록은 기기에 안전하게 저장됩니다.
        </p>
      </div>

      {/* Vaccine Cards */}
      <div className="space-y-2">
        {vaccinations.map((vaccine, i) => (
          <VaccineCard key={vaccine.id} vaccine={vaccine} currentMonth={currentMonth} index={i} />
        ))}
      </div>

      <p className="text-center text-[11px] text-stone-400 dark:text-stone-500">
        * 질병관리청(KDCA) 국가예방접종 일정 기준
        <br />* 실제 접종은 소아과 전문의와 상담하세요
      </p>
    </div>
  );
}
