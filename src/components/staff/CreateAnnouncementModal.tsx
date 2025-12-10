'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Megaphone, Users, AlertTriangle } from 'lucide-react';
import { createAnnouncement } from '@/lib/actions/announcement';

interface CreateAnnouncementModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ANNOUNCEMENT_TYPES = [
    { value: 'info', label: 'Information', color: 'text-blue-400' },
    { value: 'success', label: 'Success', color: 'text-emerald-400' },
    { value: 'warning', label: 'Warning', color: 'text-amber-400' },
    { value: 'error', label: 'Error/Alert', color: 'text-red-400' },
    { value: 'maintenance', label: 'Maintenance', color: 'text-orange-400' },
    { value: 'event', label: 'Event', color: 'text-purple-400' },
];

const AUDIENCE_OPTIONS = [
    { value: 'all', label: 'All Users' },
    { value: 'client', label: 'Clients Only' },
    { value: 'collector', label: 'Collectors Only' },
    { value: 'staff', label: 'Staff Only' },
];

export function CreateAnnouncementModal({ open, onClose, onSuccess }: CreateAnnouncementModalProps) {
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<'info' | 'success' | 'warning' | 'error' | 'maintenance' | 'event'>('info');
    const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
    const [targetAudience, setTargetAudience] = useState<string[]>(['all']);
    const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState('');
    const [publishImmediately, setPublishImmediately] = useState(true);
    const [sendEmailNotification, setSendEmailNotification] = useState(false);
    const [sendPushNotification, setSendPushNotification] = useState(true);

    const handleAudienceChange = (value: string) => {
        if (value === 'all') {
            setTargetAudience(['all']);
        } else {
            setTargetAudience(prev => {
                const newAudience = prev.filter(a => a !== 'all');
                if (newAudience.includes(value)) {
                    return newAudience.filter(a => a !== value);
                }
                return [...newAudience, value];
            });
        }
    };

    const handleSubmit = async () => {
        if (!title || !content) {
            toast.error('Title and content are required');
            return;
        }

        setLoading(true);
        try {
            const result = await createAnnouncement({
                title,
                content,
                type,
                priority,
                targetAudience,
                publishDate,
                expiryDate: expiryDate || undefined,
                publishImmediately,
                sendEmailNotification,
                sendPushNotification,
            });

            if (result.success) {
                toast.success('Announcement created successfully');
                resetForm();
                onSuccess();
            } else {
                toast.error(result.error || 'Failed to create announcement');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setType('info');
        setPriority('normal');
        setTargetAudience(['all']);
        setPublishDate(new Date().toISOString().split('T')[0]);
        setExpiryDate('');
        setPublishImmediately(true);
        setSendEmailNotification(false);
        setSendPushNotification(true);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                        Create Announcement
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <Label className="text-slate-300">Title *</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter announcement title"
                                className="bg-slate-700/50 border-slate-600 text-white mt-1"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <Label className="text-slate-300">Content *</Label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your announcement content..."
                                className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                rows={5}
                            />
                        </div>

                        {/* Type and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-slate-300">Type</Label>
                                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {ANNOUNCEMENT_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                <span className={t.color}>{t.label}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-slate-300">Priority</Label>
                                <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="important">Important</SelectItem>
                                        <SelectItem value="urgent">
                                            <span className="flex items-center gap-1 text-red-400">
                                                <AlertTriangle className="h-3 w-3" />
                                                Urgent
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Target Audience */}
                        <div>
                            <Label className="text-slate-300 mb-3 block">Target Audience</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {AUDIENCE_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleAudienceChange(option.value)}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${targetAudience.includes(option.value)
                                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                                            : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                                            }`}
                                    >
                                        <Users className="h-4 w-4" />
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scheduling */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="publishImmediately"
                                    checked={publishImmediately}
                                    onCheckedChange={(checked) => setPublishImmediately(!!checked)}
                                />
                                <Label htmlFor="publishImmediately" className="text-slate-300 cursor-pointer">
                                    Publish immediately
                                </Label>
                            </div>

                            {!publishImmediately && (
                                <div className="grid grid-cols-2 gap-4 pl-6">
                                    <div>
                                        <Label className="text-slate-300">Publish Date</Label>
                                        <Input
                                            type="date"
                                            value={publishDate}
                                            onChange={(e) => setPublishDate(e.target.value)}
                                            className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-300">Expiry Date (Optional)</Label>
                                    <Input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notification Options */}
                        <div className="space-y-3">
                            <Label className="text-slate-300">Notification Options</Label>
                            <div className="space-y-2 pl-2">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="sendEmail"
                                        checked={sendEmailNotification}
                                        onCheckedChange={(checked) => setSendEmailNotification(!!checked)}
                                    />
                                    <Label htmlFor="sendEmail" className="text-slate-400 cursor-pointer">
                                        Send email notification to target users
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="sendPush"
                                        checked={sendPushNotification}
                                        onCheckedChange={(checked) => setSendPushNotification(!!checked)}
                                    />
                                    <Label htmlFor="sendPush" className="text-slate-400 cursor-pointer">
                                        Send in-app notification to target users
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-slate-600 text-slate-300"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !title || !content}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {loading ? 'Creating...' : publishImmediately ? 'Publish Now' : 'Schedule'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
