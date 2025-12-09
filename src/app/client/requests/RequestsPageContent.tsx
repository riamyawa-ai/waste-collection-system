'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, SlidersHorizontal, RefreshCw, X } from 'lucide-react';

import { DashboardLayout } from '@/components/layouts';
import { PageHeader } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    RequestSummaryCards,
    RequestSummaryCardsSkeleton,
    RequestPickupModal,
    RequestsTable,
    CancelRequestModal,
} from '@/components/client';
import { getClientRequests } from '@/lib/actions/requests';
import { PANABO_BARANGAYS } from '@/constants/barangays';
import { PRIORITY_LEVELS } from '@/constants/status';
import type { RequestStatus, PriorityLevel } from '@/constants/status';

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

interface RequestCounts {
    pending: number;
    accepted: number;
    in_progress: number;
    completed: number;
    rejected: number;
}

export function RequestsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Modal states
    const [showNewRequest, setShowNewRequest] = useState(
        searchParams.get('new') === 'true'
    );
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelingRequest, setCancelingRequest] = useState<{
        id: string;
        number: string;
    } | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Data states
    const [requests, setRequests] = useState<RequestRow[]>([]);
    const [counts, setCounts] = useState<RequestCounts>({
        pending: 0,
        accepted: 0,
        in_progress: 0,
        completed: 0,
        rejected: 0,
    });
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(
        searchParams.get('status') || undefined
    );
    const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
    const [barangayFilter, setBarangayFilter] = useState<string | undefined>();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch requests
    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getClientRequests({
                page,
                limit: 10,
                status: statusFilter,
                priority: priorityFilter,
                barangay: barangayFilter,
                search: debouncedSearch || undefined,
                sortBy: 'created_at',
                sortOrder: 'desc',
            });

            if (result.success && result.data) {
                setRequests(result.data.requests as RequestRow[]);
                setTotal(result.data.total);
                setTotalPages(result.data.totalPages);

                // Calculate counts
                const allRequests = await getClientRequests({ limit: 1000 });
                if (allRequests.success && allRequests.data) {
                    const req = allRequests.data.requests as RequestRow[];
                    setCounts({
                        pending: req.filter((r) => r.status === 'pending').length,
                        accepted: req.filter((r) =>
                            ['accepted', 'payment_confirmed', 'assigned'].includes(r.status)
                        ).length,
                        in_progress: req.filter((r) =>
                            ['accepted_by_collector', 'en_route', 'at_location', 'in_progress'].includes(r.status)
                        ).length,
                        completed: req.filter((r) => r.status === 'completed').length,
                        rejected: req.filter((r) =>
                            ['rejected', 'cancelled'].includes(r.status)
                        ).length,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, statusFilter, priorityFilter, barangayFilter, debouncedSearch]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Handle new request from URL param
    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setShowNewRequest(true);
            // Remove the query param
            router.replace('/client/requests');
        }
    }, [searchParams, router]);

    const handleNewRequestSuccess = () => {
        setShowNewRequest(false);
        fetchRequests();
    };

    const handleViewRequest = (id: string) => {
        router.push(`/client/requests/${id}`);
    };

    const handleEditRequest = (id: string) => {
        router.push(`/client/requests/${id}/edit`);
    };

    const handleCancelRequest = (id: string) => {
        const request = requests.find((r) => r.id === id);
        if (request) {
            setCancelingRequest({ id, number: request.request_number });
            setShowCancelModal(true);
        }
    };

    const handleCancelSuccess = () => {
        setShowCancelModal(false);
        setCancelingRequest(null);
        fetchRequests();
    };

    const handleStatusFilterChange = (filter: string | undefined) => {
        setStatusFilter(filter);
        setPage(1);
    };

    const clearFilters = () => {
        setStatusFilter(undefined);
        setPriorityFilter(undefined);
        setBarangayFilter(undefined);
        setSearchQuery('');
        setPage(1);
    };

    const hasActiveFilters =
        statusFilter || priorityFilter || barangayFilter || searchQuery;

    return (
        <DashboardLayout role="client">
            <PageHeader
                title="My Requests"
                description="View and manage your waste collection requests"
                action={
                    <Button onClick={() => setShowNewRequest(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Request Pickup
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="mt-6">
                {isLoading ? (
                    <RequestSummaryCardsSkeleton />
                ) : (
                    <RequestSummaryCards
                        counts={counts}
                        selectedFilter={statusFilter}
                        onFilterChange={handleStatusFilterChange}
                    />
                )}
            </div>

            {/* Filters Bar */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        type="text"
                        placeholder="Search by request ID or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filter Toggle */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? 'bg-primary-50 border-primary-300' : ''}
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                                !
                            </span>
                        )}
                    </Button>

                    <Button variant="outline" onClick={fetchRequests}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-neutral-900">Filter Options</h4>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Priority Filter */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-700">
                                Priority
                            </label>
                            <select
                                value={priorityFilter || ''}
                                onChange={(e) =>
                                    setPriorityFilter(e.target.value || undefined)
                                }
                                className="w-full h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Priorities</option>
                                <option value={PRIORITY_LEVELS.LOW}>Low</option>
                                <option value={PRIORITY_LEVELS.MEDIUM}>Medium</option>
                                <option value={PRIORITY_LEVELS.URGENT}>Urgent</option>
                            </select>
                        </div>

                        {/* Barangay Filter */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-700">
                                Barangay
                            </label>
                            <select
                                value={barangayFilter || ''}
                                onChange={(e) =>
                                    setBarangayFilter(e.target.value || undefined)
                                }
                                className="w-full h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Barangays</option>
                                {PANABO_BARANGAYS.map((brgy) => (
                                    <option key={brgy} value={brgy}>
                                        {brgy}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range - placeholder */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-700">
                                Date Range
                            </label>
                            <select
                                className="w-full h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                disabled
                            >
                                <option value="">All Time</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Requests Table */}
            <div className="mt-6">
                <RequestsTable
                    requests={requests}
                    total={total}
                    page={page}
                    limit={10}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onView={handleViewRequest}
                    onEdit={handleEditRequest}
                    onCancel={handleCancelRequest}
                    isLoading={isLoading}
                />
            </div>

            {/* New Request Modal */}
            <RequestPickupModal
                isOpen={showNewRequest}
                onClose={() => setShowNewRequest(false)}
                onSuccess={handleNewRequestSuccess}
            />

            {/* Cancel Request Modal */}
            {cancelingRequest && (
                <CancelRequestModal
                    isOpen={showCancelModal}
                    requestId={cancelingRequest.id}
                    requestNumber={cancelingRequest.number}
                    onClose={() => {
                        setShowCancelModal(false);
                        setCancelingRequest(null);
                    }}
                    onSuccess={handleCancelSuccess}
                />
            )}
        </DashboardLayout>
    );
}
