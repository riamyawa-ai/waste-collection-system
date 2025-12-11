'use client';

import { FileText, Clock, CheckCircle2, Truck } from 'lucide-react';
import { StatCard } from '@/components/ui';

interface DashboardStatsProps {
    stats: {
        total_requests: number;
        completed_collections: number;
        pending_requests: number;
        active_collections: number;
        completion_rate: number;
    };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Requests"
                value={stats.total_requests}
                icon={FileText}
                description="all time"
                className="bg-white"
            />
            <StatCard
                title="Completed"
                value={stats.completed_collections}
                icon={CheckCircle2}
                trend={stats.completion_rate > 0 ? { value: stats.completion_rate, isPositive: true } : undefined}
                description="success rate"
                className="bg-white"
            />
            <StatCard
                title="Pending"
                value={stats.pending_requests}
                icon={Clock}
                description="awaiting review"
                className="bg-white"
            />
            <StatCard
                title="Active"
                value={stats.active_collections}
                icon={Truck}
                description="in progress"
                className="bg-white"
            />
        </div>
    );
}

// Loading skeleton
export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-4 w-24 bg-neutral-200 rounded" />
                        <div className="h-10 w-10 bg-neutral-100 rounded-lg" />
                    </div>
                    <div className="h-8 w-16 bg-neutral-200 rounded mb-2" />
                    <div className="h-3 w-20 bg-neutral-100 rounded" />
                </div>
            ))}
        </div>
    );
}
