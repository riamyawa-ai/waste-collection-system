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
import {
    Clock,
    MapPin,
    Navigation,
    Calendar,
    FileText,
    CheckCircle2,
    AlertCircle,
    Route,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { format } from 'date-fns';
import { MapboxRouteEditor } from '@/components/staff/MapboxRouteEditor';
import { SCHEDULE_STATUS_COLORS, SCHEDULE_STATUS_LABELS } from '@/constants/status';

interface ViewScheduleModalProps {
    open: boolean;
    onClose: () => void;
    scheduleId: string | null;
}

interface ScheduleStop {
    id: string;
    stop_order: number;
    location_name: string;
    location_type: string;
    address: string;
    barangay: string;
    latitude: number;
    longitude: number;
    estimated_duration: number | null;
    special_notes: string | null;
    is_completed: boolean;
}

interface ScheduleDetails {
    id: string;
    name: string;
    description: string | null;
    schedule_type: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    status: string;
    special_instructions: string | null;
    stops: ScheduleStop[];
}

export function ViewScheduleModal({ open, onClose, scheduleId }: ViewScheduleModalProps) {
    const [schedule, setSchedule] = useState<ScheduleDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && scheduleId) {
            fetchScheduleDetails();
        }
    }, [open, scheduleId]);

    const fetchScheduleDetails = async () => {
        if (!scheduleId) return;

        setLoading(true);
        const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data } = await supabase
            .from('collection_schedules')
            .select(`
                *,
                stops:schedule_stops(
                    id,
                    stop_order,
                    location_name,
                    location_type,
                    address,
                    barangay,
                    latitude,
                    longitude,
                    estimated_duration,
                    special_notes,
                    is_completed
                )
            `)
            .eq('id', scheduleId)
            .single();

        if (data) {
            // Type assertion for sorting
            const stopsArray = (data.stops || []) as unknown as ScheduleStop[];
            const sortedStops = stopsArray.sort((a, b) => a.stop_order - b.stop_order);
            setSchedule({
                ...data,
                stops: sortedStops
            } as unknown as ScheduleDetails);
        }
        setLoading(false);
    };

    const getStatusBadge = (status: string) => {
        const colors = SCHEDULE_STATUS_COLORS[status as keyof typeof SCHEDULE_STATUS_COLORS] || SCHEDULE_STATUS_COLORS.draft;
        return <Badge className={`${colors.bg} ${colors.text}`}>{SCHEDULE_STATUS_LABELS[status as keyof typeof SCHEDULE_STATUS_LABELS] || status}</Badge>;
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 gap-0 bg-white overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-white z-10 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Route className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900">
                                    {loading ? 'Loading...' : schedule?.name || 'Schedule Details'}
                                </DialogTitle>
                                <p className="text-sm text-gray-500">
                                    View route details and stops
                                </p>
                            </div>
                        </div>
                        {schedule && getStatusBadge(schedule.status)}
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                    </div>
                ) : schedule ? (
                    <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row">
                        {/* Left Side - Schedule Info */}
                        <div className="w-full lg:w-[400px] border-r border-gray-200 bg-gray-50/50 flex flex-col min-h-0 lg:h-full flex-shrink-0 overflow-hidden max-h-[250px] lg:max-h-none">
                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-6">
                                    {/* Schedule Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            Schedule Info
                                        </h3>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {format(new Date(schedule.scheduled_date), 'EEEE, MMMM d, yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {schedule.start_time} - {schedule.end_time}
                                                </span>
                                            </div>
                                            {schedule.description && (
                                                <div className="flex items-start gap-3">
                                                    <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                                    <span className="text-sm text-gray-600">{schedule.description}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Special Instructions */}
                                    {schedule.special_instructions && (
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                                Special Instructions
                                            </h3>
                                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                                <p className="text-sm text-amber-800">{schedule.special_instructions}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stops List */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            Collection Stops ({schedule.stops.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {schedule.stops.map((stop, index) => (
                                                <div key={stop.id} className={`bg-white p-3 rounded-lg border flex items-start gap-3 ${stop.is_completed ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                                                    <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0 ${stop.is_completed ? 'bg-green-600' : 'bg-green-500'}`}>
                                                        {stop.is_completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{stop.location_name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{stop.address}</p>
                                                        <p className="text-xs text-gray-400">{stop.barangay}</p>
                                                    </div>
                                                    {stop.estimated_duration && (
                                                        <Badge variant="outline" className="flex-shrink-0 text-xs">
                                                            ~{stop.estimated_duration} min
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>

                        {/* Right Side - Map */}
                        <div className="hidden lg:block flex-1 relative bg-emerald-50 min-h-0">
                            <MapboxRouteEditor
                                stops={schedule.stops.map(s => ({
                                    id: s.id,
                                    locationName: s.location_name,
                                    locationType: s.location_type,
                                    address: s.address,
                                    barangay: s.barangay,
                                    latitude: s.latitude,
                                    longitude: s.longitude,
                                }))}
                                onStopsChange={() => { }}
                                readOnly={true}
                                showSampleLocations={false}
                                height="calc(90vh - 80px)"
                            />

                            {/* Map Overlay */}
                            <div className="absolute top-16 left-4 z-10 pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Navigation className="h-4 w-4 text-green-600" />
                                    {schedule.stops.length} stops on this route
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Schedule not found</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
