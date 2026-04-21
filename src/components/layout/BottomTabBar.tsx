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
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 pb-safe">
      <nav className="pointer-events-auto mx-4 mb-3 rounded-[28px] bg-white/95 backdrop-blur-2xl dark:bg-stone-900/95 ring-1 ring-stone-200/80 dark:ring-stone-800/80 elevation-3">
        <div className="flex items-center justify-between px-2 py-2">
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
                whileTap={{ scale: 0.88 }}
                className="relative flex flex-1 items-center justify-center py-2"
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-pill-bg"
                    className="absolute inset-y-0 left-1/2 w-14 -translate-x-1/2 rounded-full bg-[#7C5CFC]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                  <Icon
                    size={isActive ? 22 : 23}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-white"
                        : "text-stone-400 dark:text-stone-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] leading-none font-bold transition-all",
                      isActive
                        ? "text-white"
                        : "text-stone-500 dark:text-stone-500 opacity-0 h-0"
                    )}
                  >
                    {tab.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
