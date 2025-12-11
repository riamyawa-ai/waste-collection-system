"use client";

import { useState, useEffect, useCallback } from "react";
import {
    CreditCard,
    Clock,
    CheckCircle2,
    Receipt,
    Download,
    Printer,
    Filter,
    Search,
    Eye,
    FileText,
    TrendingUp,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getClientPayments, getClientPaymentStats } from "@/lib/actions/client";

type PaymentStatus = "pending" | "verified" | "completed";

interface Payment {
    id: string;
    payment_number: string;
    amount: number;
    status: PaymentStatus;
    reference_number: string | null;
    created_at: string;
    verified_at: string | null;
    verified_by: string | null;
    staff_notes: string | null;
    request: {
        id: string;
        request_number: string;
        barangay: string;
        address: string;
        priority: string;
        preferred_date: string;
        assigned_collector: { full_name: string } | null;
    } | null;
}

interface PaymentStats {
    totalPayments: number;
    totalAmount: number;
    completedPayments: number;
    completedAmount: number;
    pendingPayments: number;
    pendingAmount: number;
    thisMonthAmount: number;
}

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
    pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    verified: {
        label: "Verified",
        className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    completed: {
        label: "Completed",
        className: "bg-green-100 text-green-700 border-green-200",
    },
};

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [paymentsResult, statsResult] = await Promise.all([
                getClientPayments({ status: statusFilter, search: searchQuery }),
                getClientPaymentStats(),
            ]);

            if (paymentsResult.success && paymentsResult.data) {
                setPayments(paymentsResult.data as Payment[]);
            }
            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchData]);

    const handlePrintReceipt = (payment: Payment) => {
        window.print();
    };

    const handleDownloadReceipt = (payment: Payment) => {
        alert(`Download feature coming soon for ${payment.payment_number}`);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
                        Payment Monitoring
                    </h1>
                    <p className="text-neutral-500">
                        Track and manage your waste collection service payments.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchData}
                    disabled={isLoading}
                >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-neutral-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">
                            Total Payments
                        </CardTitle>
                        <div className="p-2 bg-primary-50 rounded-lg">
                            <CreditCard className="h-4 w-4 text-primary-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-neutral-900">
                            {stats?.totalPayments || 0}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            ₱{(stats?.totalAmount || 0).toLocaleString()} total
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">
                            Completed
                        </CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats?.completedPayments || 0}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            ₱{(stats?.completedAmount || 0).toLocaleString()} paid
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">
                            Pending
                        </CardTitle>
                        <div className="p-2 bg-yellow-50 rounded-lg">
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {stats?.pendingPayments || 0}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            ₱{(stats?.pendingAmount || 0).toLocaleString()} awaiting
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-600">
                            This Month
                        </CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ₱{(stats?.thisMonthAmount || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-neutral-200">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Search by Payment ID or Reference Number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card className="border-neutral-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary-600" />
                        Payment Records
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-neutral-500">
                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                            Loading payments...
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                            <p className="text-neutral-500">No payments found</p>
                            <p className="text-sm text-neutral-400 mt-1">
                                Payment records will appear here after your requests are processed.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Payment ID</TableHead>
                                        <TableHead>Request ID</TableHead>
                                        <TableHead className="hidden md:table-cell">Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden lg:table-cell">Reference</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id} className="hover:bg-neutral-50">
                                            <TableCell className="font-medium">
                                                {payment.payment_number}
                                            </TableCell>
                                            <TableCell className="text-primary-600">
                                                {payment.request?.request_number || '—'}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-neutral-600">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                ₱{payment.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        statusConfig[payment.status]?.className || ''
                                                    )}
                                                >
                                                    {statusConfig[payment.status]?.label || payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {payment.reference_number ? (
                                                    <span className="text-sm text-neutral-600">
                                                        {payment.reference_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-neutral-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedPayment(payment)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {payment.status === "completed" && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDownloadReceipt(payment)}
                                                                className="h-8 w-8 p-0 hidden sm:flex"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handlePrintReceipt(payment)}
                                                                className="h-8 w-8 p-0 hidden sm:flex"
                                                            >
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Details Modal */}
            <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-primary-600" />
                            Payment Details
                        </DialogTitle>
                        <DialogDescription>
                            Full payment information for {selectedPayment?.payment_number}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="space-y-6 py-4">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-500">Status</span>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-sm",
                                        statusConfig[selectedPayment.status]?.className
                                    )}
                                >
                                    {statusConfig[selectedPayment.status]?.label}
                                </Badge>
                            </div>

                            <Separator />

                            {/* Request Details */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-neutral-900">Request Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-neutral-500">Request ID</span>
                                        <p className="font-medium text-primary-600">
                                            {selectedPayment.request?.request_number || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Service Date</span>
                                        <p className="font-medium">
                                            {selectedPayment.request?.preferred_date
                                                ? new Date(selectedPayment.request.preferred_date).toLocaleDateString()
                                                : '—'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-neutral-500">Location</span>
                                        <p className="font-medium">
                                            {selectedPayment.request?.barangay || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Collector</span>
                                        <p className="font-medium">
                                            {selectedPayment.request?.assigned_collector?.full_name || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Priority</span>
                                        <Badge variant="outline" className="capitalize">
                                            {selectedPayment.request?.priority || '—'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Payment Breakdown */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-neutral-900">Payment Breakdown</h4>
                                <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total Amount</span>
                                        <span className="text-primary-600">
                                            ₱{selectedPayment.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Payment Information */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-neutral-900">Payment Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-neutral-500">Payment ID</span>
                                        <p className="font-medium">{selectedPayment.payment_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Payment Date</span>
                                        <p className="font-medium">
                                            {new Date(selectedPayment.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Reference Number</span>
                                        <p className="font-medium">{selectedPayment.reference_number || "—"}</p>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Verified By</span>
                                        <p className="font-medium">{selectedPayment.verified_by || "—"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedPayment.status === "completed" && (
                                <>
                                    <Separator />
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handlePrintReceipt(selectedPayment)}
                                        >
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print Receipt
                                        </Button>
                                        <Button
                                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                                            onClick={() => handleDownloadReceipt(selectedPayment)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download PDF
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
