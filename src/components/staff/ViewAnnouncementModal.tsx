'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Megaphone,
    Calendar,
    Users,
    Eye,
    Clock,
    AlertTriangle,
    Bell,
    Mail
} from 'lucide-react';
import { getAnnouncementById } from '@/lib/actions/announcement';
import { format } from 'date-fns';

interface ViewAnnouncementModalProps {
    open: boolean;
    onClose: () => void;
    announcementId: string;
}

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
    send_email_notification: boolean;
    send_push_notification: boolean;
    created_at: string;
    updated_at: string;
    creator: { id: string; full_name: string; email: string } | null;
}

export function ViewAnnouncementModal({ open, onClose, announcementId }: ViewAnnouncementModalProps) {
    const [loading, setLoading] = useState(true);
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        if (open && announcementId) {
            loadAnnouncement();
        }
    }, [open, announcementId]);

    const loadAnnouncement = async () => {
        setLoading(true);
        try {
            const result = await getAnnouncementById(announcementId);
            if (result.success && result.data) {
                setAnnouncement(result.data);
            }
        } catch (error) {
            console.error('Failed to load announcement:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            info: 'bg-blue-100 text-blue-700 border-blue-200',
            success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            warning: 'bg-amber-100 text-amber-700 border-amber-200',
            error: 'bg-red-100 text-red-700 border-red-200',
            maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
            event: 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return styles[type] || styles.info;
    };

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            normal: 'bg-slate-100 text-slate-700 border-slate-200',
            important: 'bg-amber-100 text-amber-700 border-amber-200',
            urgent: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[priority] || styles.normal;
    };

    const getStatusDisplay = () => {
        if (!announcement) return { label: 'Unknown', style: 'bg-gray-500/20 text-gray-400' };

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
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-purple-600" />
                        Announcement Details
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                    </div>
                ) : announcement ? (
                    <ScrollArea className="max-h-[70vh] pr-4">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                                    <Badge className={getStatusDisplay().style}>
                                        {getStatusDisplay().label}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge className={getTypeBadge(announcement.type)}>
                                        {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                                    </Badge>
                                    {announcement.priority !== 'normal' && (
                                        <Badge className={getPriorityBadge(announcement.priority)}>
                                            {announcement.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                            {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Image */}
                            {announcement.image_url && (
                                <div className="rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={announcement.image_url}
                                        alt={announcement.title}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">Target Audience</span>
                                    </div>
                                    <p className="text-gray-900 font-medium">
                                        {announcement.target_audience.includes('all')
                                            ? 'All Users'
                                            : announcement.target_audience.map(a =>
                                                a.charAt(0).toUpperCase() + a.slice(1)
                                            ).join(', ')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                        <Eye className="h-4 w-4" />
                                        <span className="text-sm">Views</span>
                                    </div>
                                    <p className="text-gray-900 text-lg font-bold">{announcement.views_count}</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">Publish Date</span>
                                    </div>
                                    <p className="text-gray-900">
                                        {format(new Date(announcement.publish_date), 'MMM dd, yyyy \'at\' h:mm a')}
                                    </p>
                                </div>
                                {announcement.expiry_date && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">Expiry Date</span>
                                        </div>
                                        <p className="text-gray-900">
                                            {format(new Date(announcement.expiry_date), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Notification Settings */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <h4 className="text-sm font-medium text-gray-500 mb-3">Notification Settings</h4>
                                <div className="flex gap-4">
                                    <div className={`flex items-center gap-2 ${announcement.send_email_notification ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">Email</span>
                                        {announcement.send_email_notification ? '✓' : '✗'}
                                    </div>
                                    <div className={`flex items-center gap-2 ${announcement.send_push_notification ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        <Bell className="h-4 w-4" />
                                        <span className="text-sm">In-App</span>
                                        {announcement.send_push_notification ? '✓' : '✗'}
                                    </div>
                                </div>
                            </div>

                            {/* Creator Info */}
                            <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                                <p>Created by {announcement.creator?.full_name || 'Unknown'}</p>
                                <p>Created on {format(new Date(announcement.created_at), 'MMM dd, yyyy \'at\' h:mm a')}</p>
                                {announcement.updated_at !== announcement.created_at && (
                                    <p>Last updated {format(new Date(announcement.updated_at), 'MMM dd, yyyy \'at\' h:mm a')}</p>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Announcement not found</p>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
