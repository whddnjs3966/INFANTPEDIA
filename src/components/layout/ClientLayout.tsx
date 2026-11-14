"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBabyStore } from "@/lib/store/baby-store";
import { useThemeStore } from "@/lib/store/theme-store";
import BottomTabBar from "./BottomTabBar";
import SyncManager from "@/components/sync/SyncManager";
import AtomicSyncManager from "@/components/sync/AtomicSyncManager";
import { useEffect, useSyncExternalStore } from "react";
import { InstallPromptProvider } from "@/components/pwa/InstallPrompt";
import { isLocalRestoreBlocked, recoverLocalRestore, subscribeLocalDataSafety, isLocalDocumentStale } from "@/lib/sync/local-restore-journal";
import "./bright-shell.css";

const subscribeHydration = () => () => {};
const illustratedTabs = new Set(["/", "/encyclopedia", "/growth", "/tips", "/settings"]);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicGuide = ["/encyclopedia", "/tips", "/search"].includes(pathname);
  const router = useRouter();
  const profile = useBabyStore((s) => s.profile);
  const theme = useThemeStore((s) => s.theme);
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const stale = useSyncExternalStore(subscribeLocalDataSafety, isLocalDocumentStale, () => false);

  useEffect(() => {
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
          caches.keys().then((keys) => keys.filter(key => key.startsWith("infantpedia-")).forEach((key) => caches.delete(key)));
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
      !isPublicGuide &&
      pathname !== "/onboarding" &&
      pathname !== "/login" &&
      pathname !== "/privacy" &&
      !pathname.startsWith("/auth") &&
      !pathname.startsWith("/admin")
    ) {
      router.replace("/onboarding");
    }
  }, [hydrated, profile, pathname, router, isPublicGuide]);

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
  if(stale)return <main className="mx-auto max-w-md space-y-4 p-6"><h1 className="text-xl font-bold">다른 탭에서 기록이 바뀌었어요</h1><p className="text-sm leading-6">최신 기록을 불러오기 위해 이 탭의 변경과 전송을 멈췄어요. 새로고침 후 이어서 이용해 주세요.</p><button className="min-h-12 rounded-xl bg-[var(--brand)] px-4 text-[var(--brand-foreground)]" onClick={()=>window.location.reload()}>최신 기록 불러오기</button></main>;
  if(isLocalRestoreBlocked())return <main className="mx-auto max-w-md space-y-4 p-6"><h1 className="text-xl font-bold">복원 저장 상태를 확인해 주세요</h1><p className="text-sm leading-6">기기 저장을 복구하지 못해 기록 변경과 온라인 전송을 멈췄어요. 브라우저 데이터를 지우지 말고 저장 공간을 확인해 주세요.</p><button className="min-h-12 rounded-xl bg-[var(--brand)] px-4 text-[var(--brand-foreground)]" onClick={()=>{recoverLocalRestore();window.location.reload();}}>저장 상태 다시 확인</button></main>;
  const isSpecialPage =
    pathname === "/login" ||
    pathname === "/privacy" ||
    pathname.startsWith("/auth");
  const showTabBar = (!!profile || isPublicGuide) && !isOnboarding && !isSpecialPage;

  // Show loading while redirecting
  if (!profile && !isPublicGuide && !isOnboarding && !isSpecialPage) {
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
    <InstallPromptProvider><div
      data-bright-shell={illustratedTabs.has(pathname) ? "" : undefined}
      className="mx-auto min-h-screen w-full max-w-[480px]"
      style={{ backgroundColor: "var(--surface-bg)" }}
    >
      <SyncManager />
      <AtomicSyncManager />
      <main className={showTabBar ? "pb-28" : ""}>
        {!profile && isPublicGuide && <div className="mx-5 mt-4 flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100"><p>월령별 가이드를 둘러보세요</p><Link href="/onboarding" className="inline-flex min-h-12 shrink-0 items-center font-bold underline underline-offset-4">아기 등록</Link></div>}
        {children}
      </main>
      {showTabBar && <BottomTabBar />}
    </div></InstallPromptProvider>
  );
}
