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
      <nav
        className="pointer-events-auto mx-4 mb-3 rounded-[26px] bg-white/75 dark:bg-stone-900/75 backdrop-blur-3xl backdrop-saturate-150 ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-[0_2px_6px_rgba(15,15,20,0.05),0_10px_32px_rgba(15,15,20,0.09)]"
      >
        <div className="flex items-stretch justify-between px-1.5 py-1.5">
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
                whileTap={{ scale: 0.92 }}
                className="relative flex flex-1 flex-col items-center justify-center gap-1 py-1.5"
                aria-label={tab.label}
              >
                {/* Active icon pill (behind icon only) */}
                <div className="relative flex h-8 w-14 items-center justify-center">
                  {isActive && (
                    <motion.div
                      layoutId="tab-pill-bg"
                      className="absolute inset-0 rounded-full bg-[#14B8A6] shadow-[0_2px_8px_rgba(20,184,166,0.35)]"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    size={isActive ? 20 : 21}
                    strokeWidth={isActive ? 2.4 : 2}
                    className={cn(
                      "relative z-10 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-stone-500 dark:text-stone-400"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] leading-none font-bold tracking-tight transition-colors",
                    isActive
                      ? "text-[#14B8A6] dark:text-teal-400"
                      : "text-stone-500 dark:text-stone-400"
                  )}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
