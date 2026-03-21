"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile,
  ChevronDown,
  Check,
  AlertCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FormattedContent from "@/components/ui/FormattedContent";
import {
  getDentalGuide,
  getTeethForMonth,
  getMonthlyDentalNote,
  type ToothInfo,
} from "@/lib/data/dental-guide-data";

interface DentalGuideProps {
  month: number;
}

// ── Expandable Section ──────────────────────────────────────────────
function ExpandableSection({
  title,
  icon: Icon,
  iconColor,
  gradientFrom,
  gradientTo,
  borderColor,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full min-h-[48px] items-center gap-3 rounded-2xl border bg-gradient-to-r p-3.5 text-left transition-all",
          gradientFrom,
          gradientTo,
          borderColor,
          isOpen && "shadow-md"
        )}
        whileTap={{ scale: 0.98 }}
      >
        <div className={cn("rounded-xl p-2", iconColor)}>
          <Icon size={18} />
        </div>
        <span className="flex-1 text-sm font-bold text-gray-700 dark:text-gray-200">
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-teal-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 mt-2 p-4 shadow-sm">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tooth status helpers ────────────────────────────────────────────
type ToothStatus = "erupted" | "upcoming" | "future";

function getToothStatus(tooth: ToothInfo, month: number): ToothStatus {
  const match = tooth.eruptionMonth.match(/(\d+)~(\d+)/);
  if (!match) return "future";
  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  if (month >= end) return "erupted";
  if (month >= start) return "upcoming";
  return "future";
}

