"use client";

import { useEffect, useState } from "react";
import { getUserStats } from "@/lib/actions/staff";
import { StatCard } from "@/components/ui";
import { Users, UserCheck, UserX, UserMinus, Briefcase, Home, Truck } from "lucide-react";

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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-28 bg-neutral-100 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <StatCard
                title="Total Users"
                value={stats.total}
                icon={Users}
                className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
            />
            <StatCard
                title="Active"
                value={stats.active}
                icon={UserCheck}
                className="border-green-200"
            />
            <StatCard
                title="Inactive"
                value={stats.inactive}
                icon={UserX}
                className="border-neutral-200"
            />
            <StatCard
                title="Suspended"
                value={stats.suspended}
                icon={UserMinus}
                className="border-red-200"
            />
            <StatCard
                title="Staff"
                value={stats.byRole.staff}
                icon={Briefcase}
                className="border-blue-200"
            />
            <StatCard
                title="Clients"
                value={stats.byRole.client}
                icon={Home}
                className="border-purple-200"
            />
            <StatCard
                title="Collectors"
                value={stats.byRole.collector}
                icon={Truck}
                className="border-orange-200"
            />
        </div>
    );
}
