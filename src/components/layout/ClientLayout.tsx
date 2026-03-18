"use client";

import { usePathname, useRouter } from "next/navigation";
import { useBabyStore } from "@/lib/store/baby-store";
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !profile && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [hydrated, profile, pathname, router]);

  // Don't render until hydrated to avoid layout flash
  if (!hydrated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#FFF8F0" }}
      >
        <div className="animate-pulse-soft text-4xl">{"\ud83d\udc76"}</div>
      </div>
    );
  }

  const isOnboarding = pathname === "/onboarding";
  const showTabBar = !!profile && !isOnboarding;

  // Show loading while redirecting
  if (!profile && !isOnboarding) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#FFF8F0" }}
      >
        <div className="animate-pulse-soft text-4xl">{"\ud83d\udc76"}</div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto min-h-screen max-w-md"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <main className={showTabBar ? "pb-24" : ""}>{children}</main>
      {showTabBar && <BottomTabBar />}
    </div>
  );
}