// ── Jaw Diagram ─────────────────────────────────────────────────────
// Renders a simplified upper/lower jaw with tooth slots
function JawDiagram({ month }: { month: number }) {
  const guide = getDentalGuide();
  const allTeeth = guide.teethTimeline;

  // Group teeth by position
  const upperTeeth = allTeeth.filter((t) => t.position === "upper");
  const lowerTeeth = allTeeth.filter((t) => t.position === "lower");

  // Arrange upper: second_molar, first_molar, canine, lateral, center, center, lateral, canine, first_molar, second_molar
  const sideOrder: ToothInfo["side"][] = [
    "second_molar",
    "first_molar",
    "canine",
    "lateral",
    "center",
  ];

  function arrangeRow(teeth: ToothInfo[]): ToothInfo[] {
    const left: ToothInfo[] = [];
    const right: ToothInfo[] = [];
    const byType: Record<string, ToothInfo[]> = {};
    for (const t of teeth) {
      if (!byType[t.side]) byType[t.side] = [];
      byType[t.side].push(t);
    }
    for (const side of sideOrder) {
      const pair = byType[side] || [];
      if (pair[0]) left.push(pair[0]);
      if (pair[1]) right.unshift(pair[1]);
    }
    return [...left, ...right];
  }

  const upperRow = arrangeRow(upperTeeth);
  const lowerRow = arrangeRow(lowerTeeth);

  function ToothSlot({ tooth }: { tooth: ToothInfo }) {
    const status = getToothStatus(tooth, month);
    return (
      <motion.div
        className={cn(
          "w-6 h-7 rounded-md flex items-center justify-center text-[10px] font-bold border transition-all",
          status === "erupted" &&
            "bg-teal-400 dark:bg-teal-500 border-teal-500 dark:border-teal-400 text-white shadow-sm shadow-teal-300/50 dark:shadow-teal-600/50",
          status === "upcoming" &&
            "bg-teal-100 dark:bg-teal-900/50 border-teal-300 dark:border-teal-600 text-teal-600 dark:text-teal-300 animate-pulse",
          status === "future" &&
            "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600"
        )}
        title={`${tooth.name} (${tooth.eruptionMonth})`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: tooth.eruptionOrder * 0.03 }}
      >
        {status === "erupted" ? (
          <Check size={12} />
        ) : status === "upcoming" ? (
          <span className="text-[9px]">🦷</span>
        ) : (
          <span className="text-[8px]">·</span>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Upper label */}
      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
        윗니
      </span>
      {/* Upper row */}
      <div className="flex items-center gap-0.5">
        {upperRow.map((tooth) => (
          <ToothSlot key={tooth.id} tooth={tooth} />
        ))}
      </div>
      {/* Divider */}
      <div className="w-full max-w-[260px] h-px bg-gradient-to-r from-transparent via-teal-300 dark:via-teal-700 to-transparent" />
      {/* Lower row */}
      <div className="flex items-center gap-0.5">
        {lowerRow.map((tooth) => (
          <ToothSlot key={tooth.id} tooth={tooth} />
        ))}
      </div>
      {/* Lower label */}
      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
        아랫니
      </span>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2">
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-teal-400 dark:bg-teal-500 inline-block" />
          나온 이
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-teal-100 dark:bg-teal-900/50 border border-teal-300 dark:border-teal-600 inline-block" />
          나올 수 있는 이
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 inline-block" />
          아직
        </span>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────
export default function DentalGuide({ month }: DentalGuideProps) {
  const guide = getDentalGuide();
  const monthlyNote = getMonthlyDentalNote(month);
  const eruptedTeeth = getTeethForMonth(month);

  // Deduplicate teeth timeline by eruptionOrder for the timeline display
  const uniqueTimeline = useMemo(() => {
    const seen = new Set<number>();
    const result: {
      order: number;
      name: string;
      shortName: string;
      eruptionMonth: string;
      position: string;
      side: string;
      count: number;
    }[] = [];
    for (const t of guide.teethTimeline) {
      if (!seen.has(t.eruptionOrder)) {
        seen.add(t.eruptionOrder);
        const count = guide.teethTimeline.filter(
          (x) => x.eruptionOrder === t.eruptionOrder
        ).length;
        result.push({
          order: t.eruptionOrder,
          name: t.name,
          shortName: t.shortName,
          eruptionMonth: t.eruptionMonth,
          position: t.position,
          side: t.side,
          count,
        });
      }
    }
    return result;
  }, [guide.teethTimeline]);

  // Count erupted / upcoming teeth
  const eruptedCount = guide.teethTimeline.filter(
    (t) => getToothStatus(t, month) === "erupted"
  ).length;
  const upcomingCount = guide.teethTimeline.filter(
    (t) => getToothStatus(t, month) === "upcoming"
  ).length;

  return (
    <div className="mx-4 mb-4 space-y-3">
      {/* ── Section 1: Current Teeth Status ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-teal-200/50 dark:border-teal-800/30 bg-gradient-to-br from-teal-50 via-cyan-50 to-mint-50 dark:from-teal-950/20 dark:via-cyan-950/20 dark:to-teal-950/20 p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-xl bg-teal-100 dark:bg-teal-900/50 p-2">
            <Smile size={20} className="text-teal-500 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              치아 발달 현황
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              나온 이 {eruptedCount}개
              {upcomingCount > 0 && ` · 나올 수 있는 이 ${upcomingCount}개`}
            </p>
          </div>
        </div>

        {/* Jaw Diagram */}
        <JawDiagram month={month} />

        {/* Monthly Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/30 p-3"
        >
          <div className="flex items-start gap-2">
            <Sparkles
              size={14}
              className="text-teal-400 shrink-0 mt-0.5"
            />
            <FormattedContent content={monthlyNote} className="text-[12px] [&_p]:text-teal-700 [&_p]:dark:text-teal-300" />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Section 2: Teeth Timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ExpandableSection
          title="유치 발달 타임라인"
          icon={Calendar}
          iconColor="bg-cyan-100 dark:bg-cyan-900/50 text-cyan-500 dark:text-cyan-400"
          gradientFrom="from-cyan-50 dark:from-cyan-950/20"
          gradientTo="to-teal-50 dark:to-teal-950/20"
          borderColor="border-cyan-200/50 dark:border-cyan-800/30"
        >
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-300 via-cyan-300 to-teal-200 dark:from-teal-700 dark:via-cyan-700 dark:to-teal-800 rounded-full" />

            <div className="space-y-3">
              {uniqueTimeline.map((item, idx) => {
                // Determine if this eruption order is relevant to current month
                const match = item.eruptionMonth.match(/(\d+)~(\d+)/);
                const start = match ? parseInt(match[1], 10) : 999;
                const end = match ? parseInt(match[2], 10) : 999;
                const isErupted = month >= end;
                const isUpcoming = month >= start && month < end;
                const isFuture = month < start;

                return (
                  <motion.div
                    key={item.order}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 relative"
                  >
                    {/* Order circle */}
                    <div
                      className={cn(
                        "w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10 border-2",
                        isErupted &&
                          "bg-teal-400 dark:bg-teal-500 border-teal-300 dark:border-teal-400 text-white",
                        isUpcoming &&
                          "bg-cyan-100 dark:bg-cyan-900/50 border-cyan-400 dark:border-cyan-500 text-cyan-600 dark:text-cyan-300 shadow-md shadow-cyan-200/50 dark:shadow-cyan-800/50",
                        isFuture &&
                          "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                      )}
                    >
                      {isErupted ? (
                        <Check size={14} />
                      ) : (
                        item.order
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={cn(
                        "flex-1 rounded-xl p-2.5 border transition-all",
                        isUpcoming &&
                          "bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 shadow-sm shadow-cyan-100/50 dark:shadow-cyan-900/50",
                        isErupted &&
                          "bg-teal-50/50 dark:bg-teal-950/20 border-teal-200/50 dark:border-teal-800/30",
                        isFuture &&
                          "bg-gray-50/50 dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-[12px] font-bold",
                            isUpcoming
                              ? "text-cyan-700 dark:text-cyan-300"
                              : isErupted
                                ? "text-teal-700 dark:text-teal-400"
                                : "text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {item.name}
                        </p>
                        <span
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            isUpcoming
                              ? "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300"
                              : isErupted
                                ? "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                          )}
                        >
                          {item.count}개
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-[11px] mt-0.5",
                          isUpcoming
                            ? "text-cyan-600 dark:text-cyan-400"
                            : "text-gray-400 dark:text-gray-500"
                        )}
                      >
                        {item.eruptionMonth}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ExpandableSection>
      </motion.div>

      {/* ── Section 3: Teething Symptoms & Remedies ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <ExpandableSection
          title="이앓이 증상 & 대처법"
          icon={AlertCircle}
          iconColor="bg-amber-100 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400"
          gradientFrom="from-amber-50 dark:from-amber-950/20"
          gradientTo="to-orange-50 dark:to-orange-950/20"
          borderColor="border-amber-200/50 dark:border-amber-800/30"
          defaultOpen={month >= 5 && month <= 10}
        >
          {/* Symptoms */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1">
              <AlertCircle size={12} /> 주요 증상
            </p>
            <div className="flex flex-wrap gap-1.5">
              {guide.teethingSymptoms.map((symptom, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300"
                >
                  <AlertCircle size={10} className="text-amber-400 shrink-0" />
                  {symptom}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Remedies */}
          <div>
            <p className="text-[11px] font-bold text-teal-700 dark:text-teal-300 mb-2 flex items-center gap-1">
              <Heart size={12} /> 대처법
            </p>
            <div className="space-y-2">
              {guide.teethingRemedies.map((remedy, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-teal-200/50 dark:border-teal-800/30 bg-teal-50/50 dark:bg-teal-950/20 p-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl">{remedy.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200">
                          {remedy.title}
                        </p>
                        <span className="text-[10px] text-amber-500">
                          {remedy.effectiveness === "high"
                            ? "⭐⭐⭐"
                            : "⭐⭐"}
                        </span>
                      </div>
                      <FormattedContent content={remedy.description} className="text-[11px]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ExpandableSection>
      </motion.div>

      {/* ── Section 4: Brushing Guide ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ExpandableSection
          title="양치 가이드"
          icon={ShieldCheck}
          iconColor="bg-teal-100 dark:bg-teal-900/50 text-teal-500 dark:text-teal-400"
          gradientFrom="from-teal-50 dark:from-teal-950/20"
          gradientTo="to-emerald-50 dark:to-emerald-950/20"
          borderColor="border-teal-200/50 dark:border-teal-800/30"
        >
          {/* Key info */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 dark:bg-teal-900/40 px-2.5 py-1 text-[10px] font-semibold text-teal-700 dark:text-teal-300">
              🪥 {guide.brushingGuide.startAge}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 px-2.5 py-1 text-[10px] font-semibold text-cyan-700 dark:text-cyan-300">
              🕐 {guide.brushingGuide.frequency}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              ⏱️ {guide.brushingGuide.duration}
            </span>
          </div>

          {/* Fluoride note */}
          <div className="rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200/50 dark:border-cyan-800/30 p-3 mb-4">
            <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 mb-1 flex items-center gap-1">
              <Sparkles size={12} /> 불소 치약 안내
            </p>
            <FormattedContent content={guide.brushingGuide.fluorideNote} className="text-[11px]" />
          </div>

          {/* Steps */}
          <div className="space-y-2.5">
            {guide.brushingGuide.steps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 dark:from-teal-500 dark:to-cyan-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                    <span>{step.emoji}</span>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ExpandableSection>
      </motion.div>

      {/* ── Section 5: Dental Visit Guide ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <ExpandableSection
          title="치과 방문 가이드"
          icon={Calendar}
          iconColor="bg-violet-100 dark:bg-violet-900/50 text-violet-500 dark:text-violet-400"
          gradientFrom="from-violet-50 dark:from-violet-950/20"
          gradientTo="to-purple-50 dark:to-purple-950/20"
          borderColor="border-violet-200/50 dark:border-violet-800/30"
        >
          <div className="space-y-3">
            {/* First visit */}
            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/30 p-3">
              <p className="text-[11px] font-bold text-violet-700 dark:text-violet-300 mb-1">
                📅 첫 치과 방문
              </p>
              <FormattedContent content={guide.dentalVisit.firstVisit} className="text-[12px]" />
            </div>

            {/* Frequency */}
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 p-3">
              <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1">
                🔄 정기 검진
              </p>
              <p className="text-[12px] text-gray-600 dark:text-gray-300">
                {guide.dentalVisit.frequency}
              </p>
            </div>

            {/* What to expect */}
            <div>
              <p className="text-[11px] font-bold text-violet-700 dark:text-violet-300 mb-2 flex items-center gap-1">
                <Check size={12} /> 검진 시 확인 사항
              </p>
              <div className="space-y-1.5">
                {guide.dentalVisit.whatToExpect.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
                      <Check
                        size={10}
                        className="text-violet-500 dark:text-violet-400"
                      />
                    </div>
                    <p className="text-[12px] text-gray-600 dark:text-gray-300">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ExpandableSection>
      </motion.div>

      {/* ── Section 6: Common Issues FAQ ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <ExpandableSection
          title="자주 묻는 질문 (FAQ)"
          icon={HelpCircle}
          iconColor="bg-sky-100 dark:bg-sky-900/50 text-sky-500 dark:text-sky-400"
          gradientFrom="from-sky-50 dark:from-sky-950/20"
          gradientTo="to-cyan-50 dark:to-cyan-950/20"
          borderColor="border-sky-200/50 dark:border-sky-800/30"
        >
          <div className="space-y-3">
            {guide.commonIssues.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-sky-200/50 dark:border-sky-800/30 bg-sky-50/50 dark:bg-sky-950/20 p-3"
              >
                <p className="text-[12px] font-bold text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                  <span>{item.emoji}</span>
                  {item.issue}
                </p>
                <div className="pl-6">
                  <FormattedContent content={item.solution} className="text-[11px]" />
                </div>
              </motion.div>
            ))}
          </div>
        </ExpandableSection>
      </motion.div>
    </div>
  );
}
