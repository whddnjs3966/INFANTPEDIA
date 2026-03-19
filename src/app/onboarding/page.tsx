"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBabyStore, type BabyGender } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useDailyLogStore } from "@/lib/store/daily-log-store";
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

    // Add baby to local store
    addBaby({
      name: result.baby.name,
      birthdate: result.baby.birthdate,
      gender: result.baby.gender as BabyGender,
    });

    // Wait for state update, then import data and create mapping
    setTimeout(() => {
      const babies = useBabyStore.getState().babies;
      const newBaby = babies[babies.length - 1];
      if (newBaby) {
        useSyncStore.getState().addMapping({
          localBabyId: newBaby.id,
          sharedBabyId: result.baby.id,
          inviteCode: inviteCode.trim().toUpperCase(),
        });

        // Import measurements
        if (result.measurements.length > 0) {
          const store = useMeasurementStore.getState();
          for (const m of result.measurements) {
            store.addMeasurement({
              month: m.month,
              date: m.date,
              height: m.height,
              weight: m.weight,
              headCircumference: m.headCircumference,
            });
          }
        }

        // Import vaccinations
        if (result.vaccinations.length > 0) {
          const store = useVaccinationStore.getState();
          for (const v of result.vaccinations) {
            if (!store.isCompleted(v.vaccineId, v.doseNumber)) {
              store.toggleVaccination(v.vaccineId, v.doseNumber, v.completedDate);
            }
          }
        }

        // Import daily logs
        if (result.dailyLogs.length > 0) {
          const store = useDailyLogStore.getState();
          for (const l of result.dailyLogs) {
            store.addEntry({
              category: l.category,
              date: l.date,
              time: l.time,
              endTime: l.endTime,
              amount: l.amount,
              duration: l.duration,
              side: l.side,
              menu: l.menu,
              color: l.color,
              consistency: l.consistency,
              temperature: l.temperature,
              note: l.note,
            });
          }
        }

        useSyncStore.getState().setLastSync();
      }

      setInviteLoading(false);
      router.replace("/");
    }, 100);
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

          <h1 className="text-center text-2xl font-bold text-gray-800">
            인펀트피디아에
            <br />
            오신 것을 환영합니다!
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            아기의 성장을 함께 기록하고 알아가요 💕
          </p>
        </motion.div>

        {!showInvite ? (
          <>
            {/* New baby form */}
            <motion.form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-pink-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    👶 아기 이름
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="예: 서연이"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl border-pink-200 bg-pink-50/50 text-base placeholder:text-gray-300 focus:border-pink-300 focus:ring-pink-200"
                  />
                </div>

                {/* Gender selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
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
                          ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-400"
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
                          ? "border-pink-300 bg-pink-50 text-pink-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-400"
                      )}
                    >
                      <span className="text-xl">👧</span>
                      여아
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate" className="text-sm font-semibold text-gray-700">
                    🎂 생년월일
                  </Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="h-12 rounded-xl border-pink-200 bg-pink-50/50 text-base focus:border-pink-300 focus:ring-pink-200"
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

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-base font-bold text-white shadow-md hover:from-pink-500 hover:to-purple-500"
                  >
                    시작하기 🚀
                  </Button>
                </motion.div>
              </div>
            </motion.form>

            {/* Invite code toggle */}
            <motion.button
              onClick={() => setShowInvite(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-white/60 py-3.5 text-sm font-medium text-indigo-500 backdrop-blur-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
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
              className="rounded-3xl border border-indigo-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <Link size={18} className="text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-700">초대코드 입력</h2>
                    <p className="text-xs text-gray-500">배우자가 공유한 코드를 입력하세요</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-code" className="text-sm font-semibold text-gray-700">
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
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 text-base font-bold text-white shadow-md hover:from-indigo-500 hover:to-purple-600 disabled:opacity-50"
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
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-pink-200 bg-white/60 py-3.5 text-sm font-medium text-pink-500 backdrop-blur-sm transition-colors hover:border-pink-300 hover:bg-pink-50/50"
              whileTap={{ scale: 0.97 }}
            >
              👶 새로 등록하기
            </motion.button>
          </>
        )}

        <motion.p
          className="mt-4 text-center text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          모든 데이터는 이 기기에만 저장됩니다 🔒
        </motion.p>
      </motion.div>
    </div>
  );
}
