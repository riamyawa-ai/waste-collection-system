import { cn } from "@/lib/utils";

interface EcoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "gradient";
  hover?: boolean;
}

export function EcoCard({
  children,
  className,
  variant = "default",
  hover = true,
}: EcoCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white",
        variant === "default" && "border border-neutral-200 shadow-sm",
        variant === "elevated" && "border border-neutral-200 shadow-glass",
        variant === "gradient" &&
          "border border-primary-100 bg-gradient-to-br from-white to-primary-50/30",
        hover && "hover:shadow-eco hover:-translate-y-0.5 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

interface EcoCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function EcoCardHeader({ children, className }: EcoCardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-neutral-100", className)}>
      {children}
    </div>
  );
}

interface EcoCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function EcoCardContent({ children, className }: EcoCardContentProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

interface EcoCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function EcoCardFooter({ children, className }: EcoCardFooterProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-neutral-100 bg-neutral-50/50",
        className
      )}
    >
      {children}
    </div>
  );
}
