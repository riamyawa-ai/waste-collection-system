"use client";

import { useState, useCallback } from "react";
import { PageHeader, EcoCard, EcoCardContent } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
    RefreshCw,
} from "lucide-react";
import {
    getSchedules,
    getScheduleStats,
    deleteSchedule,
    duplicateSchedule,
    updateSchedule,
} from "@/lib/actions/schedule";
import { CreateScheduleModal } from "@/components/staff/CreateScheduleModal";
import { ViewScheduleModal } from "@/components/staff/ViewScheduleModal";
import { format } from "date-fns";
import { useEffect } from "react";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [schedulesResult, statsResult] = await Promise.all([
                getSchedules({
                    search: searchQuery || undefined,
                    status: statusFilter as "draft" | "active" | "completed" | "cancelled" | "all",
                    page: pagination.page,
                    limit: pagination.limit,
                }),
                getScheduleStats(),
            ]);

            if (schedulesResult.success && schedulesResult.data) {
                setSchedules(schedulesResult.data.schedules || []);
                setPagination((prev) => ({
                    ...prev,
                    total: schedulesResult.data?.total || 0,
                    totalPages: schedulesResult.data?.totalPages || 0,
                }));
            }

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }
        } catch (_error) {
            toast.error("Failed to load schedules");
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, pagination.page, pagination.limit]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = useCallback(() => {
        loadData();
    }, [loadData]);

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadData();
    };

    const handleDuplicate = async (scheduleId: string) => {
        const result = await duplicateSchedule(scheduleId);
        if (result.success) {
            toast.success("Schedule duplicated successfully");
            loadData();
        } else {
            toast.error(result.error || "Failed to duplicate schedule");
        }
    };

    const handleDelete = async (scheduleId: string) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;

        const result = await deleteSchedule(scheduleId);
        if (result.success) {
            toast.success("Schedule deleted successfully");
            loadData();
        } else {
            toast.error(result.error || "Failed to delete schedule");
        }
    };

    const handleStatusChange = async (scheduleId: string, newStatus: string) => {
        const result = await updateSchedule({
            id: scheduleId,
            status: newStatus as "draft" | "active" | "completed" | "cancelled",
        });
        if (result.success) {
            toast.success("Schedule status updated");
            loadData();
        } else {
            toast.error(result.error || "Failed to update status");
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-neutral-100 text-neutral-700",
            active: "bg-green-100 text-green-700",
            completed: "bg-blue-100 text-blue-700",
            cancelled: "bg-red-100 text-red-700",
        };
        return styles[status] || styles.draft;
    };

    const getScheduleTypeBadge = (type: string) => {
        const labels: Record<string, string> = {
            "one-time": "One-time",
            weekly: "Weekly",
            "bi-weekly": "Bi-weekly",
            monthly: "Monthly",
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Schedule Management"
                description="Create and manage collection schedules and routes."
            >
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Schedule
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Active Schedules</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.totalActive || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">This Week</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.schedulesThisWeek || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <MapPin className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Areas Covered</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.areasCovered || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Users className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Collectors Assigned</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.collectorsAssigned || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>
            </div>

            {/* Filters */}
            <EcoCard>
                <EcoCardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Search schedules..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </EcoCardContent>
            </EcoCard>

            {/* Schedules Table */}
            <EcoCard>
                <EcoCardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="text-center py-20">
                            <Route className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                No schedules found
                            </h3>
                            <p className="text-neutral-500 mb-4">
                                Create your first schedule to get started
                            </p>
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Schedule
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Schedule Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Collector</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map((schedule) => (
                                    <TableRow key={schedule.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-neutral-900">
                                                    {schedule.name}
                                                </p>
                                                {schedule.description && (
                                                    <p className="text-sm text-neutral-500 truncate max-w-xs">
                                                        {schedule.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {getScheduleTypeBadge(schedule.schedule_type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p className="text-neutral-900">
                                                    {format(new Date(schedule.start_date), "MMM dd, yyyy")}
                                                </p>
                                                <p className="text-neutral-500">
                                                    {schedule.start_time} - {schedule.end_time}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {schedule.collector ? (
                                                <div className="text-sm">
                                                    <p className="text-neutral-900">
                                                        {schedule.collector.full_name}
                                                    </p>
                                                    <p className="text-neutral-500">
                                                        {schedule.collector.phone}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-neutral-400 text-sm">
                                                    Not assigned
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusBadge(schedule.status)}>
                                                {schedule.status.charAt(0).toUpperCase() +
                                                    schedule.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedSchedule(schedule);
                                                            setShowViewModal(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDuplicate(schedule.id)}
                                                    >
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {schedule.status === "draft" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleStatusChange(schedule.id, "active")
                                                            }
                                                            className="text-green-600"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Activate
                                                        </DropdownMenuItem>
                                                    )}
                                                    {schedule.status === "active" && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleStatusChange(schedule.id, "completed")
                                                                }
                                                                className="text-blue-600"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Mark Completed
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleStatusChange(schedule.id, "cancelled")
                                                                }
                                                                className="text-amber-600"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(schedule.id)}
                                                        className="text-red-600"
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
                </EcoCardContent>
            </EcoCard>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() =>
                            setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                        }
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-neutral-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() =>
                            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                        }
                    >
                        Next
                    </Button>
                </div>
            )}

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
