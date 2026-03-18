"use client";

import { motion } from "framer-motion";

interface FloatingItem {
  emoji: string;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
}

const items: FloatingItem[] = [
  { emoji: "\u2b50", x: "10%", y: "15%", size: 20, delay: 0, duration: 3.5 },
  { emoji: "\ud83d\udc96", x: "85%", y: "10%", size: 16, delay: 0.5, duration: 4 },
  { emoji: "\u2601\ufe0f", x: "70%", y: "25%", size: 22, delay: 1, duration: 5 },
  { emoji: "\ud83c\udf1f", x: "20%", y: "35%", size: 14, delay: 1.5, duration: 3 },
  { emoji: "\ud83d\udc9b", x: "90%", y: "40%", size: 18, delay: 0.8, duration: 4.5 },
  { emoji: "\u2728", x: "5%", y: "50%", size: 16, delay: 2, duration: 3.5 },
  { emoji: "\ud83c\udf08", x: "75%", y: "55%", size: 20, delay: 0.3, duration: 4 },
  { emoji: "\ud83e\uddf8", x: "15%", y: "65%", size: 18, delay: 1.2, duration: 5 },
];

export default function FloatingDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}
