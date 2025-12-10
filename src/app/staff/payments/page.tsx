'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    CheckCircle,
    Download,
    RefreshCw,
    TrendingUp,
    Clock,
    CreditCard,
    Calendar,
    FileText,
    Receipt
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
import {
    getPayments,
    getPaymentStats,
    verifyPayment,
    completePayment,
    getRevenueByBarangay
} from '@/lib/actions/payment';
import { ViewPaymentModal } from '@/components/staff/ViewPaymentModal';
import { format } from 'date-fns';

interface Payment {
    id: string;
    payment_number: string;
    amount: number;
    reference_number: string | null;
    date_received: string | null;
    receipt_url: string | null;
    status: string;
    staff_notes: string | null;
    created_at: string;
    client: { id: string; full_name: string; email: string; phone: string } | null;
    request: { id: string; request_number: string; barangay: string; preferred_date: string } | null;
    verifier: { id: string; full_name: string } | null;
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
    const [barangayRevenue, setBarangayRevenue] = useState<BarangayRevenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
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
            const [paymentsResult, statsResult, revenueResult] = await Promise.all([
                getPayments({
                    search: searchQuery || undefined,
                    status: statusFilter as 'pending' | 'verified' | 'completed' | 'all',
                    page: pagination.page,
                    limit: pagination.limit,
                }),
                getPaymentStats(),
                getRevenueByBarangay(),
            ]);

            if (paymentsResult.success && paymentsResult.data) {
                setPayments(paymentsResult.data.payments || []);
                setPagination(prev => ({
                    ...prev,
                    total: paymentsResult.data?.total || 0,
                    totalPages: paymentsResult.data?.totalPages || 0,
                }));
            }

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }

            if (revenueResult.success && revenueResult.data) {
                setBarangayRevenue(revenueResult.data);
            }
        } catch (error) {
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        loadData();
    };

    const handleVerify = async (paymentId: string) => {
        const result = await verifyPayment(paymentId);
        if (result.success) {
            toast.success('Payment verified successfully');
            loadData();
        } else {
            toast.error(result.error || 'Failed to verify payment');
        }
    };

    const handleComplete = async (paymentId: string) => {
        const result = await completePayment(paymentId);
        if (result.success) {
            toast.success('Payment marked as completed');
            loadData();
        } else {
            toast.error(result.error || 'Failed to complete payment');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            verified: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        };
        return styles[status] || styles.pending;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Payment Management</h1>
                        <p className="text-slate-400 mt-1">Track and manage all payments</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={loadData}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/30 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-emerald-300 text-sm">Total Revenue</p>
                                        <p className="text-2xl font-bold text-white">
                                            {formatCurrency(stats?.totalRevenue || 0)}
                                        </p>
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
                                    <div className="p-2 bg-amber-500/20 rounded-lg">
                                        <Clock className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Pending Verification</p>
                                        <p className="text-2xl font-bold text-white">{stats?.pendingVerification || 0}</p>
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
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Verified</p>
                                        <p className="text-2xl font-bold text-white">{stats?.verified || 0}</p>
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
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Avg. Transaction</p>
                                        <p className="text-2xl font-bold text-white">
                                            {formatCurrency(stats?.averageTransaction || 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Revenue Period Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-slate-400 text-sm mb-1">Today</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(stats?.revenueToday || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-slate-400 text-sm mb-1">This Week</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(stats?.revenueWeek || 0)}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-slate-400 text-sm mb-1">This Month</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(stats?.revenueMonth || 0)}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Payments Table */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Filters */}
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search by payment ID or reference..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-40 bg-slate-700/50 border-slate-600 text-white">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="verified">Verified</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={dateFilter} onValueChange={setDateFilter}>
                                        <SelectTrigger className="w-full sm:w-40 bg-slate-700/50 border-slate-600 text-white">
                                            <SelectValue placeholder="Date Range" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="month">This Month</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payments Table */}
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
                                    </div>
                                ) : payments.length === 0 ? (
                                    <div className="text-center py-20">
                                        <CreditCard className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-white mb-2">No payments found</h3>
                                        <p className="text-slate-400">Payments will appear here when recorded</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-700 hover:bg-transparent">
                                                <TableHead className="text-slate-400">Payment ID</TableHead>
                                                <TableHead className="text-slate-400">Client</TableHead>
                                                <TableHead className="text-slate-400">Request</TableHead>
                                                <TableHead className="text-slate-400">Amount</TableHead>
                                                <TableHead className="text-slate-400">Date</TableHead>
                                                <TableHead className="text-slate-400">Status</TableHead>
                                                <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment) => (
                                                <TableRow
                                                    key={payment.id}
                                                    className="border-slate-700 hover:bg-slate-700/30"
                                                >
                                                    <TableCell>
                                                        <p className="font-mono text-white text-sm">{payment.payment_number}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-white">{payment.client?.full_name || 'Unknown'}</p>
                                                            <p className="text-slate-400 text-sm">{payment.client?.phone}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-white font-mono text-sm">
                                                            {payment.request?.request_number || 'N/A'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-emerald-400 font-bold">
                                                            {formatCurrency(payment.amount)}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-white text-sm">
                                                            {payment.date_received
                                                                ? format(new Date(payment.date_received), 'MMM dd, yyyy')
                                                                : 'Not recorded'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadge(payment.status)}>
                                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
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
                                                                        setSelectedPayment(payment);
                                                                        setShowViewModal(true);
                                                                    }}
                                                                    className="text-slate-300 hover:bg-slate-700"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                {payment.receipt_url && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => window.open(payment.receipt_url!, '_blank')}
                                                                        className="text-slate-300 hover:bg-slate-700"
                                                                    >
                                                                        <Receipt className="h-4 w-4 mr-2" />
                                                                        View Receipt
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator className="bg-slate-700" />
                                                                {payment.status === 'pending' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleVerify(payment.id)}
                                                                        className="text-blue-400 hover:bg-slate-700"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Verify Payment
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {payment.status === 'verified' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleComplete(payment.id)}
                                                                        className="text-emerald-400 hover:bg-slate-700"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Mark Completed
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Download Receipt
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

                    {/* Revenue by Barangay Sidebar */}
                    <div>
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-400" />
                                    Revenue by Area
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {barangayRevenue.length === 0 ? (
                                    <p className="text-slate-400 text-sm text-center py-4">No data available</p>
                                ) : (
                                    <div className="space-y-3">
                                        {barangayRevenue.slice(0, 8).map((item, index) => {
                                            const maxRevenue = barangayRevenue[0]?.revenue || 1;
                                            const percentage = (item.revenue / maxRevenue) * 100;
                                            return (
                                                <div key={item.barangay} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-300 truncate pr-2">{item.barangay}</span>
                                                        <span className="text-emerald-400 font-medium">
                                                            {formatCurrency(item.revenue)}
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* View Modal */}
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
