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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    MessageSquare,
    Star,
    User,
    Calendar,
    MapPin,
    Phone,
    Send,
    Flag,
    CheckCircle
} from 'lucide-react';
import { getFeedbackById, updateFeedback } from '@/lib/actions/feedback';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ViewFeedbackModalProps {
    open: boolean;
    onClose: () => void;
    feedbackId: string;
    onUpdate: () => void;
}

interface Feedback {
    id: string;
    overall_rating: number;
    comments: string | null;
    is_anonymous: boolean;
    status: string;
    staff_response: string | null;
    created_at: string;
    client: { id: string; full_name: string; email: string; phone: string } | null;
    collector: { id: string; full_name: string; phone: string; email: string } | null;
    request: {
        id: string;
        request_number: string;
        barangay: string;
        address: string;
        preferred_date: string;
        completed_at: string | null;
    } | null;
    responder: { id: string; full_name: string } | null;
    responded_at: string | null;
}

export function ViewFeedbackModal({ open, onClose, feedbackId, onUpdate }: ViewFeedbackModalProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [response, setResponse] = useState('');

    useEffect(() => {
        if (open && feedbackId) {
            loadFeedback();
        }
    }, [open, feedbackId]);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const result = await getFeedbackById(feedbackId);
            if (result.success && result.data) {
                setFeedback(result.data);
                setResponse(result.data.staff_response || '');
            }
        } catch (error) {
            console.error('Failed to load feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitResponse = async () => {
        if (!response.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setSubmitting(true);
        try {
            const result = await updateFeedback({
                id: feedbackId,
                staffResponse: response,
            });

            if (result.success) {
                toast.success('Response submitted successfully');
                onUpdate();
                loadFeedback();
            } else {
                toast.error(result.error || 'Failed to submit response');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-6 w-6 ${star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            reviewed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            responded: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            flagged: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return styles[status] || styles.new;
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-amber-400" />
                        Feedback Details
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
                    </div>
                ) : feedback ? (
                    <ScrollArea className="max-h-[70vh] pr-4">
                        <div className="space-y-6">
                            {/* Rating and Status */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    {renderStars(feedback.overall_rating)}
                                    <p className="text-slate-400 text-sm">
                                        {feedback.overall_rating} out of 5 stars
                                    </p>
                                </div>
                                <Badge className={getStatusBadge(feedback.status)}>
                                    {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                                </Badge>
                            </div>

                            {/* Client Info */}
                            <div className="bg-slate-700/50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Client
                                </h4>
                                {feedback.is_anonymous ? (
                                    <p className="text-white italic">Anonymous Feedback</p>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-white font-medium">{feedback.client?.full_name}</p>
                                        <p className="text-slate-400 text-sm">{feedback.client?.email}</p>
                                        {feedback.client?.phone && (
                                            <p className="text-slate-400 text-sm flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {feedback.client.phone}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Collector Info */}
                            <div className="bg-slate-700/50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Collector
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-white font-medium">{feedback.collector?.full_name}</p>
                                    <p className="text-slate-400 text-sm">{feedback.collector?.email}</p>
                                    {feedback.collector?.phone && (
                                        <p className="text-slate-400 text-sm flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {feedback.collector.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Request Info */}
                            {feedback.request && (
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-slate-400 mb-3">Related Request</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-400">Request Number</p>
                                            <p className="text-white font-mono">{feedback.request.request_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400">Completed</p>
                                            <p className="text-white">
                                                {feedback.request.completed_at
                                                    ? format(new Date(feedback.request.completed_at), 'MMM dd, yyyy')
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-slate-400">Location</p>
                                            <p className="text-white flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {feedback.request.address}, {feedback.request.barangay}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Comments */}
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-2">Client Comments</h4>
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <p className="text-slate-300 whitespace-pre-wrap">
                                        {feedback.comments || 'No comments provided'}
                                    </p>
                                </div>
                            </div>

                            <Separator className="bg-slate-700" />

                            {/* Staff Response Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                    <Send className="h-4 w-4 text-purple-400" />
                                    Staff Response
                                </h4>

                                {feedback.staff_response ? (
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                        <p className="text-slate-300 whitespace-pre-wrap mb-3">
                                            {feedback.staff_response}
                                        </p>
                                        <div className="text-xs text-slate-500">
                                            <p>Responded by {feedback.responder?.full_name || 'Unknown'}</p>
                                            {feedback.responded_at && (
                                                <p>on {format(new Date(feedback.responded_at), 'MMM dd, yyyy \'at\' h:mm a')}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            placeholder="Write a response to this feedback..."
                                            className="bg-slate-700/50 border-slate-600 text-white"
                                            rows={4}
                                        />
                                        <Button
                                            onClick={handleSubmitResponse}
                                            disabled={submitting || !response.trim()}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {submitting ? 'Submitting...' : 'Submit Response'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div className="text-xs text-slate-500 pt-4 border-t border-slate-700">
                                <p className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Feedback submitted on {format(new Date(feedback.created_at), 'MMM dd, yyyy \'at\' h:mm a')}
                                </p>
                            </div>
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-400">Feedback not found</p>
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
