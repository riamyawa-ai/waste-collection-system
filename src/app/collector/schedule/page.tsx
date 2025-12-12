'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, CheckCircle2, Truck, Eye, Map } from 'lucide-react';
import { SCHEDULE_STATUS_COLORS, SCHEDULE_STATUS_LABELS } from '@/constants/status';
import { ViewScheduleModal } from '@/components/collector/ViewScheduleModal';

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
}

export default function CollectorSchedulePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [_isLoading, setIsLoading] = useState(true);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    useEffect(() => {
        const fetchSchedules = async () => {
            const supabase = createBrowserClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

            const { data } = await supabase
                .from('collection_schedules')
                .select(`*, stops:schedule_stops(count)`)
                .or(`assigned_collector_id.eq.${user.id},backup_collector_id.eq.${user.id}`)
                .gte('start_date', monthStart)
                .lte('start_date', monthEnd)
                .order('start_date', { ascending: true });

            if (data) {
                setSchedules(data.map(s => ({
                    ...s,
                    stops_count: (s.stops as { count: number }[])?.[0]?.count || 0
                })) as unknown as Schedule[]);
            }
            setIsLoading(false);
        };

        fetchSchedules();
    }, [currentMonth]);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const getSchedulesForDate = (date: Date) => {
        return schedules.filter(s => isSameDay(new Date(s.start_date), date));
    };

    const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

    const getStatusBadge = (status: string) => {
        const colors = SCHEDULE_STATUS_COLORS[status as keyof typeof SCHEDULE_STATUS_COLORS] || SCHEDULE_STATUS_COLORS.draft;
        return <Badge className={`${colors.bg} ${colors.text}`}>{SCHEDULE_STATUS_LABELS[status as keyof typeof SCHEDULE_STATUS_LABELS] || status}</Badge>;
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="My Schedule" description="View your assigned collection schedules" />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Calendar */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-green-600" />
                                {format(currentMonth, 'MMMM yyyy')}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array(startOfMonth(currentMonth).getDay()).fill(null).map((_, i) => (
                                <div key={`empty-${i}`} className="h-16" />
                            ))}
                            {daysInMonth.map(day => {
                                const daySchedules = getSchedulesForDate(day);
                                const hasSchedule = daySchedules.length > 0;
                                const isSelected = selectedDate && isSameDay(day, selectedDate);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={`h-16 p-1 rounded-lg text-left transition-colors ${isToday(day) ? 'bg-green-100 border-2 border-green-500' :
                                            isSelected ? 'bg-blue-100 border-2 border-blue-500' :
                                                hasSchedule ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`text-sm font-medium ${isToday(day) ? 'text-green-700' : ''}`}>{format(day, 'd')}</div>
                                        {hasSchedule && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {daySchedules.slice(0, 2).map(s => (
                                                    <div key={s.id} className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-blue-500' : s.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                ))}
                                                {daySchedules.length > 2 && <span className="text-xs text-gray-500">+{daySchedules.length - 2}</span>}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Date Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-green-600" />
                            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                        </CardTitle>
                        <CardDescription>{selectedDateSchedules.length} schedule(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedDateSchedules.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No schedules for this date</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-4">
                                    {selectedDateSchedules.map(schedule => (
                                        <div key={schedule.id} className="p-4 rounded-lg border bg-gray-50">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium">{schedule.name}</h4>
                                                {getStatusBadge(schedule.status)}
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    {schedule.start_time} - {schedule.end_time}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    {schedule.stops_count} stops
                                                </div>
                                                {schedule.description && (
                                                    <p className="text-gray-500">{schedule.description}</p>
                                                )}
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => {
                                                        setSelectedScheduleId(schedule.id);
                                                        setShowScheduleModal(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Details
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedScheduleId(schedule.id);
                                                        setShowScheduleModal(true);
                                                    }}
                                                >
                                                    <Map className="h-4 w-4 mr-1" />
                                                    View Map
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Schedules */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-green-600" />
                        Upcoming Schedules
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="upcoming">
                        <TabsList>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upcoming" className="mt-4">
                            {schedules.filter(s => s.status === 'active').length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No upcoming schedules</div>
                            ) : (
                                <div className="space-y-3">
                                    {schedules.filter(s => s.status === 'active').map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                                            <div className="flex-1">
                                                <p className="font-medium">{s.name}</p>
                                                <p className="text-sm text-gray-500">{format(new Date(s.start_date), 'MMM d, yyyy')} • {s.start_time}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{s.stops_count} stops</Badge>
                                                {getStatusBadge(s.status)}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedScheduleId(s.id);
                                                        setShowScheduleModal(true);
                                                    }}
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
                            {schedules.filter(s => s.status === 'completed').length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No completed schedules</div>
                            ) : (
                                <div className="space-y-3">
                                    {schedules.filter(s => s.status === 'completed').map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-4 rounded-lg border">
                                            <div>
                                                <p className="font-medium">{s.name}</p>
                                                <p className="text-sm text-gray-500">{format(new Date(s.start_date), 'MMM d, yyyy')}</p>
                                            </div>
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
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
        </div>
    );
}
