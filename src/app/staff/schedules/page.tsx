'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Plus,
    Search,
    MapPin,
    Clock,
    Users,
    MoreHorizontal,
    Eye,
    Copy,
    Trash2,
    CheckCircle,
    XCircle,
    Route,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getSchedules, getScheduleStats, deleteSchedule, duplicateSchedule, updateSchedule } from '@/lib/actions/schedule';
import { CreateScheduleModal } from '@/components/staff/CreateScheduleModal';
import { ViewScheduleModal } from '@/components/staff/ViewScheduleModal';
import { format } from 'date-fns';

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
    created_at: string;
    collector: { id: string; full_name: string; phone: string } | null;
    backup_collector: { id: string; full_name: string } | null;
    creator: { id: string; full_name: string } | null;
}

interface Stats {
    totalActive: number;
    totalSchedules: number;
    schedulesThisWeek: number;
    areasCovered: number;
    collectorsAssigned: number;
}

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        loadData();
    }, [statusFilter, pagination.page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [schedulesResult, statsResult] = await Promise.all([
                getSchedules({
                    search: searchQuery || undefined,
                    status: statusFilter as 'draft' | 'active' | 'completed' | 'cancelled' | 'all',
                    page: pagination.page,
                    limit: pagination.limit,
                }),
                getScheduleStats(),
            ]);

            if (schedulesResult.success && schedulesResult.data) {
                setSchedules(schedulesResult.data.schedules || []);
                setPagination(prev => ({
                    ...prev,
                    total: schedulesResult.data?.total || 0,
                    totalPages: schedulesResult.data?.totalPages || 0,
                }));
            }

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }
        } catch (error) {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        loadData();
    };

    const handleDuplicate = async (scheduleId: string) => {
        const result = await duplicateSchedule(scheduleId);
        if (result.success) {
            toast.success('Schedule duplicated successfully');
            loadData();
        } else {
            toast.error(result.error || 'Failed to duplicate schedule');
        }
    };

    const handleDelete = async (scheduleId: string) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;

        const result = await deleteSchedule(scheduleId);
        if (result.success) {
            toast.success('Schedule deleted successfully');
            loadData();
        } else {
            toast.error(result.error || 'Failed to delete schedule');
        }
    };

    const handleStatusChange = async (scheduleId: string, newStatus: string) => {
        const result = await updateSchedule({ id: scheduleId, status: newStatus as 'draft' | 'active' | 'completed' | 'cancelled' });
        if (result.success) {
            toast.success('Schedule status updated');
            loadData();
        } else {
            toast.error(result.error || 'Failed to update status');
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

    const getScheduleTypeBadge = (type: string) => {
        const labels: Record<string, string> = {
            'one-time': 'One-time',
            'weekly': 'Weekly',
            'bi-weekly': 'Bi-weekly',
            'monthly': 'Monthly',
        };
        return labels[type] || type;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Schedule Management</h1>
                        <p className="text-slate-400 mt-1">Create and manage collection schedules</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Schedule
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                        <Calendar className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Active Schedules</p>
                                        <p className="text-2xl font-bold text-white">{stats?.totalActive || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Clock className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">This Week</p>
                                        <p className="text-2xl font-bold text-white">{stats?.schedulesThisWeek || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <MapPin className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Areas Covered</p>
                                        <p className="text-2xl font-bold text-white">{stats?.areasCovered || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/20 rounded-lg">
                                        <Users className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Collectors Assigned</p>
                                        <p className="text-2xl font-bold text-white">{stats?.collectorsAssigned || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Filters */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search schedules..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-48 bg-slate-700/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={loadData}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedules Table */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="text-center py-20">
                                <Route className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No schedules found</h3>
                                <p className="text-slate-400 mb-4">Create your first schedule to get started</p>
                                <Button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Schedule
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-700 hover:bg-transparent">
                                        <TableHead className="text-slate-400">Schedule Name</TableHead>
                                        <TableHead className="text-slate-400">Type</TableHead>
                                        <TableHead className="text-slate-400">Date & Time</TableHead>
                                        <TableHead className="text-slate-400">Collector</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.map((schedule) => (
                                        <TableRow
                                            key={schedule.id}
                                            className="border-slate-700 hover:bg-slate-700/30"
                                        >
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-white">{schedule.name}</p>
                                                    {schedule.description && (
                                                        <p className="text-sm text-slate-400 truncate max-w-xs">
                                                            {schedule.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-slate-600 text-slate-300">
                                                    {getScheduleTypeBadge(schedule.schedule_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="text-white">
                                                        {format(new Date(schedule.start_date), 'MMM dd, yyyy')}
                                                    </p>
                                                    <p className="text-slate-400">
                                                        {schedule.start_time} - {schedule.end_time}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {schedule.collector ? (
                                                    <div className="text-sm">
                                                        <p className="text-white">{schedule.collector.full_name}</p>
                                                        <p className="text-slate-400">{schedule.collector.phone}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 text-sm">Not assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadge(schedule.status)}>
                                                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedSchedule(schedule);
                                                                setShowViewModal(true);
                                                            }}
                                                            className="text-slate-300 hover:bg-slate-700"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDuplicate(schedule.id)}
                                                            className="text-slate-300 hover:bg-slate-700"
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-700" />
                                                        {schedule.status === 'draft' && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusChange(schedule.id, 'active')}
                                                                className="text-emerald-400 hover:bg-slate-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Activate
                                                            </DropdownMenuItem>
                                                        )}
                                                        {schedule.status === 'active' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusChange(schedule.id, 'completed')}
                                                                    className="text-blue-400 hover:bg-slate-700"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Mark Completed
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                                                                    className="text-amber-400 hover:bg-slate-700"
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    Cancel
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-slate-700" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(schedule.id)}
                                                            className="text-red-400 hover:bg-slate-700"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="border-slate-600 text-slate-300"
                        >
                            Previous
                        </Button>
                        <span className="flex items-center px-4 text-slate-400">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="border-slate-600 text-slate-300"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Schedule Modal */}
            <CreateScheduleModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    loadData();
                }}
            />

            {/* View Schedule Modal */}
            {selectedSchedule && (
                <ViewScheduleModal
                    open={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedSchedule(null);
                    }}
                    scheduleId={selectedSchedule.id}
                />
            )}
        </div>
    );
}
