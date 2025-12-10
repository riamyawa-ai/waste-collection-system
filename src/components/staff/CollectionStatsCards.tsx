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
                className="bg-white border-l-4 border-l-yellow-500 shadow-sm"
                description="Needs action"
                trend={{ value: 5, isPositive: true }}
            />
            <StatCard
                title="Awaiting Payment"
                value={stats.accepted}
                icon={CreditCard}
                className="bg-white border-l-4 border-l-blue-500 shadow-sm"
                trend={{ value: 2, isPositive: false }}
            />
            <StatCard
                title="In Progress"
                value={stats.in_progress + stats.accepted_by_collector + stats.assigned}
                icon={Truck}
                className="bg-white border-l-4 border-l-orange-500 shadow-sm"
                trend={{ value: 10, isPositive: true }}
            />
            <StatCard
                title="Completed"
                value={stats.completed}
                icon={CheckCircle2}
                className="bg-white border-l-4 border-l-green-500 shadow-sm"
                trend={{ value: 15, isPositive: true }}
            />
        </div>
    );
}
