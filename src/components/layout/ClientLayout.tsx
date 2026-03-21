"use client";

import { usePathname, useRouter } from "next/navigation";
import { useBabyStore } from "@/lib/store/baby-store";
import { useThemeStore } from "@/lib/store/theme-store";
import BottomTabBar from "./BottomTabBar";
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
    if (hydrated && !profile && pathname !== "/onboarding" && pathname !== "/login" && !pathname.startsWith("/auth")) {
      router.replace("/onboarding");
    }
  }, [hydrated, profile, pathname, router]);

  // Don't render until hydrated to avoid layout flash
  if (!hydrated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--cream-bg)" }}
      >
        <div className="animate-pulse-soft text-4xl">{"\ud83d\udc76"}</div>
      </div>
    );
  }

  const isOnboarding = pathname === "/onboarding";
  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth");
  const showTabBar = !!profile && !isOnboarding && !isAuthPage;

  // Show loading while redirecting
  if (!profile && !isOnboarding && !isAuthPage) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--cream-bg)" }}
      >
        <div className="animate-pulse-soft text-4xl">{"\ud83d\udc76"}</div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto min-h-screen max-w-md"
      style={{ backgroundColor: "var(--cream-bg)" }}
    >
      <main className={showTabBar ? "pb-24" : ""}>{children}</main>
      {showTabBar && <BottomTabBar />}
    </div>
  );
}
