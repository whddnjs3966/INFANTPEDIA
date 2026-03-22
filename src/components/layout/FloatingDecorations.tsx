"use client";

import { memo } from "react";

interface FloatingItem {
  emoji: string;
  x: string;
  y: string;
  size: number;
}

const items: FloatingItem[] = [
  { emoji: "\u2b50", x: "10%", y: "15%", size: 20 },
  { emoji: "\ud83d\udc96", x: "85%", y: "10%", size: 16 },
  { emoji: "\u2601\ufe0f", x: "70%", y: "25%", size: 22 },
  { emoji: "\ud83c\udf1f", x: "20%", y: "35%", size: 14 },
  { emoji: "\u2728", x: "5%", y: "50%", size: 16 },
];

export default memo(function FloatingDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {items.map((item, i) => (
        <div
          key={i}
          className="absolute select-none animate-float"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
            opacity: 0.12,
            animationDelay: `${i * 0.7}s`,
            willChange: "transform",
            contain: "layout style paint",
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
});

