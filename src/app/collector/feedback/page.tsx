'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Star, MessageSquare, User } from 'lucide-react';

interface Feedback {
    id: string;
    overall_rating: number;
    comments: string | null;
    is_anonymous: boolean;
    created_at: string;
    request: { request_number: string } | null;
    client: { full_name: string } | null;
}

interface RatingBreakdown {
    [key: number]: number;
}

export default function CollectorFeedbackPage() {
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalFeedback, setTotalFeedback] = useState(0);
    const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            const supabase = createBrowserClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('feedback')
                .select(`
          id, overall_rating, comments, is_anonymous, created_at,
          request:collection_requests(request_number),
          client:profiles!feedback_client_id_fkey(full_name)
        `)
                .eq('collector_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setFeedbackList(data as unknown as Feedback[]);
                setTotalFeedback(data.length);

                if (data.length > 0) {
                    const sum = data.reduce((acc, f) => acc + f.overall_rating, 0);
                    setAverageRating(Math.round((sum / data.length) * 10) / 10);

                    const breakdown: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                    data.forEach(f => { breakdown[f.overall_rating] = (breakdown[f.overall_rating] || 0) + 1; });
                    setRatingBreakdown(breakdown);
                }
            }
            setIsLoading(false);
        };

        fetchFeedback();
    }, []);

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="My Feedback" description="View feedback received from clients" />

            {/* Overview Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-green-600 mb-2">{averageRating.toFixed(1)}</div>
                            <div className="flex justify-center mb-2">{renderStars(Math.round(averageRating))}</div>
                            <p className="text-sm text-gray-500">Average Rating</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-blue-600 mb-2">{totalFeedback}</div>
                            <p className="text-sm text-gray-500">Total Feedback Received</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Rating Breakdown</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = ratingBreakdown[rating] || 0;
                                const percentage = totalFeedback > 0 ? (count / totalFeedback) * 100 : 0;
                                return (
                                    <div key={rating} className="flex items-center gap-2">
                                        <span className="w-4 text-sm">{rating}</span>
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        <Progress value={percentage} className="flex-1 h-2" />
                                        <span className="w-8 text-xs text-gray-500">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Feedback List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        Recent Feedback
                    </CardTitle>
                    <CardDescription>Last 10 feedback entries</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : feedbackList.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No feedback received yet</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px]">
                            <div className="space-y-4">
                                {feedbackList.map(feedback => (
                                    <div key={feedback.id} className="p-4 rounded-lg border bg-gray-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{feedback.is_anonymous ? 'Anonymous' : feedback.client?.full_name || 'Client'}</p>
                                                    <p className="text-xs text-gray-500">Request: {feedback.request?.request_number}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {renderStars(feedback.overall_rating)}
                                                <p className="text-xs text-gray-500 mt-1">{format(new Date(feedback.created_at), 'MMM d, yyyy')}</p>
                                            </div>
                                        </div>
                                        {feedback.comments && (
                                            <p className="text-gray-600 text-sm bg-white p-3 rounded border">&ldquo;{feedback.comments}&rdquo;</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
