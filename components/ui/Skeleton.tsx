import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

export default function Skeleton({ className, variant = "rect" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-border",
        variant === "circle" && "rounded-full",
        variant === "text" && "h-4 rounded-[var(--radius-sm)]",
        variant === "rect" && "rounded-[var(--radius-md)]",
        className
      )}
    />
  );
}

/* Preset skeleton for a metric card */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-surface rounded-[var(--radius-lg)] border border-border p-6 space-y-3", className)}>
      <Skeleton variant="text" className="w-24 h-3" />
      <Skeleton variant="text" className="w-16 h-7" />
      <Skeleton variant="text" className="w-32 h-3" />
    </div>
  );
}

/* Preset skeleton for a table row */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4", className)}>
      <Skeleton variant="circle" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-40" />
        <Skeleton variant="text" className="w-24 h-3" />
      </div>
      <Skeleton variant="text" className="w-20" />
    </div>
  );
}
