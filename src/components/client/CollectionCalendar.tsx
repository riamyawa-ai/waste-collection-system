'use client';

import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    X,
    Clock,
    MapPin,
    Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_COLORS, STATUS_LABELS, type RequestStatus } from '@/constants/status';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import Link from 'next/link';

interface CalendarEvent {
    id: string;
    date: string;
    status: RequestStatus;
    title?: string;
    barangay?: string;
    time_slot?: string;
}

interface CollectionCalendarProps {
    events?: CalendarEvent[];
    onDateClick?: (date: Date, events: CalendarEvent[]) => void;
    className?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function CollectionCalendar({
    events = [],
    onDateClick,
    className,
}: CollectionCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const today = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getEventsForDate = (day: number): CalendarEvent[] => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter((event) => event.date === dateStr);
    };

    const isToday = (day: number): boolean => {
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    const handleDateClick = (day: number) => {
        const date = new Date(year, month, day);
        const dayEvents = getEventsForDate(day);

        setSelectedDate(date);
        setSelectedEvents(dayEvents);

        if (dayEvents.length > 0) {
            setShowModal(true);
        }

        onDateClick?.(date, dayEvents);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDate(null);
        setSelectedEvents([]);
    };

    // Generate calendar grid
    const calendarDays: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
        calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    return (
        <>
            <div className={cn('bg-white rounded-xl border border-neutral-200 overflow-hidden', className)}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary-600" />
                        <h3 className="font-semibold text-neutral-900">
                            {MONTHS[month]} {year}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToToday}
                            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={prevMonth}
                            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-neutral-600" />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-neutral-600" />
                        </button>
                    </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 border-b border-neutral-200">
                    {DAYS.map((day) => (
                        <div
                            key={day}
                            className="py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wide"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => {
                        const dayEvents = day ? getEventsForDate(day) : [];
                        const hasEvents = dayEvents.length > 0;

                        return (
                            <div
                                key={index}
                                onClick={() => day && handleDateClick(day)}
                                className={cn(
                                    'min-h-[80px] p-1 border-b border-r border-neutral-100 last:border-r-0',
                                    day && 'cursor-pointer hover:bg-neutral-50 transition-colors',
                                    !day && 'bg-neutral-50/50',
                                    hasEvents && 'hover:bg-primary-50/50'
                                )}
                            >
                                {day && (
                                    <>
                                        <div
                                            className={cn(
                                                'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1',
                                                isToday(day)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'text-neutral-700'
                                            )}
                                        >
                                            {day}
                                        </div>
                                        {/* Event indicators */}
                                        <div className="space-y-0.5">
                                            {dayEvents.slice(0, 3).map((event) => (
                                                <div
                                                    key={event.id}
                                                    className={cn(
                                                        'text-xs px-1.5 py-0.5 rounded truncate',
                                                        STATUS_COLORS[event.status]?.bg,
                                                        STATUS_COLORS[event.status]?.text
                                                    )}
                                                    title={event.title || STATUS_LABELS[event.status]}
                                                >
                                                    {event.title || STATUS_LABELS[event.status]}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-xs text-neutral-500 px-1.5">
                                                    +{dayEvents.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="p-4 border-t border-neutral-200 bg-neutral-50">
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-neutral-600">Completed</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-neutral-600">Scheduled</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span className="text-neutral-600">Pending</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <span className="text-neutral-600">In Progress</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Modal */}
            {showModal && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={closeModal}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                            <div>
                                <h3 className="font-semibold text-neutral-900">
                                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    {selectedEvents.length} request{selectedEvents.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-neutral-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
                            {selectedEvents.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500">
                                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                                    <p>No requests on this date</p>
                                </div>
                            ) : (
                                selectedEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="p-4 border border-neutral-200 rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium text-neutral-900">
                                                        {event.title || 'Collection Request'}
                                                    </span>
                                                    <StatusBadge status={event.status} size="sm" />
                                                </div>

                                                {event.barangay && (
                                                    <div className="flex items-center gap-1.5 text-sm text-neutral-600 mb-1">
                                                        <MapPin className="w-4 h-4 text-neutral-400" />
                                                        <span>{event.barangay}</span>
                                                    </div>
                                                )}

                                                {event.time_slot && (
                                                    <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                                                        <Clock className="w-4 h-4 text-neutral-400" />
                                                        <span>{event.time_slot}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Link href={`/client/requests/${event.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
                            <Button onClick={closeModal} variant="outline" className="w-full">
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Loading skeleton
export function CollectionCalendarSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <div className="h-6 w-32 bg-neutral-200 rounded" />
                <div className="flex gap-2">
                    <div className="h-8 w-16 bg-neutral-200 rounded" />
                    <div className="h-8 w-8 bg-neutral-200 rounded" />
                    <div className="h-8 w-8 bg-neutral-200 rounded" />
                </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-neutral-200">
                {[...Array(35)].map((_, i) => (
                    <div key={i} className="bg-white min-h-[80px]" />
                ))}
            </div>
        </div>
    );
}
