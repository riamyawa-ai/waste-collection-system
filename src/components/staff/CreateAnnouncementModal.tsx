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
    { value: 'info', label: 'Information', color: 'text-blue-600' },
    { value: 'success', label: 'Success', color: 'text-emerald-600' },
    { value: 'warning', label: 'Warning', color: 'text-amber-600' },
    { value: 'error', label: 'Error/Alert', color: 'text-red-600' },
    { value: 'maintenance', label: 'Maintenance', color: 'text-orange-600' },
    { value: 'event', label: 'Event', color: 'text-purple-600' },
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
        } catch (_error) {
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
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-purple-600" />
                        Create Announcement
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <Label className="text-gray-700">Title *</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter announcement title"
                                className="mt-1"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <Label className="text-gray-700">Content *</Label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your announcement content..."
                                className="mt-1"
                                rows={5}
                            />
                        </div>

                        {/* Type and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-700">Type</Label>
                                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ANNOUNCEMENT_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                <span className={t.color}>{t.label}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-gray-700">Priority</Label>
                                <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="important">Important</SelectItem>
                                        <SelectItem value="urgent">
                                            <span className="flex items-center gap-1 text-red-600">
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
                            <Label className="text-gray-700 mb-3 block">Target Audience</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {AUDIENCE_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleAudienceChange(option.value)}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${targetAudience.includes(option.value)
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
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
                                <Label htmlFor="publishImmediately" className="text-gray-700 cursor-pointer">
                                    Publish immediately
                                </Label>
                            </div>

                            {!publishImmediately && (
                                <div className="grid grid-cols-2 gap-4 pl-6">
                                    <div>
                                        <Label className="text-gray-700">Publish Date</Label>
                                        <Input
                                            type="date"
                                            value={publishDate}
                                            onChange={(e) => setPublishDate(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-700">Expiry Date (Optional)</Label>
                                    <Input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notification Options */}
                        <div className="space-y-3">
                            <Label className="text-gray-700">Notification Options</Label>
                            <div className="space-y-2 pl-2">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="sendEmail"
                                        checked={sendEmailNotification}
                                        onCheckedChange={(checked) => setSendEmailNotification(!!checked)}
                                    />
                                    <Label htmlFor="sendEmail" className="text-gray-600 cursor-pointer">
                                        Send email notification to target users
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="sendPush"
                                        checked={sendPushNotification}
                                        onCheckedChange={(checked) => setSendPushNotification(!!checked)}
                                    />
                                    <Label htmlFor="sendPush" className="text-gray-600 cursor-pointer">
                                        Send in-app notification to target users
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !title || !content}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {loading ? 'Creating...' : publishImmediately ? 'Publish Now' : 'Schedule'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
