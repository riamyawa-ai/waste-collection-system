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
import { Separator } from '@/components/ui/separator';
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
            <DialogContent className="max-w-2xl max-h-[90vh] bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                        Announcement Details
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
                    </div>
                ) : announcement ? (
                    <ScrollArea className="max-h-[70vh] pr-4">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
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
                                <div className="rounded-lg overflow-hidden">
                                    <img
                                        src={announcement.image_url}
                                        alt={announcement.title}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="bg-slate-700/50 rounded-lg p-4">
                                <p className="text-slate-300 whitespace-pre-wrap">{announcement.content}</p>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">Target Audience</span>
                                    </div>
                                    <p className="text-white">
                                        {announcement.target_audience.includes('all')
                                            ? 'All Users'
                                            : announcement.target_audience.map(a =>
                                                a.charAt(0).toUpperCase() + a.slice(1)
                                            ).join(', ')}
                                    </p>
                                </div>
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Eye className="h-4 w-4" />
                                        <span className="text-sm">Views</span>
                                    </div>
                                    <p className="text-white text-lg font-bold">{announcement.views_count}</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">Publish Date</span>
                                    </div>
                                    <p className="text-white">
                                        {format(new Date(announcement.publish_date), 'MMM dd, yyyy \'at\' h:mm a')}
                                    </p>
                                </div>
                                {announcement.expiry_date && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">Expiry Date</span>
                                        </div>
                                        <p className="text-white">
                                            {format(new Date(announcement.expiry_date), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Notification Settings */}
                            <div className="bg-slate-700/50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-slate-400 mb-3">Notification Settings</h4>
                                <div className="flex gap-4">
                                    <div className={`flex items-center gap-2 ${announcement.send_email_notification ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">Email</span>
                                        {announcement.send_email_notification ? '✓' : '✗'}
                                    </div>
                                    <div className={`flex items-center gap-2 ${announcement.send_push_notification ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <Bell className="h-4 w-4" />
                                        <span className="text-sm">In-App</span>
                                        {announcement.send_push_notification ? '✓' : '✗'}
                                    </div>
                                </div>
                            </div>

                            {/* Creator Info */}
                            <div className="text-xs text-slate-500 pt-4 border-t border-slate-700">
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
                        <p className="text-slate-400">Announcement not found</p>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-700">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-slate-600 text-slate-300"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
