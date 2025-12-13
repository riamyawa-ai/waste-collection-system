'use client';

import { useState, useCallback } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Megaphone, Users, AlertTriangle, Wrench, Info, Calendar, Clock, ImagePlus, X } from 'lucide-react';
import { createAnnouncement } from '@/lib/actions/announcement';
import { useDropzone } from 'react-dropzone';

interface CreateAnnouncementModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userRole?: string;
}

const ANNOUNCEMENT_TYPES = [
    { value: 'info', label: 'Information', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'success', label: 'Success', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'warning', label: 'Warning', color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { value: 'error', label: 'Error/Alert', color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: 'maintenance', label: 'Maintenance', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { value: 'event', label: 'Event', color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

const AUDIENCE_OPTIONS = [
    { value: 'all', label: 'All Users' },
    { value: 'client', label: 'Clients Only' },
    { value: 'collector', label: 'Collectors Only' },
    { value: 'staff', label: 'Staff Only' },
];

export function CreateAnnouncementModal({ open, onClose, onSuccess, userRole = 'staff' }: CreateAnnouncementModalProps) {
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<'info' | 'success' | 'warning' | 'error' | 'maintenance' | 'event'>('info');
    const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
    const [targetAudience, setTargetAudience] = useState<string[]>(['all']);
    // Use local date string (YYYY-MM-DD) instead of UTC to avoid "yesterday" due to timezone offset
    const [publishDate, setPublishDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [expiryDate, setExpiryDate] = useState('');
    const [publishImmediately, setPublishImmediately] = useState(true);
    const [sendEmailNotification, setSendEmailNotification] = useState(false);
    const [sendPushNotification, setSendPushNotification] = useState(true);

    // Event-specific: Image upload
    const [eventImage, setEventImage] = useState<File | null>(null);
    const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);

    // Maintenance-specific: Date/time fields
    const [maintenanceStartDate, setMaintenanceStartDate] = useState('');
    const [maintenanceStartTime, setMaintenanceStartTime] = useState('');
    const [maintenanceEndDate, setMaintenanceEndDate] = useState('');
    const [maintenanceEndTime, setMaintenanceEndTime] = useState('');


    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setEventImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEventImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 1
    });

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

        // Validate maintenance fields
        if (type === 'maintenance') {
            if (!maintenanceStartDate || !maintenanceStartTime || !maintenanceEndDate || !maintenanceEndTime) {
                toast.error('Maintenance start and end date/time are required');
                return;
            }
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
                // Pass maintenance window info for maintenance type
                maintenanceStartDateTime: type === 'maintenance'
                    ? new Date(`${maintenanceStartDate}T${maintenanceStartTime}`).toISOString()
                    : undefined,
                maintenanceEndDateTime: type === 'maintenance'
                    ? new Date(`${maintenanceEndDate}T${maintenanceEndTime}`).toISOString()
                    : undefined,
                // maintenanceAllowedRoles removed
                // For events, we would upload the image (simplified for now)
                hasEventImage: type === 'event' && eventImage !== null,
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
        setEventImage(null);
        setEventImagePreview(null);
        setMaintenanceStartDate('');
        setMaintenanceStartTime('');
        setMaintenanceEndDate('');
        setMaintenanceEndTime('');

    };

    const removeImage = () => {
        setEventImage(null);
        setEventImagePreview(null);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] bg-white border-green-200 flex flex-col overflow-hidden">
                <DialogHeader className="border-b border-green-100 pb-4 shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-green-800">
                        <div className="p-2 rounded-lg bg-green-100">
                            <Megaphone className="h-5 w-5 text-green-600" />
                        </div>
                        Create Announcement
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4 overflow-y-auto">
                    <div className="space-y-6 py-2">
                        {/* Title */}
                        <div>
                            <Label className="text-gray-700 font-medium">Title <span className="text-red-500">*</span></Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter announcement title"
                                className="mt-1.5 border-gray-200 focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <Label className="text-gray-700 font-medium">Content <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your announcement content..."
                                className="mt-1.5 border-gray-200 focus:border-green-500 focus:ring-green-500"
                                rows={4}
                            />
                        </div>

                        {/* Type and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-700 font-medium">Type</Label>
                                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                                    <SelectTrigger className="mt-1.5 border-gray-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ANNOUNCEMENT_TYPES.filter(t =>
                                            // Only show maintenance option to admins
                                            t.value !== 'maintenance' || userRole === 'admin'
                                        ).map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                <span className={t.color}>{t.label}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-gray-700 font-medium">Priority</Label>
                                <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                                    <SelectTrigger className="mt-1.5 border-gray-200">
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

                        {/* Event Image Upload - Only shown for event type */}
                        {type === 'event' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <ImagePlus className="h-4 w-4 text-purple-600" />
                                    <Label className="text-gray-700 font-medium">Event Image</Label>
                                </div>

                                {eventImagePreview ? (
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-purple-200">
                                        <img
                                            src={eventImagePreview}
                                            alt="Event preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                                        >
                                            <X className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        {...getRootProps()}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                                            }`}
                                    >
                                        <input {...getInputProps()} />
                                        <ImagePlus className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-600">
                                            {isDragActive ? 'Drop the image here...' : 'Drag & drop an image, or click to select'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Max file size: 10MB • JPG, PNG, GIF, WebP</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Maintenance Settings - Only shown for maintenance type */}
                        {type === 'maintenance' && (
                            <div className="space-y-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
                                <div className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-orange-600" />
                                    <Label className="text-orange-800 font-medium">Maintenance Window & Access Control</Label>
                                </div>

                                <Alert className="bg-orange-100 border-orange-300">
                                    <Info className="h-4 w-4 text-orange-600" />
                                    <AlertDescription className="text-orange-800 text-sm">
                                        <strong>Important:</strong> Users selected in "Target Audience" below will be <strong>BLOCKED</strong> from accessing the system during this window.
                                        Admins are never blocked.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-orange-700 flex items-center gap-1.5 mb-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Start Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="date"
                                            value={maintenanceStartDate}
                                            onChange={(e) => setMaintenanceStartDate(e.target.value)}
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-orange-700 flex items-center gap-1.5 mb-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            Start Time <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="time"
                                            value={maintenanceStartTime}
                                            onChange={(e) => setMaintenanceStartTime(e.target.value)}
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-orange-700 flex items-center gap-1.5 mb-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            End Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="date"
                                            value={maintenanceEndDate}
                                            onChange={(e) => setMaintenanceEndDate(e.target.value)}
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-orange-700 flex items-center gap-1.5 mb-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            End Time <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="time"
                                            value={maintenanceEndTime}
                                            onChange={(e) => setMaintenanceEndTime(e.target.value)}
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Target Audience */}
                        <div>
                            <Label className="text-gray-700 font-medium mb-3 block">
                                {type === 'maintenance' ? 'Blocked Roles (Who should be blocked?)' : 'Target Audience'}
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {AUDIENCE_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleAudienceChange(option.value)}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${targetAudience.includes(option.value)
                                            ? 'border-green-600 bg-green-50 text-green-700'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-green-300 hover:bg-green-50/50'
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
                                    className="border-green-300 data-[state=checked]:bg-green-600"
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
                                            className="mt-1 border-gray-200"
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
                                        className="mt-1 border-gray-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notification Options */}
                        <div className="space-y-3">
                            <Label className="text-gray-700 font-medium">Notification Options</Label>
                            <div className="space-y-2 pl-2">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="sendEmail"
                                        checked={sendEmailNotification}
                                        onCheckedChange={(checked) => setSendEmailNotification(!!checked)}
                                        className="border-green-300 data-[state=checked]:bg-green-600"
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
                                        className="border-green-300 data-[state=checked]:bg-green-600"
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
                <div className="flex justify-end gap-3 pt-4 border-t border-green-100 shrink-0 mt-auto">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !title || !content}
                        className="bg-green-600 hover:bg-green-700 text-white px-6"
                    >
                        {loading ? 'Creating...' : publishImmediately ? 'Publish Now' : 'Schedule'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
