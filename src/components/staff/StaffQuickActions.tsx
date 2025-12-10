"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import {
    Users,
    FileText,
    Calendar,
    MessageSquare,
    CreditCard,
    Megaphone,
    BarChart3,
    Settings,
} from "lucide-react";

interface QuickAction {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
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
        variant: "primary",
    },
    {
        title: "Set Schedule",
        description: "Create collection schedules",
        href: "/staff/schedules",
        icon: Calendar,
        variant: "default",
    },
    {
        title: "Record Payment",
        description: "Log payment receipts",
        href: "/staff/payments",
        icon: CreditCard,
        variant: "default",
    },
    {
        title: "View Feedback",
        description: "Review client feedback",
        href: "/staff/feedback",
        icon: MessageSquare,
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

export function StaffQuickActions() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                    <Link key={action.href} href={action.href}>
                        <div
                            className={`group relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${action.variant === "primary"
                                    ? "bg-primary-600 text-white border-primary-600 hover:bg-primary-700"
                                    : "bg-white text-neutral-900 border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                                }`}
                        >
                            {action.badge !== undefined && action.badge > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                                    {action.badge > 99 ? "99+" : action.badge}
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
