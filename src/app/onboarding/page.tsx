"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBabyStore, type BabyGender } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { joinByInviteCode } from "@/lib/sync/sync-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link, RefreshCw } from "lucide-react";
import FloatingDecorations from "@/components/layout/FloatingDecorations";

export default function OnboardingPage() {
  const router = useRouter();
  const addBaby = useBabyStore((s) => s.addBaby);

  // New baby form
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<BabyGender>("male");
  const [error, setError] = useState("");

  // Invite code
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("아기 이름을 입력해 주세요");
      return;
    }
    if (!birthdate) {
      setError("생년월일을 선택해 주세요");
      return;
    }

    const birth = new Date(birthdate);
    const today = new Date();
    if (birth > today) {
      setError("생년월일이 미래 날짜입니다");
      return;
    }

    addBaby({ name: name.trim(), birthdate, gender });
    router.replace("/");
  };

  const handleInviteJoin = async () => {
    if (inviteCode.length < 6) return;
    setInviteLoading(true);
    setInviteError("");

    const result = await joinByInviteCode(inviteCode.trim());

    if ("error" in result) {
      setInviteError(result.error);
      setInviteLoading(false);
      return;
    }

    // Add baby to local store (Zustand set() is synchronous)
    addBaby({
      name: result.baby.name,
      birthdate: result.baby.birthdate,
      gender: result.baby.gender as BabyGender,
    });

    // State is already updated — access directly
    const babies = useBabyStore.getState().babies;
    const newBaby = babies[babies.length - 1];
    if (newBaby) {
      useSyncStore.getState().addMapping({
        localBabyId: newBaby.id,
        sharedBabyId: result.baby.id,
        inviteCode: inviteCode.trim().toUpperCase(),
      });

      // Import measurements
      for (const m of result.measurements) {
        useMeasurementStore.getState().addMeasurement({
          month: m.month,
          date: m.date,
          height: m.height,
          weight: m.weight,
          headCircumference: m.headCircumference,
        });
      }

      // Import vaccinations
      for (const v of result.vaccinations) {
        const vacStore = useVaccinationStore.getState();
        if (!vacStore.isCompleted(v.vaccineId, v.doseNumber)) {
          vacStore.toggleVaccination(v.vaccineId, v.doseNumber, v.completedDate);
        }
      }

      useSyncStore.getState().setLastSync();
    }

    setInviteLoading(false);
    router.replace("/");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <FloatingDecorations />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Hero */}
        <motion.div
          className="mb-8 flex flex-col items-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="mb-4 flex items-center gap-3 text-5xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>👶</span>
            <span>🍼</span>
            <span>⭐</span>
          </motion.div>

          <h1 className="text-center text-2xl font-bold text-stone-800 dark:text-stone-100">
            인펀트피디아에
            <br />
            오신 것을 환영합니다!
          </h1>
          <p className="mt-2 text-center text-sm text-stone-500 dark:text-stone-400">
            아기의 성장을 함께 기록하고 알아가요 💕
          </p>
        </motion.div>

        {!showInvite ? (
          <>
            {/* New baby form */}
            <motion.form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white dark:bg-stone-800 p-6 shadow-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                    👶 아기 이름
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="예: 서연이"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl border-stone-200 bg-stone-50 text-base placeholder:text-stone-300 focus:border-violet-300 focus:ring-violet-200"
                  />
                </div>

                {/* Gender selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                    👧👦 성별
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGender("male")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                        gender === "male"
                          ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "border-stone-200 bg-white text-stone-400 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-500"
                      )}
                    >
                      <span className="text-xl">👦</span>
                      남아
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGender("female")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                        gender === "female"
                          ? "border-pink-300 bg-pink-50 text-pink-700 shadow-sm dark:border-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                          : "border-stone-200 bg-white text-stone-400 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-500"
                      )}
                    >
                      <span className="text-xl">👧</span>
                      여아
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate" className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                    🎂 생년월일
                  </Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="h-12 rounded-xl border-stone-200 bg-stone-50 text-base focus:border-violet-300 focus:ring-violet-200"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-red-400"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-[#7C5CFC] text-base font-bold text-white shadow-md active:bg-[#6B4CE0]"
                  >
                    시작하기 🚀
                  </Button>
                </motion.div>
              </div>
            </motion.form>

            {/* Invite code toggle */}
            <motion.button
              onClick={() => setShowInvite(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-white/60 py-3.5 text-sm font-medium text-indigo-500 backdrop-blur-sm transition-colors active:border-indigo-300 active:bg-indigo-50/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link size={16} />
              초대코드가 있으신가요?
            </motion.button>
          </>
        ) : (
          <>
            {/* Invite code form */}
            <motion.div
              className="rounded-3xl bg-white dark:bg-stone-800 p-6 shadow-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <Link size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-700 dark:text-stone-200">초대코드 입력</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">배우자가 공유한 코드를 입력하세요</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-code" className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                    🔗 초대코드
                  </Label>
                  <Input
                    id="invite-code"
                    type="text"
                    placeholder="예: ABC123"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value.toUpperCase());
                      setInviteError("");
                    }}
                    maxLength={6}
                    className="h-14 rounded-xl border-indigo-200 bg-indigo-50/50 text-center font-mono text-2xl tracking-[0.3em] focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>

                {inviteError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-red-400"
                  >
                    {inviteError}
                  </motion.p>
                )}

                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="button"
                    onClick={handleInviteJoin}
                    disabled={inviteLoading || inviteCode.length < 6}
                    className="h-12 w-full rounded-xl bg-[#7C5CFC] text-base font-bold text-white shadow-md active:bg-[#6B4CE0] disabled:opacity-50"
                  >
                    {inviteLoading ? (
                      <>
                        <RefreshCw size={18} className="mr-2 animate-spin" />
                        연결 중...
                      </>
                    ) : (
                      "연결하기"
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Back to new baby form */}
            <motion.button
              onClick={() => {
                setShowInvite(false);
                setInviteError("");
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-pink-200 bg-white/60 py-3.5 text-sm font-medium text-pink-500 backdrop-blur-sm transition-colors active:border-pink-300 active:bg-pink-50/50"
              whileTap={{ scale: 0.97 }}
            >
              👶 새로 등록하기
            </motion.button>
          </>
        )}

        <motion.p
          className="mt-4 text-center text-xs text-stone-400 dark:text-stone-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          데이터는 클라우드에 안전하게 백업 및 동기화됩니다 ☁️
        </motion.p>
      </motion.div>
    </div>
  );
}
