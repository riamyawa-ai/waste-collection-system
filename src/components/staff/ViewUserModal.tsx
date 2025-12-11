"use client";

import { useEffect, useState } from "react";
import { getUserById } from "@/lib/actions/staff";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Star,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface ViewUserModalProps {
    open: boolean;
    onClose: () => void;
    userId: string | null;
}

const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    staff: "bg-blue-100 text-blue-700",
    client: "bg-purple-100 text-purple-700",
    collector: "bg-orange-100 text-orange-700",
};

const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-neutral-100 text-neutral-700",
    suspended: "bg-red-100 text-red-700",
};

// Define proper types for user data
interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    barangay: string | null;
    avatar_url: string | null;
    role: 'admin' | 'staff' | 'client' | 'collector';
    status: 'active' | 'inactive' | 'suspended';
    email_verified: boolean;
    two_factor_enabled: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

interface RequestData {
    id: string;
    request_number: string;
    status: string;
    priority: string;
    created_at: string;
}

interface PaymentData {
    id: string;
    payment_number: string;
    amount: number;
    status: string;
    date_received: string;
}

interface AttendanceData {
    id: string;
    login_time: string;
    logout_time: string | null;
    duration_minutes: number | null;
}

interface FeedbackData {
    id: string;
    overall_rating: number;
    comments: string | null;
    created_at: string;
}

interface UserData {
    profile: UserProfile;
    requests?: RequestData[];
    requestCount?: number;
    payments?: PaymentData[];
    paymentCount?: number;
    attendance?: AttendanceData[];
    collections?: RequestData[];
    collectionCount?: number;
    feedback?: FeedbackData[];
    averageRating?: number;
}

