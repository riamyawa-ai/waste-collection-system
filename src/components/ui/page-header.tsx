import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  action,
  className,
}: PageHeaderProps) {
  const actionContent = action || children;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 border-b border-neutral-200 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500 md:text-base">
            {description}
          </p>
        )}
      </div>
      {actionContent && <div className="flex items-center gap-3">{actionContent}</div>}
    </div>
  );
}

