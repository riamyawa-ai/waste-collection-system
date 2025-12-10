'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Megaphone,
    Plus,
    Search,
    Filter,
    Bell,
    AlertTriangle,
    Calendar,
    MoreHorizontal,
    Eye,
    Edit,
    Copy,
    Trash2,
    Send,
    Clock,
    RefreshCw,
    Users,
    CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
    getAnnouncements,
    getAnnouncementStats,
    deleteAnnouncement,
    duplicateAnnouncement,
    publishAnnouncement
} from '@/lib/actions/announcement';
import { CreateAnnouncementModal } from '@/components/staff/CreateAnnouncementModal';
import { ViewAnnouncementModal } from '@/components/staff/ViewAnnouncementModal';
import { format } from 'date-fns';

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
    creator: { id: string; full_name: string } | null;
}

interface Stats {
    total: number;
    active: number;
    urgent: number;
    scheduled: number;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        loadData();
    }, [typeFilter, statusFilter, pagination.page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [announcementsResult, statsResult] = await Promise.all([
                getAnnouncements({
                    search: searchQuery || undefined,
                    type: typeFilter as 'info' | 'success' | 'warning' | 'error' | 'maintenance' | 'event' | 'all',
                    status: statusFilter as 'draft' | 'published' | 'scheduled' | 'expired' | 'all',
                    page: pagination.page,
                    limit: pagination.limit,
                }),
                getAnnouncementStats(),
            ]);

            if (announcementsResult.success && announcementsResult.data) {
                setAnnouncements(announcementsResult.data.announcements || []);
                setPagination(prev => ({
                    ...prev,
                    total: announcementsResult.data?.total || 0,
                    totalPages: announcementsResult.data?.totalPages || 0,
                }));
            }

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }
        } catch (error) {
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        loadData();
    };

    const handleDuplicate = async (announcementId: string) => {
        const result = await duplicateAnnouncement(announcementId);
        if (result.success) {
            toast.success('Announcement duplicated successfully');
            loadData();
        } else {
            toast.error(result.error || 'Failed to duplicate');
        }
    };

    const handleDelete = async (announcementId: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        const result = await deleteAnnouncement(announcementId);
        if (result.success) {
            toast.success('Announcement deleted');
            loadData();
        } else {
            toast.error(result.error || 'Failed to delete');
        }
    };

    const handlePublish = async (announcementId: string) => {
        const result = await publishAnnouncement(announcementId);
        if (result.success) {
            toast.success('Announcement published');
            loadData();
        } else {
            toast.error(result.error || 'Failed to publish');
        }
    };

    const getTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            error: 'bg-red-500/20 text-red-400 border-red-500/30',
            maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            event: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };
        return styles[type] || styles.info;
    };

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            normal: 'bg-slate-500/20 text-slate-400',
            important: 'bg-amber-500/20 text-amber-400',
            urgent: 'bg-red-500/20 text-red-400',
        };
        return styles[priority] || styles.normal;
    };

    const getStatusDisplay = (announcement: Announcement) => {
        const now = new Date();
        const publishDate = new Date(announcement.publish_date);
        const expiryDate = announcement.expiry_date ? new Date(announcement.expiry_date) : null;

        if (!announcement.is_published) {
            return { label: 'Draft', style: 'bg-gray-500/20 text-gray-400' };
        }
        if (publishDate > now) {
            return { label: 'Scheduled', style: 'bg-blue-500/20 text-blue-400' };
        }
        if (expiryDate && expiryDate < now) {
            return { label: 'Expired', style: 'bg-red-500/20 text-red-400' };
        }
        return { label: 'Active', style: 'bg-emerald-500/20 text-emerald-400' };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Announcements</h1>
                        <p className="text-slate-400 mt-1">Create and manage system announcements</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Announcement
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Megaphone className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Total</p>
                                        <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Active</p>
                                        <p className="text-2xl font-bold text-white">{stats?.active || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Urgent</p>
                                        <p className="text-2xl font-bold text-white">{stats?.urgent || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/20 rounded-lg">
                                        <Clock className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Scheduled</p>
                                        <p className="text-2xl font-bold text-white">{stats?.scheduled || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Filters */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search announcements..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-40 bg-slate-700/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
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
                                <SelectTrigger className="w-full sm:w-40 bg-slate-700/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={loadData}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Announcements Table */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="text-center py-20">
                                <Megaphone className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No announcements found</h3>
                                <p className="text-slate-400 mb-4">Create your first announcement</p>
                                <Button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Announcement
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-700 hover:bg-transparent">
                                        <TableHead className="text-slate-400">Title</TableHead>
                                        <TableHead className="text-slate-400">Type</TableHead>
                                        <TableHead className="text-slate-400">Audience</TableHead>
                                        <TableHead className="text-slate-400">Publish Date</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-slate-400">Views</TableHead>
                                        <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {announcements.map((announcement) => {
                                        const status = getStatusDisplay(announcement);
                                        return (
                                            <TableRow
                                                key={announcement.id}
                                                className="border-slate-700 hover:bg-slate-700/30"
                                            >
                                                <TableCell>
                                                    <div className="flex items-start gap-3">
                                                        {announcement.priority === 'urgent' && (
                                                            <AlertTriangle className="h-4 w-4 text-red-400 mt-1 flex-shrink-0" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-white line-clamp-1">
                                                                {announcement.title}
                                                            </p>
                                                            <p className="text-sm text-slate-400 line-clamp-1">
                                                                {announcement.content.substring(0, 50)}...
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getTypeBadge(announcement.type)}>
                                                        {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3 text-slate-400" />
                                                        <span className="text-sm text-slate-300">
                                                            {announcement.target_audience.includes('all')
                                                                ? 'All Users'
                                                                : announcement.target_audience.join(', ')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="text-white">
                                                            {format(new Date(announcement.publish_date), 'MMM dd, yyyy')}
                                                        </p>
                                                        <p className="text-slate-400">
                                                            {format(new Date(announcement.publish_date), 'h:mm a')}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={status.style}>
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-slate-300">{announcement.views_count}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedAnnouncement(announcement);
                                                                    setShowViewModal(true);
                                                                }}
                                                                className="text-slate-300 hover:bg-slate-700"
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </DropdownMenuItem>
                                                            {!announcement.is_published && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handlePublish(announcement.id)}
                                                                    className="text-emerald-400 hover:bg-slate-700"
                                                                >
                                                                    <Send className="h-4 w-4 mr-2" />
                                                                    Publish Now
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleDuplicate(announcement.id)}
                                                                className="text-slate-300 hover:bg-slate-700"
                                                            >
                                                                <Copy className="h-4 w-4 mr-2" />
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-700" />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(announcement.id)}
                                                                className="text-red-400 hover:bg-slate-700"
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
                    </CardContent>
                </Card>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="border-slate-600 text-slate-300"
                        >
                            Previous
                        </Button>
                        <span className="flex items-center px-4 text-slate-400">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="border-slate-600 text-slate-300"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <CreateAnnouncementModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    loadData();
                }}
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
