"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, TrendingUp, Lightbulb, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "홈", icon: Home },
  { href: "/encyclopedia", label: "백과", icon: BookOpen },
  { href: "/growth", label: "성장", icon: TrendingUp },
  { href: "/tips", label: "꿀팁", icon: Lightbulb },
  { href: "/settings", label: "설정", icon: Settings },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[calc(448px-2rem)] -translate-x-1/2 rounded-3xl bg-white/75 shadow-lg shadow-black/8 backdrop-blur-xl dark:bg-gray-950/75 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.href}
              onClick={() => router.replace(tab.href)}
              whileTap={{ scale: 0.85 }}
              className={cn(
                "relative flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1 transition-colors",
                isActive
                  ? "text-[#E88FAC]"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={isActive ? { y: -2 } : { y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative z-10"
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span
                className={cn(
                  "relative z-10 text-[10px] font-medium transition-all duration-200",
                  isActive ? "font-bold opacity-100" : "font-medium opacity-70"
                )}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
