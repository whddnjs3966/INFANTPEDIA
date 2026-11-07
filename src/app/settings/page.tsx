"use client";

import Image from "next/image";

import { getKoreaDate } from "@/lib/utils/date";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBabyStore, type BabyGender } from "@/lib/store/baby-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Heart,
  Plus,
  Check,
  UserPlus,
  Moon,
  Sun,
  LogIn,
  LogOut,
  ChevronRight,
  FileText,
  Info,
  Baby,
  UsersRound,
  SlidersHorizontal,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/store/theme-store";
import SharingSection from "@/components/sharing/SharingSection";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/layout/PageHeader";
import SectionHeader from "@/components/layout/SectionHeader";
import StorageOverview from "@/components/settings/StorageOverview";
import DataLifecyclePanel from "@/components/settings/DataLifecyclePanel";
import { useDragScroll } from "@/hooks/useDragScroll";

const settingsTabs = [
  { id: "account", label: "내 계정", shortLabel: "내 계정", icon: User },
  { id: "babies", label: "아기 관리", shortLabel: "아기", icon: Baby },
  { id: "family", label: "가족과 공유", shortLabel: "가족", icon: UsersRound },
  { id: "app", label: "앱 환경", shortLabel: "앱 환경", icon: SlidersHorizontal },
  { id: "data", label: "데이터 관리", shortLabel: "데이터", icon: Database },
] as const;
type SettingsTab = typeof settingsTabs[number]["id"];
function tabFromHash(): SettingsTab {
  return settingsTabs.find(tab => window.location.hash === `#settings-${tab.id}`)?.id ?? "account";
}
function scrollToSettingsTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    let restoreFrame = 0;
    const restore = () => {
      setActiveTab(tabFromHash());
      // Run after the browser's history-position restoration without changing its global policy.
      cancelAnimationFrame(restoreFrame);
      restoreFrame = requestAnimationFrame(scrollToSettingsTop);
    };
    restore();
    window.addEventListener("hashchange", restore);
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("popstate", restore);
      cancelAnimationFrame(restoreFrame);
    };
  }, []);

  const selectTab = (tab: SettingsTab) => {
    scrollToSettingsTop();
    if (tab === activeTab) return;
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#settings-${tab}`);
    setActiveTab(tab);
  };
  const profile = useBabyStore((s) => s.profile);
  const babies = useBabyStore((s) => s.babies);
  const activeBabyId = useBabyStore((s) => s.activeBabyId);
  const updateBaby = useBabyStore((s) => s.updateBaby);
  const addBaby = useBabyStore((s) => s.addBaby);
  const setActiveBaby = useBabyStore((s) => s.setActiveBaby);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { user, loading: authLoading, signOut } = useAuth();

  const [name, setName] = useState(profile?.name || "");
  const [loggingOut, setLoggingOut] = useState(false);
  const [birthdate, setBirthdate] = useState(profile?.birthdate || "");
  const [gender, setGender] = useState<BabyGender>(profile?.gender || "male");
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  useLayoutEffect(() => {
    if (activeTab) scrollToSettingsTop();
  }, [activeTab]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBirthdate, setNewBirthdate] = useState("");
  const [newGender, setNewGender] = useState<BabyGender>("male");

  const { ref: babyRailRef, dragProps: babyRailDrag, suppressClickIfDragging: suppressBabyClick } = useDragScroll<HTMLDivElement>();

  useEffect(() => {
    if (!profile) return;
    const frame=requestAnimationFrame(()=>{
      setName(profile.name);setBirthdate(profile.birthdate);setGender(profile.gender || "male");
    });
    return()=>cancelAnimationFrame(frame);
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthdate || !profile) return;
    updateBaby(profile.id, { name: name.trim(), birthdate, gender });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEditMode(false);
    }, 1500);
  };

  const handleAddBaby = () => {
    if (!newName.trim() || !newBirthdate) return;
    addBaby({ name: newName.trim(), birthdate: newBirthdate, gender: newGender });
    setNewName("");
    setNewBirthdate("");
    setNewGender("male");
    setShowAddForm(false);
  };

  const activeId = profile?.id || activeBabyId;

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
  };
  const child = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen dark:bg-[var(--background)] pb-4">
      <PageHeader eyebrow="앱 관리" title="설정" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="px-5 space-y-6 [&>[hidden]]:hidden"
      >
        {/* ── Profile Banner ── */}
        <motion.section variants={child} className="space-y-3">
          <div className="surface-card p-4 text-[var(--foreground)]">
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--brand)]">
                <Baby size={25} strokeWidth={1.6} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--brand)]">
                  현재 아기
                </p>
                <p className="mt-0.5 break-words text-lg font-semibold leading-7 tracking-tight">
                  {profile?.name || "-"}
                </p>
                <p className="mt-0.5 text-sm font-medium text-[var(--muted-foreground)]">
                  {profile?.birthdate || ""}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div role="tablist" aria-label="설정 항목" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,3rem),1fr))] gap-1 rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-[var(--shadow-card)]">
          {settingsTabs.map((item, index) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return <button
            key={item.id}
            ref={element => { tabButtons.current[index] = element; }}
            id={`settings-tab-${item.id}`}
            role="tab"
            type="button"
            aria-label={item.label}
            aria-selected={activeTab === item.id}
            aria-controls={`settings-panel-${item.id}`}
            tabIndex={(activeTab ?? "account") === item.id ? 0 : -1}
            onClick={() => selectTab(item.id)}
            onKeyDown={event => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % settingsTabs.length;
              else if (event.key === "ArrowLeft") next = (index + settingsTabs.length - 1) % settingsTabs.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = settingsTabs.length - 1;
              else return;
              event.preventDefault();
              selectTab(settingsTabs[next].id);
              tabButtons.current[next]?.focus({ preventScroll: true });
            }}
            className={cn("relative flex min-h-[78px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-1 pb-4 pt-3 text-sm font-semibold transition-colors motion-reduce:transition-none", selected ? "bg-[var(--accent-soft)] text-[var(--brand)]" : "text-[var(--muted-foreground)] hover:bg-[var(--surface-bg)]")}
          >
            <span aria-hidden="true" className={`flex h-[40px] w-[40px] items-center justify-center rounded-xl ${selected ? "bg-[var(--card)]" : "bg-[var(--surface-sky)]"}`}><Icon size={20} strokeWidth={1.7} /></span>
            <span className="w-full break-words whitespace-normal text-center leading-snug">{item.shortLabel}</span>
            {selected && <span aria-hidden="true" className="absolute bottom-1.5 h-0.5 w-4 rounded-full bg-[var(--brand)]" />}
          </button>;
          })}
        </div>
        <section id="settings-panel-account" role="tabpanel" aria-labelledby="settings-tab-account" hidden={activeTab !== "account"} tabIndex={0} className="space-y-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]">
          <div><h2 id="settings-account-title" className="text-2xl font-semibold tracking-tight">내 계정</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">로그인 상태를 확인하고 계정을 관리해요.</p></div>
        {/* ── Account ── */}
        <motion.section variants={child} className="space-y-3">
          <SectionHeader level={3} title="계정" caption={user ? "로그인됨" : "로그인하지 않음"} />

          <div className="surface-card overflow-hidden">
            {authLoading ? (
              <div className="flex items-center justify-center py-5">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-3 px-5 py-4">
                  {user.user_metadata?.avatar_url ? (
                    <Image src={user.user_metadata.avatar_url} width={44} height={44} unoptimized alt="" className="h-11 w-11 rounded-full" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                      <User size={20} className="text-green-600 dark:text-green-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-stone-900 dark:text-stone-100">
                      {user.user_metadata?.full_name || user.user_metadata?.name || "사용자"}
                    </p>
                    <p className="truncate text-sm text-stone-500 dark:text-stone-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={async () => { setLoggingOut(true); await signOut(); setLoggingOut(false); }}
                  disabled={loggingOut}
                  className="flex w-full items-center justify-between px-5 py-4 border-t border-stone-100 dark:border-[var(--border)] active:bg-stone-50 dark:active:bg-stone-800"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} className="text-stone-500 dark:text-stone-400" />
                    <span className="text-base font-semibold text-stone-700 dark:text-stone-200">로그아웃</span>
                  </div>
                  {loggingOut && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-transparent" />
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="flex w-full items-center justify-between px-5 py-5 active:bg-stone-50 dark:active:bg-stone-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
                    <LogIn size={19} className="text-[var(--brand)]" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-bold text-stone-900 dark:text-stone-100">로그인하기</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">계정 연결과 가족 공유</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-300 dark:text-stone-600" />
              </button>
            )}
          </div>
        </motion.section>

        </section>
        <section id="settings-panel-babies" role="tabpanel" aria-labelledby="settings-tab-babies" hidden={activeTab !== "babies"} tabIndex={0} className="space-y-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]">
          <div><h2 id="settings-babies-title" className="text-2xl font-bold tracking-tight">아기 관리</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">기록할 아기를 선택하고 프로필을 관리해요.</p></div>
        {/* ── Baby switcher ── */}
        {babies.length > 1 && (
          <motion.section variants={child} className="space-y-3">
            <SectionHeader level={3} title="아기 전환" caption={`${babies.length}명 등록됨`} />

            <div
              ref={babyRailRef}
              {...babyRailDrag}
              className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1 cursor-grab active:cursor-grabbing select-none"
            >
              {babies.map((baby) => (
                <motion.button
                  key={baby.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={suppressBabyClick(() => setActiveBaby(baby.id))} aria-pressed={baby.id === activeId}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 transition-all elevation-1",
                    baby.id === activeId
                      ? "bg-[var(--brand)] text-[var(--brand-foreground)]"
                      : "bg-white dark:bg-[var(--card)]"
                  )}
                >
                  <span className="text-xl">{baby.gender === "female" ? "👧" : "👦"}</span>
                  <div className="text-left">
                    <p className={cn(
                      "text-base font-bold leading-tight",
                      baby.id === activeId ? "text-[var(--brand-foreground)]" : "text-stone-800 dark:text-stone-100"
                    )}>
                      {baby.name}
                    </p>
                    <p className={cn(
                      "text-sm leading-tight mt-0.5",
                      baby.id === activeId ? "text-[var(--brand-foreground)]/80" : "text-stone-500 dark:text-stone-400"
                    )}>
                      {baby.birthdate}
                    </p>
                  </div>
                  {baby.id === activeId && <Check size={14} className="text-[var(--brand-foreground)] shrink-0" strokeWidth={3} />}
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Profile (inline edit) ── */}
        <motion.section variants={child} className="space-y-3">
          <SectionHeader level={3}
            title="아기 프로필"
            caption={editMode ? "수정 중" : "탭하여 편집"}
            action={editMode ? undefined : { label: "편집", onClick: () => setEditMode(true) }}
          />

          <div className="surface-card overflow-hidden">
            {!editMode ? (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-[var(--border)]">
                  <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">이름</span>
                  <span className="text-base font-bold text-stone-900 dark:text-stone-100">{profile?.name || "-"}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-[var(--border)]">
                  <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">성별</span>
                  <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {profile?.gender === "female" ? "👧 여아" : "👦 남아"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">생년월일</span>
                  <span className="text-base font-bold text-stone-900 dark:text-stone-100">{profile?.birthdate || "-"}</span>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-name" className="text-sm font-bold text-stone-500 dark:text-stone-400">아기 이름</Label>
                  <Input id="settings-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-2xl text-base" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-stone-500 dark:text-stone-400">성별</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setGender("male")} aria-pressed={gender === "male"} className={cn("flex items-center justify-center gap-2 rounded-2xl py-3 text-base font-semibold transition-all", gender === "male" ? "bg-[var(--brand)] text-[var(--brand-foreground)]" : "bg-stone-100 dark:bg-[var(--surface-muted)] text-stone-500 dark:text-stone-400")}>
                      👦 남아
                    </button>
                    <button type="button" onClick={() => setGender("female")} aria-pressed={gender === "female"} className={cn("flex items-center justify-center gap-2 rounded-2xl py-3 text-base font-semibold transition-all", gender === "female" ? "bg-[var(--brand)] text-[var(--brand-foreground)]" : "bg-stone-100 dark:bg-[var(--surface-muted)] text-stone-500 dark:text-stone-400")}>
                      👧 여아
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-birth" className="text-sm font-bold text-stone-500 dark:text-stone-400">생년월일</Label>
                  <Input id="settings-birth" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} max={getKoreaDate()} className="h-12 rounded-2xl text-base" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)} className="h-12 flex-1 rounded-2xl">취소</Button>
                  <Button type="submit" className="h-12 flex-1 rounded-2xl bg-[var(--brand)] font-semibold text-[var(--brand-foreground)] active:bg-[var(--brand-pressed)]">
                    {saved ? "저장됨!" : "저장"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.section>

        <motion.section variants={child} className="space-y-3">
          <SectionHeader level={3} title="아기 추가" />
          <div className="surface-card overflow-hidden">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex w-full items-center justify-between px-5 py-4 border-t border-stone-100 dark:border-[var(--border)] active:bg-stone-50 dark:active:bg-stone-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
                    <UserPlus size={19} className="text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-bold text-stone-900 dark:text-stone-100">아이 추가</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">여러 아이 관리하기</p>
                  </div>
                </div>
                <Plus size={18} className="text-stone-400 dark:text-stone-500" />
              </button>
            ) : (
              <div className="border-t border-stone-100 dark:border-[var(--border)] p-5 space-y-3">
                <p className="text-sm font-bold text-stone-700 dark:text-stone-200">새 아이 등록</p>
                <Input type="text" aria-label="새 아기 이름" placeholder="아기 이름" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-12 rounded-2xl text-base" />
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setNewGender("male")} aria-pressed={newGender === "male"} className={cn("flex min-h-12 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-semibold transition-all", newGender === "male" ? "bg-[var(--brand)] text-[var(--brand-foreground)]" : "bg-stone-100 dark:bg-[var(--surface-muted)] text-stone-500 dark:text-stone-400")}>
                    👦 남아
                  </button>
                  <button type="button" onClick={() => setNewGender("female")} aria-pressed={newGender === "female"} className={cn("flex min-h-12 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-semibold transition-all", newGender === "female" ? "bg-[var(--brand)] text-[var(--brand-foreground)]" : "bg-stone-100 dark:bg-[var(--surface-muted)] text-stone-500 dark:text-stone-400")}>
                    👧 여아
                  </button>
                </div>
                <Input aria-label="새 아기 생년월일" type="date" value={newBirthdate} onChange={(e) => setNewBirthdate(e.target.value)} max={getKoreaDate()} className="h-12 rounded-2xl text-base" />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="h-12 flex-1 rounded-2xl">취소</Button>
                  <Button type="button" onClick={handleAddBaby} disabled={!newName.trim() || !newBirthdate} className="h-12 flex-1 rounded-2xl bg-[var(--brand)] font-semibold text-[var(--brand-foreground)] active:bg-[var(--brand-pressed)]">등록</Button>
                </div>
              </div>
            )}
          </div>
        </motion.section>
        </section>
        <section id="settings-panel-family" role="tabpanel" aria-labelledby="settings-tab-family" hidden={activeTab !== "family"} tabIndex={0} className="space-y-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]">
          <div><h2 id="settings-family-title" className="text-2xl font-bold tracking-tight">가족과 공유</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">공유 상태를 확인하고 이 기기의 연결 정보를 관리해요.</p></div>
        {/* ── Data Sharing ── */}
        <motion.section variants={child} className="space-y-3">
          <SharingSection />
        </motion.section>

        </section>
        <section id="settings-panel-app" role="tabpanel" aria-labelledby="settings-tab-app" hidden={activeTab !== "app"} tabIndex={0} className="space-y-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]">
          <div><h2 id="settings-app-title" className="text-2xl font-bold tracking-tight">앱 환경</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">화면 테마와 앱 정보를 확인해요.</p></div>
        <motion.section variants={child} className="space-y-3">
          <SectionHeader level={3} title="화면 설정" />
          <div className="surface-card overflow-hidden">
            <button
              onClick={toggleTheme}
              role="switch" aria-checked={theme === "dark"} aria-label="다크 모드"
              className="flex w-full items-center justify-between px-5 py-4 active:bg-stone-50 dark:active:bg-stone-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40">
                  {theme === "dark" ? <Moon size={19} className="text-indigo-500" /> : <Sun size={19} className="text-indigo-500" />}
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100">다크 모드</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{theme === "dark" ? "어두운 테마 사용 중" : "밝은 테마 사용 중"}</p>
                </div>
              </div>
              <div className={cn("relative h-7 w-12 rounded-full transition-colors shrink-0", theme === "dark" ? "bg-indigo-500" : "bg-stone-300")}>
                <motion.div
                  className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
                  animate={{ left: theme === "dark" ? "1.375rem" : "0.125rem" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </button>          </div>
        </motion.section>
        {/* ── App info ── */}
        <motion.section variants={child} className="space-y-3">
          <SectionHeader level={3} title="앱 정보" />

          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-[var(--border)]">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-stone-400" />
                <span className="text-base font-semibold text-stone-700 dark:text-stone-200">버전</span>
              </div>
              <span className="text-sm font-bold text-stone-500 dark:text-stone-400">1.2.0</span>
            </div>
            <button
              onClick={() => router.push("/privacy")}
              className="flex w-full items-center justify-between px-5 py-4 active:bg-stone-50 dark:active:bg-stone-800"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-stone-400" />
                <span className="text-base font-semibold text-stone-700 dark:text-stone-200">개인정보처리방침</span>
              </div>
              <ChevronRight size={18} className="text-stone-300 dark:text-stone-600" />
            </button>
          </div>
        </motion.section>

        </section>
        <section id="settings-panel-data" role="tabpanel" aria-labelledby="settings-tab-data" hidden={activeTab !== "data"} tabIndex={0} className="space-y-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]">
          <div><h2 id="settings-data-title" className="text-2xl font-bold tracking-tight">데이터 관리</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">기록 보관 위치를 확인하고 삭제 범위를 살펴보세요.</p></div>
        <StorageOverview signedIn={!!user} checkingAccount={authLoading} accountId={user?.id} />
        <DataLifecyclePanel key={`data:${activeTab}:${profile?.id??"none"}`} />
        </section>
        {/* ── Footer ── */}
        <motion.div variants={child} className="flex items-center justify-center gap-1.5 pt-2 pb-4 text-sm text-stone-400 dark:text-stone-600">
          <span>Made with</span>
          <Heart size={11} className="fill-pink-400 text-pink-400" />
          <span>for parents</span>
        </motion.div>
      </motion.div>
    </div>
  );
}



