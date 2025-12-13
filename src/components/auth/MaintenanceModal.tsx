'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertTriangle, Clock, Wrench } from 'lucide-react';
import { format } from 'date-fns';

interface MaintenanceModalProps {
    open: boolean;
    message?: string;
    endTime?: string | null;
    wasForced?: boolean;
}

export function MaintenanceModal({ open, message, endTime, wasForced }: MaintenanceModalProps) {
    // Format end time if available
    const formattedEndTime = endTime
        ? format(new Date(endTime), "MMMM d, yyyy 'at' h:mm a")
        : null;

    return (
        <Dialog open={open} modal>
            <DialogContent
                className="sm:max-w-lg bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 p-0 overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {/* Header with icon */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                            <Wrench className="h-10 w-10" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold">System Maintenance</h2>
                    <p className="text-orange-100 mt-1">In Progress</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {wasForced && (
                        <div className="flex items-start gap-3 p-4 bg-amber-100 rounded-lg border border-amber-200">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-amber-800">
                                You have been automatically logged out due to scheduled system maintenance.
                            </p>
                        </div>
                    )}

                    <div className="text-center space-y-3">
                        <p className="text-gray-700">
                            {message || 'We are currently performing scheduled maintenance to improve your experience. Please check back shortly.'}
                        </p>

                        {formattedEndTime && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg border border-orange-200">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <div className="text-left">
                                    <p className="text-xs text-gray-500">Expected completion</p>
                                    <p className="text-sm font-semibold text-gray-900">{formattedEndTime}</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <a
                                href="/login"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-600 text-white hover:bg-orange-700 h-10 px-4 py-2 w-full sm:w-auto"
                            >
                                Go to Login
                            </a>
                        </div>
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-500">
                            We apologize for any inconvenience. Thank you for your patience.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <p className="text-xs text-center text-gray-400">
                        Only administrators have access during maintenance windows.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
