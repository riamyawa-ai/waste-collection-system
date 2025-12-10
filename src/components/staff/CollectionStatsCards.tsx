"use client";

import { useEffect, useState } from "react";
import { getCollectionStats } from "@/lib/actions/staff";
import { StatCard } from "@/components/ui";
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    CreditCard,
    Users,
    AlertTriangle,
} from "lucide-react";

interface CollectionStats {
    pending: number;
    accepted: number;
    payment_confirmed: number;
    assigned: number;
    accepted_by_collector: number;
    in_progress: number;
    completed: number;
    rejected: number;
    cancelled: number;
    completedToday: number;
    total: number;
}

export function CollectionStatsCards() {
    const [stats, setStats] = useState<CollectionStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            const result = await getCollectionStats();
            if (result.success && result.data) {
                setStats(result.data as CollectionStats);
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
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
                title="Pending Review"
                value={stats.pending}
                icon={Clock}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
                description="Needs action"
                chartData={[stats.pending - 2, stats.pending + 1, stats.pending - 1, stats.pending + 3, stats.pending]}
                trend={{ value: 5, isPositive: true }}
            />
            <StatCard
                title="Awaiting Payment"
                value={stats.accepted}
                icon={CreditCard}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                chartData={[stats.accepted - 5, stats.accepted - 2, stats.accepted + 4, stats.accepted]}
            />
            <StatCard
                title="In Progress"
                value={stats.in_progress + stats.accepted_by_collector + stats.assigned}
                icon={Truck}
                className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                chartData={[2, 4, 3, 5, 8, 6, stats.in_progress + stats.assigned]}
            />
            <StatCard
                title="Completed"
                value={stats.completed}
                icon={CheckCircle2}
                className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                chartData={[stats.completed - 20, stats.completed - 15, stats.completed - 8, stats.completed - 5, stats.completed]}
                trend={{ value: 12, isPositive: true }}
            />
        </div>
    );
}
