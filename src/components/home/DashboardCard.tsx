"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type ColorScheme = "blue" | "pink" | "purple" | "mint" | "yellow" | "peach";

const colorMap: Record<ColorScheme, { bg: string; border: string; icon: string }> = {
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-950/50 dark:to-sky-950/50",
    border: "border-blue-200/50 dark:border-blue-800/50",
    icon: "text-blue-400",
  },
  pink: {
    bg: "bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/50 dark:to-rose-950/50",
    border: "border-pink-200/50 dark:border-pink-800/50",
    icon: "text-pink-400",
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-950/50",
    border: "border-purple-200/50 dark:border-purple-800/50",
    icon: "text-purple-400",
  },
  mint: {
    bg: "bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
    icon: "text-emerald-400",
  },
  yellow: {
    bg: "bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/50 dark:to-amber-950/50",
    border: "border-yellow-200/50 dark:border-yellow-800/50",
    icon: "text-yellow-500",
  },
  peach: {
    bg: "bg-gradient-to-br from-orange-50 to-rose-100 dark:from-orange-950/50 dark:to-rose-950/50",
    border: "border-orange-200/50 dark:border-orange-800/50",
    icon: "text-orange-400",
  },
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
  const colors = colorMap[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative overflow-hidden rounded-[28px] p-4",
        colors.bg,
        "border", colors.border,
        "shadow-[0_2px_12px_rgb(0,0,0,0.04)] transition-shadow"
      )}
    >
      {/* Decorative circle */}
      <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/20" />

      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2">
          <div className={cn("rounded-lg bg-white/60 dark:bg-white/10 p-1.5", colors.icon)}>
            <Icon size={18} />
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{title}</span>
          {emoji && <span className="text-sm">{emoji}</span>}
        </div>
        <p className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="mt-0.5 text-[13px] font-medium text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
