'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getAttendanceHistory } from '@/lib/actions/collector';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, Clock, Timer, ChevronLeft, ChevronRight, RefreshCw, TrendingUp } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    date: string;
    login_time: string;
    logout_time: string | null;
    total_duration: string | null;
}

interface AttendanceStats {
    totalDays: number;
    totalHours: number;
    averageHours: number;
    daysThisMonth: number;
}

export default function CollectorAttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 0,
        total: 0,
    });
    const [dateRange, setDateRange] = useState({
        from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    });
    const [stats, setStats] = useState<AttendanceStats>({
        totalDays: 0,
        totalHours: 0,
        averageHours: 0,
        daysThisMonth: 0,
    });

    const fetchAttendance = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getAttendanceHistory({
                from_date: dateRange.from,
                to_date: dateRange.to,
                page: pagination.page,
                limit: 25,
            });

            if (result.error) {
                console.error('Error fetching attendance:', result.error);
                return;
            }

            if (result.data) {
                const attendanceRecords = result.data as AttendanceRecord[];
                const totalRecords = result.total || attendanceRecords.length;
                const limit = 25;

                setRecords(attendanceRecords);
                setPagination(prev => ({
                    ...prev,
                    total: totalRecords,
                    totalPages: Math.ceil(totalRecords / limit),
                }));

                // Calculate stats from records
                const totalMinutes = attendanceRecords.reduce((sum, r) => {
                    if (r.total_duration) {
                        const parts = r.total_duration.split(':');
                        return sum + (parseInt(parts[0]) * 60) + parseInt(parts[1] || '0');
                    }
                    return sum;
                }, 0);

                setStats({
                    totalDays: attendanceRecords.length,
                    totalHours: Math.round(totalMinutes / 60),
                    averageHours: attendanceRecords.length > 0 ? Math.round((totalMinutes / 60) / attendanceRecords.length * 10) / 10 : 0,
                    daysThisMonth: attendanceRecords.filter(r =>
                        new Date(r.date).getMonth() === new Date().getMonth()
                    ).length,
                });
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setIsLoading(false);
        }
    }, [dateRange, pagination.page]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const formatDuration = (duration: string | null) => {
        if (!duration) return '—';
        const parts = duration.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        return `${hours}h ${minutes}m`;
    };

    const formatTime = (time: string | null) => {
        if (!time) return '—';
        try {
            return format(new Date(time), 'h:mm a');
        } catch {
            return time;
        }
    };

    const setQuickRange = (range: 'today' | 'week' | 'month' | 'last30') => {
        const today = new Date();
        switch (range) {
            case 'today':
                setDateRange({
                    from: format(today, 'yyyy-MM-dd'),
                    to: format(today, 'yyyy-MM-dd'),
                });
                break;
            case 'week':
                setDateRange({
                    from: format(subDays(today, 7), 'yyyy-MM-dd'),
                    to: format(today, 'yyyy-MM-dd'),
                });
                break;
            case 'month':
                setDateRange({
                    from: format(startOfMonth(today), 'yyyy-MM-dd'),
                    to: format(endOfMonth(today), 'yyyy-MM-dd'),
                });
                break;
            case 'last30':
                setDateRange({
                    from: format(subDays(today, 30), 'yyyy-MM-dd'),
                    to: format(today, 'yyyy-MM-dd'),
                });
                break;
        }
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Attendance History"
                description="View your attendance and work hours"
            >
                <Button variant="outline" onClick={fetchAttendance} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-700">{stats.totalDays}</p>
                            <p className="text-sm text-green-600">Total Days</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Timer className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-700">{stats.totalHours}h</p>
                            <p className="text-sm text-blue-600">Total Hours</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-700">{stats.averageHours}h</p>
                            <p className="text-sm text-purple-600">Avg Hours/Day</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-700">{stats.daysThisMonth}</p>
                            <p className="text-sm text-orange-600">Days This Month</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="space-y-2">
                            <Label className="text-sm">Quick Range</Label>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setQuickRange('today')}>Today</Button>
                                <Button variant="outline" size="sm" onClick={() => setQuickRange('week')}>This Week</Button>
                                <Button variant="outline" size="sm" onClick={() => setQuickRange('month')}>This Month</Button>
                                <Button variant="outline" size="sm" onClick={() => setQuickRange('last30')}>Last 30 Days</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from" className="text-sm">From</Label>
                            <Input
                                id="from"
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                className="w-[180px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="to" className="text-sm">To</Label>
                            <Input
                                id="to"
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                className="w-[180px]"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        Attendance Records
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No attendance records found</p>
                            <p className="text-sm">Your attendance history will appear here</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Day</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Total Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(record.date), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {format(new Date(record.date), 'EEEE')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                {formatTime(record.login_time)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {record.logout_time ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                    {formatTime(record.logout_time)}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                                    Active
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-gray-900">
                                                {formatDuration(record.total_duration)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {record.logout_time ? (
                                                <Badge className="bg-green-100 text-green-700">Completed</Badge>
                                            ) : (
                                                <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <span className="text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
