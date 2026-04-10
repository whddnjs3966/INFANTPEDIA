"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, Link, Copy, Check, RefreshCw, Unlink } from "lucide-react";
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
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { shareBaby, joinByInviteCode } from "@/lib/sync/sync-service";
import type { BabyGender } from "@/lib/store/baby-store";

export default function SharingSection() {
  const profile = useBabyStore((s) => s.profile);
  const updateBaby = useBabyStore((s) => s.updateBaby);

  const measurements = useMeasurementStore((s) => s.measurements);
  const vaccinationRecords = useVaccinationStore((s) => s.records);
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
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);

  const currentMapping = profile
    ? mappings.find((m) => m.localBabyId === profile.id)
    : undefined;

  // ─── Generate invite code ───
  const handleShare = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setGeneratedCode(null);

    const result = await shareBaby(profile, measurements, vaccinationRecords);

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
  }, [profile, measurements, vaccinationRecords, addMapping, setLastSync]);

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

  // ─── Join via code (overwrite existing data) ───
  const handleJoin = useCallback(async () => {
    if (!joinCode.trim() || !profile) return;
    setLoading(true);
    setJoinError("");
    setJoinSuccess(false);

    const result = await joinByInviteCode(joinCode.trim());

    if ("error" in result) {
      setJoinError(result.error);
    } else {
      // Overwrite current baby profile with shared data
      updateBaby(profile.id, {
        name: result.baby.name,
        birthdate: result.baby.birthdate,
        gender: result.baby.gender as BabyGender,
      });

      // Remove old mapping if exists, add new one
      if (currentMapping) {
        removeMapping(profile.id);
      }
      addMapping({
        localBabyId: profile.id,
        sharedBabyId: result.baby.id,
        inviteCode: joinCode.trim().toUpperCase(),
      });

      // Clear and replace measurements
      useMeasurementStore.getState().clearAll();
      for (const m of result.measurements) {
        useMeasurementStore.getState().addMeasurement({
          month: m.month,
          date: m.date,
          height: m.height,
          weight: m.weight,
          headCircumference: m.headCircumference,
        });
      }

      // Clear and replace vaccinations
      useVaccinationStore.getState().clearAll();
      for (const v of result.vaccinations) {
        useVaccinationStore.getState().toggleVaccination(v.vaccineId, v.doseNumber, v.completedDate);
      }

      setLastSync();
      setJoinSuccess(true);
      setJoinCode("");
    }
    setLoading(false);
  }, [joinCode, profile, currentMapping, updateBaby, addMapping, removeMapping, setLastSync]);

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
      <div className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 p-5 shadow-[0_2px_8px_rgb(0,0,0,0.06)]">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-green-100 p-2">
            <Share2 size={18} className="text-green-500" />
          </div>
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">데이터 공유</h2>
        </div>

        {currentMapping ? (
          // Already shared
          <div className="space-y-3">
            <div className="rounded-xl bg-green-50 dark:bg-green-900/30 p-3">
              <p className="mb-1 text-xs text-green-600 dark:text-green-400">
                <Link size={12} className="mr-1 inline" />
                공유 연결됨
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold tracking-widest text-green-700 dark:text-green-300">
                  {currentMapping.inviteCode}
                </span>
                <button
                  onClick={() => handleCopy(currentMapping.inviteCode)}
                  className="rounded-lg p-1.5 text-green-500 active:bg-green-100 dark:active:bg-green-900/50"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-green-500 dark:text-green-400">
                이 코드를 상대방에게 공유하세요
              </p>
            </div>

            {/* Unlink */}
            <Dialog>
              <DialogTrigger
                render={
                  <button className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs text-gray-400 active:text-red-400" />
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              초대코드를 생성하면 다른 기기에서 같은 아기 데이터를 볼 수 있어요.
            </p>

            {generatedCode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-green-50 dark:bg-green-900/30 p-4 text-center"
              >
                <p className="mb-1 text-xs text-green-600 dark:text-green-400">초대코드가 생성되었어요!</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-[0.3em] text-green-700 dark:text-green-300">
                    {generatedCode}
                  </span>
                  <button
                    onClick={() => handleCopy(generatedCode)}
                    className="rounded-lg p-2 text-green-500 active:bg-green-100 dark:active:bg-green-900/50"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-green-500 dark:text-green-400">
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

      {/* Join by invite code — always visible */}
      <div className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800 p-5 shadow-[0_2px_8px_rgb(0,0,0,0.06)]">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-950/40 p-2">
            <Link size={18} className="text-indigo-500" />
          </div>
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-200">초대코드 입력</h2>
        </div>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          상대방의 초대코드를 입력하면 데이터를 가져올 수 있어요.
          {currentMapping && (
            <span className="block mt-1 text-orange-500 dark:text-orange-400">
              기존 데이터가 상대방의 데이터로 덮어써집니다.
            </span>
          )}
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
            className="h-11 flex-1 rounded-xl border-indigo-200 bg-indigo-50/30 dark:border-indigo-800 dark:bg-indigo-950/20 text-center font-mono text-lg tracking-widest"
          />
          <Button
            onClick={() => {
              if (currentMapping) {
                setOverwriteDialogOpen(true);
              } else {
                handleJoin();
              }
            }}
            disabled={loading || joinCode.length < 6}
            className="h-11 rounded-xl bg-indigo-500 px-5 font-semibold text-white active:bg-indigo-600"
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
            연결 완료! 상대방의 데이터를 가져왔어요.
          </motion.p>
        )}

        {/* Overwrite confirmation dialog */}
        <Dialog open={overwriteDialogOpen} onOpenChange={setOverwriteDialogOpen}>
          <DialogContent className="max-w-[340px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-center">데이터를 덮어쓸까요?</DialogTitle>
              <DialogDescription className="text-center">
                현재 저장된 데이터가 상대방의 데이터로{"\n"}완전히 교체됩니다. 이 작업은 되돌릴 수 없어요.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:flex-row">
              <DialogClose
                render={<Button variant="outline" className="flex-1 rounded-xl" />}
              >
                취소
              </DialogClose>
              <Button
                onClick={() => {
                  setOverwriteDialogOpen(false);
                  handleJoin();
                }}
                className="flex-1 rounded-xl bg-indigo-500 text-white active:bg-indigo-600"
              >
                덮어쓰기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
