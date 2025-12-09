'use client';

import { useState, useTransition } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cancelRequest } from '@/lib/actions/requests';

interface CancelRequestModalProps {
    isOpen: boolean;
    requestId: string;
    requestNumber: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CancelRequestModal({
    isOpen,
    requestId,
    requestNumber,
    onClose,
    onSuccess,
}: CancelRequestModalProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!reason.trim()) {
            setError('Please provide a reason for cancellation');
            return;
        }

        startTransition(async () => {
            const result = await cancelRequest({
                id: requestId,
                reason: reason.trim(),
            });

            if (result.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(result.error || 'Failed to cancel request');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900">
                                Cancel Request
                            </h2>
                            <p className="text-sm text-neutral-500">{requestNumber}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-neutral-600">
                        Are you sure you want to cancel this request? This action cannot be
                        undone.
                    </p>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label
                            htmlFor="cancel-reason"
                            className="block text-sm font-medium text-neutral-700"
                        >
                            Reason for cancellation <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="cancel-reason"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please explain why you're cancelling this request..."
                            disabled={isPending}
                            className="flex w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-neutral-400 text-right">
                            {reason.length}/500
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1"
                        >
                            Keep Request
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={isPending || !reason.trim()}
                            className="flex-1"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                'Cancel Request'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
