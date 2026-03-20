"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBabyStore, type BabyGender } from "@/lib/store/baby-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { User, Trash2, Info, Heart, Plus, Check, X, UserPlus, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/store/theme-store";
import SharingSection from "@/components/sharing/SharingSection";

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

  const [name, setName] = useState(profile?.name || "");
  const [birthdate, setBirthdate] = useState(profile?.birthdate || "");
  const [gender, setGender] = useState<BabyGender>(profile?.gender || "male");
  const [saved, setSaved] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Add baby form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBirthdate, setNewBirthdate] = useState("");
  const [newGender, setNewGender] = useState<BabyGender>("male");

  // Sync form when active baby changes
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
    router.replace("/onboarding");
  };

  const activeId = profile?.id || activeBabyId;

  return (
    <div className="min-h-screen px-4 pt-6 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">⚙️ 설정</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          아기 정보를 수정하거나 앱 설정을 변경하세요
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 space-y-6"
      >
        {/* Baby Switcher */}
        {babies.length > 1 && (
          <div className="rounded-2xl border border-purple-200/50 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
            <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">아기 선택</p>
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
                      : "border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700"
                  )}
                >
                  <span className="text-lg">{baby.gender === "female" ? "👧" : "👦"}</span>
                  <div className="text-left">
                    <p className={cn(
                      "text-sm font-semibold",
                      baby.id === activeId ? "text-pink-700 dark:text-pink-300" : "text-gray-600 dark:text-gray-300"
                    )}>
                      {baby.name}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{baby.birthdate}</p>
                  </div>
                  {baby.id === activeId && (
                    <Check size={14} className="text-pink-500" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Profile edit */}
        <div className="rounded-2xl border border-pink-200/50 bg-white/80 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-pink-100 p-2 dark:bg-pink-900/50">
              <User size={18} className="text-pink-500 dark:text-pink-400" />
            </div>
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">아기 프로필</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name" className="text-sm font-medium text-gray-600">
                아기 이름
              </Label>
              <Input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border-pink-200 bg-pink-50/30"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">성별</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-medium transition-all",
                    gender === "male"
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-400"
                  )}
                >
                  👦 남아
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-medium transition-all",
                    gender === "female"
                      ? "border-pink-300 bg-pink-50 text-pink-700"
                      : "border-gray-200 text-gray-400"
                  )}
                >
                  👧 여아
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-birth" className="text-sm font-medium text-gray-600">
                생년월일
              </Label>
              <Input
                id="settings-birth"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-11 rounded-xl border-pink-200 bg-pink-50/30"
              />
            </div>

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 font-semibold text-white"
              >
                {saved ? "✅ 저장되었어요!" : "저장하기"}
              </Button>
            </motion.div>
          </form>
        </div>

        <Separator className="bg-pink-100 dark:bg-gray-700" />

        {/* Dark Mode Toggle */}
        <div className="rounded-2xl border border-indigo-200/50 bg-white/80 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/50">
                {theme === "dark" ? (
                  <Moon size={18} className="text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <Sun size={18} className="text-indigo-500" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">다크 모드</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {theme === "dark" ? "어두운 테마 사용 중" : "밝은 테마 사용 중"}
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={cn(
                "relative h-8 w-14 rounded-full transition-colors",
                theme === "dark"
                  ? "bg-indigo-500"
                  : "bg-gray-300"
              )}
            >
              <motion.div
                className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm"
                animate={{ left: theme === "dark" ? "1.75rem" : "0.25rem" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </div>

        <Separator className="bg-pink-100 dark:bg-gray-700" />

        {/* Add Baby */}
        <div className="rounded-2xl border border-blue-200/50 bg-white/80 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-blue-100 p-2">
              <UserPlus size={18} className="text-blue-500" />
            </div>
            <h2 className="text-base font-bold text-gray-700">아이 추가</h2>
          </div>

          {!showAddForm ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 py-3 text-sm font-medium text-blue-500 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <Plus size={16} />
              둘째 아기 등록하기
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <Input
                type="text"
                placeholder="아기 이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-11 rounded-xl border-blue-200 bg-blue-50/30"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewGender("male")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-xs font-medium transition-all",
                    newGender === "male"
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-400"
                  )}
                >
                  👦 남아
                </button>
                <button
                  type="button"
                  onClick={() => setNewGender("female")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-xs font-medium transition-all",
                    newGender === "female"
                      ? "border-pink-300 bg-pink-50 text-pink-700"
                      : "border-gray-200 text-gray-400"
                  )}
                >
                  👧 여아
                </button>
              </div>
              <Input
                type="date"
                value={newBirthdate}
                onChange={(e) => setNewBirthdate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-11 rounded-xl border-blue-200 bg-blue-50/30"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="h-10 flex-1 rounded-xl"
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={handleAddBaby}
                  disabled={!newName.trim() || !newBirthdate}
                  className="h-10 flex-1 rounded-xl bg-blue-500 font-semibold text-white hover:bg-blue-600"
                >
                  등록
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <Separator className="bg-pink-100" />

        {/* Data Sharing */}
        <SharingSection />

        {/* Remove individual baby (only if more than 1) */}
        {babies.length > 1 && profile && (
          <>
            <Separator className="bg-pink-100" />
            <div className="rounded-2xl border border-orange-200/50 bg-white/80 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-orange-100 p-2">
                  <X size={18} className="text-orange-500" />
                </div>
                <h2 className="text-base font-bold text-gray-700">아이 삭제</h2>
              </div>
              <p className="mb-3 text-xs text-gray-500">
                현재 선택된 <span className="font-semibold">{profile.name}</span>의 프로필을 삭제합니다.
              </p>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-10 w-full rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                    />
                  }
                >
                  {profile.name} 프로필 삭제
                </DialogTrigger>
                <DialogContent className="max-w-[340px] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      {profile.name} 프로필을 삭제할까요?
                    </DialogTitle>
                    <DialogDescription className="text-center">
                      이 아기의 프로필 정보가 삭제됩니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex gap-2 sm:flex-row">
                    <DialogClose
                      render={
                        <Button variant="outline" className="flex-1 rounded-xl" />
                      }
                    >
                      취소
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        removeBaby(profile.id);
                        setDeleteDialogOpen(false);
                      }}
                      className="flex-1 rounded-xl"
                    >
                      삭제
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}

        <Separator className="bg-pink-100" />

        {/* Data reset */}
        <div className="rounded-2xl border border-red-200/50 bg-white/80 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-red-100 p-2">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h2 className="text-base font-bold text-gray-700">전체 초기화</h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            모든 아기 정보가 삭제되고 처음 화면으로 돌아갑니다.
          </p>

          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="destructive"
                  className="h-11 w-full rounded-xl font-semibold"
                />
              }
            >
              전체 초기화하기
            </DialogTrigger>
            <DialogContent className="max-w-[340px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-center">정말 초기화할까요?</DialogTitle>
                <DialogDescription className="text-center">
                  저장된 모든 아기 정보가 삭제됩니다.{"\n"}
                  이 작업은 되돌릴 수 없어요.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:flex-row">
                <DialogClose
                  render={
                    <Button variant="outline" className="flex-1 rounded-xl" />
                  }
                >
                  취소
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setResetDialogOpen(false);
                    handleReset();
                  }}
                  className="flex-1 rounded-xl"
                >
                  초기화
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Separator className="bg-pink-100" />

        {/* App info */}
        <div className="rounded-2xl border border-purple-200/50 bg-white/80 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-purple-100 p-2">
              <Info size={18} className="text-purple-500" />
            </div>
            <h2 className="text-base font-bold text-gray-700">앱 정보</h2>
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>버전</span>
              <span className="font-medium text-gray-700">0.2.0</span>
            </div>
            <div className="flex justify-between">
              <span>앱 이름</span>
              <span className="font-medium text-gray-700">InfantPedia</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1 pb-8 text-xs text-gray-400">
          <span>Made with</span>
          <Heart size={12} className="fill-pink-400 text-pink-400" />
          <span>for parents</span>
        </div>
      </motion.div>
    </div>
  );
}
