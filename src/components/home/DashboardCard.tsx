"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type ColorScheme = "blue" | "pink" | "purple" | "mint" | "yellow" | "peach";

const iconColorMap: Record<ColorScheme, string> = {
  blue: "text-blue-500",
  pink: "text-pink-500",
  purple: "text-violet-500",
  mint: "text-emerald-500",
  yellow: "text-amber-500",
  peach: "text-orange-500",
};

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: ColorScheme;
  emoji?: string;
  index?: number;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  emoji,
  index = 0,
}: DashboardCardProps) {
  const iconColor = iconColorMap[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-4",
        "bg-white dark:bg-stone-900",
        "border border-stone-200 dark:border-stone-700",
        "shadow-[0_2px_8px_rgb(0,0,0,0.06)] transition-shadow"
      )}
    >
      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2">
          <div className={cn("rounded-lg bg-stone-100 dark:bg-stone-800 p-1.5", iconColor)}>
            <Icon size={18} />
          </div>
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">{title}</span>
          {emoji && <span className="text-sm">{emoji}</span>}
        </div>
        <p className="text-xl font-extrabold text-stone-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="mt-0.5 text-[13px] font-medium text-stone-500 dark:text-stone-400">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
