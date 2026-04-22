"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBabyStore, type BabyGender } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useMilestoneStore } from "@/lib/store/milestone-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  User,
  Trash2,
  Heart,
  Plus,
  Check,
  UserPlus,
  Moon,
  Sun,
  LogIn,
  LogOut,
  Shield,
  ChevronRight,
  FileText,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/store/theme-store";
import SharingSection from "@/components/sharing/SharingSection";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/layout/PageHeader";
import SectionHeader from "@/components/layout/SectionHeader";
import { useDragScroll } from "@/hooks/useDragScroll";

export default function SettingsPage() {
  const router = useRouter();
  const profile = useBabyStore((s) => s.profile);
  const babies = useBabyStore((s) => s.babies);
  const activeBabyId = useBabyStore((s) => s.activeBabyId);
  const updateBaby = useBabyStore((s) => s.updateBaby);
  const addBaby = useBabyStore((s) => s.addBaby);
  const removeBaby = useBabyStore((s) => s.removeBaby);
  const setActiveBaby = useBabyStore((s) => s.setActiveBaby);
  const clearAll = useBabyStore((s) => s.clearAll);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { user, loading: authLoading, signOut } = useAuth();

  const [name, setName] = useState(profile?.name || "");
  const [loggingOut, setLoggingOut] = useState(false);
  const [birthdate, setBirthdate] = useState(profile?.birthdate || "");
  const [gender, setGender] = useState<BabyGender>(profile?.gender || "male");
  const [saved, setSaved] = useState(false);
  const [deleteBabyTargetId, setDeleteBabyTargetId] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [accountDeleteDialogOpen, setAccountDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBirthdate, setNewBirthdate] = useState("");
  const [newGender, setNewGender] = useState<BabyGender>("male");

  const { ref: babyRailRef, dragProps: babyRailDrag, suppressClickIfDragging: suppressBabyClick } = useDragScroll<HTMLDivElement>();

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBirthdate(profile.birthdate);
      setGender(profile.gender || "male");
    }
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

  const handleReset = () => {
    clearAll();
    useMeasurementStore.getState().clearAll();
    useVaccinationStore.getState().clearAll();
    useSyncStore.getState().mappings.forEach((m) =>
      useSyncStore.getState().removeMapping(m.localBabyId)
    );
    useMilestoneStore.setState({ completedMilestones: {}, completedDates: {} });
    router.replace("/onboarding");
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (res.ok) {
        clearAll();
        useMeasurementStore.getState().clearAll();
        useVaccinationStore.getState().clearAll();
        useSyncStore.getState().mappings.forEach((m) =>
          useSyncStore.getState().removeMapping(m.localBabyId)
        );
        useMilestoneStore.setState({ completedMilestones: {}, completedDates: {} });
        router.replace("/onboarding");
      }
    } catch {
      /* ignore */
    } finally {
      setDeletingAccount(false);
      setAccountDeleteDialogOpen(false);
    }
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
    <div className="min-h-screen dark:bg-stone-950 pb-4">
      <PageHeader eyebrow="앱 관리" title="설정" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="px-5 space-y-7"
      >
        {/* ── Profile Banner ── */}
        <motion.section variants={child} className="space-y-3">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14B8A6] to-[#2DD4BF] p-5 text-white elevation-2">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl"
              aria-hidden
            />
            <div className="relative flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30 text-3xl">
                {profile?.gender === "female" ? "👧" : "👦"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white/75 uppercase tracking-wider">
                  현재 아기
                </p>
                <p className="mt-0.5 text-[20px] font-extrabold tracking-tight truncate">
                  {profile?.name || "-"}
                </p>
                <p className="mt-0.5 text-[13px] font-medium text-white/85">
                  {profile?.birthdate || ""}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Account ── */}
        <motion.section variants={child} className="space-y-3">
          <SectionHeader title="계정" caption={user ? "로그인됨" : "로그인하지 않음"} />

          <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 elevation-1">
            {authLoading ? (
              <div className="flex items-center justify-center py-5">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-300 border-t-transparent" />
              </div>
            ) : user ? (
              <>
                <div className="flex items-center gap-3 px-5 py-4">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="h-11 w-11 rounded-full" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                      <User size={20} className="text-green-600 dark:text-green-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-stone-900 dark:text-stone-100">
                      {user.user_metadata?.full_name || user.user_metadata?.name || "사용자"}
                    </p>
                    <p className="truncate text-[12px] text-stone-500 dark:text-stone-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={async () => { setLoggingOut(true); await signOut(); setLoggingOut(false); }}
                  disabled={loggingOut}
                  className="flex w-full items-center justify-between px-5 py-4 border-t border-stone-100 dark:border-stone-800 active:bg-stone-50 dark:active:bg-stone-800"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} className="text-stone-500 dark:text-stone-400" />
                    <span className="text-[14px] font-semibold text-stone-700 dark:text-stone-200">로그아웃</span>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40">
                    <LogIn size={19} className="text-[#14B8A6]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-stone-900 dark:text-stone-100">로그인하기</p>
                    <p className="text-[12px] text-stone-500 dark:text-stone-400">기기 간 데이터 동기화</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-300 dark:text-stone-600" />
              </button>
            )}
          </div>
        </motion.section>

        {/* ── Baby switcher ── */}
        {babies.length > 1 && (
          <motion.section variants={child} className="space-y-3">
            <SectionHeader title="아기 전환" caption={`${babies.length}명 등록됨`} />

            <div
              ref={babyRailRef}
              {...babyRailDrag}
              className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1 cursor-grab active:cursor-grabbing select-none"
            >
              {babies.map((baby) => (
                <motion.button
                  key={baby.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={suppressBabyClick(() => setActiveBaby(baby.id))}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 transition-all elevation-1",
                    baby.id === activeId
                      ? "bg-[#14B8A6] text-white"
                      : "bg-white dark:bg-stone-900"
                  )}
                >
                  <span className="text-xl">{baby.gender === "female" ? "👧" : "👦"}</span>
                  <div className="text-left">
                    <p className={cn(
                      "text-[14px] font-bold leading-tight",
                      baby.id === activeId ? "text-white" : "text-stone-800 dark:text-stone-100"
                    )}>
                      {baby.name}
                    </p>
                    <p className={cn(
                      "text-[11px] leading-tight mt-0.5",
                      baby.id === activeId ? "text-white/80" : "text-stone-500 dark:text-stone-400"
                    )}>
                      {baby.birthdate}
                    </p>
                  </div>
                  {baby.id === activeId && <Check size={14} className="text-white shrink-0" strokeWidth={3} />}
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Profile (inline edit) ── */}
        <motion.section variants={child} className="space-y-3">
          <SectionHeader
            title="아기 프로필"
            caption={editMode ? "수정 중" : "탭하여 편집"}
            action={editMode ? undefined : { label: "편집", onClick: () => setEditMode(true) }}
          />

          <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 elevation-1">
            {!editMode ? (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-[13px] font-semibold text-stone-500 dark:text-stone-400">이름</span>
                  <span className="text-[14px] font-bold text-stone-900 dark:text-stone-100">{profile?.name || "-"}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-[13px] font-semibold text-stone-500 dark:text-stone-400">성별</span>
                  <span className="text-[14px] font-bold text-stone-900 dark:text-stone-100">
                    {profile?.gender === "female" ? "👧 여아" : "👦 남아"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[13px] font-semibold text-stone-500 dark:text-stone-400">생년월일</span>
                  <span className="text-[14px] font-bold text-stone-900 dark:text-stone-100">{profile?.birthdate || "-"}</span>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-name" className="text-[12px] font-bold text-stone-500 dark:text-stone-400">아기 이름</Label>
                  <Input id="settings-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-2xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-bold text-stone-500 dark:text-stone-400">성별</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setGender("male")} className={cn("flex items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold transition-all", gender === "male" ? "bg-[#14B8A6] text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400")}>
                      👦 남아
                    </button>
                    <button type="button" onClick={() => setGender("female")} className={cn("flex items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold transition-all", gender === "female" ? "bg-[#14B8A6] text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400")}>
                      👧 여아
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-birth" className="text-[12px] font-bold text-stone-500 dark:text-stone-400">생년월일</Label>
                  <Input id="settings-birth" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="h-11 rounded-2xl" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)} className="h-11 flex-1 rounded-2xl">취소</Button>
                  <Button type="submit" className="h-11 flex-1 rounded-2xl bg-[#14B8A6] font-semibold text-white active:bg-[#0D9488]">
                    {saved ? "저장됨!" : "저장"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.section>

        {/* ── Preferences ── */}
        <motion.section variants={child} className="space-y-3">
          <SectionHeader title="환경 설정" />

          <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 elevation-1">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center justify-between px-5 py-4 active:bg-stone-50 dark:active:bg-stone-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40">
                  {theme === "dark" ? <Moon size={19} className="text-indigo-500" /> : <Sun size={19} className="text-indigo-500" />}
                </div>
                <div className="text-left">
                  <p className="text-[15px] font-bold text-stone-900 dark:text-stone-100">다크 모드</p>
                  <p className="text-[12px] text-stone-500 dark:text-stone-400">{theme === "dark" ? "어두운 테마 사용 중" : "밝은 테마 사용 중"}</p>
                </div>
              </div>
              <div className={cn("relative h-7 w-12 rounded-full transition-colors shrink-0", theme === "dark" ? "bg-indigo-500" : "bg-stone-300")}>
                <motion.div
                  className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
                  animate={{ left: theme === "dark" ? "1.375rem" : "0.125rem" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </button>

            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex w-full items-center justify-between px-5 py-4 border-t border-stone-100 dark:border-stone-800 active:bg-stone-50 dark:active:bg-stone-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
                    <UserPlus size={19} className="text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-stone-900 dark:text-stone-100">아이 추가</p>
                    <p className="text-[12px] text-stone-500 dark:text-stone-400">여러 아이 관리하기</p>
                  </div>
                </div>
                <Plus size={18} className="text-stone-400 dark:text-stone-500" />
              </button>
            ) : (
              <div className="border-t border-stone-100 dark:border-stone-800 p-5 space-y-3">
                <p className="text-[13px] font-bold text-stone-700 dark:text-stone-200">새 아이 등록</p>
                <Input type="text" placeholder="아기 이름" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-11 rounded-2xl" />
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setNewGender("male")} className={cn("flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] font-semibold transition-all", newGender === "male" ? "bg-[#14B8A6] text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400")}>
                    👦 남아
                  </button>
                  <button type="button" onClick={() => setNewGender("female")} className={cn("flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] font-semibold transition-all", newGender === "female" ? "bg-[#14B8A6] text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400")}>
                    👧 여아
                  </button>
                </div>
                <Input type="date" value={newBirthdate} onChange={(e) => setNewBirthdate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="h-11 rounded-2xl" />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="h-11 flex-1 rounded-2xl">취소</Button>
                  <Button type="button" onClick={handleAddBaby} disabled={!newName.trim() || !newBirthdate} className="h-11 flex-1 rounded-2xl bg-[#14B8A6] font-semibold text-white active:bg-[#0D9488]">등록</Button>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── Data Sharing ── */}
        <motion.section variants={child} className="space-y-3">
          <SharingSection />
        </motion.section>

        {/* ── Remove baby ── */}
        {babies.length > 1 && (
          <motion.section variants={child} className="space-y-3">
            <SectionHeader title="아이 데이터 삭제" caption="삭제할 아이를 선택하세요" />
            <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 elevation-1 divide-y divide-stone-100 dark:divide-stone-800">
              {babies.map((baby) => (
                <div key={baby.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">{baby.gender === "female" ? "👧" : "👦"}</span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-stone-900 dark:text-stone-100 truncate">{baby.name}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">{baby.birthdate}</p>
                    </div>
                  </div>
                  <Dialog open={deleteBabyTargetId === baby.id} onOpenChange={(open) => setDeleteBabyTargetId(open ? baby.id : null)}>
                    <DialogTrigger render={<button className="shrink-0 rounded-xl bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 text-[12px] font-bold text-orange-500 dark:text-orange-400 transition-colors active:bg-orange-100" />}>
                      삭제
                    </DialogTrigger>
                    <DialogContent className="max-w-[340px] rounded-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-center">{baby.name}의 데이터를 삭제할까요?</DialogTitle>
                        <DialogDescription className="text-center">이 아기의 프로필과 모든 기록이 삭제됩니다.{"\n"}이 작업은 되돌릴 수 없어요.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex gap-2 sm:flex-row">
                        <DialogClose render={<Button variant="outline" className="flex-1 rounded-2xl" />}>취소</DialogClose>
                        <Button variant="destructive" onClick={() => { removeBaby(baby.id); setDeleteBabyTargetId(null); }} className="flex-1 rounded-2xl">삭제</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Danger zone ── */}
        <motion.section variants={child} className="space-y-3">
          <SectionHeader title="위험 구역" caption="되돌릴 수 없는 작업" />

          <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 elevation-1">
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger render={
                <button className="flex w-full items-center justify-between px-5 py-4 active:bg-stone-50 dark:active:bg-stone-800" />
              }>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
                    <Trash2 size={19} className="text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-bold text-red-500">전체 초기화</p>
                    <p className="text-[12px] text-stone-500 dark:text-stone-400">모든 아기 정보 삭제</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-300 dark:text-stone-600" />
              </DialogTrigger>
              <DialogContent className="max-w-[340px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-center">정말 초기화할까요?</DialogTitle>
                  <DialogDescription className="text-center">저장된 모든 아기 정보가 삭제됩니다.{"\n"}이 작업은 되돌릴 수 없어요.</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:flex-row">
                  <DialogClose render={<Button variant="outline" className="flex-1 rounded-2xl" />}>취소</DialogClose>
                  <Button variant="destructive" onClick={() => { setResetDialogOpen(false); handleReset(); }} className="flex-1 rounded-2xl">초기화</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {user && (
              <Dialog open={accountDeleteDialogOpen} onOpenChange={setAccountDeleteDialogOpen}>
                <DialogTrigger render={
                  <button className="flex w-full items-center justify-between px-5 py-4 border-t border-stone-100 dark:border-stone-800 active:bg-stone-50 dark:active:bg-stone-800" />
                }>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
                      <Shield size={19} className="text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-bold text-red-500">계정 삭제</p>
                      <p className="text-[12px] text-stone-500 dark:text-stone-400">영구 삭제 (복구 불가)</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-stone-300 dark:text-stone-600" />
                </DialogTrigger>
                <DialogContent className="max-w-[340px] rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-center">정말 계정을 삭제할까요?</DialogTitle>
                    <DialogDescription className="text-center">계정이 영구적으로 삭제되며{"\n"}저장된 모든 데이터를 복구할 수 없습니다.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex gap-2 sm:flex-row">
                    <DialogClose render={<Button variant="outline" className="flex-1 rounded-2xl" />}>취소</DialogClose>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount} className="flex-1 rounded-2xl">
                      {deletingAccount ? "삭제 중..." : "삭제"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.section>

        {/* ── App info ── */}
        <motion.section variants={child} className="space-y-3">
          <SectionHeader title="앱 정보" />

          <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 elevation-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-stone-400" />
                <span className="text-[14px] font-semibold text-stone-700 dark:text-stone-200">버전</span>
              </div>
              <span className="text-[13px] font-bold text-stone-500 dark:text-stone-400">1.2.0</span>
            </div>
            <button
              onClick={() => router.push("/privacy")}
              className="flex w-full items-center justify-between px-5 py-4 active:bg-stone-50 dark:active:bg-stone-800"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-stone-400" />
                <span className="text-[14px] font-semibold text-stone-700 dark:text-stone-200">개인정보처리방침</span>
              </div>
              <ChevronRight size={18} className="text-stone-300 dark:text-stone-600" />
            </button>
          </div>
        </motion.section>

        {/* ── Footer ── */}
        <motion.div variants={child} className="flex items-center justify-center gap-1.5 pt-2 pb-4 text-[12px] text-stone-400 dark:text-stone-600">
          <span>Made with</span>
          <Heart size={11} className="fill-pink-400 text-pink-400" />
          <span>for parents</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
