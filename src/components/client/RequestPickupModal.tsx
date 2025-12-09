'use client';

import { X, Recycle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    if (!isOpen) return null;

    const handleSuccess = (requestId: string) => {
        onSuccess?.(requestId);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl mx-4 my-8 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
                            <Recycle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Request Waste Pickup</h2>
                            <p className="text-sm text-white/80">
                                Fill out the form to schedule a collection
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <RequestForm onSuccess={handleSuccess} onCancel={onClose} />
                </div>
            </div>
        </div>
    );
}
