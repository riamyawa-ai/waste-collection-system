'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import type { RequestStatus } from '@/constants/status';

interface ActivityItem {
    id: string;
    request_number: string;
    status: RequestStatus;
    barangay: string;
    updated_at: string;
    created_at: string;
}

interface RecentActivityProps {
    activities: ActivityItem[];
    className?: string;
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
    return (
        <div className={cn('bg-white rounded-xl border border-neutral-200 overflow-hidden', className)}>
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <h3 className="font-semibold text-neutral-900">Recent Activity</h3>
                <Link
                    href="/client/requests"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                    View all
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {activities.length === 0 ? (
                <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-3">
                        <FileText className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p className="text-neutral-600 font-medium">No recent activity</p>
                    <p className="text-sm text-neutral-500 mt-1">
                        Your recent requests will appear here
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-neutral-100">
                    {activities.map((activity) => (
                        <Link
                            key={activity.id}
                            href={`/client/requests/${activity.id}`}
                            className="flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors group"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50 shrink-0">
                                <FileText className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-neutral-900 truncate">
                                        {activity.request_number}
                                    </p>
                                    <StatusBadge status={activity.status} showDot={false} />
                                </div>
                                <p className="text-sm text-neutral-500 truncate">
                                    {activity.barangay}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="flex items-center gap-1 text-xs text-neutral-400">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(activity.updated_at), {
                                        addSuffix: true,
                                    })}
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// Loading skeleton
export function RecentActivitySkeleton() {
    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <div className="h-5 w-32 bg-neutral-200 rounded" />
                <div className="h-4 w-16 bg-neutral-200 rounded" />
            </div>
            <div className="divide-y divide-neutral-100">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-neutral-200 rounded" />
                            <div className="h-3 w-24 bg-neutral-100 rounded" />
                        </div>
                        <div className="h-3 w-16 bg-neutral-100 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
