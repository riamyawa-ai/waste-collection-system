"use client";

import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data available",
  className,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-neutral-100 h-12" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-neutral-200">
              <div className="h-16 bg-white flex items-center px-6 gap-4">
                {columns.map((_, j) => (
                  <div
                    key={j}
                    className="h-4 bg-neutral-200 rounded flex-1"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-neutral-200 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-primary-50/50"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm text-neutral-900",
                      column.className
                    )}
                  >
                    {column.cell
                      ? column.cell(row)
                      : (row[column.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: TablePaginationProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-white",
        className
      )}
    >
      <div className="text-sm text-neutral-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
