"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Clock,
    CreditCard,
    FileText,
    Megaphone,
    MessageSquare,
    Trash2,
    Truck,
    Calendar,
    Filter,
    RefreshCw,
    X,
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    getClientNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearReadNotifications,
} from "@/lib/actions/client";

type NotificationType =
    | "request_status_update"
    | "payment_verification"
    | "collector_assignment"
    | "collection_reminder"
    | "collection_complete"
    | "feedback_request"
    | "schedule_change"
    | "system_announcement";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
    link?: string;
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; className: string; label: string }> = {
    request_status_update: {
        icon: FileText,
        className: "bg-blue-100 text-blue-600",
        label: "Request Update",
    },
    payment_verification: {
        icon: CreditCard,
        className: "bg-green-100 text-green-600",
        label: "Payment",
    },
    collector_assignment: {
        icon: Truck,
        className: "bg-purple-100 text-purple-600",
        label: "Assignment",
    },
    collection_reminder: {
        icon: Clock,
        className: "bg-yellow-100 text-yellow-600",
        label: "Reminder",
    },
    collection_complete: {
        icon: CheckCheck,
        className: "bg-green-100 text-green-600",
        label: "Completed",
    },
    feedback_request: {
        icon: MessageSquare,
        className: "bg-orange-100 text-orange-600",
        label: "Feedback",
    },
    schedule_change: {
        icon: Calendar,
        className: "bg-indigo-100 text-indigo-600",
        label: "Schedule",
    },
    system_announcement: {
        icon: Megaphone,
        className: "bg-primary-100 text-primary-600",
        label: "Announcement",
    },
};

function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getClientNotifications(50);
            if (result.success && result.data) {
                setNotifications(result.data as Notification[]);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.is_read;
        return n.type === filter;
    });

    const handleMarkAsRead = async (id: string) => {
        const result = await markNotificationAsRead(id);
        if (result.success) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        }
    };

    const handleMarkAllAsRead = async () => {
        const result = await markAllNotificationsAsRead();
        if (result.success) {
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        }
    };

    const handleDeleteNotification = async (id: string) => {
        const result = await deleteNotification(id);
        if (result.success) {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }
    };

    const handleClearRead = async () => {
        const result = await clearReadNotifications();
        if (result.success) {
            setNotifications((prev) => prev.filter((n) => !n.is_read));
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    return (
        <DashboardLayout role="client">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
                            Notifications
                        </h1>
                        <p className="text-neutral-500">
                            Stay updated with your collection requests and announcements.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                                {unreadCount} unread
                            </Badge>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchNotifications}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Filters and Actions */}
                <Card className="border-neutral-200">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter notifications" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Notifications</SelectItem>
                                    <SelectItem value="unread">Unread Only</SelectItem>
                                    <SelectItem value="request_status_update">Request Updates</SelectItem>
                                    <SelectItem value="payment_verification">Payment</SelectItem>
                                    <SelectItem value="collection_reminder">Reminders</SelectItem>
                                    <SelectItem value="system_announcement">Announcements</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    disabled={unreadCount === 0}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark All Read
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearRead}
                                    className="text-neutral-500"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear Read
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications List */}
                <Card className="border-neutral-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary-600" />
                            All Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                <BellOff className="h-12 w-12 text-neutral-300 mb-4" />
                                <p className="text-neutral-500">No notifications</p>
                                <p className="text-sm text-neutral-400 mt-1">
                                    {filter === "unread"
                                        ? "You're all caught up!"
                                        : "Notifications will appear here when you receive them."}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredNotifications.map((notification) => {
                                    const TypeIcon = typeConfig[notification.type]?.icon || Bell;
                                    return (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "flex gap-4 p-4 cursor-pointer hover:bg-neutral-50 transition-colors",
                                                !notification.is_read && "bg-primary-50/50"
                                            )}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div
                                                className={cn(
                                                    "flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center",
                                                    typeConfig[notification.type]?.className || "bg-neutral-100 text-neutral-600"
                                                )}
                                            >
                                                <TypeIcon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <p
                                                            className={cn(
                                                                "text-base",
                                                                !notification.is_read
                                                                    ? "font-semibold text-neutral-900"
                                                                    : "font-medium text-neutral-700"
                                                            )}
                                                        >
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <div className="h-2 w-2 rounded-full bg-primary-500" />
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteNotification(notification.id);
                                                        }}
                                                        className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-neutral-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-xs",
                                                            typeConfig[notification.type]?.className
                                                        )}
                                                    >
                                                        {typeConfig[notification.type]?.label || notification.type}
                                                    </Badge>
                                                    <span className="text-xs text-neutral-400">
                                                        {formatTimeAgo(notification.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
