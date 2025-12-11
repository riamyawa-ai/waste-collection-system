'use client';

import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';

interface RequestCounts {
    pending: number;
    accepted: number;
    in_progress: number;
    completed: number;
    rejected: number;
}

interface RequestSummaryCardsProps {
    counts: RequestCounts;
    selectedFilter?: string;
    onFilterChange?: (filter: string | undefined) => void;
}

const summaryItems = [
    {
        key: 'pending',
        label: 'Pending',
        icon: Clock,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
    },
    {
        key: 'accepted',
        label: 'Accepted',
        icon: CheckCircle2,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        key: 'in_progress',
        label: 'In Progress',
        icon: Truck,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
    },
    {
        key: 'completed',
        label: 'Completed',
        icon: CheckCircle2,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
    },
    {
        key: 'rejected',
        label: 'Rejected',
        icon: XCircle,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
    },
];

export function RequestSummaryCards({
    counts,
    selectedFilter,
    onFilterChange,
}: RequestSummaryCardsProps) {
    const handleClick = (key: string) => {
        if (onFilterChange) {
            onFilterChange(selectedFilter === key ? undefined : key);
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {summaryItems.map((item) => {
                const count = counts[item.key as keyof RequestCounts] || 0;
                const isSelected = selectedFilter === item.key;

                return (
                    <button
                        key={item.key}
                        onClick={() => handleClick(item.key)}
                        className={cn(
                            'p-4 rounded-xl border transition-all text-left',
                            isSelected
                                ? `${item.bgColor} ${item.borderColor} ring-2 ring-offset-1`
                                : 'bg-white border-neutral-200 hover:border-neutral-300',
                            isSelected && item.key === 'pending' && 'ring-yellow-400',
                            isSelected && item.key === 'accepted' && 'ring-blue-400',
                            isSelected && item.key === 'in_progress' && 'ring-orange-400',
                            isSelected && item.key === 'completed' && 'ring-green-400',
                            isSelected && item.key === 'rejected' && 'ring-red-400'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex items-center justify-center w-10 h-10 rounded-lg',
                                    isSelected ? item.iconBg : 'bg-neutral-100'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'w-5 h-5',
                                        isSelected ? item.iconColor : 'text-neutral-500'
                                    )}
                                />
                            </div>
                            <div>
                                <p
                                    className={cn(
                                        'text-2xl font-bold',
                                        isSelected ? item.textColor : 'text-neutral-900'
                                    )}
                                >
                                    {count}
                                </p>
                                <p
                                    className={cn(
                                        'text-sm font-medium',
                                        isSelected ? item.textColor : 'text-neutral-500'
                                    )}
                                >
                                    {item.label}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

// Loading skeleton
export function RequestSummaryCardsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="p-4 rounded-xl border border-neutral-200 bg-white animate-pulse"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg" />
                        <div className="space-y-2">
                            <div className="h-6 w-8 bg-neutral-200 rounded" />
                            <div className="h-4 w-16 bg-neutral-100 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
