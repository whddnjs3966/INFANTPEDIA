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
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-stone-200 bg-white/90 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/90 pb-safe">
      <div className="flex items-center justify-around px-2 py-1.5">
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
                "relative flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 px-2 py-1 transition-colors",
                isActive
                  ? "text-[#7C5CFC] dark:text-violet-400"
                  : "text-stone-400 dark:text-stone-500"
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span
                className={cn(
                  "text-[11px] transition-all duration-200",
                  isActive ? "font-bold" : "font-medium opacity-70"
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="tab-dot"
                  className="absolute bottom-0.5 h-[3px] w-5 rounded-full bg-[#7C5CFC] dark:bg-violet-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
