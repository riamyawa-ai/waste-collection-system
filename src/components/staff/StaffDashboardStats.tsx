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
                    className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
                    chartData={[4, 7, 5, 8, 12, 15, 10, stats.pendingRequests]}
                    trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                    title="Collections"
                    value={getCollectionValue()}
                    icon={Truck}
                    description={`${timeFrame === "today" ? "Today" : timeFrame === "week" ? "This Week" : "This Month"}`}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                    chartData={[10, 25, 18, 30, 22, 35, 40, 45]}
                />
                <StatCard
                    title="Revenue"
                    value={`₱${getRevenueValue().toLocaleString()}`}
                    icon={DollarSign}
                    description={`${timeFrame === "today" ? "Today" : timeFrame === "week" ? "This Week" : "This Month"}`}
                    className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                    chartData={[1500, 2300, 1800, 3200, 2900, 4500, 3800, 5000]}
                    trend={{ value: 8, isPositive: true }}
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    description={`${stats.usersByRole.client} clients, ${stats.usersByRole.collector} collectors`}
                    className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
                    chartData={[stats.totalUsers - 10, stats.totalUsers - 8, stats.totalUsers - 5, stats.totalUsers - 2, stats.totalUsers]}
                />
            </div>
        </div>
    );
}
