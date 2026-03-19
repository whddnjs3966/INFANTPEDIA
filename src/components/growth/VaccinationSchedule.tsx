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
  const { isCompleted, toggleVaccination, getRecord } = useVaccinationStore();

  useEffect(() => { setMounted(true); }, []);

  const allDone = vaccine.doses.every((d) =>
    mounted ? isCompleted(vaccine.id, d.doseNumber) : currentMonth > d.monthEnd
  );
  const hasCurrent = vaccine.doses.some(
    (d) => currentMonth >= d.monthStart && currentMonth <= d.monthEnd
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-2xl border bg-white transition-all",
        hasCurrent && !allDone
          ? "border-amber-200 shadow-md shadow-amber-50"
          : allDone
          ? "border-green-100"
          : "border-gray-100"
      )}
    >
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center gap-3 p-4">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          allDone ? "bg-green-50" : hasCurrent ? "bg-amber-50" : "bg-gray-50"
        )}>
          {allDone ? (
            <Check size={18} className="text-green-500" />
          ) : hasCurrent ? (
            <AlertCircle size={18} className="text-amber-500" />
          ) : (
            <Syringe size={18} className="text-gray-400" />
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">{vaccine.name}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              {vaccine.nameEn}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{vaccine.description}</p>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-gray-50 px-4 pb-4 pt-3"
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
                    "flex items-center gap-3 rounded-xl px-3 py-2",
                    completed ? "bg-green-50/50" : isCurrent ? "bg-amber-50" : "bg-gray-50"
                  )}
                >
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVaccination(vaccine.id, dose.doseNumber);
                    }}
                    className="shrink-0"
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
                      <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                    )}
                  </button>

                  <div className="flex-1">
                    <span className={cn(
                      "text-xs font-medium",
                      completed ? "text-green-700 line-through" : isCurrent ? "text-amber-700" : "text-gray-500"
                    )}>
                      {dose.doseLabel}
                    </span>
                    {dose.note && (
                      <span className="ml-2 text-[10px] text-gray-400">({dose.note})</span>
                    )}
                    {record && (
                      <span className="ml-2 text-[10px] text-green-500">{record.completedDate}</span>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-400">
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
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-green-50 p-3 text-center">
          <p className="text-lg font-bold text-green-600">{done}</p>
          <p className="text-[10px] text-green-500">접종 완료</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 text-center">
          <p className="text-lg font-bold text-amber-600">{currentDoses}</p>
          <p className="text-[10px] text-amber-500">접종 시기</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3 text-center">
          <p className="text-lg font-bold text-gray-500">{remaining}</p>
          <p className="text-[10px] text-gray-400">남은 접종</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">접종 진행률</p>
          <p className="text-xs font-bold text-emerald-600">{Math.round((done / totalDoses) * 100)}%</p>
        </div>
        <div className="h-3 rounded-full bg-gray-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(done / totalDoses) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
          />
        </div>
        <div className="mt-3 flex justify-between">
          {VACCINE_MONTHS.map((m) => (
            <div key={m} className={cn(
              "flex flex-col items-center",
              m <= currentMonth ? "text-green-500" : "text-gray-300"
            )}>
              <div className={cn(
                "h-2.5 w-2.5 rounded-full border-2",
                m < currentMonth ? "border-green-400 bg-green-400"
                  : m === currentMonth ? "border-amber-400 bg-amber-400"
                  : "border-gray-200 bg-white"
              )} />
              <span className="mt-1 text-[9px]">{m}m</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-2xl bg-blue-50 px-4 py-3">
        <p className="text-xs text-blue-600">
          💡 각 접종 항목을 탭하여 열고, 완료된 접종을 체크하세요. 접종 기록은 기기에 안전하게 저장됩니다.
        </p>
      </div>

      {/* Vaccine Cards */}
      <div className="space-y-2">
        {vaccinations.map((vaccine, i) => (
          <VaccineCard key={vaccine.id} vaccine={vaccine} currentMonth={currentMonth} index={i} />
        ))}
      </div>

      <p className="text-center text-[10px] text-gray-400">
        * 질병관리청(KDCA) 국가예방접종 일정 기준
        <br />* 실제 접종은 소아과 전문의와 상담하세요
      </p>
    </div>
  );
}
