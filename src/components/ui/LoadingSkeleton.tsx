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
    <div className="space-y-4 px-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 pt-4">
        <Skeleton className="h-6 w-48" />
      </div>

      {/* D-day card skeleton */}
      <Skeleton className="h-32 w-full" />

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>

      {/* Wonder weeks banner */}
      <Skeleton className="h-24 w-full" />

      {/* Summary card */}
      <Skeleton className="h-36 w-full" />
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
