"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
    ChevronDown,
    Filter,
    X,
    RefreshCw,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    getClientNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearReadNotifications,
} from "@/lib/actions/client";

// Notification types as per SYSTEM-OVERVIEW Section 3.7
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
    metadata?: Record<string, string>;
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
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

interface NotificationsCenterProps {
    className?: string;
    role?: "client" | "staff" | "collector" | "admin";
}

export function NotificationsCenter({ className, role = "client" }: NotificationsCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<NotificationType | "all">("all");
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getClientNotifications(20);
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
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const filteredNotifications = notifications.filter(
        (n) => filter === "all" || n.type === filter
    );

    const handleMarkAsRead = useCallback(async (id: string) => {
        const result = await markNotificationAsRead(id);
        if (result.success) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        const result = await markAllNotificationsAsRead();
        if (result.success) {
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        }
    }, []);

    const handleClearRead = useCallback(async () => {
        const result = await clearReadNotifications();
        if (result.success) {
            setNotifications((prev) => prev.filter((n) => !n.is_read));
        }
    }, []);

    const handleDeleteNotification = useCallback(async (id: string) => {
        const result = await deleteNotification(id);
        if (result.success) {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }
    }, []);

    const handleNotificationClick = useCallback((notification: Notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            window.location.href = notification.link;
        }
        setIsOpen(false);
    }, [handleMarkAsRead]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("relative", className)}
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[380px] p-0"
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={fetchNotifications}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <Filter className="h-4 w-4 mr-1" />
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setFilter("all")}>
                                    All notifications
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("request_status_update")}>
                                    Request Updates
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("payment_verification")}>
                                    Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("collection_reminder")}>
                                    Reminders
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("system_announcement")}>
                                    Announcements
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-[350px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mb-3" />
                            <p className="text-sm text-neutral-500">Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <BellOff className="h-10 w-10 text-neutral-300 mb-3" />
                            <p className="text-sm text-neutral-500">No notifications</p>
                            <p className="text-xs text-neutral-400 mt-1">
                                You&apos;re all caught up!
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
                                            "flex gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors",
                                            !notification.is_read && "bg-primary-50/50"
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div
                                            className={cn(
                                                "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                                                typeConfig[notification.type]?.className || "bg-neutral-100 text-neutral-600"
                                            )}
                                        >
                                            <TypeIcon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className={cn(
                                                        "text-sm line-clamp-1",
                                                        !notification.is_read
                                                            ? "font-semibold text-neutral-900"
                                                            : "font-medium text-neutral-700"
                                                    )}
                                                >
                                                    {notification.title}
                                                </p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteNotification(notification.id);
                                                    }}
                                                    className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-neutral-500 line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-xs text-neutral-400">
                                                    {formatTimeAgo(notification.created_at)}
                                                </span>
                                                {!notification.is_read && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="flex items-center justify-between p-3 border-t bg-neutral-50">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                            className="text-xs h-8"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearRead}
                            className="text-xs h-8 text-neutral-500"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear read
                        </Button>
                    </div>
                    <Link
                        href={`/${role}/notifications`}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        onClick={() => setIsOpen(false)}
                    >
                        View All
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
