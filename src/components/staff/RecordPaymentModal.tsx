"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordPayment } from "@/lib/actions/staff";
import { CreditCard, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

interface RecordPaymentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    request: {
        id: string;
        request_number: string;
        client?: {
            full_name: string;
            phone: string;
        } | null;
        barangay: string;
    } | null;
}

export function RecordPaymentModal({
    open,
    onClose,
    onSuccess,
    request,
}: RecordPaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        referenceNumber: "",
        dateReceived: new Date().toISOString().split("T")[0],
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request) return;

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!formData.referenceNumber.trim()) {
            toast.error("Please enter a reference number");
            return;
        }

        setLoading(true);
        try {
            const result = await recordPayment(request.id, {
                amount: parseFloat(formData.amount),
                referenceNumber: formData.referenceNumber,
                dateReceived: formData.dateReceived,
                notes: formData.notes,
            });

            if (result.success) {
                toast.success("Payment recorded successfully");
                onSuccess();
                onClose();
                resetForm();
            } else {
                toast.error(result.error || "Failed to record payment");
            }
        } catch (_error) {
            toast.error("An error occurred");
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            amount: "",
            referenceNumber: "",
            dateReceived: new Date().toISOString().split("T")[0],
            notes: "",
        });
    };

    if (!request) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                        Record Payment
                    </DialogTitle>
                    <DialogDescription>
                        Record payment details for this collection request.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Request Summary */}
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-neutral-500">Request #</p>
                                <p className="font-mono font-medium">{request.request_number}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500">Client</p>
                                <p className="font-medium">
                                    {request.client?.full_name || "Unknown"}
                                </p>
                            </div>
                            <div>
                                <p className="text-neutral-500">Contact</p>
                                <p className="font-medium">{request.client?.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500">Location</p>
                                <p className="font-medium">{request.barangay}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount Received (₱) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData((f) => ({ ...f, amount: e.target.value }))
                                    }
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateReceived">Date Received *</Label>
                                <Input
                                    id="dateReceived"
                                    type="date"
                                    value={formData.dateReceived}
                                    onChange={(e) =>
                                        setFormData((f) => ({ ...f, dateReceived: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="referenceNumber">Reference Number *</Label>
                            <Input
                                id="referenceNumber"
                                placeholder="e.g., GCash ref #, Bank transaction ID"
                                value={formData.referenceNumber}
                                onChange={(e) =>
                                    setFormData((f) => ({ ...f, referenceNumber: e.target.value }))
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="receipt">Upload Receipt (Optional)</Label>
                            <div
                                className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-primary-300 transition-colors cursor-pointer"
                                onClick={() => toast.info("File upload feature is coming soon")}
                            >
                                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                <p className="text-sm text-neutral-600">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    PNG, JPG, or PDF up to 10MB
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Staff Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any additional notes about this payment..."
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData((f) => ({ ...f, notes: e.target.value }))
                                }
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
