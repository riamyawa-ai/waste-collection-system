'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    DollarSign,
    User,
    Calendar,
    MapPin,
    Phone,
    FileText,
    CheckCircle,
    Receipt,
    CreditCard,
    ExternalLink
} from 'lucide-react';
import { getPaymentById, verifyPayment, completePayment, updatePayment } from '@/lib/actions/payment';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ViewPaymentModalProps {
    open: boolean;
    onClose: () => void;
    paymentId: string;
    onUpdate: () => void;
}

interface Payment {
    id: string;
    payment_number: string;
    amount: number;
    reference_number: string | null;
    payment_method: string | null;
    date_received: string | null;
    receipt_url: string | null;
    status: string;
    staff_notes: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    client: {
        id: string;
        full_name: string;
        email: string;
        phone: string;
        address: string;
        barangay: string;
    } | null;
    request: {
        id: string;
        request_number: string;
        barangay: string;
        address: string;
        preferred_date: string;
        priority: string;
        completed_at: string | null;
    } | null;
    verifier: { id: string; full_name: string; email: string } | null;
}

export function ViewPaymentModal({ open, onClose, paymentId, onUpdate }: ViewPaymentModalProps) {
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [payment, setPayment] = useState<Payment | null>(null);
    const [notes, setNotes] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (open && paymentId) {
            loadPayment();
        }
    }, [open, paymentId]);

    const loadPayment = async () => {
        setLoading(true);
        try {
            const result = await getPaymentById(paymentId);
            if (result.success && result.data) {
                setPayment(result.data);
                setNotes(result.data.staff_notes || '');
            }
        } catch (error) {
            console.error('Failed to load payment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setActionLoading(true);
        try {
            const result = await verifyPayment(paymentId);
            if (result.success) {
                toast.success('Payment verified successfully');
                loadPayment();
                onUpdate();
            } else {
                toast.error(result.error || 'Failed to verify payment');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async () => {
        setActionLoading(true);
        try {
            const result = await completePayment(paymentId);
            if (result.success) {
                toast.success('Payment marked as completed');
                loadPayment();
                onUpdate();
            } else {
                toast.error(result.error || 'Failed to complete payment');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        setActionLoading(true);
        try {
            const result = await updatePayment({
                id: paymentId,
                staffNotes: notes,
            });
            if (result.success) {
                toast.success('Notes saved');
                setIsEditing(false);
                loadPayment();
            } else {
                toast.error(result.error || 'Failed to save notes');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setActionLoading(false);
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
        }).format(amount);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-400" />
                        Payment Details
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
                    </div>
                ) : payment ? (
                    <ScrollArea className="max-h-[70vh] pr-4">
                        <div className="space-y-6">
                            {/* Amount and Status */}
                            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-emerald-300 text-sm">Amount</p>
                                        <p className="text-3xl font-bold text-white">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                    </div>
                                    <Badge className={getStatusBadge(payment.status)}>
                                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400">Payment Number</p>
                                        <p className="text-white font-mono">{payment.payment_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Reference Number</p>
                                        <p className="text-white font-mono">
                                            {payment.reference_number || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Payment Method</p>
                                        <p className="text-white capitalize">
                                            {payment.payment_method || 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Date Received</p>
                                        <p className="text-white">
                                            {payment.date_received
                                                ? format(new Date(payment.date_received), 'MMM dd, yyyy')
                                                : 'Not recorded'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Receipt */}
                            {payment.receipt_url && (
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Receipt className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm text-slate-300">Receipt Attached</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(payment.receipt_url!, '_blank')}
                                            className="border-slate-600 text-slate-300"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Receipt
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Client Info */}
                            {payment.client && (
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Client Information
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-white font-medium">{payment.client.full_name}</p>
                                        <p className="text-slate-400 text-sm">{payment.client.email}</p>
                                        <p className="text-slate-400 text-sm flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {payment.client.phone}
                                        </p>
                                        <p className="text-slate-400 text-sm flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {payment.client.address}, {payment.client.barangay}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Request Info */}
                            {payment.request && (
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Related Request
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-400">Request Number</p>
                                            <p className="text-white font-mono">{payment.request.request_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400">Priority</p>
                                            <p className="text-white capitalize">{payment.request.priority}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-slate-400">Location</p>
                                            <p className="text-white">
                                                {payment.request.address}, {payment.request.barangay}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Verification Info */}
                            {payment.verifier && (
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-blue-400" />
                                        <span className="text-blue-400 font-medium">Verified</span>
                                    </div>
                                    <p className="text-slate-400 text-sm">
                                        Verified by {payment.verifier.full_name}
                                        {payment.verified_at && (
                                            <> on {format(new Date(payment.verified_at), 'MMM dd, yyyy \'at\' h:mm a')}</>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Staff Notes */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Staff Notes
                                    </h4>
                                    {!isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                            className="text-slate-400"
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add staff notes..."
                                            className="bg-slate-700/50 border-slate-600 text-white"
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleSaveNotes}
                                                disabled={actionLoading}
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setNotes(payment.staff_notes || '');
                                                }}
                                                className="border-slate-600 text-slate-300"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-700/50 rounded-lg p-3">
                                        <p className="text-slate-300 text-sm">
                                            {payment.staff_notes || 'No notes added'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div className="text-xs text-slate-500 pt-4 border-t border-slate-700">
                                <p>Created on {format(new Date(payment.created_at), 'MMM dd, yyyy \'at\' h:mm a')}</p>
                                {payment.updated_at !== payment.created_at && (
                                    <p>Last updated {format(new Date(payment.updated_at), 'MMM dd, yyyy \'at\' h:mm a')}</p>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-400">Payment not found</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-slate-700">
                    <div className="flex gap-2">
                        {payment?.status === 'pending' && (
                            <Button
                                onClick={handleVerify}
                                disabled={actionLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify Payment
                            </Button>
                        )}
                        {payment?.status === 'verified' && (
                            <Button
                                onClick={handleComplete}
                                disabled={actionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Completed
                            </Button>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-slate-600 text-slate-300"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
