"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader, EcoCard, EcoCardContent } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    MessageSquare,
    Search,
    Star,
    MoreHorizontal,
    Eye,
    Flag,
    CheckCircle,
    RefreshCw,
    TrendingUp,
} from "lucide-react";
import {
    getFeedback,
    getFeedbackStats,
    getCollectorPerformance,
} from "@/lib/actions/feedback";
import { ViewFeedbackModal } from "@/components/staff/ViewFeedbackModal";
import { format } from "date-fns";

interface Feedback {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    is_flagged: boolean;
    staff_response: string | null;
    client: {
        id: string;
        full_name: string;
        email: string;
    } | null;
    collector: {
        id: string;
        full_name: string;
    } | null;
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
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [collectors, setCollectors] = useState<CollectorPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
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
    }, [ratingFilter, statusFilter, pagination.page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [feedbackResult, statsResult, performanceResult] = await Promise.all([
                getFeedback({
                    search: searchQuery || undefined,
                    status: (ratingFilter === 'all' ? undefined : (statusFilter === 'positive' ? undefined : statusFilter)) as 'new' | 'reviewed' | 'responded' | 'flagged' | 'all' | undefined,
                    page: pagination.page,
                    limit: pagination.limit,
                }),
                getFeedbackStats(),
                getCollectorPerformance(),
            ]);

            if (feedbackResult.success && feedbackResult.data) {
                setFeedbackList(feedbackResult.data.feedback || []);
                setPagination((prev) => ({
                    ...prev,
                    total: feedbackResult.data?.total || 0,
                    totalPages: feedbackResult.data?.totalPages || 0,
                }));
            }

            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }

            if (performanceResult.success && performanceResult.data) {
                setCollectors(performanceResult.data);
            }
        } catch (error) {
            toast.error("Failed to load feedback");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = useCallback(() => {
        loadData();
    }, [ratingFilter, statusFilter, pagination.page]);

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadData();
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-neutral-200"
                            }`}
                    />
                ))}
            </div>
        );
    };

    const getRatingBadge = (rating: number) => {
        if (rating >= 4) return "bg-green-100 text-green-700";
        if (rating >= 3) return "bg-amber-100 text-amber-700";
        return "bg-red-100 text-red-700";
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="User Feedback"
                description="View and manage feedback from service users."
            >
                <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Total Feedback</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.total || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Star className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Average Rating</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.averageRating?.toFixed(1) || "0.0"}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Flag className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">Needs Attention</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.pendingReview || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>

                <EcoCard>
                    <EcoCardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm">This Month</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {stats?.thisMonth || 0}
                                </p>
                            </div>
                        </div>
                    </EcoCardContent>
                </EcoCard>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters */}
                    <EcoCard>
                        <EcoCardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <Input
                                        placeholder="Search feedback..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ratings</SelectItem>
                                        <SelectItem value="positive">Positive (4-5)</SelectItem>
                                        <SelectItem value="neutral">Neutral (3)</SelectItem>
                                        <SelectItem value="negative">Negative (1-2)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="responded">Responded</SelectItem>
                                        <SelectItem value="flagged">Flagged</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </EcoCardContent>
                    </EcoCard>

                    {/* Feedback Table */}
                    <EcoCard>
                        <EcoCardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                                </div>
                            ) : feedbackList.length === 0 ? (
                                <div className="text-center py-20">
                                    <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                        No feedback found
                                    </h3>
                                    <p className="text-neutral-500">
                                        Feedback from users will appear here
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Rating</TableHead>
                                            <TableHead>Comment</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Collector</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {feedbackList.map((feedback) => (
                                            <TableRow key={feedback.id}>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {renderStars(feedback.rating)}
                                                        <Badge
                                                            className={getRatingBadge(feedback.rating)}
                                                        >
                                                            {feedback.rating}/5
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-neutral-900 line-clamp-2 max-w-xs">
                                                        {feedback.comment || "No comment provided"}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="text-neutral-900 font-medium">
                                                            {feedback.client?.full_name || "Unknown"}
                                                        </p>
                                                        <p className="text-neutral-500">
                                                            {feedback.client?.email || ""}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-neutral-900">
                                                        {feedback.collector?.full_name || "No collector"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-neutral-600 text-sm">
                                                        {format(
                                                            new Date(feedback.created_at),
                                                            "MMM dd, yyyy"
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {feedback.is_flagged ? (
                                                        <Badge className="bg-red-100 text-red-700">
                                                            <Flag className="h-3 w-3 mr-1" />
                                                            Flagged
                                                        </Badge>
                                                    ) : feedback.staff_response ? (
                                                        <Badge className="bg-green-100 text-green-700">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Responded
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-amber-100 text-amber-700">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedFeedback(feedback);
                                                                    setShowViewModal(true);
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </EcoCardContent>
                    </EcoCard>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <Button
                                variant="outline"
                                disabled={pagination.page === 1}
                                onClick={() =>
                                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                                }
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4 text-neutral-500">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() =>
                                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                                }
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar: Collector Performance */}
                <div className="space-y-6">
                    <EcoCard>
                        <EcoCardContent className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-primary-600" />
                                <h3 className="font-semibold text-neutral-900">
                                    Top Collectors
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {collectors.slice(0, 5).map((collector, index) => (
                                    <div
                                        key={collector.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50"
                                    >
                                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-900 truncate">
                                                {collector.name}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {collector.totalFeedback} reviews
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-medium text-neutral-900">
                                                {collector.averageRating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {collectors.length === 0 && (
                                    <p className="text-sm text-neutral-500 text-center py-4">
                                        No collector data available
                                    </p>
                                )}
                            </div>
                        </EcoCardContent>
                    </EcoCard>
                </div>
            </div>

            {/* View Feedback Modal */}
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
