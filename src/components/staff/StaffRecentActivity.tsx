"use client";

import { useEffect, useState } from "react";
import { getStaffRecentActivity } from "@/lib/actions/staff";
import { EcoCard, EcoCardContent } from "@/components/ui";
import { FileText, User, CreditCard, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
    id: string;
    type: "request" | "user" | "payment";
    title: string;
    description: string;
    timestamp: string;
    status?: string;
}

export function StaffRecentActivity() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            setLoading(true);
            const result = await getStaffRecentActivity(20);
            if (result.success && result.data) {
                setActivities(result.data);
            }
            setLoading(false);
        }
        fetchActivities();

        // Refresh every 30 seconds
        const interval = setInterval(fetchActivities, 30000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case "request":
                return <FileText className="w-4 h-4 text-primary-600" />;
            case "user":
                return <User className="w-4 h-4 text-blue-600" />;
            case "payment":
                return <CreditCard className="w-4 h-4 text-green-600" />;
            default:
                return <Clock className="w-4 h-4 text-neutral-600" />;
        }
    };

    const getStatusColor = (status?: string) => {
        if (!status) return "";
        switch (status) {
            case "pending":
                return "text-yellow-600";
            case "completed":
                return "text-green-600";
            case "rejected":
            case "cancelled":
                return "text-red-600";
            case "in_progress":
                return "text-orange-600";
            default:
                return "text-blue-600";
        }
    };

    if (loading) {
        return (
            <EcoCard>
                <EcoCardContent>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-start gap-3 animate-pulse">
                                <div className="w-8 h-8 bg-neutral-100 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-neutral-100 rounded w-1/3" />
                                    <div className="h-3 bg-neutral-100 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </EcoCardContent>
            </EcoCard>
        );
    }

    return (
        <EcoCard>
            <EcoCardContent>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900">
                        Recent Activity
                    </h3>
                    <span className="text-xs text-neutral-500">Auto-updates every 30s</span>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {activities.length === 0 ? (
                        <p className="text-sm text-neutral-500 text-center py-8">
                            No recent activity
                        </p>
                    ) : (
                        activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100"
                            >
                                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                                    {getIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 truncate">
                                        {activity.title}
                                        {activity.status && (
                                            <span
                                                className={`ml-2 text-xs font-normal ${getStatusColor(
                                                    activity.status
                                                )}`}
                                            >
                                                • {activity.status.replace(/_/g, " ")}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-neutral-500 truncate">
                                        {activity.description}
                                    </p>
                                </div>
                                <span className="text-xs text-neutral-400 flex-shrink-0 whitespace-nowrap">
                                    {activity.timestamp
                                        ? formatDistanceToNow(new Date(activity.timestamp), {
                                            addSuffix: true,
                                        })
                                        : ""}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </EcoCardContent>
        </EcoCard>
    );
}
