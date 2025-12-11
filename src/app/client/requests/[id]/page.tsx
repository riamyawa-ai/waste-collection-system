'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Truck,
    Phone,
    FileText,
    Package,
    AlertTriangle,
    Check,
    XCircle,
    Edit,
    RefreshCw,
    User,
    MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { CancelRequestModal, EditRequestModal } from '@/components/client';
import { getRequestById } from '@/lib/actions/requests';
import type { RequestStatus, PriorityLevel } from '@/constants/status';

interface RequestDetail {
    id: string;
    request_number: string;
    requester_name?: string;
    created_at: string;
    status: RequestStatus;
    priority: PriorityLevel;
    barangay: string;
    address: string;
    waste_type: string;
    special_instructions?: string;
    preferred_date: string;
    preferred_time_slot: string;
    contact_number: string;
    alt_contact_number?: string;
    estimated_volume?: string;
    scheduled_date?: string;
    completed_at?: string;
    cancellation_reason?: string;
    assigned_collector?: {
        id: string;
        full_name: string;
    };
}

export default function RequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const requestId = params.id as string;

    const [request, setRequest] = useState<RequestDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchRequest = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getRequestById(requestId);
            if (result.success && result.data) {
                setRequest(result.data as RequestDetail);
            } else {
                setError(result.error || 'Request not found');
            }
        } catch (err) {
            setError('Failed to load request details');
        } finally {
            setIsLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        fetchRequest();
    }, [fetchRequest]);

    const canEdit = request?.status === 'pending';
    const canCancel = request && ['pending', 'accepted'].includes(request.status);

    const handleCancelSuccess = () => {
        setShowCancelModal(false);
        fetchRequest();
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        fetchRequest();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <FileText className="h-12 w-12 text-neutral-300 mb-4" />
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Request Not Found</h2>
                <p className="text-neutral-500 mb-6">{error || 'The request you are looking for does not exist.'}</p>
                <Link href="/client/requests">
                    <Button>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Requests
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/client/requests">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-neutral-900">
                                    {request.request_number}
                                </h1>
                                <StatusBadge status={request.status} />
                            </div>
                            <p className="text-sm text-neutral-500">
                                Submitted on {format(new Date(request.created_at), 'MMMM d, yyyy h:mm a')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {canEdit && (
                            <Button variant="outline" onClick={() => setShowEditModal(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Request
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => setShowCancelModal(true)}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Request
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Location Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary-600" />
                                    Location Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Barangay</p>
                                        <p className="text-neutral-900">{request.barangay}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Street Address</p>
                                        <p className="text-neutral-900">{request.address}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Collection Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary-600" />
                                    Collection Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Waste Type</p>
                                        <p className="text-neutral-900 capitalize">{request.waste_type?.replace(/_/g, ' ') || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Priority</p>
                                        <PriorityBadge priority={request.priority} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Estimated Volume</p>
                                        <p className="text-neutral-900">{request.estimated_volume || 'Not specified'}</p>
                                    </div>
                                </div>
                                {request.special_instructions && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-neutral-500 mb-2">Special Instructions</p>
                                        <p className="text-neutral-900 bg-neutral-50 p-3 rounded-lg">
                                            {request.special_instructions}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Schedule Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary-600" />
                                    Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Preferred Date</p>
                                        <p className="text-neutral-900">
                                            {request.preferred_date ? format(new Date(request.preferred_date), 'MMMM d, yyyy') : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Preferred Time</p>
                                        <p className="text-neutral-900 capitalize">{request.preferred_time_slot?.replace(/_/g, ' ') || 'Not specified'}</p>
                                    </div>
                                    {request.scheduled_date && (
                                        <div>
                                            <p className="text-sm font-medium text-neutral-500">Scheduled Date</p>
                                            <p className="text-neutral-900 flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-600" />
                                                {format(new Date(request.scheduled_date), 'MMMM d, yyyy')}
                                            </p>
                                        </div>
                                    )}
                                    {request.completed_at && (
                                        <div>
                                            <p className="text-sm font-medium text-neutral-500">Completed At</p>
                                            <p className="text-neutral-900">
                                                {format(new Date(request.completed_at), 'MMMM d, yyyy h:mm a')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-primary-600" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {request.requester_name && (
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Requester Name</p>
                                        <p className="text-neutral-900">{request.requester_name}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-neutral-500">Primary Contact</p>
                                    <p className="text-neutral-900">{request.contact_number}</p>
                                </div>
                                {request.alt_contact_number && (
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Alternative Contact</p>
                                        <p className="text-neutral-900">{request.alt_contact_number}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Collector Card */}
                        {request.assigned_collector && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-primary-600" />
                                        Assigned Collector
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">
                                                {request.assigned_collector.full_name}
                                            </p>
                                            <p className="text-sm text-neutral-500">Waste Collector</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Cancellation Reason */}
                        {request.cancellation_reason && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="h-5 w-5" />
                                        Cancellation Reason
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-red-700">{request.cancellation_reason}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href="/client/requests?new=true" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="w-4 h-4 mr-2" />
                                        New Request
                                    </Button>
                                </Link>
                                {request.status === 'completed' && (
                                    <Link href="/client/feedback" className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Leave Feedback
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && request && (
                <EditRequestModal
                    isOpen={showEditModal}
                    request={{
                        id: request.id,
                        request_number: request.request_number,
                        requester_name: request.requester_name,
                        barangay: request.barangay,
                        address: request.address,
                        priority: request.priority,
                        preferred_date: request.preferred_date,
                        preferred_time_slot: request.preferred_time_slot,
                        contact_number: request.contact_number,
                        alt_contact_number: request.alt_contact_number,
                        special_instructions: request.special_instructions,
                    }}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Cancel Modal */}
            {showCancelModal && request && (
                <CancelRequestModal
                    isOpen={showCancelModal}
                    requestId={request.id}
                    requestNumber={request.request_number}
                    onClose={() => setShowCancelModal(false)}
                    onSuccess={handleCancelSuccess}
                />
            )}
        </>
    );
}
