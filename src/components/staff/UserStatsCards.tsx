"use client";

import { useEffect, useState } from "react";
import { getUserStats } from "@/lib/actions/staff";
import { StatCard } from "@/components/ui";
import { Users, UserCheck, Home, Truck } from "lucide-react";

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byRole: {
        staff: number;
        client: number;
        collector: number;
    };
}

export function UserStatsCards() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            const result = await getUserStats();
            if (result.success && result.data) {
                setStats(result.data);
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-neutral-100 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                title="Total Users"
                value={stats.total}
                icon={Users}
                className="bg-white border-l-4 border-l-primary-500 shadow-sm"
                trend={{ value: 3, isPositive: true }}
            />
            <StatCard
                title="Active"
                value={stats.active}
                icon={UserCheck}
                className="bg-white border-l-4 border-l-green-500 shadow-sm"
                trend={{ value: 98, isPositive: true }}
            />
            <StatCard
                title="Clients"
                value={stats.byRole.client}
                icon={Home}
                className="bg-white border-l-4 border-l-purple-500 shadow-sm"
                trend={{ value: 2, isPositive: true }}
            />
            <StatCard
                title="Collectors"
                value={stats.byRole.collector}
                icon={Truck}
                className="bg-white border-l-4 border-l-orange-500 shadow-sm"
                trend={{ value: 0, isPositive: true }}
            />
        </div>
    );
}
