'use client';

import { format } from 'date-fns';
import {
    Eye,
    Edit,
    XCircle,
    MapPin,
    FileDown,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RequestStatus } from '@/constants/status';
import type { PriorityLevel } from '@/constants/status';

interface RequestRow {
    id: string;
    request_number: string;
    created_at: string;
    barangay: string;
    priority: PriorityLevel;
    status: RequestStatus;
    scheduled_date: string | null;
    assigned_collector: {
        id: string;
        full_name: string;
    } | null;
}

interface RequestsTableProps {
    requests: RequestRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onView: (id: string) => void;
    onEdit?: (id: string) => void;
    onCancel?: (id: string) => void;
    onTrack?: (id: string) => void;
    isLoading?: boolean;
}

export function RequestsTable({
    requests,
    total,
    page,
    limit,
    totalPages,
    onPageChange,
    onView,
    onEdit,
    onCancel,
    onTrack,
    isLoading = false,
}: RequestsTableProps) {
    const canEdit = (status: RequestStatus) => status === 'pending';
    const canCancel = (status: RequestStatus) =>
        ['pending', 'accepted'].includes(status);
    const canTrack = (status: RequestStatus) =>
        ['assigned', 'accepted_by_collector', 'en_route', 'at_location', 'in_progress'].includes(status);
    const canDownload = (status: RequestStatus) => status === 'completed';

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200">
                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                Request ID
                            </th>
                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                Date Requested
                            </th>
                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                Barangay
                            </th>
                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                Priority
                            </th>
                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                Status
                            </th>
                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                Scheduled
                            </th>
                            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                Collector
                            </th>
                            <th className="text-right text-xs font-semibold text-neutral-600 uppercase tracking-wide px-4 py-3">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {isLoading ? (
                            // Loading skeleton
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-3">
                                        <div className="h-4 w-24 bg-neutral-200 rounded" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="h-4 w-20 bg-neutral-200 rounded" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="h-4 w-24 bg-neutral-200 rounded" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="h-6 w-16 bg-neutral-200 rounded-full" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="h-6 w-20 bg-neutral-200 rounded-full" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="h-4 w-20 bg-neutral-200 rounded" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="h-4 w-28 bg-neutral-200 rounded" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="h-8 w-8 bg-neutral-200 rounded ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : requests.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-neutral-500">
                                    No requests found
                                </td>
                            </tr>
                        ) : (
                            requests.map((request) => (
                                <tr
                                    key={request.id}
                                    className="hover:bg-neutral-50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onView(request.id)}
                                            className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                        >
                                            {request.request_number}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-neutral-600">
                                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                                            <MapPin className="w-4 h-4 text-neutral-400" />
                                            {request.barangay}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <PriorityBadge priority={request.priority} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={request.status} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-neutral-600">
                                        {request.scheduled_date
                                            ? format(new Date(request.scheduled_date), 'MMM d, yyyy')
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-neutral-600">
                                        {request.assigned_collector?.full_name || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Primary action - View */}
                                            <button
                                                onClick={() => onView(request.id)}
                                                className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {/* More actions dropdown - Uses portal to escape overflow */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => onView(request.id)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>

                                                    {canEdit(request.status) && onEdit && (
                                                        <DropdownMenuItem onClick={() => onEdit(request.id)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Request
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canTrack(request.status) && onTrack && (
                                                        <DropdownMenuItem onClick={() => onTrack(request.id)}>
                                                            <MapPin className="w-4 h-4 mr-2" />
                                                            Track Collector
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canDownload(request.status) && (
                                                        <DropdownMenuItem onClick={() => {
                                                            // TODO: Download receipt
                                                        }}>
                                                            <FileDown className="w-4 h-4 mr-2" />
                                                            Download Receipt
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canCancel(request.status) && onCancel && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => onCancel(request.id)}
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2" />
                                                                Cancel Request
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50">
                    <div className="text-sm text-neutral-500">
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
                        {total} requests
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-neutral-600">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
