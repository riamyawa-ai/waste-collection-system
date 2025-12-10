'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Search,
    Star,
    Filter,
    MoreHorizontal,
    Eye,
    Flag,
    CheckCircle,
    RefreshCw,
    BarChart3,
    TrendingUp,
    Users,
    Calendar
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
    getFeedback,
    getFeedbackStats,
    markFeedbackAsReviewed,
    flagFeedback,
    getCollectorPerformance
} from '@/lib/actions/feedback';
import { ViewFeedbackModal } from '@/components/staff/ViewFeedbackModal';
import { format } from 'date-fns';

interface Feedback {
    id: string;
    overall_rating: number;
    comments: string | null;
    is_anonymous: boolean;
    status: string;
    created_at: string;
    client: { id: string; full_name: string; email: string } | null;
    collector: { id: string; full_name: string; phone: string } | null;
    request: { id: string; request_number: string; barangay: string } | null;
}

interface Stats {
    total: number;
    averageRating: number;
    pendingReview: number;
    thisMonth: number;
    ratingDistribution: Record<number, number>;
}

interface CollectorPerformance {
    id: string;
    name: string;
    totalFeedback: number;
    averageRating: number;
    completedCollections: number;
}

export default function FeedbackPage() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [performance, setPerformance] = useState<CollectorPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState<string>('all');
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        loadData();
    }, [statusFilter, ratingFilter, pagination.page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [feedbackResult, statsResult, performanceResult] = await Promise.all([
                getFeedback({
                    status: statusFilter as 'new' | 'reviewed' | 'responded' | 'flagged' | 'all',
                    rating: ratingFilter !== 'all' ? parseInt(ratingFilter) : undefined,
                    page: pagination.page,
                    limit: pagination.limit,
                }),
                getFeedbackStats(),
                getCollectorPerformance(),
            ]);

            if (feedbackResult.success && feedbackResult.data) {
                setFeedback(feedbackResult.data.feedback || []);
                setPagination(prev => ({
                    ...prev,
                    total: feedbackResult.data?.total || 0,
                    totalPages: feedbackResult.data?.totalPages || 0,
                }));
            }

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }

            if (performanceResult.success && performanceResult.data) {
                setPerformance(performanceResult.data);
            }
        } catch (error) {
            toast.error('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReviewed = async (feedbackId: string) => {
        const result = await markFeedbackAsReviewed(feedbackId);
        if (result.success) {
            toast.success('Marked as reviewed');
            loadData();
        } else {
            toast.error(result.error || 'Failed to update');
        }
    };

    const handleFlag = async (feedbackId: string) => {
        const result = await flagFeedback(feedbackId);
        if (result.success) {
            toast.success('Feedback flagged for follow-up');
            loadData();
        } else {
            toast.error(result.error || 'Failed to flag');
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Feedback Management</h1>
                        <p className="text-slate-400 mt-1">Review and manage user feedback</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={loadData}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
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
                                        <MessageSquare className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Total Feedback</p>
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
                                    <div className="p-2 bg-amber-500/20 rounded-lg">
                                        <Star className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Average Rating</p>
                                        <p className="text-2xl font-bold text-white">{stats?.averageRating || 0}</p>
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
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Eye className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Pending Review</p>
                                        <p className="text-2xl font-bold text-white">{stats?.pendingReview || 0}</p>
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
                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                        <Calendar className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">This Month</p>
                                        <p className="text-2xl font-bold text-white">{stats?.thisMonth || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Feedback List */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Filters */}
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search feedback..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-36 bg-slate-700/50 border-slate-600 text-white">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="reviewed">Reviewed</SelectItem>
                                            <SelectItem value="responded">Responded</SelectItem>
                                            <SelectItem value="flagged">Flagged</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                        <SelectTrigger className="w-full sm:w-36 bg-slate-700/50 border-slate-600 text-white">
                                            <SelectValue placeholder="Rating" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Ratings</SelectItem>
                                            <SelectItem value="5">5 Stars</SelectItem>
                                            <SelectItem value="4">4 Stars</SelectItem>
                                            <SelectItem value="3">3 Stars</SelectItem>
                                            <SelectItem value="2">2 Stars</SelectItem>
                                            <SelectItem value="1">1 Star</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feedback Table */}
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
                                    </div>
                                ) : feedback.length === 0 ? (
                                    <div className="text-center py-20">
                                        <MessageSquare className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-white mb-2">No feedback found</h3>
                                        <p className="text-slate-400">Feedback will appear here when clients submit reviews</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-700 hover:bg-transparent">
                                                <TableHead className="text-slate-400">Date</TableHead>
                                                <TableHead className="text-slate-400">Client</TableHead>
                                                <TableHead className="text-slate-400">Collector</TableHead>
                                                <TableHead className="text-slate-400">Rating</TableHead>
                                                <TableHead className="text-slate-400">Status</TableHead>
                                                <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {feedback.map((item) => (
                                                <TableRow
                                                    key={item.id}
                                                    className="border-slate-700 hover:bg-slate-700/30"
                                                >
                                                    <TableCell>
                                                        <p className="text-white text-sm">
                                                            {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-white">
                                                            {item.is_anonymous ? 'Anonymous' : item.client?.full_name || 'Unknown'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-white">{item.collector?.full_name || 'Unknown'}</p>
                                                    </TableCell>
                                                    <TableCell>{renderStars(item.overall_rating)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadge(item.status)}>
                                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                        </Badge>
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
                                                                        setSelectedFeedback(item);
                                                                        setShowViewModal(true);
                                                                    }}
                                                                    className="text-slate-300 hover:bg-slate-700"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                {item.status === 'new' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleMarkReviewed(item.id)}
                                                                        className="text-emerald-400 hover:bg-slate-700"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Mark Reviewed
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator className="bg-slate-700" />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleFlag(item.id)}
                                                                    className="text-red-400 hover:bg-slate-700"
                                                                >
                                                                    <Flag className="h-4 w-4 mr-2" />
                                                                    Flag for Follow-up
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
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

                    {/* Collector Performance Sidebar */}
                    <div className="space-y-4">
                        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-amber-400" />
                                    Top Performers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {performance.length === 0 ? (
                                    <p className="text-slate-400 text-sm text-center py-4">No data available</p>
                                ) : (
                                    <div className="space-y-4">
                                        {performance.slice(0, 5).map((collector, index) => (
                                            <div key={collector.id} className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-500/20 text-amber-400' :
                                                        index === 1 ? 'bg-slate-400/20 text-slate-300' :
                                                            index === 2 ? 'bg-orange-600/20 text-orange-400' :
                                                                'bg-slate-600/20 text-slate-400'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{collector.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(Math.round(collector.averageRating))}
                                                        <span className="text-slate-400 text-sm">
                                                            ({collector.totalFeedback})
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-white">{collector.averageRating}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rating Distribution */}
                        {stats?.ratingDistribution && (
                            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-white flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                                        Rating Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            const count = stats.ratingDistribution[rating] || 0;
                                            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                            return (
                                                <div key={rating} className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 w-16">
                                                        <span className="text-white text-sm">{rating}</span>
                                                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                    </div>
                                                    <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-slate-400 text-sm w-10 text-right">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {selectedFeedback && (
                <ViewFeedbackModal
                    open={showViewModal}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedFeedback(null);
                    }}
                    feedbackId={selectedFeedback.id}
                    onUpdate={loadData}
                />
            )}
        </div>
    );
}
