"use client";

import { useEffect, useState, useCallback } from "react";
import { getUsers, updateUserStatus, type UserFilters } from "@/lib/actions/staff";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Eye,
    Pencil,
    Trash2,
    MoreVertical,
    Search,
    RefreshCw,
    Ban,
    CheckCircle,
    Key,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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

interface UserManagementTableProps {
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onResetPassword: (user: User) => void;
    onDelete: (user: User) => void;
    onRefresh?: () => void;
}

const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    staff: "bg-blue-100 text-blue-700",
    client: "bg-purple-100 text-purple-700",
    collector: "bg-orange-100 text-orange-700",
};

const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-neutral-100 text-neutral-700",
    suspended: "bg-red-100 text-red-700",
};

export function UserManagementTable({
    onView,
    onEdit,
    onResetPassword,
    onDelete,
    onRefresh,
}: UserManagementTableProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<UserFilters>({
        search: "",
        role: "all",
        status: "all",
        page: 1,
        limit: 25,
    });
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const result = await getUsers(filters);
        if (result.success && result.data) {
            setUsers(result.data.users);
            setTotalPages(result.data.totalPages);
            setTotal(result.data.total);
        }
        setLoading(false);
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleStatusChange = async (
        userId: string,
        newStatus: "active" | "inactive" | "suspended"
    ) => {
        const result = await updateUserStatus(userId, newStatus);
        if (result.success) {
            toast.success(`User status updated to ${newStatus}`);
            fetchUsers();
        } else {
            toast.error(result.error || "Failed to update status");
        }
    };



    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-neutral-200">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={filters.search}
                            onChange={(e) =>
                                setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
                            }
                            className="pl-10"
                        />
                    </div>
                </div>
                <Select
                    value={filters.role}
                    onValueChange={(value) =>
                        setFilters((f) => ({ ...f, role: value as UserFilters["role"], page: 1 }))
                    }
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="collector">Collector</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filters.status}
                    onValueChange={(value) =>
                        setFilters((f) => ({
                            ...f,
                            status: value as UserFilters["status"],
                            page: 1,
                        }))
                    }
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        fetchUsers();
                        onRefresh?.();
                    }}
                >
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-neutral-50">
                            <TableHead className="w-[50px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Registered</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(8)].map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-neutral-100 animate-pulse rounded" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-neutral-50">
                                    <TableCell className="font-mono text-xs text-neutral-500">
                                        {user.id.slice(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                                                    {getInitials(user.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-neutral-900">
                                                    {user.full_name}
                                                </p>
                                                {user.barangay && (
                                                    <p className="text-xs text-neutral-500">
                                                        {user.barangay}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm text-neutral-900">{user.email}</p>
                                            <p className="text-xs text-neutral-500">{user.phone}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={roleColors[user.role]} variant="outline">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[user.status]} variant="outline">
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-neutral-600">
                                        {format(new Date(user.created_at), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-sm text-neutral-600">
                                        {user.last_login_at
                                            ? format(new Date(user.last_login_at), "MMM d, yyyy")
                                            : "Never"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onView(user)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEdit(user)}>
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {user.status !== "active" && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusChange(user.id, "active")}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                            Activate
                                                        </DropdownMenuItem>
                                                    )}
                                                    {user.status !== "suspended" && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleStatusChange(user.id, "suspended")}
                                                            className="text-red-600"
                                                        >
                                                            <Ban className="w-4 h-4 mr-2" />
                                                            Suspend
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => onResetPassword(user)}>
                                                        <Key className="w-4 h-4 mr-2" />
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => onDelete(user)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
                    <p className="text-sm text-neutral-500">
                        Showing {((filters.page || 1) - 1) * (filters.limit || 25) + 1} to{" "}
                        {Math.min((filters.page || 1) * (filters.limit || 25), total)} of {total} users
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                            disabled={(filters.page || 1) <= 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-neutral-600">
                            Page {filters.page || 1} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                            disabled={(filters.page || 1) >= totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
