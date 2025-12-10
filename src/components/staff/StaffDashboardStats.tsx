"use client";

import { useEffect, useState } from "react";
import { StatCard, EcoCard, EcoCardContent } from "@/components/ui";
import {
    Users,
    FileText,
    Clock,
    CheckCircle2,
    TrendingUp,
    DollarSign,
    Truck,
    AlertTriangle,
} from "lucide-react";
import { getStaffDashboardStats } from "@/lib/actions/staff";

interface DashboardStats {
    totalUsers: number;
    usersByRole: {
        admin: number;
        staff: number;
        client: number;
        collector: number;
    };
    collections: {
        today: number;
        week: number;
        month: number;
    };
    pendingRequests: number;
    activeCollectors: number;
    statusDistribution: Record<string, number>;
    revenue: {
        today: number;
        week: number;
        month: number;
    };
}

export function StaffDashboardStats() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState<"today" | "week" | "month">("today");

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            const result = await getStaffDashboardStats();
            if (result.success && result.data) {
                setStats(result.data);
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-neutral-100 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const getCollectionValue = () => {
        switch (timeFrame) {
            case "today":
                return stats.collections.today;
            case "week":
                return stats.collections.week;
            case "month":
                return stats.collections.month;
        }
    };

    const getRevenueValue = () => {
        switch (timeFrame) {
            case "today":
                return stats.revenue.today;
            case "week":
                return stats.revenue.week;
            case "month":
                return stats.revenue.month;
        }
    };

    return (
        <div className="space-y-4">
            {/* Time Frame Selector */}
            <div className="flex gap-2">
                {(["today", "week", "month"] as const).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeFrame(tf)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeFrame === tf
                            ? "bg-primary-600 text-white"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                    >
                        {tf.charAt(0).toUpperCase() + tf.slice(1)}
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Pending Requests"
                    value={stats.pendingRequests}
                    icon={Clock}
                    description="Awaiting review"
                    className="bg-white border-l-4 border-l-yellow-500 shadow-sm"
                    trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                    title="Collections"
                    value={getCollectionValue()}
                    icon={Truck}
                    description={`${timeFrame === "today" ? "Today" : timeFrame === "week" ? "This Week" : "This Month"}`}
                    className="bg-white border-l-4 border-l-blue-500 shadow-sm"
                    trend={{ value: 5, isPositive: true }}
                />
                <StatCard
                    title="Revenue"
                    value={`₱${getRevenueValue().toLocaleString()}`}
                    icon={DollarSign}
                    description={`${timeFrame === "today" ? "Today" : timeFrame === "week" ? "This Week" : "This Month"}`}
                    className="bg-white border-l-4 border-l-green-500 shadow-sm"
                    trend={{ value: 8, isPositive: true }}
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    description={`${stats.usersByRole.client} clients, ${stats.usersByRole.collector} collectors`}
                    className="bg-white border-l-4 border-l-purple-500 shadow-sm"
                    trend={{ value: 3, isPositive: true }}
                />
            </div>
        </div>
    );
}
