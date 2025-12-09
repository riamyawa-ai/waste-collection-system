'use client';

import { Recycle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { RequestForm } from './RequestForm';

interface RequestPickupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (requestId: string) => void;
}

export function RequestPickupModal({
    isOpen,
    onClose,
    onSuccess,
}: RequestPickupModalProps) {
    const handleSuccess = (requestId: string) => {
        onSuccess?.(requestId);
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                {/* Header */}
                <DialogHeader className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
                            <Recycle className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-white">Request Waste Pickup</DialogTitle>
                            <DialogDescription className="text-white/80">
                                Fill out the form to schedule a collection
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <RequestForm onSuccess={handleSuccess} onCancel={onClose} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
