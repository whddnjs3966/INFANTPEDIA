"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, Link, Copy, Check, Download, RefreshCw, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useDailyLogStore } from "@/lib/store/daily-log-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { shareBaby, joinByInviteCode, pushToCloud, pullFromCloud } from "@/lib/sync/sync-service";
import type { BabyGender } from "@/lib/store/baby-store";

export default function SharingSection() {
  const profile = useBabyStore((s) => s.profile);
  const addBaby = useBabyStore((s) => s.addBaby);
  const updateBaby = useBabyStore((s) => s.updateBaby);
  const babies = useBabyStore((s) => s.babies);

  const measurements = useMeasurementStore((s) => s.measurements);
  const vaccinationRecords = useVaccinationStore((s) => s.records);
  const dailyLogEntries = useDailyLogStore((s) => s.entries);

  const mappings = useSyncStore((s) => s.mappings);
  const addMapping = useSyncStore((s) => s.addMapping);
  const removeMapping = useSyncStore((s) => s.removeMapping);
  const setLastSync = useSyncStore((s) => s.setLastSync);

  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "pushing" | "pulling" | "done" | "error">("idle");

  const currentMapping = profile
    ? mappings.find((m) => m.localBabyId === profile.id)
    : undefined;

  // ─── Generate invite code ───
  const handleShare = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setGeneratedCode(null);

    const result = await shareBaby(profile, measurements, vaccinationRecords, dailyLogEntries);

    if ("error" in result) {
      alert(result.error);
    } else {
      setGeneratedCode(result.code);
      addMapping({
        localBabyId: profile.id,
        sharedBabyId: result.sharedBabyId,
        inviteCode: result.code,
      });
      setLastSync();
    }
    setLoading(false);
  }, [profile, measurements, vaccinationRecords, dailyLogEntries, addMapping, setLastSync]);

  // ─── Copy code ───
  const handleCopy = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // ─── Join via code ───
  const handleJoin = useCallback(async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    setJoinError("");
    setJoinSuccess(false);

    const result = await joinByInviteCode(joinCode.trim());

    if ("error" in result) {
      setJoinError(result.error);
    } else {
      // Check if we already have this shared baby
      const existingMapping = mappings.find((m) => m.sharedBabyId === result.baby.id);
      if (existingMapping) {
        setJoinError("이미 연결된 아기입니다");
        setLoading(false);
        return;
      }

      // Add baby to local store
      addBaby({
        name: result.baby.name,
        birthdate: result.baby.birthdate,
        gender: result.baby.gender as BabyGender,
      });

      // We need the new baby's local ID - it'll be the latest baby
      // Wait a tick for state to update
      setTimeout(() => {
        const updatedBabies = useBabyStore.getState().babies;
        const newBaby = updatedBabies[updatedBabies.length - 1];
        if (newBaby) {
          addMapping({
            localBabyId: newBaby.id,
            sharedBabyId: result.baby.id,
            inviteCode: joinCode.trim().toUpperCase(),
          });

          // Import measurements
          if (result.measurements.length > 0) {
            const measStore = useMeasurementStore.getState();
            for (const m of result.measurements) {
              measStore.addMeasurement({
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
            const vacStore = useVaccinationStore.getState();
            for (const v of result.vaccinations) {
              if (!vacStore.isCompleted(v.vaccineId, v.doseNumber)) {
                vacStore.toggleVaccination(v.vaccineId, v.doseNumber, v.completedDate);
              }
            }
          }

          // Import daily logs
          if (result.dailyLogs.length > 0) {
            const logStore = useDailyLogStore.getState();
            for (const l of result.dailyLogs) {
              logStore.addEntry({
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

          setLastSync();
        }
        setJoinSuccess(true);
        setJoinCode("");
      }, 100);
    }
    setLoading(false);
  }, [joinCode, mappings, addBaby, addMapping, setLastSync]);

  // ─── Push sync ───
  const handlePush = useCallback(async () => {
    if (!profile || !currentMapping) return;
    setSyncStatus("pushing");
    const result = await pushToCloud(
      currentMapping.sharedBabyId,
      profile,
      measurements,
      vaccinationRecords,
      dailyLogEntries
    );
    if (result.error) {
      setSyncStatus("error");
    } else {
      setLastSync();
      setSyncStatus("done");
    }
    setTimeout(() => setSyncStatus("idle"), 2000);
  }, [profile, currentMapping, measurements, vaccinationRecords, dailyLogEntries, setLastSync]);

  // ─── Pull sync ───
  const handlePull = useCallback(async () => {
    if (!profile || !currentMapping) return;
    setSyncStatus("pulling");
    const result = await pullFromCloud(currentMapping.sharedBabyId);
    if ("error" in result) {
      setSyncStatus("error");
    } else {
      // Update baby profile
      updateBaby(profile.id, {
        name: result.baby.name,
        birthdate: result.baby.birthdate,
        gender: result.baby.gender as BabyGender,
      });

      // Replace local measurements with cloud data
      const measStore = useMeasurementStore.getState();
      // Clear existing and add new
      for (const m of measStore.measurements) {
        measStore.deleteMeasurement(m.id);
      }
      for (const m of result.measurements) {
        measStore.addMeasurement({
          month: m.month,
          date: m.date,
          height: m.height,
          weight: m.weight,
          headCircumference: m.headCircumference,
        });
      }

      // Replace vaccinations
      const vacStore = useVaccinationStore.getState();
      // Clear existing
      for (const r of [...vacStore.records]) {
        vacStore.toggleVaccination(r.vaccineId, r.doseNumber);
      }
      // Add new
      for (const v of result.vaccinations) {
        vacStore.toggleVaccination(v.vaccineId, v.doseNumber, v.completedDate);
      }

      // Replace daily logs
      const logStore = useDailyLogStore.getState();
      for (const e of logStore.entries) {
        logStore.deleteEntry(e.id);
      }
      for (const l of result.dailyLogs) {
        logStore.addEntry({
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

      setLastSync();
      setSyncStatus("done");
    }
    setTimeout(() => setSyncStatus("idle"), 2000);
  }, [profile, currentMapping, updateBaby, setLastSync]);

  // ─── Unlink sharing ───
  const handleUnlink = useCallback(() => {
    if (!profile) return;
    removeMapping(profile.id);
    setGeneratedCode(null);
  }, [profile, removeMapping]);

  if (!profile) return null;

  return (
    <div className="space-y-4">
      {/* Share / Connected status */}
      <div className="rounded-2xl border border-green-200/50 bg-white/80 p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-green-100 p-2">
            <Share2 size={18} className="text-green-500" />
          </div>
          <h2 className="text-base font-bold text-gray-700">데이터 공유</h2>
        </div>

        {currentMapping ? (
          // Already shared
          <div className="space-y-3">
            <div className="rounded-xl bg-green-50 p-3">
              <p className="mb-1 text-xs text-green-600">
                <Link size={12} className="mr-1 inline" />
                공유 연결됨
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold tracking-widest text-green-700">
                  {currentMapping.inviteCode}
                </span>
                <button
                  onClick={() => handleCopy(currentMapping.inviteCode)}
                  className="rounded-lg p-1.5 text-green-500 hover:bg-green-100"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-green-500">
                이 코드를 상대방에게 공유하세요
              </p>
            </div>

            {/* Sync buttons */}
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePush}
                disabled={syncStatus !== "idle"}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-xs font-medium transition-all",
                  syncStatus === "pushing"
                    ? "border-blue-300 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-200"
                )}
              >
                <RefreshCw size={14} className={syncStatus === "pushing" ? "animate-spin" : ""} />
                {syncStatus === "pushing" ? "업로드 중..." : "데이터 업로드"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePull}
                disabled={syncStatus !== "idle"}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-xs font-medium transition-all",
                  syncStatus === "pulling"
                    ? "border-purple-300 bg-purple-50 text-purple-600"
                    : "border-gray-200 text-gray-600 hover:border-purple-200"
                )}
              >
                <Download size={14} className={syncStatus === "pulling" ? "animate-spin" : ""} />
                {syncStatus === "pulling" ? "다운로드 중..." : "데이터 다운로드"}
              </motion.button>
            </div>

            {syncStatus === "done" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-green-500"
              >
                동기화 완료!
              </motion.p>
            )}
            {syncStatus === "error" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-red-500"
              >
                동기화 실패. 다시 시도해주세요.
              </motion.p>
            )}

            {/* Unlink */}
            <Dialog>
              <DialogTrigger
                render={
                  <button className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs text-gray-400 hover:text-red-400" />
                }
              >
                <Unlink size={12} />
                공유 연결 해제
              </DialogTrigger>
              <DialogContent className="max-w-[340px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-center">공유를 해제할까요?</DialogTitle>
                  <DialogDescription className="text-center">
                    로컬 데이터는 유지되지만, 더 이상 동기화되지 않습니다.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:flex-row">
                  <DialogClose
                    render={<Button variant="outline" className="flex-1 rounded-xl" />}
                  >
                    취소
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleUnlink}
                    className="flex-1 rounded-xl"
                  >
                    해제
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          // Not shared yet
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              초대코드를 생성하면 다른 기기에서 같은 아기 데이터를 볼 수 있어요.
            </p>

            {generatedCode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-green-50 p-4 text-center"
              >
                <p className="mb-1 text-xs text-green-600">초대코드가 생성되었어요!</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-[0.3em] text-green-700">
                    {generatedCode}
                  </span>
                  <button
                    onClick={() => handleCopy(generatedCode)}
                    className="rounded-lg p-2 text-green-500 hover:bg-green-100"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-green-500">
                  이 코드를 배우자에게 보내주세요
                </p>
              </motion.div>
            ) : (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={handleShare}
                  disabled={loading}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 font-semibold text-white"
                >
                  {loading ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Share2 size={16} className="mr-2" />
                  )}
                  {loading ? "생성 중..." : "초대코드 생성하기"}
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Join by invite code */}
      {!currentMapping && (
        <div className="rounded-2xl border border-indigo-200/50 bg-white/80 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-indigo-100 p-2">
              <Link size={18} className="text-indigo-500" />
            </div>
            <h2 className="text-base font-bold text-gray-700">초대코드 입력</h2>
          </div>
          <p className="mb-3 text-xs text-gray-500">
            배우자가 공유한 초대코드를 입력하면 같은 데이터를 볼 수 있어요.
          </p>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="예: ABC123"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setJoinError("");
                setJoinSuccess(false);
              }}
              maxLength={6}
              className="h-11 flex-1 rounded-xl border-indigo-200 bg-indigo-50/30 text-center font-mono text-lg tracking-widest"
            />
            <Button
              onClick={handleJoin}
              disabled={loading || joinCode.length < 6}
              className="h-11 rounded-xl bg-indigo-500 px-5 font-semibold text-white hover:bg-indigo-600"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : "연결"}
            </Button>
          </div>

          {joinError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center text-xs text-red-500"
            >
              {joinError}
            </motion.p>
          )}
          {joinSuccess && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center text-xs text-green-500"
            >
              연결 완료! 데이터를 가져왔어요.
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