export function ViewUserModal({ open, onClose, userId }: ViewUserModalProps) {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);

    async function fetchUserDetails() {
        if (!userId) return;

        setLoading(true);
        const result = await getUserById(userId);
        if (result.success && result.data) {
            setUserData(result.data as unknown as UserData);
        }
        setLoading(false);
    }

    useEffect(() => {
        if (open && userId) {
            void fetchUserDetails();
        }
    }, [open, userId]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (!userId) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                    </div>
                ) : !userData ? (
                    <p className="text-center py-8 text-neutral-500">User not found</p>
                ) : (
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={userData.profile.avatar_url as string} />
                                <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                                    {getInitials(userData.profile.full_name as string)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-semibold text-neutral-900">
                                        {userData.profile.full_name as string}
                                    </h3>
                                    <Badge className={roleColors[userData.profile.role as string]} variant="outline">
                                        {userData.profile.role as string}
                                    </Badge>
                                    <Badge className={statusColors[userData.profile.status as string]} variant="outline">
                                        {userData.profile.status as string}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-neutral-400" />
                                        {userData.profile.email as string}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-neutral-400" />
                                        {(userData.profile.phone as string) || "Not provided"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-neutral-400" />
                                        {(userData.profile.barangay as string) || "Not provided"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-neutral-400" />
                                        Member since{" "}
                                        {format(new Date(userData.profile.created_at as string), "MMM d, yyyy")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role-specific tabs */}
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="info">Info</TabsTrigger>
                                {userData.profile.role === "client" && (
                                    <>
                                        <TabsTrigger value="requests">Requests</TabsTrigger>
                                        <TabsTrigger value="payments">Payments</TabsTrigger>
                                    </>
                                )}
                                {userData.profile.role === "collector" && (
                                    <>
                                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                                        <TabsTrigger value="performance">Performance</TabsTrigger>
                                    </>
                                )}
                                <TabsTrigger value="history">History</TabsTrigger>
                            </TabsList>

                            {/* Info Tab */}
                            <TabsContent value="info" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-neutral-500 mb-2">
                                            Full Address
                                        </h4>
                                        <p className="text-neutral-900">
                                            {(userData.profile.address as string) || "Not provided"}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-neutral-500 mb-2">
                                            Last Login
                                        </h4>
                                        <p className="text-neutral-900">
                                            {userData.profile.last_login_at
                                                ? format(
                                                    new Date(userData.profile.last_login_at as string),
                                                    "MMM d, yyyy h:mm a"
                                                )
                                                : "Never"}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-neutral-500 mb-2">
                                            Two-Factor Auth
                                        </h4>
                                        <p className="text-neutral-900">
                                            {userData.profile.two_factor_enabled ? "Enabled" : "Disabled"}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-neutral-500 mb-2">
                                            Account Updated
                                        </h4>
                                        <p className="text-neutral-900">
                                            {format(
                                                new Date(userData.profile.updated_at as string),
                                                "MMM d, yyyy h:mm a"
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Requests Tab (Client) */}
                            <TabsContent value="requests" className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-neutral-900">
                                        Collection Requests
                                    </h4>
                                    <span className="text-sm text-neutral-500">
                                        Total: {userData.requestCount || 0}
                                    </span>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Request #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priority</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(userData.requests || []).map((request, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono text-sm">
                                                    {request.request_number}
                                                </TableCell>
                                                <TableCell>
                                                    {format(
                                                        new Date(request.created_at),
                                                        "MMM d, yyyy"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {request.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{request.priority}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Payments Tab (Client) */}
                            <TabsContent value="payments" className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-neutral-900">
                                        Payment History
                                    </h4>
                                    <span className="text-sm text-neutral-500">
                                        Total: {userData.paymentCount || 0}
                                    </span>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Payment #</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(userData.payments || []).map((payment, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono text-sm">
                                                    {payment.payment_number}
                                                </TableCell>
                                                <TableCell>₱{payment.amount?.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {format(
                                                        new Date(payment.date_received),
                                                        "MMM d, yyyy"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Attendance Tab (Collector) */}
                            <TabsContent value="attendance" className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Login</TableHead>
                                            <TableHead>Logout</TableHead>
                                            <TableHead>Duration</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(userData.attendance || []).map((attendance, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    {format(
                                                        new Date(attendance.login_time),
                                                        "MMM d, yyyy"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {format(
                                                        new Date(attendance.login_time),
                                                        "h:mm a"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.logout_time
                                                        ? format(
                                                            new Date(attendance.logout_time),
                                                            "h:mm a"
                                                        )
                                                        : "Active"}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.duration_minutes
                                                        ? `${Math.floor(attendance.duration_minutes / 60)}h ${attendance.duration_minutes % 60}m`
                                                        : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Performance Tab (Collector) */}
                            <TabsContent value="performance" className="space-y-4">
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg text-center">
                                        <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary-700">
                                            <Star className="w-5 h-5 fill-primary-500 text-primary-500" />
                                            {userData.averageRating?.toFixed(1) || "0.0"}
                                        </div>
                                        <p className="text-sm text-primary-600">Average Rating</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-700">
                                            {userData.collectionCount || 0}
                                        </div>
                                        <p className="text-sm text-blue-600">Total Collections</p>
                                    </div>
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-700">
                                            {(userData.feedback || []).length}
                                        </div>
                                        <p className="text-sm text-green-600">Feedback Received</p>
                                    </div>
                                </div>

                                <h4 className="font-medium text-neutral-900 mb-3">
                                    Recent Feedback
                                </h4>
                                <div className="space-y-3">
                                    {(userData.feedback || []).slice(0, 5).map((feedback, i) => (
                                        <div
                                            key={i}
                                            className="p-3 bg-neutral-50 rounded-lg border border-neutral-100"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {[...Array(5)].map((_, j) => (
                                                    <Star
                                                        key={j}
                                                        className={`w-4 h-4 ${j < feedback.overall_rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-neutral-300"
                                                            }`}
                                                    />
                                                ))}
                                                <span className="text-xs text-neutral-500 ml-2">
                                                    {format(
                                                        new Date(feedback.created_at),
                                                        "MMM d, yyyy"
                                                    )}
                                                </span>
                                            </div>
                                            {feedback.comments && (
                                                <p className="text-sm text-neutral-600">
                                                    {feedback.comments}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* History Tab */}
                            <TabsContent value="history" className="space-y-4">
                                <p className="text-neutral-500 text-sm text-center py-8">
                                    Activity history will be available in a future update.
                                </p>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
