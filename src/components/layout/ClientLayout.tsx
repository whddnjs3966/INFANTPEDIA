"use client";

import { usePathname, useRouter } from "next/navigation";
import { useBabyStore } from "@/lib/store/baby-store";
import { useThemeStore } from "@/lib/store/theme-store";
import BottomTabBar from "./BottomTabBar";
import SyncManager from "@/components/sync/SyncManager";
import { useEffect, useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useBabyStore((s) => s.profile);
  const theme = useThemeStore((s) => s.theme);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);

    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      } else {
        // In dev, unregister any previously registered SW and purge caches
        // to prevent stale JS/HTML from causing hydration mismatches.
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => reg.unregister());
        });
        if ("caches" in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
        }
      }
    }
  }, []);

  // Apply dark class to html element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (
      hydrated &&
      !profile &&
      pathname !== "/onboarding" &&
      pathname !== "/login" &&
      pathname !== "/privacy" &&
      !pathname.startsWith("/auth") &&
      !pathname.startsWith("/admin")
    ) {
      router.replace("/onboarding");
    }
  }, [hydrated, profile, pathname, router]);

  // Pass-through for admin routes without mobile constraints
  if (pathname.startsWith("/admin")) {
    return <main>{children}</main>;
  }

  // Don't render until hydrated to avoid layout flash
  if (!hydrated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--surface-bg)" }}
      >
        <div className="animate-pulse-soft text-4xl">{"\ud83d\udc76"}</div>
      </div>
    );
  }

  const isOnboarding = pathname === "/onboarding";
  const isSpecialPage =
    pathname === "/login" ||
    pathname === "/privacy" ||
    pathname.startsWith("/auth");
  const showTabBar = !!profile && !isOnboarding && !isSpecialPage;

  // Show loading while redirecting
  if (!profile && !isOnboarding && !isSpecialPage) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--surface-bg)" }}
      >
        <div className="animate-pulse-soft text-4xl">{"\ud83d\udc76"}</div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto min-h-screen w-full max-w-[480px]"
      style={{ backgroundColor: "var(--surface-bg)" }}
    >
      <SyncManager />
      <main className={showTabBar ? "pb-28" : ""}>{children}</main>
      {showTabBar && <BottomTabBar />}
    </div>
  );
}
