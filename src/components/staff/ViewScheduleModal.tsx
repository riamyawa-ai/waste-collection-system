'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
    }, [open, scheduleId]);

    const loadSchedule = async () => {
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
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return styles[status] || styles.draft;
    };

    const getLocationTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            schools: 'bg-blue-500/20 text-blue-400',
            hospitals: 'bg-red-500/20 text-red-400',
            parks: 'bg-green-500/20 text-green-400',
            government: 'bg-purple-500/20 text-purple-400',
            commercial: 'bg-amber-500/20 text-amber-400',
            residential: 'bg-cyan-500/20 text-cyan-400',
            markets: 'bg-pink-500/20 text-pink-400',
        };
        return colors[type] || 'bg-slate-500/20 text-slate-400';
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Route className="h-5 w-5 text-emerald-400" />
                        Schedule Details
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
                    </div>
                ) : schedule ? (
                    <ScrollArea className="max-h-[70vh] pr-4">
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div className="bg-slate-700/50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{schedule.name}</h3>
                                        {schedule.description && (
                                            <p className="text-slate-400 text-sm mt-1">{schedule.description}</p>
                                        )}
                                    </div>
                                    <Badge className={getStatusBadge(schedule.status)}>
                                        {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-slate-400">Date</p>
                                            <p className="text-white">
                                                {format(new Date(schedule.start_date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-slate-400">Time</p>
                                            <p className="text-white">{schedule.start_time} - {schedule.end_time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Route className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-slate-400">Type</p>
                                            <p className="text-white capitalize">{schedule.schedule_type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-slate-400">Stops</p>
                                            <p className="text-white">{stops.length} locations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Collector Info */}
                            {schedule.collector && (
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-emerald-400" />
                                        Assigned Collector
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <User className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{schedule.collector.full_name}</p>
                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {schedule.collector.phone}
                                                </span>
                                                <span>{schedule.collector.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {schedule.backup_collector && (
                                        <div className="mt-3 pt-3 border-t border-slate-600">
                                            <p className="text-slate-400 text-sm mb-1">Backup Collector</p>
                                            <p className="text-white">{schedule.backup_collector.full_name}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Route Stops */}
                            <div>
                                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                    Route Stops
                                </h4>
                                <div className="space-y-2">
                                    {stops.map((stop, index) => (
                                        <div
                                            key={stop.id}
                                            className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg"
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${stop.is_completed
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-slate-600 text-slate-300'
                                                }`}>
                                                {stop.is_completed ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-white font-medium">{stop.location_name}</p>
                                                    <Badge className={`text-xs ${getLocationTypeBadge(stop.location_type)}`}>
                                                        {stop.location_type}
                                                    </Badge>
                                                </div>
                                                <p className="text-slate-400 text-sm">
                                                    {stop.address}, {stop.barangay}
                                                </p>
                                                {stop.contact_person && (
                                                    <p className="text-slate-500 text-xs mt-1">
                                                        Contact: {stop.contact_person} - {stop.contact_number}
                                                    </p>
                                                )}
                                                {stop.special_notes && (
                                                    <p className="text-amber-400/70 text-xs mt-1 flex items-center gap-1">
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
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                    <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Special Instructions
                                    </h4>
                                    <p className="text-slate-300 text-sm">{schedule.special_instructions}</p>
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="text-xs text-slate-500 pt-4 border-t border-slate-700">
                                <p>Created by {schedule.creator?.full_name || 'Unknown'}</p>
                                <p>Created on {format(new Date(schedule.created_at), 'MMM dd, yyyy \'at\' h:mm a')}</p>
                            </div>
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-400">Schedule not found</p>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-700">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-slate-600 text-slate-300"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
