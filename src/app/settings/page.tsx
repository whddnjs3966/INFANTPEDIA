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
import { User, Trash2, Info, Heart, Plus, Check, UserPlus, Moon, Sun, LogIn, LogOut, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/store/theme-store";
import SharingSection from "@/components/sharing/SharingSection";
import { useAuth } from "@/hooks/useAuth";

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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBirthdate, setNewBirthdate] = useState("");
  const [newGender, setNewGender] = useState<BabyGender>("male");

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
    setTimeout(() => setSaved(false), 2000);
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
      // ignore
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
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen dark:bg-gray-950 px-4 pt-6 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[12px] font-medium text-gray-400 dark:text-gray-500">앱 관리</p>
        <h1 className="mt-0.5 text-[22px] font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
          설정
        </h1>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mt-5 space-y-3"
      >
        {/* ── Account Section ── */}
        <motion.div variants={child} className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/40">
              {user ? <User size={17} className="text-green-500" /> : <LogIn size={17} className="text-green-500" />}
            </div>
            <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">계정</h2>
          </div>

          {authLoading ? (
            <div className="flex items-center justify-center py-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-300 border-t-transparent" />
            </div>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-green-50/50 dark:bg-green-950/20 px-4 py-3">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-200 dark:bg-green-800">
                    <User size={20} className="text-green-600 dark:text-green-300" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {user.user_metadata?.full_name || user.user_metadata?.name || "사용자"}
                  </p>
                  <p className="truncate text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-green-100 dark:bg-green-900/50 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                  로그인됨
                </span>
              </div>
              <button
                onClick={async () => { setLoggingOut(true); await signOut(); setLoggingOut(false); }}
                disabled={loggingOut}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors active:bg-gray-100 dark:active:bg-gray-700"
              >
                {loggingOut ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                ) : (
                  <><LogOut size={14} />로그아웃</>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">로그인하면 기기를 바꿔도 데이터가 안전하게 유지돼요</p>
              <button
                onClick={() => router.push("/login")}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 text-sm font-semibold text-white active:from-green-500 active:to-emerald-500"
              >
                <LogIn size={16} />
                소셜 로그인하기
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Baby Switcher ── */}
        {babies.length > 1 && (
          <motion.div variants={child} className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-3 text-[12px] font-semibold text-gray-400 dark:text-gray-500 px-1">아기 선택</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {babies.map((baby) => (
                <motion.button
                  key={baby.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveBaby(baby.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-2xl border-2 px-4 py-2.5 transition-all",
                    baby.id === activeId
                      ? "border-pink-300 bg-pink-50 shadow-sm dark:border-pink-600 dark:bg-pink-900/30"
                      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  )}
                >
                  <span className="text-lg">{baby.gender === "female" ? "👧" : "👦"}</span>
                  <div className="text-left">
                    <p className={cn("text-sm font-semibold", baby.id === activeId ? "text-pink-700 dark:text-pink-300" : "text-gray-600 dark:text-gray-300")}>
                      {baby.name}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{baby.birthdate}</p>
                  </div>
                  {baby.id === activeId && <Check size={14} className="text-pink-500" />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Profile Edit ── */}
        <motion.div variants={child} className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950/40">
              <User size={17} className="text-pink-500" />
            </div>
            <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">아기 프로필</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-name" className="text-[12px] font-semibold text-gray-500 dark:text-gray-400">아기 이름</Label>
              <Input id="settings-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-gray-500 dark:text-gray-400">성별</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setGender("male")} className={cn("flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-medium transition-all", gender === "male" ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/30 dark:text-blue-400" : "border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500")}>
                  👦 남아
                </button>
                <button type="button" onClick={() => setGender("female")} className={cn("flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-medium transition-all", gender === "female" ? "border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-600 dark:bg-pink-950/30 dark:text-pink-400" : "border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500")}>
                  👧 여아
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-birth" className="text-[12px] font-semibold text-gray-500 dark:text-gray-400">생년월일</Label>
              <Input id="settings-birth" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
            </div>
            <Button type="submit" className="h-11 w-full rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 font-semibold text-white active:from-pink-500 active:to-purple-500">
              {saved ? "저장되었어요!" : "저장하기"}
            </Button>
          </form>
        </motion.div>

        {/* ── Dark Mode Toggle ── */}
        <motion.div variants={child} className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                {theme === "dark" ? <Moon size={17} className="text-indigo-500" /> : <Sun size={17} className="text-indigo-500" />}
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">다크 모드</h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{theme === "dark" ? "어두운 테마 사용 중" : "밝은 테마 사용 중"}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={cn("relative h-8 w-14 rounded-full transition-colors", theme === "dark" ? "bg-indigo-500" : "bg-gray-300")}
            >
              <motion.div
                className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm"
                animate={{ left: theme === "dark" ? "1.75rem" : "0.25rem" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* ── Add Baby ── */}
        <motion.div variants={child} className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
              <UserPlus size={17} className="text-blue-500" />
            </div>
            <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">아이 추가</h2>
          </div>

          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition-colors active:bg-blue-600"
            >
              <Plus size={16} />
              아이 추가하기
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
              <Input type="text" placeholder="아기 이름" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setNewGender("male")} className={cn("flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-xs font-medium transition-all", newGender === "male" ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/30 dark:text-blue-400" : "border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500")}>
                  👦 남아
                </button>
                <button type="button" onClick={() => setNewGender("female")} className={cn("flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-xs font-medium transition-all", newGender === "female" ? "border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-600 dark:bg-pink-950/30 dark:text-pink-400" : "border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500")}>
                  👧 여아
                </button>
              </div>
              <Input type="date" value={newBirthdate} onChange={(e) => setNewBirthdate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="h-11 flex-1 rounded-xl">취소</Button>
                <Button type="button" onClick={handleAddBaby} disabled={!newName.trim() || !newBirthdate} className="h-11 flex-1 rounded-xl bg-blue-500 font-semibold text-white active:bg-blue-600">등록</Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Data Sharing ── */}
        <motion.div variants={child}>
          <SharingSection />
        </motion.div>

        {/* ── Remove individual baby ── */}
        {babies.length > 1 && (
          <motion.div variants={child} className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40">
                <Trash2 size={17} className="text-orange-500" />
              </div>
              <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">아이 데이터 삭제</h2>
            </div>
            <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">삭제할 아이를 선택하세요. 해당 아이의 모든 데이터가 삭제됩니다.</p>
            <div className="space-y-2">
              {babies.map((baby) => (
                <div key={baby.id} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{baby.gender === "female" ? "👧" : "👦"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{baby.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{baby.birthdate}</p>
                    </div>
                  </div>
                  <Dialog open={deleteBabyTargetId === baby.id} onOpenChange={(open) => setDeleteBabyTargetId(open ? baby.id : null)}>
                    <DialogTrigger render={<button className="shrink-0 rounded-lg bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 text-xs font-medium text-orange-500 dark:text-orange-400 transition-colors active:bg-orange-100" />}>
                      삭제
                    </DialogTrigger>
                    <DialogContent className="max-w-[340px] rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-center">{baby.name}의 데이터를 삭제할까요?</DialogTitle>
                        <DialogDescription className="text-center">이 아기의 프로필과 모든 기록이 삭제됩니다.{"\n"}이 작업은 되돌릴 수 없어요.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex gap-2 sm:flex-row">
                        <DialogClose render={<Button variant="outline" className="flex-1 rounded-xl" />}>취소</DialogClose>
                        <Button variant="destructive" onClick={() => { removeBaby(baby.id); setDeleteBabyTargetId(null); }} className="flex-1 rounded-xl">삭제</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Data Reset ── */}
        <motion.div variants={child} className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40">
              <Trash2 size={17} className="text-red-400" />
            </div>
            <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">전체 초기화</h2>
          </div>
          <p className="mb-4 text-[11px] text-gray-400 dark:text-gray-500">모든 아기 정보가 삭제되고 처음 화면으로 돌아갑니다.</p>
          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger render={<Button variant="destructive" className="h-11 w-full rounded-xl font-semibold" />}>전체 초기화하기</DialogTrigger>
            <DialogContent className="max-w-[340px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-center">정말 초기화할까요?</DialogTitle>
                <DialogDescription className="text-center">저장된 모든 아기 정보가 삭제됩니다.{"\n"}이 작업은 되돌릴 수 없어요.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:flex-row">
                <DialogClose render={<Button variant="outline" className="flex-1 rounded-xl" />}>취소</DialogClose>
                <Button variant="destructive" onClick={() => { setResetDialogOpen(false); handleReset(); }} className="flex-1 rounded-xl">초기화</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* ── Account Deletion ── */}
        {user && (
          <motion.div variants={child} className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40">
                <Shield size={17} className="text-red-400" />
              </div>
              <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">계정 삭제</h2>
            </div>
            <p className="mb-4 text-[11px] text-gray-400 dark:text-gray-500">계정과 모든 클라우드 데이터가 영구적으로 삭제됩니다.</p>
            <Dialog open={accountDeleteDialogOpen} onOpenChange={setAccountDeleteDialogOpen}>
              <DialogTrigger render={<Button variant="destructive" className="h-11 w-full rounded-xl font-semibold" />}>계정 삭제하기</DialogTrigger>
              <DialogContent className="max-w-[340px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-center">정말 계정을 삭제할까요?</DialogTitle>
                  <DialogDescription className="text-center">계정이 영구적으로 삭제되며{"\n"}저장된 모든 데이터를 복구할 수 없습니다.</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:flex-row">
                  <DialogClose render={<Button variant="outline" className="flex-1 rounded-xl" />}>취소</DialogClose>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount} className="flex-1 rounded-xl">
                    {deletingAccount ? "삭제 중..." : "삭제"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {/* ── App Info ── */}
        <motion.div variants={child} className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40">
              <Info size={17} className="text-purple-500" />
            </div>
            <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100">앱 정보</h2>
          </div>
          <div className="space-y-2.5 text-[13px] text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>버전</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">1.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>앱 이름</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">인펀트피디아</span>
            </div>
            <button onClick={() => router.push("/privacy")} className="flex w-full justify-between pt-1 py-2">
              <span>개인정보처리방침</span>
              <span className="font-medium text-purple-500 dark:text-purple-400">보기</span>
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={child} className="flex items-center justify-center gap-1 pb-8 pt-2 text-xs text-gray-300 dark:text-gray-600">
          <span>Made with</span>
          <Heart size={10} className="fill-pink-300 text-pink-300" />
          <span>for parents</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
