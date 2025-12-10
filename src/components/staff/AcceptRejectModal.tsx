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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { acceptRequest, rejectRequest } from "@/lib/actions/staff";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AcceptRejectModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    request: {
        id: string;
        request_number: string;
        client?: {
            full_name: string;
        } | null;
        barangay: string;
    } | null;
    mode: "accept" | "reject";
}

export function AcceptRejectModal({
    open,
    onClose,
    onSuccess,
    request,
    mode,
}: AcceptRejectModalProps) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");

    const handleSubmit = async () => {
        if (!request) return;

        if (mode === "reject" && !reason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        setLoading(true);
        try {
            const result =
                mode === "accept"
                    ? await acceptRequest(request.id)
                    : await rejectRequest(request.id, reason);

            if (result.success) {
                toast.success(
                    mode === "accept"
                        ? "Request accepted successfully"
                        : "Request rejected"
                );
                onSuccess();
                onClose();
                setReason("");
            } else {
                toast.error(result.error || "Failed to process request");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
        setLoading(false);
    };

    if (!request) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === "accept" ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Accept Request
                            </>
                        ) : (
                            <>
                                <XCircle className="w-5 h-5 text-red-600" />
                                Reject Request
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "accept"
                            ? "Approve this collection request and notify the client to proceed with payment."
                            : "Decline this collection request. The client will be notified with your reason."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
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
                            <div className="col-span-2">
                                <p className="text-neutral-500">Location</p>
                                <p className="font-medium">{request.barangay}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    {mode === "reject" && (
                        <div className="space-y-2">
                            <Label>Rejection Reason *</Label>
                            <Textarea
                                placeholder="Please provide a reason for rejecting this request..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                            />
                            <p className="text-xs text-neutral-500">
                                This reason will be sent to the client.
                            </p>
                        </div>
                    )}

                    {/* Accept Confirmation */}
                    {mode === "accept" && (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                            <p className="text-sm text-green-700">
                                After accepting, the client will receive a notification to
                                proceed with payment. Once payment is confirmed, you can assign a
                                collector.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            variant={mode === "accept" ? "default" : "destructive"}
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {mode === "accept" ? "Accept Request" : "Reject Request"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
