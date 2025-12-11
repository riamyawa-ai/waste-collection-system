"use client";

import { useEffect, useState, useCallback } from "react";
import {
    getCollectionRequests,
    type CollectionFilters,
} from "@/lib/actions/staff";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    STATUS_LABELS,
    STATUS_COLORS,
    PRIORITY_LABELS,
    PRIORITY_COLORS,
} from "@/constants/status";
import {
    Search,
    RefreshCw,
    Eye,
    CheckCircle,
    XCircle,
    CreditCard,
    Users,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Phone,
} from "lucide-react";
import { format } from "date-fns";

interface CollectionRequest {
    id: string;
    request_number: string;
    status: string;
    priority: string;
    barangay: string;
    complete_address: string;
    preferred_date: string;
    preferred_time_slot: string;
    created_at: string;
    client: {
        id: string;
        full_name: string;
        email: string;
        phone: string;
    } | null;
    collector: {
        id: string;
        full_name: string;
        phone: string;
    } | null;
}

interface CollectionManagementTableProps {
    onView: (request: CollectionRequest) => void;
    onAccept: (request: CollectionRequest) => void;
    onReject: (request: CollectionRequest) => void;
    onRecordPayment: (request: CollectionRequest) => void;
    onAssignCollector: (request: CollectionRequest) => void;
    onComplete: (request: CollectionRequest) => void;
    onRefresh?: () => void;
}

export function CollectionManagementTable({
    onView,
    onAccept,
    onReject,
    onRecordPayment,
    onAssignCollector,
    onComplete,
    onRefresh,
}: CollectionManagementTableProps) {
    const [requests, setRequests] = useState<CollectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<CollectionFilters>({
        search: "",
        status: "all",
        priority: "all",
        page: 1,
        limit: 25,
    });
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        const result = await getCollectionRequests(filters);
        if (result.success && result.data) {
            setRequests(result.data.requests);
            setTotalPages(result.data.totalPages);
            setTotal(result.data.total);
        }
        setLoading(false);
    }, [filters]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetching data on filters change is a valid pattern
        void fetchRequests();
    }, [fetchRequests]);

    const getStatusBadgeClasses = (status: string) => {
        const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
        if (!colors) return "bg-neutral-100 text-neutral-700";
        return `${colors.bg} ${colors.text}`;
    };

    const getPriorityBadgeClasses = (priority: string) => {
        const colors = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS];
        if (!colors) return "bg-neutral-100 text-neutral-700";
        return `${colors.bg} ${colors.text}`;
    };

    const getAvailableActions = (status: string) => {
        const actions: string[] = ["view"];
        switch (status) {
            case "pending":
                actions.push("accept", "reject");
                break;
            case "accepted":
                actions.push("recordPayment");
                break;
            case "payment_confirmed":
            case "declined_by_collector":
                actions.push("assignCollector");
                break;
            case "in_progress":
            case "at_location":
                actions.push("complete");
                break;
        }
        return actions;
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-neutral-200">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search by request number..."
                            value={filters.search}
                            onChange={(e) =>
                                setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
                            }
                            className="pl-10"
                        />
                    </div>
                </div>
                <Select
                    value={filters.status}
                    onValueChange={(value) =>
                        setFilters((f) => ({ ...f, status: value, page: 1 }))
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending Review</SelectItem>
                        <SelectItem value="accepted">Awaiting Payment</SelectItem>
                        <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="accepted_by_collector">Accepted by Collector</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filters.priority}
                    onValueChange={(value) =>
                        setFilters((f) => ({
                            ...f,
                            priority: value as CollectionFilters["priority"],
                            page: 1,
                        }))
                    }
                >
                    <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        fetchRequests();
                        onRefresh?.();
                    }}
                >
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-neutral-50">
                            <TableHead>Request #</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Collector</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(8)].map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-neutral-100 animate-pulse rounded" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center py-8 text-neutral-500"
                                >
                                    No requests found
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => {
                                const actions = getAvailableActions(request.status);
                                return (
                                    <TableRow key={request.id} className="hover:bg-neutral-50">
                                        <TableCell>
                                            <span className="font-mono text-sm font-medium text-primary-700">
                                                {request.request_number}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-neutral-900 text-sm">
                                                    {request.client?.full_name || "Unknown"}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-neutral-500">
                                                    <Phone className="w-3 h-3" />
                                                    {request.client?.phone || "-"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[150px]">
                                                <p className="font-medium text-neutral-900 text-sm truncate">
                                                    {request.barangay}
                                                </p>
                                                <p className="text-xs text-neutral-500 truncate">
                                                    {request.complete_address}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getPriorityBadgeClasses(request.priority)}
                                                variant="outline"
                                            >
                                                {PRIORITY_LABELS[
                                                    request.priority as keyof typeof PRIORITY_LABELS
                                                ] || request.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm text-neutral-900">
                                                    {request.preferred_date
                                                        ? format(
                                                            new Date(request.preferred_date),
                                                            "MMM d, yyyy"
                                                        )
                                                        : "-"}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {request.preferred_time_slot}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getStatusBadgeClasses(request.status)}
                                                variant="outline"
                                            >
                                                {STATUS_LABELS[
                                                    request.status as keyof typeof STATUS_LABELS
                                                ] || request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {request.collector ? (
                                                <div>
                                                    <p className="font-medium text-neutral-900 text-sm">
                                                        {request.collector.full_name}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        {request.collector.phone}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-neutral-400">
                                                    Not assigned
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onView(request)}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {actions.includes("accept") && (
                                                            <DropdownMenuItem
                                                                onClick={() => onAccept(request)}
                                                                className="text-green-600"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Accept
                                                            </DropdownMenuItem>
                                                        )}
                                                        {actions.includes("reject") && (
                                                            <DropdownMenuItem
                                                                onClick={() => onReject(request)}
                                                                className="text-red-600"
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2" />
                                                                Reject
                                                            </DropdownMenuItem>
                                                        )}
                                                        {actions.includes("recordPayment") && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => onRecordPayment(request)}
                                                                >
                                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                                    Record Payment
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {actions.includes("assignCollector") && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => onAssignCollector(request)}
                                                                >
                                                                    <Users className="w-4 h-4 mr-2" />
                                                                    Assign Collector
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {actions.includes("complete") && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => onComplete(request)}
                                                                    className="text-green-600"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                                    Mark Complete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
                    <p className="text-sm text-neutral-500">
                        Showing {((filters.page || 1) - 1) * (filters.limit || 25) + 1} to{" "}
                        {Math.min((filters.page || 1) * (filters.limit || 25), total)} of{" "}
                        {total} requests
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))
                            }
                            disabled={(filters.page || 1) <= 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-neutral-600">
                            Page {filters.page || 1} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))
                            }
                            disabled={(filters.page || 1) >= totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
