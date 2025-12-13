'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, List, History, RefreshCw, Download, Plus } from 'lucide-react';

import { PageHeader } from '@/components/ui';
import { Button } from '@/components/ui/button';
import {
    CollectionCalendar,
    CollectionCalendarSkeleton,
} from '@/components/client';
import { getClientRequests } from '@/lib/actions/requests';
import { getPublicSchedules } from '@/lib/actions/public-schedule';
import { cn } from '@/lib/utils';
import type { RequestStatus } from '@/constants/status';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';

type ViewTab = 'calendar' | 'regular' | 'history';

interface ScheduleEvent {
    id: string;
    date: string;
    status: RequestStatus;
    title: string;
    details?: any;
}

interface HistoryItem {
    id: string;
    request_number: string;
    preferred_date: string;
    barangay: string;
    status: RequestStatus;
    scheduled_date: string | null;
    completed_at: string | null;
    assigned_collector: {
        full_name: string;
    } | null;
}

interface PublicSchedule {
    id: string;
    name: string;
    description: string | null;
    start_date: string;
    start_time: string;
    status: string;
    assigned_collector: {
        full_name: string;
    } | null;
}

export default function ClientSchedulePage() {
    const [activeTab, setActiveTab] = useState<ViewTab>('calendar');
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [publicSchedules, setPublicSchedules] = useState<PublicSchedule[]>([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch public schedules for calendar/list
            const scheduleResult = await getPublicSchedules();
            if (scheduleResult.success && scheduleResult.data) {
                const schedules = scheduleResult.data as PublicSchedule[];
                setPublicSchedules(schedules);

                // Format for calendar
                setEvents(
                    schedules.map((sched) => {
                        // Map schedule status to request status for calendar display
                        let displayStatus = sched.status;
                        if (displayStatus === 'active') displayStatus = 'assigned';

                        return {
                            id: sched.id,
                            date: sched.start_date,
                            status: displayStatus as RequestStatus,
                            title: sched.name,
                            time_slot: sched.start_time,
                            details: sched, // Ensure full object is passed
                            type: 'schedule',
                            description: sched.description || undefined
                        };
                    })
                );
            }

            // Fetch personal history (completed/cancelled requests)
            const historyResult = await getClientRequests({ limit: 100 });
            if (historyResult.success && historyResult.data) {
                const requests = historyResult.data.requests;
                setHistory(
                    requests
                        .filter((req) =>
                            ['completed', 'cancelled', 'rejected'].includes(req.status as string)
                        )
                        .map((req) => ({
                            id: req.id as string,
                            request_number: req.request_number as string,
                            preferred_date: req.preferred_date as string,
                            barangay: req.barangay as string,
                            status: req.status as RequestStatus,
                            scheduled_date: req.scheduled_date as string | null,
                            completed_at: req.completed_at as string | null,
                            assigned_collector: req.assigned_collector as { full_name: string } | null,
                            type: 'request',
                        })) as HistoryItem[]
                );
            }
        } catch (error) {
            console.error('Error fetching schedule data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const tabs = [
        { id: 'calendar' as const, label: 'Calendar View', icon: Calendar },
        { id: 'regular' as const, label: 'Routes List', icon: List },
        { id: 'history' as const, label: 'Collection History', icon: History },
    ];

    return (
        <>
            <PageHeader
                title="Collection Schedule"
                description="View your scheduled collections and history"
                action={
                    <Link href="/client/requests?new=true">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Request Pickup
                        </Button>
                    </Link>
                }
            />

            {/* Tabs */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex bg-neutral-100 rounded-lg p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                activeTab === tab.id
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-neutral-600 hover:text-neutral-900'
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchData}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'calendar' && (
                    isLoading ? (
                        <CollectionCalendarSkeleton />
                    ) : (
                        <CollectionCalendar
                            events={events}
                            onDateClick={(date, dayEvents) => {
                                console.log('Date clicked:', date, dayEvents);
                            }}
                        />
                    )
                )}

                {activeTab === 'regular' && (
                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                        {publicSchedules.length > 0 ? (
                            <div className="divide-y divide-neutral-100">
                                {publicSchedules.map((schedule) => (
                                    <div key={schedule.id} className="p-4 hover:bg-neutral-50 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-neutral-900">{schedule.name}</h4>
                                            <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                                                <span>{format(new Date(schedule.start_date), 'MMM d, yyyy')}</span>
                                                <span>•</span>
                                                <span>{schedule.start_time}</span>
                                            </div>
                                            {schedule.assigned_collector?.full_name && (
                                                <p className="text-xs text-neutral-400 mt-1">
                                                    Collector: {schedule.assigned_collector.full_name}
                                                </p>
                                            )}
                                        </div>
                                        <StatusBadge status={schedule.status === 'active' ? 'assigned' : schedule.status as RequestStatus} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
                                    <List className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                    No Active Schedules
                                </h3>
                                <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                                    There are no active collection schedules at the moment.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                        {isLoading ? (
                            <div className="p-4 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 border-b border-neutral-100">
                                        <div className="w-20 h-4 bg-neutral-200 rounded" />
                                        <div className="w-32 h-4 bg-neutral-200 rounded" />
                                        <div className="w-24 h-6 bg-neutral-200 rounded-full" />
                                        <div className="flex-1" />
                                        <div className="w-16 h-4 bg-neutral-200 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="p-6 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                                    <History className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                    No Collection History
                                </h3>
                                <p className="text-neutral-500">
                                    Your completed collections will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-neutral-50 border-b border-neutral-200">
                                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                                Date
                                            </th>
                                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                                Request ID
                                            </th>
                                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                                Location
                                            </th>
                                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                                Collector
                                            </th>
                                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                                Status
                                            </th>
                                            <th className="text-right text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {history.map((item) => (
                                            <tr key={item.id} className="hover:bg-neutral-50">
                                                <td className="px-4 py-3 text-sm text-neutral-900">
                                                    {format(new Date(item.completed_at || item.preferred_date), 'MMM d, yyyy')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/client/requests/${item.id}`}
                                                        className="text-sm font-medium text-primary-600 hover:underline"
                                                    >
                                                        {item.request_number}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-600">
                                                    {item.barangay}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-600">
                                                    {item.assigned_collector?.full_name || '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`/client/requests/${item.id}`}
                                                        className="text-sm text-primary-600 hover:underline"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
