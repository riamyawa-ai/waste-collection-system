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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard
                title="Total Requests"
                value={stats.total}
                icon={FileText}
                className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
            />
            <StatCard
                title="Pending Review"
                value={stats.pending}
                icon={Clock}
                className="border-yellow-200"
                description="Awaiting action"
            />
            <StatCard
                title="Awaiting Payment"
                value={stats.accepted}
                icon={CreditCard}
                className="border-blue-200"
            />
            <StatCard
                title="In Progress"
                value={stats.in_progress + stats.accepted_by_collector}
                icon={Truck}
                className="border-orange-200"
            />
            <StatCard
                title="Completed Today"
                value={stats.completedToday}
                icon={CheckCircle2}
                className="border-green-200"
            />
            <StatCard
                title="Rejected"
                value={stats.rejected}
                icon={XCircle}
                className="border-red-200"
            />
        </div>
    );
}
