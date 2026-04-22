"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormattedContentProps {
  content: string;
  className?: string;
}

// 측정값/수치 — 중립 하이콘트라스트 볼드
const measurementPatterns = [
  // Numbers with units (e.g., 38도, 0.5도, 37.5도, 5분, 6개월, 22~24도)
  /(\d+[\.\,]?\d*\s*(?:도|분|시간|ml|cc|mg|kg|cm|mm|g|개월|세|회|번|일|주|초|개|장|방울|스푼))/g,
  // Number ranges (e.g., 22~24도, 3~6개월)
  /(\d+\s*[~\-]\s*\d+\s*(?:도|분|시간|ml|cc|mg|kg|cm|mm|g|개월|세|회|번|일|주|초|개))/g,
];

// 경고/행동 키워드 — amber 액센트 볼드
const warningPatterns = [
  /(즉시 병원|응급실|소아과|병원에|병원을|해열제|수분 보충|관찰하|주의하|금지|필수|중요|권장|반드시|절대|위험|주의|필요 시|확인하)/g,
];

type Range = {
  start: number;
  end: number;
  type: "measurement" | "warning";
};

function highlightText(text: string): React.ReactNode[] {
  const ranges: Range[] = [];

  for (const pattern of measurementPatterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "measurement",
      });
    }
  }

  for (const pattern of warningPatterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "warning",
      });
    }
  }

  if (ranges.length === 0) return [text];

  // Sort by start (warning takes precedence on ties so it wins when merged)
  ranges.sort((a, b) => a.start - b.start || (a.type === "warning" ? -1 : 1));

  const merged: Range[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
      if (r.type === "warning") last.type = "warning";
    } else {
      merged.push({ ...r });
    }
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  merged.forEach((range, i) => {
    if (cursor < range.start) parts.push(text.slice(cursor, range.start));
    const segment = text.slice(range.start, range.end);
    if (range.type === "warning") {
      parts.push(
        <strong
          key={i}
          className="font-bold text-amber-600 dark:text-amber-400"
        >
          {segment}
        </strong>
      );
    } else {
      parts.push(
        <strong
          key={i}
          className="font-bold text-stone-900 dark:text-stone-50"
        >
          {segment}
        </strong>
      );
    }
    cursor = range.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return parts;
}

export default function FormattedContent({
  content,
  className,
}: FormattedContentProps) {
  // Split by sentence-ending patterns: Korean period + whitespace
  const sentences = content
    .split(/(?<=\.)[\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Single sentence → clean paragraph
  if (sentences.length <= 1) {
    return (
      <p
        className={cn(
          "text-[14px] leading-[1.7] text-stone-600 dark:text-stone-300",
          className
        )}
      >
        {highlightText(content)}
      </p>
    );
  }

  // Multiple sentences → editorial numbered list
  return (
    <ol className={cn("space-y-3", className)}>
      {sentences.map((sentence, idx) => (
        <li key={idx} className="flex gap-3">
          <span
            aria-hidden
            className="shrink-0 pt-[4px] text-[10.5px] font-black tabular-nums tracking-[0.08em] text-[#14B8A6] dark:text-teal-400"
          >
            {String(idx + 1).padStart(2, "0")}
          </span>
          <p className="flex-1 text-[14px] leading-[1.7] text-stone-600 dark:text-stone-300">
            {highlightText(sentence)}
          </p>
        </li>
      ))}
    </ol>
  );
}
