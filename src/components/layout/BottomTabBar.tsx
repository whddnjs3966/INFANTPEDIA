"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, BookOpen, TrendingUp, Lightbulb, Settings } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "홈", icon: Home },
  { href: "/encyclopedia", label: "백과", icon: BookOpen },
  { href: "/growth", label: "기록", icon: TrendingUp },
  { href: "/tips", label: "꿀팁", icon: Lightbulb },
  { href: "/settings", label: "설정", icon: Settings },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 pb-safe">
      <nav
        aria-label="주요 메뉴"
        className="pointer-events-auto mx-3 mb-2 rounded-[28px] border border-[var(--border)] bg-[var(--card)]/95 shadow-[0_8px_32px_rgba(31,41,55,0.10)] backdrop-blur-xl"
      >
        <div className="flex items-stretch px-1 py-1">
          {tabs.map((tab) => {
            const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                scroll={tab.href !== "/encyclopedia" && tab.href !== "/tips"}
                replace
                aria-current={isActive ? "page" : undefined}
                className="relative flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[var(--muted-foreground)] transition-colors hover:text-[var(--brand)]"
              >
                {isActive && (
                  <motion.span
                    layoutId={reduceMotion ? undefined : "tab-pill-bg"}
                    className="absolute left-1/2 top-1 h-8 w-12 -translate-x-1/2 rounded-full bg-[var(--accent-soft)]"
                    transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
                  />
                )}
                <span className="relative z-10 flex h-7 w-12 items-center justify-center">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    aria-hidden="true"
                    className={cn(
                      "relative z-10",
                      isActive ? "text-[var(--brand)]" : "text-[var(--muted-foreground)]"
                    )}
                  />
                </span>
                <span className={cn(
                  "relative z-10 text-sm leading-5",
                  isActive ? "font-bold text-[var(--brand)]" : "font-medium text-[var(--muted-foreground)]"
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
