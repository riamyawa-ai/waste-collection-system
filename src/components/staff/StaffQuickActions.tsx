"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Users,
    FileText,
    Calendar,
    MessageSquare,
    CreditCard,
    Megaphone,
} from "lucide-react";
import { getQuickActionCounts } from "@/lib/actions/staff";

interface QuickAction {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    badgeKey?: "pendingRequests" | "pendingPayments" | "unreadFeedback";
    variant?: "default" | "primary" | "secondary";
}

const quickActions: QuickAction[] = [
    {
        title: "Manage Users",
        description: "View and manage all users",
        href: "/staff/users",
        icon: Users,
        variant: "default",
    },
    {
        title: "Process Requests",
        description: "Review pending requests",
        href: "/staff/collections",
        icon: FileText,
        badgeKey: "pendingRequests",
        variant: "primary",
    },
    {
        title: "Set Schedule",
        description: "Create collection schedules",
        href: "/staff/schedule",
        icon: Calendar,
        variant: "default",
    },
    {
        title: "Record Payment",
        description: "Log payment receipts",
        href: "/staff/payments",
        icon: CreditCard,
        badgeKey: "pendingPayments",
        variant: "default",
    },
    {
        title: "View Feedback",
        description: "Review client feedback",
        href: "/staff/feedback",
        icon: MessageSquare,
        badgeKey: "unreadFeedback",
        variant: "default",
    },
    {
        title: "Announcements",
        description: "Manage announcements",
        href: "/staff/announcements",
        icon: Megaphone,
        variant: "default",
    },
];

interface BadgeCounts {
    pendingRequests: number;
    pendingPayments: number;
    unreadFeedback: number;
}

export function StaffQuickActions() {
    const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
        pendingRequests: 0,
        pendingPayments: 0,
        unreadFeedback: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            const result = await getQuickActionCounts();
            if (result.success && result.data) {
                setBadgeCounts(result.data);
            }
            setLoading(false);
        }
        fetchCounts();

        // Refresh counts every 60 seconds
        const interval = setInterval(fetchCounts, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => {
                const Icon = action.icon;
                const badge = action.badgeKey ? badgeCounts[action.badgeKey] : undefined;

                return (
                    <Link key={action.href} href={action.href}>
                        <div
                            className={`group relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${action.variant === "primary"
                                ? "bg-primary-600 text-white border-primary-600 hover:bg-primary-700"
                                : "bg-white text-neutral-900 border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                                }`}
                        >
                            {!loading && badge !== undefined && badge > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium shadow-sm">
                                    {badge > 99 ? "99+" : badge}
                                </span>
                            )}
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${action.variant === "primary"
                                    ? "bg-white/20"
                                    : "bg-primary-100 group-hover:bg-primary-200"
                                    }`}
                            >
                                <Icon
                                    className={`w-5 h-5 ${action.variant === "primary"
                                        ? "text-white"
                                        : "text-primary-600"
                                        }`}
                                />
                            </div>
                            <h4
                                className={`text-sm font-semibold mb-1 ${action.variant === "primary" ? "text-white" : "text-neutral-900"
                                    }`}
                            >
                                {action.title}
                            </h4>
                            <p
                                className={`text-xs ${action.variant === "primary"
                                    ? "text-white/80"
                                    : "text-neutral-500"
                                    }`}
                            >
                                {action.description}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
