'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { Clock, MapPin, CheckCircle2, Truck, Map, Route, XCircle, AlertTriangle } from 'lucide-react';
import { SCHEDULE_STATUS_COLORS, SCHEDULE_STATUS_LABELS } from '@/constants/status';
import { ViewScheduleModal } from '@/components/collector/ViewScheduleModal';
import { ScheduleCalendar } from '@/components/collector/ScheduleCalendar';
import { acceptSchedule, declineSchedule } from '@/lib/actions/collector';
import { toast } from 'sonner';

interface Schedule {
    id: string;
    name: string;
    description: string | null;
    schedule_type: string;
    start_date: string;
    start_time: string;
    end_time: string;
    status: string;
    special_instructions: string | null;
    stops_count: number;
    confirmed_by_collector?: boolean;
    confirmed_at?: string | null;
}

const DECLINE_REASONS = [
    { value: 'capacity', label: 'Already at capacity' },
    { value: 'outside_area', label: 'Outside service area' },
    { value: 'schedule_conflict', label: 'Schedule conflict' },
    { value: 'vehicle_issue', label: 'Vehicle/equipment issue' },
    { value: 'personal', label: 'Personal emergency' },
    { value: 'other', label: 'Other' },
];

export default function CollectorSchedulePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Decline dialog state
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);
    const [scheduleToDecline, setScheduleToDecline] = useState<Schedule | null>(null);
    const [declineReason, setDeclineReason] = useState('');
    const [declineOtherReason, setDeclineOtherReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // No collector available modal
    const [showNoCollectorModal, setShowNoCollectorModal] = useState(false);

    const fetchSchedules = useCallback(async () => {
        setIsLoading(true);
        const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsLoading(false);
            return;
        }

        // Fetch schedules for current month plus next month for upcoming section
        const monthStart = format(startOfMonth(subMonths(currentMonth, 1)), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(addMonths(currentMonth, 2)), 'yyyy-MM-dd');

        const { data, error } = await supabase
            .from('collection_schedules')
            .select(`*, stops:schedule_stops(count)`)
            .or(`assigned_collector_id.eq.${user.id},backup_collector_id.eq.${user.id}`)
            .gte('start_date', monthStart)
            .lte('start_date', monthEnd)
            .order('start_date', { ascending: true });

        if (error) {
            console.error('Error fetching schedules:', error);
        }

        if (data) {
            setSchedules(data.map(s => ({
                ...s,
                stops_count: (s.stops as { count: number }[])?.[0]?.count || 0
            })) as unknown as Schedule[]);
        }
        setIsLoading(false);
    }, [currentMonth]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleAccept = async (schedule: Schedule) => {
        setIsProcessing(true);
        const result = await acceptSchedule(schedule.id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Schedule accepted!');
            fetchSchedules();
        }
        setIsProcessing(false);
    };

    const handleDeclineClick = (schedule: Schedule) => {
        setScheduleToDecline(schedule);
        setDeclineReason('');
        setDeclineOtherReason('');
        setShowDeclineDialog(true);
    };

    const handleDeclineSubmit = async () => {
        if (!scheduleToDecline) return;

        const reason = declineReason === 'other'
            ? declineOtherReason
            : DECLINE_REASONS.find(r => r.value === declineReason)?.label || declineReason;

        if (!reason) {
            toast.error('Please provide a reason');
            return;
        }

        setIsProcessing(true);
        const result = await declineSchedule(scheduleToDecline.id, reason);

        if (result.error) {
            toast.error(result.error);
        } else {
            setShowDeclineDialog(false);

            if (result.reassignmentFailed) {
                setShowNoCollectorModal(true);
            } else {
                toast.success(result.message || 'Schedule declined');
            }

            fetchSchedules();
        }
        setIsProcessing(false);
    };

    const getStatusBadge = (status: string) => {
        const colors = SCHEDULE_STATUS_COLORS[status as keyof typeof SCHEDULE_STATUS_COLORS] || SCHEDULE_STATUS_COLORS.draft;
        return <Badge className={`${colors.bg} ${colors.text}`}>{SCHEDULE_STATUS_LABELS[status as keyof typeof SCHEDULE_STATUS_LABELS] || status}</Badge>;
    };

    const handleScheduleClick = (schedule: { id: string }) => {
        setSelectedScheduleId(schedule.id);
        setShowScheduleModal(true);
    };

    // Check if schedule can be accepted/declined (not yet confirmed)
    const canRespondToSchedule = (schedule: Schedule) => {
        return ['draft', 'active'].includes(schedule.status) && !schedule.confirmed_by_collector;
    };

    // Get schedules for calendar (current month only)
    const calendarSchedules = schedules.filter(s => {
        const scheduleDate = new Date(s.start_date);
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        return scheduleDate >= monthStart && scheduleDate <= monthEnd;
    });

    // Get upcoming active schedules (from today onwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingSchedules = schedules
        .filter(s => ['active', 'accepted'].includes(s.status) && new Date(s.start_date) >= today)
        .slice(0, 5);

    // Get completed schedules
    const completedSchedules = schedules
        .filter(s => s.status === 'completed')
        .slice(0, 10);

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="My Schedule" description="View and manage your assigned collection schedules" />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Calendar - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <ScheduleCalendar
                        schedules={calendarSchedules}
                        onScheduleClick={handleScheduleClick}
                    />
                </div>

                {/* Quick Stats & Today's Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-green-600" />
                            Schedule Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50 rounded-lg text-center">
                                <p className="text-2xl font-bold text-blue-600">{upcomingSchedules.length}</p>
                                <p className="text-xs text-blue-700">Upcoming</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-600">{completedSchedules.length}</p>
                                <p className="text-xs text-green-700">Completed</p>
                            </div>
                        </div>

                        {/* Next Schedule */}
                        {upcomingSchedules.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Next Schedule</p>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Route className="h-4 w-4 text-green-600" />
                                        <p className="font-medium text-gray-900 truncate">{upcomingSchedules[0].name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="h-3 w-3" />
                                        <span>{format(new Date(upcomingSchedules[0].start_date), 'MMM d')} • {upcomingSchedules[0].start_time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{upcomingSchedules[0].stops_count} stops</span>
                                    </div>

                                    {/* Action Buttons */}
                                    {canRespondToSchedule(upcomingSchedules[0]) && (
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleAccept(upcomingSchedules[0])}
                                                disabled={isProcessing}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => handleDeclineClick(upcomingSchedules[0])}
                                                disabled={isProcessing}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Decline
                                            </Button>
                                        </div>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full mt-2"
                                        onClick={() => handleScheduleClick(upcomingSchedules[0])}
                                    >
                                        <Map className="h-4 w-4 mr-1" />
                                        View Route
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming & History Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-green-600" />
                        All Schedules
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="upcoming">
                        <TabsList>
                            <TabsTrigger value="upcoming">Upcoming ({upcomingSchedules.length})</TabsTrigger>
                            <TabsTrigger value="history">Completed ({completedSchedules.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upcoming" className="mt-4">
                            {upcomingSchedules.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No upcoming schedules</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingSchedules.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                                            <div className="flex-1">
                                                <p className="font-medium">{s.name}</p>
                                                <p className="text-sm text-gray-500">{format(new Date(s.start_date), 'MMM d, yyyy')} • {s.start_time}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{s.stops_count} stops</Badge>
                                                {getStatusBadge(s.status)}

                                                {/* Accept/Decline buttons for active schedules */}
                                                {canRespondToSchedule(s) && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleAccept(s)}
                                                            disabled={isProcessing}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeclineClick(s)}
                                                            disabled={isProcessing}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Decline
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleScheduleClick(s)}
                                                >
                                                    <Map className="h-4 w-4 mr-1" />
                                                    View Map
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="history" className="mt-4">
                            {completedSchedules.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No completed schedules</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {completedSchedules.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-4 rounded-lg border">
                                            <div>
                                                <p className="font-medium">{s.name}</p>
                                                <p className="text-sm text-gray-500">{format(new Date(s.start_date), 'MMM d, yyyy')}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{s.stops_count} stops</Badge>
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* View Schedule Modal */}
            <ViewScheduleModal
                open={showScheduleModal}
                onClose={() => {
                    setShowScheduleModal(false);
                    setSelectedScheduleId(null);
                }}
                scheduleId={selectedScheduleId}
            />

            {/* Decline Dialog */}
            <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Decline Schedule</DialogTitle>
                        <DialogDescription>
                            Please select a reason for declining this schedule. It will be reassigned to another available collector.
                        </DialogDescription>
                    </DialogHeader>
                    <RadioGroup value={declineReason} onValueChange={setDeclineReason} className="space-y-2">
                        {DECLINE_REASONS.map((r) => (
                            <div key={r.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={r.value} id={`decline-${r.value}`} />
                                <Label htmlFor={`decline-${r.value}`}>{r.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {declineReason === 'other' && (
                        <Textarea
                            value={declineOtherReason}
                            onChange={(e) => setDeclineOtherReason(e.target.value)}
                            placeholder="Specify your reason..."
                            className="mt-2"
                        />
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeclineSubmit}
                            disabled={isProcessing || !declineReason}
                        >
                            {isProcessing ? 'Declining...' : 'Decline Schedule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* No Collector Available Modal */}
            <Dialog open={showNoCollectorModal} onOpenChange={setShowNoCollectorModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-5 w-5" />
                            No Available Collectors
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            There are no other collectors available at this time to take over this schedule.
                            Staff has been notified and will assign a replacement as soon as one becomes available.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowNoCollectorModal(false)}>
                            Understood
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
