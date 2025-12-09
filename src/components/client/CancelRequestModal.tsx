'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
                setReason('');
                onSuccess?.();
                onClose();
            } else {
                setError(result.error || 'Failed to cancel request');
            }
        });
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && !isPending) {
            setReason('');
            setError(null);
            onClose();
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <AlertDialogTitle>Cancel Request</AlertDialogTitle>
                            <AlertDialogDescription>
                                {requestNumber}
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-neutral-600">
                        Are you sure you want to cancel this request? This action cannot be
                        undone.
                    </p>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="cancel-reason" required>
                            Reason for cancellation
                        </Label>
                        <Textarea
                            id="cancel-reason"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please explain why you're cancelling this request..."
                            disabled={isPending}
                            maxLength={500}
                            className="resize-none"
                        />
                        <p className="text-xs text-neutral-400 text-right">
                            {reason.length}/500
                        </p>
                    </div>

                    <AlertDialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Keep Request
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={isPending || !reason.trim()}
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
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
