import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, type RequestStatus } from "@/constants/status";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

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
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            status === "completed" && "bg-green-500",
            status === "scheduled" && "bg-blue-500",
            status === "pending" && "bg-yellow-500",
            status === "in_progress" && "bg-orange-500",
            status === "cancelled" && "bg-red-500"
          )}
        />
      )}
      {label}
    </span>
  );
}
