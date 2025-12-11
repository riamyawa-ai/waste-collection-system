"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Megaphone,
    Info,
    AlertTriangle,
    CheckCircle2,
    Wrench,
    Calendar as CalendarIcon,
    Filter,
    Search,
    Clock,
    Pin,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getClientAnnouncements } from "@/lib/actions/client";
import React from "react";

type AnnouncementType = "info" | "success" | "warning" | "error" | "maintenance" | "event";
type AnnouncementPriority = "normal" | "important" | "urgent";

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    priority: AnnouncementPriority;
    publish_date: string;
    expiry_date: string;
    is_published: boolean;
    image_url: string | null;
    target_audience: string[];
    created_at: string;
}

const typeConfig: Record<AnnouncementType, { icon: React.ElementType; className: string; label: string }> = {
    info: {
        icon: Info,
        className: "bg-blue-100 text-blue-700 border-blue-200",
        label: "Information",
    },
    success: {
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700 border-green-200",
        label: "Success",
    },
    warning: {
        icon: AlertTriangle,
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        label: "Warning",
    },
    error: {
        icon: AlertTriangle,
        className: "bg-red-100 text-red-700 border-red-200",
        label: "Alert",
    },
    maintenance: {
        icon: Wrench,
        className: "bg-orange-100 text-orange-700 border-orange-200",
        label: "Maintenance",
    },
    event: {
        icon: CalendarIcon,
        className: "bg-purple-100 text-purple-700 border-purple-200",
        label: "Event",
    },
};

const priorityConfig: Record<AnnouncementPriority, { className: string; label: string }> = {
    normal: { className: "bg-neutral-100 text-neutral-600", label: "Normal" },
    important: { className: "bg-blue-100 text-blue-700", label: "Important" },
    urgent: { className: "bg-red-100 text-red-700", label: "Urgent" },
};

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnnouncements = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getClientAnnouncements({
                type: typeFilter === "all" ? undefined : typeFilter,
                search: searchQuery || undefined,
            });

            if (result.success && result.data) {
                setAnnouncements(result.data as Announcement[]);
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
        } finally {
            setIsLoading(false);
        }
    }, [typeFilter, searchQuery]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAnnouncements();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchAnnouncements]);

    // Sort: urgent first, then by date
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        const priorityOrder = { urgent: 0, important: 1, normal: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
    });

    const handleViewAnnouncement = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
                        Service Announcements
                    </h1>
                    <p className="text-neutral-500">
                        Stay updated with the latest news and service updates.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAnnouncements}
                    disabled={isLoading}
                >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-neutral-200">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Search announcements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="info">Information</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="event">Event</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Announcements List */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                                <div className="h-4 bg-neutral-100 rounded w-1/2 mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-20 bg-neutral-100 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : sortedAnnouncements.length === 0 ? (
                <Card className="border-neutral-200">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Megaphone className="h-12 w-12 text-neutral-300 mb-4" />
                        <p className="text-neutral-500">No announcements found</p>
                        <p className="text-sm text-neutral-400 mt-1">
                            Check back later for updates and news.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {sortedAnnouncements.map((announcement) => {
                        const TypeIcon = typeConfig[announcement.type]?.icon || Info;
                        return (
                            <Card
                                key={announcement.id}
                                className={cn(
                                    "border-neutral-200 hover:shadow-md transition-all cursor-pointer",
                                    announcement.priority === "urgent" && "border-l-4 border-l-red-500",
                                    announcement.priority === "important" && "border-l-4 border-l-blue-500"
                                )}
                                onClick={() => handleViewAnnouncement(announcement)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {announcement.priority === "urgent" && (
                                                <Pin className="h-4 w-4 text-red-600" />
                                            )}
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", typeConfig[announcement.type]?.className)}
                                            >
                                                <TypeIcon className="h-3 w-3 mr-1" />
                                                {typeConfig[announcement.type]?.label || announcement.type}
                                            </Badge>
                                            {announcement.priority !== "normal" && (
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-xs", priorityConfig[announcement.priority]?.className)}
                                                >
                                                    {priorityConfig[announcement.priority]?.label}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg mt-2 line-clamp-2">
                                        {announcement.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-neutral-600 line-clamp-3">
                                        {announcement.content}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <Clock className="h-3 w-3" />
                                        {new Date(announcement.publish_date).toLocaleDateString()}
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Announcement Detail Modal */}
            <Dialog
                open={!!selectedAnnouncement}
                onOpenChange={(open) => !open && setSelectedAnnouncement(null)}
            >
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    {selectedAnnouncement && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <Badge
                                        variant="outline"
                                        className={cn(typeConfig[selectedAnnouncement.type]?.className)}
                                    >
                                        {React.createElement(typeConfig[selectedAnnouncement.type]?.icon || Info, {
                                            className: "h-3 w-3 mr-1",
                                        })}
                                        {typeConfig[selectedAnnouncement.type]?.label}
                                    </Badge>
                                    {selectedAnnouncement.priority !== "normal" && (
                                        <Badge
                                            variant="outline"
                                            className={cn(priorityConfig[selectedAnnouncement.priority]?.className)}
                                        >
                                            {priorityConfig[selectedAnnouncement.priority]?.label}
                                        </Badge>
                                    )}
                                </div>
                                <DialogTitle className="text-xl">
                                    {selectedAnnouncement.title}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        Published: {new Date(selectedAnnouncement.publish_date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        Expires: {new Date(selectedAnnouncement.expiry_date).toLocaleDateString()}
                                    </span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4">
                                <div className="prose prose-sm max-w-none text-neutral-700">
                                    <p className="whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedAnnouncement(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
