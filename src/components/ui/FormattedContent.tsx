"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormattedContentProps {
  content: string;
  className?: string;
}

const circleNumbers = ["❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾", "❿"];

// Key terms to bold — numbers/measurements, medical terms, time expressions, action words
const boldPatterns = [
  // Numbers with units (e.g., 38도, 0.5도, 37.5도, 5분, 6개월, 22~24도)
  /(\d+[\.\,]?\d*\s*(?:도|분|시간|ml|cc|mg|kg|cm|mm|g|개월|세|회|번|일|주|초|개|장|방울|스푼))/g,
  // Number ranges (e.g., 22~24도, 3~6개월)
  /(\d+\s*[~\-]\s*\d+\s*(?:도|분|시간|ml|cc|mg|kg|cm|mm|g|개월|세|회|번|일|주|초|개))/g,
  // Important warning/action keywords
  /(즉시 병원|응급실|소아과|병원에|병원을|해열제|수분 보충|관찰하|주의하|금지|필수|중요|권장|반드시|절대|위험|주의|필요 시|확인하)/g,
];

function highlightText(text: string): React.ReactNode[] {
  // Collect all bold ranges
  const ranges: { start: number; end: number }[] = [];

  for (const pattern of boldPatterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }
  }

  if (ranges.length === 0) return [text];

  // Sort and merge overlapping ranges
  ranges.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i].start <= last.end) {
      last.end = Math.max(last.end, ranges[i].end);
    } else {
      merged.push(ranges[i]);
    }
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  merged.forEach((range, i) => {
    if (cursor < range.start) {
      parts.push(text.slice(cursor, range.start));
    }
    parts.push(
      <strong key={i} className="font-bold text-gray-800 dark:text-gray-100">
        {text.slice(range.start, range.end)}
      </strong>
    );
    cursor = range.end;
  });
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}

export default function FormattedContent({
  content,
  className,
}: FormattedContentProps) {
  // Split by sentence-ending patterns: Korean period + space, or end of string
  const sentences = content
    .split(/(?<=\.)[\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // If only 1 sentence, render as a simple paragraph with highlights
  if (sentences.length <= 1) {
    return (
      <p className={cn("text-sm leading-relaxed text-gray-600 dark:text-gray-300", className)}>
        {highlightText(content)}
      </p>
    );
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      {sentences.map((sentence, idx) => (
        <div key={idx} className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0 text-[13px] leading-relaxed font-bold text-indigo-400 dark:text-indigo-300">
            {circleNumbers[idx] || `${idx + 1}.`}
          </span>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {highlightText(sentence)}
          </p>
        </div>
      ))}
    </div>
  );
}
