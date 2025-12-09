import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, type RequestStatus } from "@/constants/status";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
  showDot?: boolean;
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

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const dotColor = DOT_COLORS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
      )}
      {label}
    </span>
  );
}
