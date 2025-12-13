"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader, EcoCard, EcoCardContent } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Megaphone,
    Plus,
    Search,
    AlertTriangle,
    MoreHorizontal,
    Eye,
    Copy,
    Trash2,
    Send,
    Clock,
    RefreshCw,
    Users,
    CheckCircle,
    Wrench,
    Settings,
} from "lucide-react";
import {
    getAnnouncements,
    getAnnouncementStats,
    deleteAnnouncement,
    duplicateAnnouncement,
    publishAnnouncement,
} from "@/lib/actions/announcement";
import { CreateAnnouncementModal } from "@/components/staff/CreateAnnouncementModal";
import { ViewAnnouncementModal } from "@/components/staff/ViewAnnouncementModal";
import { format } from "date-fns";
import Link from "next/link";

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: string;
    priority: string;
    target_audience: string[];
    image_url: string | null;
    publish_date: string;
    expiry_date: string | null;
    is_published: boolean;
    views_count: number;
    created_at: string;
    enable_maintenance_mode: boolean;
    creator: { id: string; full_name: string } | null;
}

interface Stats {
    total: number;
    active: number;
    urgent: number;
    scheduled: number;
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [announcementsResult, statsResult] = await Promise.all([
                getAnnouncements({
                    search: searchQuery || undefined,
                    type: typeFilter as "info" | "success" | "warning" | "error" | "maintenance" | "event" | "all",
                    status: statusFilter as "draft" | "published" | "scheduled" | "expired" | "all",
                    page: pagination.page,
                    limit: pagination.limit,
                }),
                getAnnouncementStats(),
            ]);

            if (announcementsResult.success && announcementsResult.data) {
                setAnnouncements(announcementsResult.data.announcements || []);
                setPagination((prev) => ({
                    ...prev,
                    total: announcementsResult.data?.total || 0,
                    totalPages: announcementsResult.data?.totalPages || 0,
                }));
            }

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }
        } catch (_error) {
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    }, [searchQuery, typeFilter, statusFilter, pagination.page, pagination.limit]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = useCallback(() => {
        loadData();
    }, [loadData]);

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadData();
    };

    const handleDuplicate = async (announcementId: string) => {
        const result = await duplicateAnnouncement(announcementId);
        if (result.success) {
            toast.success("Announcement duplicated successfully");
            loadData();
        } else {
            toast.error(result.error || "Failed to duplicate");
        }
    };

    const handleDelete = async (announcementId: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        const result = await deleteAnnouncement(announcementId);
        if (result.success) {
            toast.success("Announcement deleted");
            loadData();
        } else {
            toast.error(result.error || "Failed to delete");
        }
    };

    const handlePublish = async (announcementId: string) => {
        const result = await publishAnnouncement(announcementId);
        if (result.success) {
            toast.success("Announcement published");
            loadData();
        } else {
            toast.error(result.error || "Failed to publish");
        }
    };

    const getTypeBadge = (type: string, enableMaintenanceMode?: boolean) => {
        const styles: Record<string, string> = {
            info: "bg-blue-100 text-blue-700",
            success: "bg-green-100 text-green-700",
            warning: "bg-amber-100 text-amber-700",
            error: "bg-red-100 text-red-700",
            maintenance: "bg-orange-100 text-orange-700",
            event: "bg-purple-100 text-purple-700",
        };
        return (
            <div className="flex items-center gap-1.5">
                <Badge className={styles[type] || styles.info}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
                {enableMaintenanceMode && (
                    <Badge className="bg-orange-500 text-white animate-pulse">
                        <Wrench className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                )}
            </div>
        );
    };

    const getStatusDisplay = (announcement: Announcement) => {
        const now = new Date();
        const publishDate = new Date(announcement.publish_date);
        const expiryDate = announcement.expiry_date ? new Date(announcement.expiry_date) : null;

        if (!announcement.is_published) {
            return { label: "Draft", style: "bg-neutral-100 text-neutral-700" };
        }
        if (publishDate > now) {
            return { label: "Scheduled", style: "bg-blue-100 text-blue-700" };
        }
        if (expiryDate && expiryDate < now) {
            return { label: "Expired", style: "bg-red-100 text-red-700" };
        }
        return { label: "Active", style: "bg-green-100 text-green-700" };
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Announcements"
                description="Create and manage system-wide announcements and alerts."
            >
                <div className="flex gap-3">
                    <Link href="/admin/settings">
                        <Button variant="outline" className="gap-2">
                            <Settings className="w-4 h-4" />
                            System Settings
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Announcement
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Megaphone className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Total</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.total || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Active</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.active || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Urgent</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.urgent || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Scheduled</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.scheduled || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>
            </div>

            {/* Filters */}
            <EcoCard>
                <EcoCardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Search announcements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="event">Event</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </EcoCardContent>
            </EcoCard>

            {/* Announcements Table */}
            <EcoCard>
                <EcoCardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-20">
                            <Megaphone className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                No announcements found
                            </h3>
                            <p className="text-neutral-500 mb-4">Create your first announcement</p>
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Announcement
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Audience</TableHead>
                                    <TableHead>Publish Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.map((announcement) => {
                                    const status = getStatusDisplay(announcement);
                                    return (
                                        <TableRow key={announcement.id}>
                                            <TableCell>
                                                <div className="flex items-start gap-2">
                                                    {announcement.priority === "urgent" && (
                                                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-neutral-900 line-clamp-1">
                                                            {announcement.title}
                                                        </p>
                                                        <p className="text-sm text-neutral-500 line-clamp-1">
                                                            {announcement.content.substring(0, 50)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getTypeBadge(announcement.type, announcement.enable_maintenance_mode)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3 text-neutral-400" />
                                                    <span className="text-sm text-neutral-600">
                                                        {announcement.target_audience.includes("all")
                                                            ? "All Users"
                                                            : announcement.target_audience.join(", ")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="text-neutral-900">
                                                        {format(
                                                            new Date(announcement.publish_date),
                                                            "MMM dd, yyyy"
                                                        )}
                                                    </p>
                                                    <p className="text-neutral-500">
                                                        {format(
                                                            new Date(announcement.publish_date),
                                                            "h:mm a"
                                                        )}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={status.style}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-neutral-600">
                                                    {announcement.views_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedAnnouncement(announcement);
                                                                setShowViewModal(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>
                                                        {!announcement.is_published && (
                                                            <DropdownMenuItem
                                                                onClick={() => handlePublish(announcement.id)}
                                                                className="text-green-600"
                                                            >
                                                                <Send className="h-4 w-4 mr-2" />
                                                                Publish Now
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => handleDuplicate(announcement.id)}
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(announcement.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </EcoCardContent>
            </EcoCard>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() =>
                            setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                        }
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-neutral-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() =>
                            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                        }
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Create Modal */}
            <CreateAnnouncementModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    loadData();
                }}
                userRole="admin"
            />

            {/* View Modal */}
            {selectedAnnouncement && (
                <ViewAnnouncementModal
                    open={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedAnnouncement(null);
                    }}
                    announcementId={selectedAnnouncement.id}
                />
            )}
        </div>
    );
}
