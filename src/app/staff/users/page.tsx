"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
    UserStatsCards,
    UserManagementTable,
    AddUserModal,
    ViewUserModal,
    EditUserModal,
    ResetPasswordModal,
    DeleteUserModal,
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
    address?: string;
}

export default function UsersPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    const handleView = (user: User) => {
        setSelectedUser(user);
        setShowViewModal(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleResetPassword = (user: User) => {
        setSelectedUser(user);
        setShowResetModal(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleCloseModals = () => {
        setShowViewModal(false);
        setShowEditModal(false);
        setShowResetModal(false);
        setShowDeleteModal(false);
        setSelectedUser(null);
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
                onResetPassword={handleResetPassword}
                onDelete={handleDelete}
                onRefresh={handleRefresh}
            />

            {/* Modals */}
            <AddUserModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleRefresh}
            />

            <ViewUserModal
                open={showViewModal}
                onClose={handleCloseModals}
                userId={selectedUser?.id || null}
            />

            <EditUserModal
                open={showEditModal}
                onClose={handleCloseModals}
                onSuccess={handleRefresh}
                user={selectedUser}
            />

            <ResetPasswordModal
                open={showResetModal}
                onClose={handleCloseModals}
                user={selectedUser}
            />

            <DeleteUserModal
                open={showDeleteModal}
                onClose={handleCloseModals}
                onSuccess={handleRefresh}
                user={selectedUser}
            />
        </div>
    );
}
