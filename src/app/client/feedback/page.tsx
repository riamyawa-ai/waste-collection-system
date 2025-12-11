"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Star,
    MessageSquare,
    User,
    ThumbsUp,
    Clock,
    RefreshCw,
    Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
    getPendingFeedback,
    getFeedbackHistory,
    submitFeedback,
} from "@/lib/actions/profile";

interface PendingFeedbackRequest {
    id: string;
    request_number: string;
    barangay: string;
    completed_at: string;
    assigned_collector: { full_name: string } | null;
}

interface FeedbackHistoryItem {
    id: string;
    overall_rating: number;
    comments: string | null;
    is_anonymous: boolean;
    status: string;
    created_at: string;
    request: { request_number: string } | null;
    collector: { full_name: string } | null;
}

function StarRating({ rating, onRatingChange, readonly = false }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
}) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    className={cn(
                        "transition-all",
                        readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
                    )}
                    onClick={() => onRatingChange?.(star)}
                    onMouseEnter={() => !readonly && setHoverRating(star)}
                    onMouseLeave={() => !readonly && setHoverRating(0)}
                >
                    <Star
                        className={cn(
                            "h-6 w-6 transition-colors",
                            (hoverRating || rating) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-neutral-300"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

export default function FeedbackPage() {
    const [pendingFeedback, setPendingFeedback] = useState<PendingFeedbackRequest[]>([]);
    const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Feedback form state
    const [selectedRequest, setSelectedRequest] = useState<PendingFeedbackRequest | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [pendingResult, historyResult] = await Promise.all([
                getPendingFeedback(),
                getFeedbackHistory(),
            ]);

            if (pendingResult.success && pendingResult.data) {
                // Transform the data to match expected interface
                const transformed = (pendingResult.data as Record<string, unknown>[]).map(item => ({
                    ...item,
                    assigned_collector: Array.isArray(item.assigned_collector)
                        ? item.assigned_collector[0] || null
                        : item.assigned_collector,
                }));
                setPendingFeedback(transformed as PendingFeedbackRequest[]);
            }
            if (historyResult.success && historyResult.data) {
                const transformed = (historyResult.data as Record<string, unknown>[]).map(item => ({
                    ...item,
                    request: Array.isArray(item.request) ? item.request[0] || null : item.request,
                    collector: Array.isArray(item.collector) ? item.collector[0] || null : item.collector,
                }));
                setFeedbackHistory(transformed as FeedbackHistoryItem[]);
            }
        } catch (error) {
            console.error("Error fetching feedback data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async () => {
        if (!selectedRequest || rating === 0) return;

        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const result = await submitFeedback({
                requestId: selectedRequest.id,
                rating,
                comment: comment || undefined,
                isAnonymous,
            });

            if (result.success) {
                setSubmitMessage({ type: 'success', text: 'Thank you for your feedback!' });
                // Reset form
                setSelectedRequest(null);
                setRating(0);
                setComment("");
                setIsAnonymous(false);
                // Refresh data
                fetchData();
            } else {
                setSubmitMessage({ type: 'error', text: result.error || 'Failed to submit feedback' });
            }
        } catch (_error) {
            setSubmitMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
        setRating(0);
        setComment("");
        setIsAnonymous(false);
        setSubmitMessage(null);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
                        Service Feedback
                    </h1>
                    <p className="text-neutral-500">
                        Rate your collection experiences and help us improve our service.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchData}
                    disabled={isLoading}
                >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Pending Feedback Section */}
            <Card className="border-neutral-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary-600" />
                        Pending Feedback
                    </CardTitle>
                    <CardDescription>
                        These completed collections are awaiting your feedback.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
                        </div>
                    ) : pendingFeedback.length === 0 ? (
                        <div className="text-center py-8">
                            <ThumbsUp className="h-12 w-12 mx-auto text-green-500 mb-4" />
                            <p className="text-neutral-500">All caught up!</p>
                            <p className="text-sm text-neutral-400 mt-1">
                                No pending feedback requests at this time.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {pendingFeedback.map((request) => (
                                <Card
                                    key={request.id}
                                    className="border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                Completed
                                            </Badge>
                                            <span className="text-xs text-neutral-500">
                                                {new Date(request.completed_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="font-semibold text-primary-600 mb-1">
                                            {request.request_number}
                                        </p>
                                        <p className="text-sm text-neutral-600 mb-2">
                                            {request.barangay}
                                        </p>
                                        {request.assigned_collector && (
                                            <div className="flex items-center gap-1 text-sm text-neutral-500">
                                                <User className="h-3 w-3" />
                                                {request.assigned_collector.full_name}
                                            </div>
                                        )}
                                        <Button
                                            size="sm"
                                            className="w-full mt-3 bg-primary-600 hover:bg-primary-700"
                                        >
                                            <Star className="h-4 w-4 mr-2" />
                                            Rate Service
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Feedback History Section */}
            <Card className="border-neutral-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary-600" />
                        Feedback History
                    </CardTitle>
                    <CardDescription>
                        Your previously submitted feedback.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
                        </div>
                    ) : feedbackHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                            <p className="text-neutral-500">No feedback submitted yet</p>
                            <p className="text-sm text-neutral-400 mt-1">
                                Your feedback history will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Request</TableHead>
                                        <TableHead>Collector</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead className="hidden md:table-cell">Comments</TableHead>
                                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedbackHistory.map((feedback) => (
                                        <TableRow key={feedback.id}>
                                            <TableCell className="font-medium text-primary-600">
                                                {feedback.request?.request_number || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {feedback.is_anonymous
                                                    ? <span className="text-neutral-400 italic">Anonymous</span>
                                                    : feedback.collector?.full_name || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={cn(
                                                                "h-4 w-4",
                                                                star <= feedback.overall_rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-neutral-300"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <p className="text-sm text-neutral-600 line-clamp-2 max-w-xs">
                                                    {feedback.comments || '—'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-neutral-500">
                                                {new Date(feedback.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Feedback Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary-600" />
                            Rate Your Experience
                        </DialogTitle>
                        <DialogDescription>
                            Share your feedback for {selectedRequest?.request_number}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6 py-4">
                            {submitMessage && (
                                <div className={cn(
                                    "p-3 rounded-lg text-sm",
                                    submitMessage.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                )}>
                                    {submitMessage.text}
                                </div>
                            )}

                            {/* Request Info */}
                            <div className="bg-neutral-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-neutral-500">Location</span>
                                        <p className="font-medium">{selectedRequest.barangay}</p>
                                    </div>
                                    <div>
                                        <span className="text-neutral-500">Completed</span>
                                        <p className="font-medium">
                                            {new Date(selectedRequest.completed_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {selectedRequest.assigned_collector && (
                                        <div className="col-span-2">
                                            <span className="text-neutral-500">Collector</span>
                                            <p className="font-medium">{selectedRequest.assigned_collector.full_name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="space-y-2">
                                <Label className="text-base font-medium">Overall Rating *</Label>
                                <div className="flex items-center gap-4">
                                    <StarRating rating={rating} onRatingChange={setRating} />
                                    <span className="text-sm text-neutral-500">
                                        {rating === 0 && "Select a rating"}
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Very Good"}
                                        {rating === 5 && "Excellent"}
                                    </span>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="space-y-2">
                                <Label htmlFor="comment">Comments (Optional)</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Share your experience with this collection service..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            {/* Anonymous Option */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="anonymous"
                                    checked={isAnonymous}
                                    onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                                />
                                <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                                    Submit feedback anonymously
                                </Label>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={rating === 0 || isSubmitting}
                            className="bg-primary-600 hover:bg-primary-700"
                        >
                            {isSubmitting ? "Submitting..." : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Feedback
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
