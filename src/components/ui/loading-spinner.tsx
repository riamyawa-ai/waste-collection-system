import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-primary-200 border-t-primary-600",
        size === "sm" && "h-4 w-4",
        size === "md" && "h-8 w-8",
        size === "lg" && "h-12 w-12",
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-neutral-600">{message}</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-6">
      <div className="space-y-4">
        <div className="h-4 w-3/4 rounded bg-neutral-200" />
        <div className="h-8 w-1/2 rounded bg-neutral-200" />
        <div className="h-4 w-full rounded bg-neutral-200" />
      </div>
    </div>
  );
}
