"use client";

import { useState, useEffect, useCallback } from "react";
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
    DollarSign,
    Search,
    MoreHorizontal,
    Eye,
    CheckCircle,
    Download,
    RefreshCw,
    TrendingUp,
    Clock,
    CreditCard,
    Receipt,
} from "lucide-react";
import {
    getPayments,
    getPaymentStats,
    getRevenueByBarangay,
} from "@/lib/actions/payment";
import { ViewPaymentModal } from "@/components/staff/ViewPaymentModal";
import { format } from "date-fns";

interface Payment {
    id: string;
    amount: number;
    status: string;
    payment_method: string | null;
    payment_date: string | null;
    reference_number: string | null;
    notes: string | null;
    created_at: string;
    request: {
        id: string;
        request_number: string;
        barangay: string;
        client: {
            id: string;
            full_name: string;
        } | null;
    } | null;
    verified_by: {
        id: string;
        full_name: string;
    } | null;
}

interface Stats {
    totalRevenue: number;
    revenueToday: number;
    revenueWeek: number;
    revenueMonth: number;
    pendingVerification: number;
    verified: number;
    averageTransaction: number;
    totalTransactions: number;
}

interface BarangayRevenue {
    barangay: string;
    revenue: number;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [revenueByBarangay, setRevenueByBarangay] = useState<BarangayRevenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
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
            const [paymentsResult, statsResult, revenueResult] = await Promise.all([
                getPayments({
                    search: searchQuery || undefined,
                    status: statusFilter === 'all' ? undefined : statusFilter as "pending" | "verified" | "completed",
                    page: pagination.page,
                    limit: pagination.limit,
                }),
                getPaymentStats(),
                getRevenueByBarangay(),
            ]);

            if (paymentsResult.success && paymentsResult.data) {
                setPayments(paymentsResult.data.payments || []);
                setPagination((prev) => ({
                    ...prev,
                    total: paymentsResult.data?.total || 0,
                    totalPages: paymentsResult.data?.totalPages || 0,
                }));
            }

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }

            if (revenueResult.success && revenueResult.data) {
                setRevenueByBarangay(revenueResult.data);
            }
        } catch (_error) {
            toast.error("Failed to load payments");
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-amber-100 text-amber-700",
            verified: "bg-green-100 text-green-700",
            failed: "bg-red-100 text-red-700",
            refunded: "bg-blue-100 text-blue-700",
        };
        return styles[status] || styles.pending;
    };

    const getPaymentMethodLabel = (method: string | null) => {
        if (!method) return "Not specified";
        const labels: Record<string, string> = {
            cash: "Cash",
            gcash: "GCash",
            bank_transfer: "Bank Transfer",
            credit_card: "Credit Card",
        };
        return labels[method] || method;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Payment Management"
                description="Track and verify payments for collection services."
            >
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Total Revenue</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {formatCurrency(stats?.totalRevenue || 0)}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Today</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {formatCurrency(stats?.revenueToday || 0)}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Verified Today</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.verified || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Receipt className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Awaiting Verification</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.pendingVerification || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters */}
                    <EcoCard>
                        <EcoCardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <Input
                                        placeholder="Search by reference number or client..."
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
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </EcoCardContent>
                    </EcoCard>

                    {/* Payments Table */}
                    <EcoCard>
                        <EcoCardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-20">
                                    <CreditCard className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                        No payments found
                                    </h3>
                                    <p className="text-neutral-500">
                                        Payments will appear here once created
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="font-medium text-neutral-900">
                                                            {payment.reference_number || "N/A"}
                                                        </p>
                                                        <p className="text-neutral-500">
                                                            {payment.request?.request_number || "No request"}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="text-neutral-900 font-medium">
                                                            {payment.request?.client?.full_name || "Unknown"}
                                                        </p>
                                                        <p className="text-neutral-500">
                                                            {payment.request?.barangay || ""}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold text-neutral-900">
                                                        {formatCurrency(payment.amount)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-neutral-600">
                                                        {getPaymentMethodLabel(payment.payment_method)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-neutral-600 text-sm">
                                                        {payment.payment_date
                                                            ? format(
                                                                new Date(payment.payment_date),
                                                                "MMM dd, yyyy"
                                                            )
                                                            : "Not paid"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadge(payment.status)}>
                                                        {payment.status.charAt(0).toUpperCase() +
                                                            payment.status.slice(1)}
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
                                                                    setSelectedPayment(payment);
                                                                    setShowViewModal(true);
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
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
                </div>

                {/* Sidebar: Revenue by Barangay */}
                <div className="space-y-6">
                    <EcoCard>
                        <EcoCardContent className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-primary-600" />
                                <h3 className="font-semibold text-neutral-900">
                                    Revenue by Barangay
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {revenueByBarangay.slice(0, 8).map((item) => (
                                    <div
                                        key={item.barangay}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">
                                                {item.barangay}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                Revenue
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold text-primary-600">
                                            {formatCurrency(item.revenue)}
                                        </span>
                                    </div>
                                ))}
                                {revenueByBarangay.length === 0 && (
                                    <p className="text-sm text-neutral-500 text-center py-4">
                                        No revenue data available
                                    </p>
                                )}
                            </div>
                        </EcoCardContent>
                    </EcoCard>
                </div>
            </div>

            {/* View Payment Modal */}
            {selectedPayment && (
                <ViewPaymentModal
                    open={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedPayment(null);
                    }}
                    paymentId={selectedPayment.id}
                    onUpdate={loadData}
                />
            )}
        </div>
    );
}
