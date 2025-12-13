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
    Route,
    Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SCHEDULE_STATUS_COLORS, SCHEDULE_STATUS_LABELS } from '@/constants/status';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ScheduleEvent {
    id: string;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string | null;  // Added for collection duration display
    start_time: string;
    end_time: string;
    status: string;
    stops_count: number;
    special_instructions: string | null;
}

interface ScheduleCalendarProps {
    schedules?: ScheduleEvent[];
    onScheduleClick?: (schedule: ScheduleEvent) => void;
    className?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function ScheduleCalendar({
    schedules = [],
    onScheduleClick,
    className,
}: ScheduleCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSchedules, setSelectedSchedules] = useState<ScheduleEvent[]>([]);
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

    const getSchedulesForDate = (day: number): ScheduleEvent[] => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const checkDate = new Date(year, month, day);

        return schedules.filter((schedule) => {
            const startDate = new Date(schedule.start_date);
            const endDate = schedule.end_date ? new Date(schedule.end_date) : startDate;

            // Check if the current date falls within the schedule's date range
            return checkDate >= startDate && checkDate <= endDate;
        });
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
        const daySchedules = getSchedulesForDate(day);

        setSelectedDate(date);
        setSelectedSchedules(daySchedules);

        if (daySchedules.length > 0) {
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDate(null);
        setSelectedSchedules([]);
    };

    const getStatusColor = (status: string) => {
        const colors = SCHEDULE_STATUS_COLORS[status as keyof typeof SCHEDULE_STATUS_COLORS];
        return colors || SCHEDULE_STATUS_COLORS.draft;
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
                        <CalendarIcon className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-neutral-900">
                            {MONTHS[month]} {year}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToToday}
                            className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
                        const daySchedules = day ? getSchedulesForDate(day) : [];
                        const hasSchedules = daySchedules.length > 0;

                        return (
                            <div
                                key={index}
                                onClick={() => day && handleDateClick(day)}
                                className={cn(
                                    'min-h-[80px] p-1 border-b border-r border-neutral-100 last:border-r-0',
                                    day && 'cursor-pointer hover:bg-neutral-50 transition-colors',
                                    !day && 'bg-neutral-50/50',
                                    hasSchedules && 'hover:bg-green-50/50'
                                )}
                            >
                                {day && (
                                    <>
                                        <div
                                            className={cn(
                                                'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1',
                                                isToday(day)
                                                    ? 'bg-green-500 text-white'
                                                    : 'text-neutral-700'
                                            )}
                                        >
                                            {day}
                                        </div>
                                        {/* Schedule indicators */}
                                        <div className="space-y-0.5">
                                            {daySchedules.slice(0, 2).map((schedule) => {
                                                const colors = getStatusColor(schedule.status);
                                                return (
                                                    <div
                                                        key={schedule.id}
                                                        className={cn(
                                                            'text-xs px-1.5 py-0.5 rounded truncate',
                                                            colors.bg,
                                                            colors.text
                                                        )}
                                                        title={schedule.name}
                                                    >
                                                        {schedule.name}
                                                    </div>
                                                );
                                            })}
                                            {daySchedules.length > 2 && (
                                                <div className="text-xs text-neutral-500 px-1.5">
                                                    +{daySchedules.length - 2} more
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
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-neutral-600">Active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-neutral-600">Completed</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-gray-400" />
                            <span className="text-neutral-600">Draft</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-neutral-600">Cancelled</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Details Modal */}
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
                                    {selectedSchedules.length} schedule{selectedSchedules.length !== 1 ? 's' : ''}
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
                            {selectedSchedules.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500">
                                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                                    <p>No schedules on this date</p>
                                </div>
                            ) : (
                                selectedSchedules.map((schedule) => {
                                    const colors = getStatusColor(schedule.status);
                                    return (
                                        <div
                                            key={schedule.id}
                                            className="p-4 border border-neutral-200 rounded-lg hover:border-green-200 hover:bg-green-50/30 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Route className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium text-neutral-900">
                                                            {schedule.name}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-sm text-neutral-600 mb-1">
                                                        <Clock className="w-4 h-4 text-neutral-400" />
                                                        <span>{schedule.start_time} - {schedule.end_time}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-sm text-neutral-600 mb-2">
                                                        <MapPin className="w-4 h-4 text-neutral-400" />
                                                        <span>{schedule.stops_count} stops</span>
                                                    </div>

                                                    <Badge className={cn(colors.bg, colors.text)}>
                                                        {SCHEDULE_STATUS_LABELS[schedule.status as keyof typeof SCHEDULE_STATUS_LABELS] || schedule.status}
                                                    </Badge>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onScheduleClick?.(schedule)}
                                                >
                                                    <Map className="w-4 h-4 mr-1" />
                                                    View Map
                                                </Button>
                                            </div>

                                            {schedule.description && (
                                                <p className="mt-2 text-sm text-neutral-500">
                                                    {schedule.description}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })
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
export function ScheduleCalendarSkeleton() {
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
