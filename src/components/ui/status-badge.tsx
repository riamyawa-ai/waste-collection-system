import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, type RequestStatus } from "@/constants/status";

export interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
}

// Dot color mapping for each status
const DOT_COLORS: Record<RequestStatus, string> = {
  pending: "bg-yellow-500",
  accepted: "bg-blue-500",
  rejected: "bg-red-500",
  payment_confirmed: "bg-emerald-500",
  assigned: "bg-indigo-500",
  accepted_by_collector: "bg-cyan-500",
  declined_by_collector: "bg-rose-500",
  en_route: "bg-purple-500",
  at_location: "bg-violet-500",
  in_progress: "bg-orange-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-500",
};

const SIZE_STYLES = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const DOT_SIZES = {
  sm: "w-1 h-1",
  md: "w-1.5 h-1.5",
  lg: "w-2 h-2",
};

export function StatusBadge({
  status,
  className,
  showDot = true,
  size = "md"
}: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const dotColor = DOT_COLORS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        SIZE_STYLES[size],
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {showDot && (
        <span className={cn("rounded-full", DOT_SIZES[size], dotColor)} />
      )}
      {label}
    </span>
  );
}
