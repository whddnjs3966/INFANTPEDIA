"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-pink-100/60 via-purple-100/40 to-pink-100/60",
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* D-day card */}
      <Skeleton className="h-36 w-full bg-gradient-to-r from-violet-100/60 via-purple-100/40 to-violet-100/60 dark:from-violet-900/20 dark:via-purple-900/10 dark:to-violet-900/20" />

      {/* Feeding card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>

      {/* Sleep card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>

      {/* Summary card */}
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function EncyclopediaSkeleton() {
  return (
    <div className="space-y-4 px-4 pt-4">
      {/* Month selector skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-16 shrink-0 rounded-full" />
        ))}
      </div>

      {/* Accordion skeleton */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export { Skeleton };
