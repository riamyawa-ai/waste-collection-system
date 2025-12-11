'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    MapPin,
    Clock,
    Calendar,
    User,
    Route,
    Phone,
    FileText,
    CheckCircle
} from 'lucide-react';
import { getScheduleById } from '@/lib/actions/schedule';
import { format } from 'date-fns';

interface ViewScheduleModalProps {
    open: boolean;
    onClose: () => void;
    scheduleId: string;
}

interface Stop {
    id: string;
    location_name: string;
    location_type: string;
    address: string;
    barangay: string;
    stop_order: number;
    is_completed: boolean;
    contact_person: string | null;
    contact_number: string | null;
    special_notes: string | null;
}

interface Schedule {
    id: string;
    name: string;
    description: string | null;
    schedule_type: string;
    start_date: string;
    end_date: string | null;
    start_time: string;
    end_time: string;
    working_days: string[] | null;
    status: string;
    special_instructions: string | null;
    created_at: string;
    collector: { id: string; full_name: string; phone: string; email: string } | null;
    backup_collector: { id: string; full_name: string; phone: string; email: string } | null;
    creator: { id: string; full_name: string } | null;
}

export function ViewScheduleModal({ open, onClose, scheduleId }: ViewScheduleModalProps) {
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [stops, setStops] = useState<Stop[]>([]);

    useEffect(() => {
        if (open && scheduleId) {
            loadSchedule();
        }
    }, [open, scheduleId, loadSchedule]);

    const loadSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getScheduleById(scheduleId);
            if (result.success && result.data) {
                setSchedule(result.data.schedule);
                setStops(result.data.stops || []);
            }
        } catch (error) {
            console.error('Failed to load schedule:', error);
        } finally {
            setLoading(false);
        }
    }, [scheduleId]);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            completed: 'bg-blue-100 text-blue-700 border-blue-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || styles.draft;
    };

    const getLocationTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            schools: 'bg-blue-50 text-blue-700 border-blue-200 border',
            hospitals: 'bg-red-50 text-red-700 border-red-200 border',
            parks: 'bg-green-50 text-green-700 border-green-200 border',
            government: 'bg-purple-50 text-purple-700 border-purple-200 border',
            commercial: 'bg-amber-50 text-amber-700 border-amber-200 border',
            residential: 'bg-cyan-50 text-cyan-700 border-cyan-200 border',
            markets: 'bg-pink-50 text-pink-700 border-pink-200 border',
        };
        return colors[type] || 'bg-slate-100 text-slate-700 border-slate-200 border';
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Route className="h-5 w-5 text-emerald-600" />
                        Schedule Details
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                    </div>
                ) : schedule ? (
                    <ScrollArea className="max-h-[70vh] pr-4">
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{schedule.name}</h3>
                                        {schedule.description && (
                                            <p className="text-gray-500 text-sm mt-1">{schedule.description}</p>
                                        )}
                                    </div>
                                    <Badge className={getStatusBadge(schedule.status)}>
                                        {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-500">Date</p>
                                            <p className="text-gray-900 font-medium">
                                                {format(new Date(schedule.start_date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-500">Time</p>
                                            <p className="text-gray-900 font-medium">{schedule.start_time} - {schedule.end_time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Route className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-500">Type</p>
                                            <p className="text-gray-900 font-medium capitalize">{schedule.schedule_type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-gray-500">Stops</p>
                                            <p className="text-gray-900 font-medium">{stops.length} locations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Collector Info */}
                            {schedule.collector && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-emerald-600" />
                                        Assigned Collector
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <User className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">{schedule.collector.full_name}</p>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {schedule.collector.phone}
                                                </span>
                                                <span>{schedule.collector.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {schedule.backup_collector && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-gray-500 text-sm mb-1">Backup Collector</p>
                                            <p className="text-gray-900">{schedule.backup_collector.full_name}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Route Stops */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                    Route Stops
                                </h4>
                                <div className="space-y-2">
                                    {stops.map((stop, index) => (
                                        <div
                                            key={stop.id}
                                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${stop.is_completed
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-white text-gray-500 border border-gray-200'
                                                }`}>
                                                {stop.is_completed ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-gray-900 font-medium">{stop.location_name}</p>
                                                    <Badge className={`text-xs ${getLocationTypeBadge(stop.location_type)}`}>
                                                        {stop.location_type}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    {stop.address}, {stop.barangay}
                                                </p>
                                                {stop.contact_person && (
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        Contact: {stop.contact_person} - {stop.contact_number}
                                                    </p>
                                                )}
                                                {stop.special_notes && (
                                                    <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                                                        <FileText className="h-3 w-3" />
                                                        {stop.special_notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Special Instructions */}
                            {schedule.special_instructions && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Special Instructions
                                    </h4>
                                    <p className="text-amber-900 text-sm">{schedule.special_instructions}</p>
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="text-xs text-gray-400 pt-4 border-t border-gray-200">
                                <p>Created by {schedule.creator?.full_name || 'Unknown'}</p>
                                <p>Created on {format(new Date(schedule.created_at), 'MMM dd, yyyy \'at\' h:mm a')}</p>
                            </div>
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-400">Schedule not found</p>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
