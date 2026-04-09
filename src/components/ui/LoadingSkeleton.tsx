"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-stone-200/60 dark:bg-stone-800/60",
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* D-day card */}
      <Skeleton className="h-36 w-full dark:bg-stone-800/40" />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
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
