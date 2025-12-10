"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
    UserStatsCards,
    UserManagementTable,
    AddUserModal,
    ViewUserModal,
} from "@/components/staff";
import { UserPlus, Download } from "lucide-react";

interface User {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    role: "admin" | "staff" | "client" | "collector";
    status: "active" | "inactive" | "suspended";
    barangay?: string;
    avatar_url?: string;
    created_at: string;
    last_login_at?: string;
}

export default function UsersPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    const handleView = (user: User) => {
        setSelectedUserId(user.id);
        setShowViewModal(true);
    };

    const handleEdit = (user: User) => {
        // For now, open view modal - edit functionality can be added
        setSelectedUserId(user.id);
        setShowViewModal(true);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="User Management"
                description="View and manage all system users including clients, collectors, and staff."
            >
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button onClick={() => setShowAddModal(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Cards */}
            <UserStatsCards key={`stats-${refreshKey}`} />

            {/* Users Table */}
            <UserManagementTable
                key={`table-${refreshKey}`}
                onView={handleView}
                onEdit={handleEdit}
                onRefresh={handleRefresh}
            />

            {/* Add User Modal */}
            <AddUserModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleRefresh}
            />

            {/* View User Modal */}
            <ViewUserModal
                open={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedUserId(null);
                }}
                userId={selectedUserId}
            />
        </div>
    );
}
