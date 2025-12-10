"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Phone,
    MapPin,
    Calendar,
    Clock,
    FileText,
    Truck,
    AlertCircle,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { format } from "date-fns";

interface CollectionRequest {
    id: string;
    request_number: string;
    status: string;
    priority: string;
    barangay: string;
    complete_address?: string;
    address?: string;
    preferred_date: string;
    preferred_time_slot: string;
    special_instructions?: string;
    rejection_reason?: string;
    created_at: string;
    updated_at?: string;
    client: {
        id: string;
        full_name: string;
        email: string;
        phone: string;
    } | null;
    collector: {
        id: string;
        full_name: string;
        phone: string;
    } | null;
}

interface ViewRequestModalProps {
    open: boolean;
    onClose: () => void;
    request: CollectionRequest | null;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    accepted: "bg-blue-100 text-blue-700 border-blue-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    payment_confirmed: "bg-purple-100 text-purple-700 border-purple-200",
    assigned: "bg-indigo-100 text-indigo-700 border-indigo-200",
    accepted_by_collector: "bg-cyan-100 text-cyan-700 border-cyan-200",
    declined_by_collector: "bg-orange-100 text-orange-700 border-orange-200",
    en_route: "bg-teal-100 text-teal-700 border-teal-200",
    at_location: "bg-emerald-100 text-emerald-700 border-emerald-200",
    in_progress: "bg-lime-100 text-lime-700 border-lime-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

const priorityColors: Record<string, string> = {
    low: "bg-neutral-100 text-neutral-600",
    medium: "bg-yellow-100 text-yellow-700",
    urgent: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, React.ElementType> = {
    pending: Clock,
    accepted: CheckCircle2,
    rejected: XCircle,
    completed: CheckCircle2,
    cancelled: XCircle,
};

export function ViewRequestModal({ open, onClose, request }: ViewRequestModalProps) {
    if (!request) return null;

    const StatusIcon = statusIcons[request.status] || FileText;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary-600" />
                        Request Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-start justify-between p-4 bg-neutral-50 rounded-xl">
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">Request Number</p>
                            <p className="text-lg font-semibold font-mono text-neutral-900">
                                {request.request_number}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge className={priorityColors[request.priority] || "bg-neutral-100"}>
                                {request.priority}
                            </Badge>
                            <Badge className={statusColors[request.status] || "bg-neutral-100"}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {request.status.replace(/_/g, " ")}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Client Information */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary-600" />
                            Client Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-white border border-neutral-200 rounded-lg">
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Name</p>
                                <p className="font-medium text-neutral-900">
                                    {request.client?.full_name || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Email</p>
                                <p className="font-medium text-neutral-900">
                                    {request.client?.email || "N/A"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-neutral-400" />
                                <p className="font-medium text-neutral-900">
                                    {request.client?.phone || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary-600" />
                            Collection Location
                        </h3>
                        <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-neutral-500 mb-1">Barangay</p>
                                    <p className="font-medium text-neutral-900">{request.barangay}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-neutral-500 mb-1">Complete Address</p>
                                    <p className="font-medium text-neutral-900">
                                        {request.complete_address || request.address || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Information */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-600" />
                            Schedule
                        </h3>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-white border border-neutral-200 rounded-lg">
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Preferred Date</p>
                                <p className="font-medium text-neutral-900">
                                    {request.preferred_date
                                        ? format(new Date(request.preferred_date), "MMMM d, yyyy")
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Time Slot</p>
                                <p className="font-medium text-neutral-900">
                                    {request.preferred_time_slot || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Created</p>
                                <p className="font-medium text-neutral-900">
                                    {format(new Date(request.created_at), "MMM d, yyyy h:mm a")}
                                </p>
                            </div>
                            {request.updated_at && (
                                <div>
                                    <p className="text-xs text-neutral-500 mb-1">Last Updated</p>
                                    <p className="font-medium text-neutral-900">
                                        {format(new Date(request.updated_at), "MMM d, yyyy h:mm a")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assigned Collector */}
                    {request.collector && (
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-primary-600" />
                                Assigned Collector
                            </h3>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-green-900">
                                            {request.collector.full_name}
                                        </p>
                                        <p className="text-sm text-green-700 flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {request.collector.phone}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Special Instructions */}
                    {request.special_instructions && (
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-primary-600" />
                                Special Instructions
                            </h3>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-neutral-700">{request.special_instructions}</p>
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {request.status === "rejected" && request.rejection_reason && (
                        <div>
                            <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Rejection Reason
                            </h3>
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700">{request.rejection_reason}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
