"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
    CollectionStatsCards,
    CollectionManagementTable,
    AcceptRejectModal,
    RecordPaymentModal,
    AssignCollectorModal,
    ViewRequestModal,
} from "@/components/staff";
import { completeRequest } from "@/lib/actions/staff";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CollectionRequest {
    id: string;
    request_number: string;
    status: string;
    priority: string;
    barangay: string;
    complete_address: string;
    preferred_date: string;
    preferred_time_slot: string;
    created_at: string;
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

export default function CollectionsPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedRequest, setSelectedRequest] = useState<CollectionRequest | null>(null);

    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    const handleView = (request: CollectionRequest) => {
        setSelectedRequest(request);
        setShowViewModal(true);
    };

    const handleAccept = (request: CollectionRequest) => {
        setSelectedRequest(request);
        setShowAcceptModal(true);
    };

    const handleReject = (request: CollectionRequest) => {
        setSelectedRequest(request);
        setShowRejectModal(true);
    };

    const handleRecordPayment = (request: CollectionRequest) => {
        setSelectedRequest(request);
        setShowPaymentModal(true);
    };

    const handleAssignCollector = (request: CollectionRequest) => {
        setSelectedRequest(request);
        setShowAssignModal(true);
    };

    const handleComplete = async (request: CollectionRequest) => {
        const result = await completeRequest(request.id);
        if (result.success) {
            toast.success("Request marked as completed");
            handleRefresh();
        } else {
            toast.error(result.error || "Failed to complete request");
        }
    };

    const closeAllModals = () => {
        setShowViewModal(false);
        setShowAcceptModal(false);
        setShowRejectModal(false);
        setShowPaymentModal(false);
        setShowAssignModal(false);
        setSelectedRequest(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Waste Collection Management"
                description="Process collection requests, record payments, and assign collectors."
            >
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Cards */}
            <CollectionStatsCards key={`stats-${refreshKey}`} />

            {/* Collection Table */}
            <CollectionManagementTable
                key={`table-${refreshKey}`}
                onView={handleView}
                onAccept={handleAccept}
                onReject={handleReject}
                onRecordPayment={handleRecordPayment}
                onAssignCollector={handleAssignCollector}
                onComplete={handleComplete}
                onRefresh={handleRefresh}
            />

            {/* Accept Modal */}
            <AcceptRejectModal
                open={showAcceptModal}
                onClose={closeAllModals}
                onSuccess={handleRefresh}
                request={selectedRequest}
                mode="accept"
            />

            {/* Reject Modal */}
            <AcceptRejectModal
                open={showRejectModal}
                onClose={closeAllModals}
                onSuccess={handleRefresh}
                request={selectedRequest}
                mode="reject"
            />

            {/* Record Payment Modal */}
            <RecordPaymentModal
                open={showPaymentModal}
                onClose={closeAllModals}
                onSuccess={handleRefresh}
                request={selectedRequest}
            />

            {/* Assign Collector Modal */}
            <AssignCollectorModal
                open={showAssignModal}
                onClose={closeAllModals}
                onSuccess={handleRefresh}
                request={selectedRequest}
            />

            {/* View Request Modal */}
            <ViewRequestModal
                open={showViewModal}
                onClose={closeAllModals}
                request={selectedRequest}
            />
        </div>
    );
}
