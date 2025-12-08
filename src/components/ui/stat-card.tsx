import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-eco transition-all duration-300",
        className
      )}
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full opacity-50" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          </div>
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
              <Icon className="h-6 w-6 text-primary-600" />
            </div>
          )}
        </div>

        {(description || trend) && (
          <div className="mt-4 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 mr-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 mr-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-sm text-neutral-500">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
