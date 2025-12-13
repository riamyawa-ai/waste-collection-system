'use server';

import { createClient } from '@/lib/supabase/server';
import { subDays, startOfWeek, startOfMonth, startOfQuarter, startOfYear, format } from 'date-fns';

export interface ReportData {
    type: 'collections' | 'payments' | 'attendance' | 'requests';
    period: string;
    dateRange: { start: string; end: string };
    generatedAt: string;
    data: Record<string, unknown>;
}

interface ActionResult {
    success: boolean;
    error?: string;
    data?: ReportData;
}

/**
 * Get date range based on period
 */
function getDateRange(period: string): { start: Date; end: Date } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
        case 'today':
            return { start: today, end: now };
        case 'week':
            return { start: startOfWeek(today), end: now };
        case 'month':
            return { start: startOfMonth(today), end: now };
        case 'quarter':
            return { start: startOfQuarter(today), end: now };
        case 'year':
            return { start: startOfYear(today), end: now };
        default:
            return { start: subDays(today, 30), end: now };
    }
}

/**
 * Generate Collection Report
 */
export async function generateCollectionReport(period: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { start, end } = getDateRange(period);

        // Fetch collection data
        const { data: requests, error } = await supabase
            .from('collection_requests')
            .select(`
                id,
                request_number,
                status,
                barangay,
                preferred_date,
                completed_at,
                client:client_id(full_name),
                collector:assigned_collector_id(full_name)
            `)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching collection data:', error);
            return { success: false, error: 'Failed to fetch collection data' };
        }

        // Calculate statistics
        const totalRequests = requests?.length || 0;
        const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
        const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
        const cancelledRequests = requests?.filter(r => r.status === 'cancelled').length || 0;

        // Group by barangay
        const byBarangay: Record<string, number> = {};
        requests?.forEach(r => {
            const barangay = r.barangay || 'Unknown';
            byBarangay[barangay] = (byBarangay[barangay] || 0) + 1;
        });

        // Group by collector
        const byCollector: Record<string, number> = {};
        requests?.forEach(r => {
            const collector = (r.collector as { full_name?: string } | null)?.full_name || 'Unassigned';
            byCollector[collector] = (byCollector[collector] || 0) + 1;
        });

        const reportData: ReportData = {
            type: 'collections',
            period,
            dateRange: {
                start: format(start, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd'),
            },
            generatedAt: new Date().toISOString(),
            data: {
                summary: {
                    totalRequests,
                    completedRequests,
                    pendingRequests,
                    cancelledRequests,
                    completionRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0,
                },
                byBarangay,
                byCollector,
                details: requests?.slice(0, 100).map(r => ({
                    requestNumber: r.request_number,
                    status: r.status,
                    barangay: r.barangay,
                    preferredDate: r.preferred_date,
                    completedAt: r.completed_at,
                    client: (r.client as { full_name?: string } | null)?.full_name || 'Unknown',
                    collector: (r.collector as { full_name?: string } | null)?.full_name || 'Unassigned',
                })),
            },
        };

        return { success: true, data: reportData };
    } catch (error) {
        console.error('Error generating collection report:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Generate Payment Report
 */
export async function generatePaymentReport(period: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { start, end } = getDateRange(period);

        // Fetch payment data
        const { data: payments, error } = await supabase
            .from('payments')
            .select(`
                id,
                payment_number,
                amount,
                status,
                date_received,
                request:request_id(request_number, barangay, client:client_id(full_name))
            `)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching payment data:', error);
            return { success: false, error: 'Failed to fetch payment data' };
        }

        // Calculate statistics
        const totalPayments = payments?.length || 0;
        const totalAmount = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const verifiedPayments = payments?.filter(p => p.status === 'verified').length || 0;
        const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;
        const completedPayments = payments?.filter(p => p.status === 'completed').length || 0;
        const verifiedAmount = payments?.filter(p => p.status !== 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        // Group by barangay
        const revenueByBarangay: Record<string, number> = {};
        payments?.forEach(p => {
            const request = p.request as { barangay?: string } | null;
            const barangay = request?.barangay || 'Unknown';
            revenueByBarangay[barangay] = (revenueByBarangay[barangay] || 0) + (p.amount || 0);
        });

        const reportData: ReportData = {
            type: 'payments',
            period,
            dateRange: {
                start: format(start, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd'),
            },
            generatedAt: new Date().toISOString(),
            data: {
                summary: {
                    totalPayments,
                    totalAmount,
                    verifiedPayments,
                    pendingPayments,
                    completedPayments,
                    verifiedAmount,
                    collectionRate: totalAmount > 0 ? Math.round((verifiedAmount / totalAmount) * 100) : 0,
                },
                revenueByBarangay,
                details: payments?.slice(0, 100).map(p => {
                    const request = p.request as { request_number?: string; barangay?: string; client?: { full_name?: string } } | null;
                    return {
                        paymentNumber: p.payment_number,
                        amount: p.amount,
                        status: p.status,
                        dateReceived: p.date_received,
                        requestNumber: request?.request_number || 'N/A',
                        barangay: request?.barangay || 'Unknown',
                        client: request?.client?.full_name || 'Unknown',
                    };
                }),
            },
        };

        return { success: true, data: reportData };
    } catch (error) {
        console.error('Error generating payment report:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Generate Attendance Report
 */
export async function generateAttendanceReport(period: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { start, end } = getDateRange(period);

        // Fetch attendance data
        const { data: attendance, error } = await supabase
            .from('collector_attendance')
            .select(`
                id,
                login_time,
                logout_time,
                total_duration,
                collector:collector_id(full_name)
            `)
            .gte('login_time', start.toISOString())
            .lte('login_time', end.toISOString())
            .order('login_time', { ascending: false });

        if (error) {
            console.error('Error fetching attendance data:', error);
            return { success: false, error: 'Failed to fetch attendance data' };
        }

        // Get all collectors
        const { data: collectors } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'collector')
            .eq('status', 'active');

        const totalCollectors = collectors?.length || 0;
        const collectorsWithAttendance = new Set(attendance?.map(a => ((a.collector as { full_name?: string } | null)?.full_name)));
        const averageAttendanceRate = totalCollectors > 0 ? Math.round((collectorsWithAttendance.size / totalCollectors) * 100) : 0;

        // Group by collector
        const byCollector: Record<string, { days: number; totalHours: number }> = {};
        attendance?.forEach(a => {
            const collector = (a.collector as { full_name?: string } | null)?.full_name || 'Unknown';
            if (!byCollector[collector]) {
                byCollector[collector] = { days: 0, totalHours: 0 };
            }
            byCollector[collector].days += 1;
            // Parse duration string (e.g., "08:30:00")
            const duration = a.total_duration as string | null;
            if (duration) {
                const [hours, minutes] = duration.split(':').map(Number);
                byCollector[collector].totalHours += hours + (minutes || 0) / 60;
            }
        });

        const reportData: ReportData = {
            type: 'attendance',
            period,
            dateRange: {
                start: format(start, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd'),
            },
            generatedAt: new Date().toISOString(),
            data: {
                summary: {
                    totalRecords: attendance?.length || 0,
                    totalCollectors,
                    activeCollectors: collectorsWithAttendance.size,
                    averageAttendanceRate,
                },
                byCollector: Object.entries(byCollector).map(([name, stats]) => ({
                    collector: name,
                    daysWorked: stats.days,
                    totalHours: Math.round(stats.totalHours * 10) / 10,
                    averageHoursPerDay: stats.days > 0 ? Math.round((stats.totalHours / stats.days) * 10) / 10 : 0,
                })),
                details: attendance?.slice(0, 100).map(a => ({
                    collector: (a.collector as { full_name?: string } | null)?.full_name || 'Unknown',
                    loginTime: a.login_time,
                    logoutTime: a.logout_time,
                    duration: a.total_duration,
                })),
            },
        };

        return { success: true, data: reportData };
    } catch (error) {
        console.error('Error generating attendance report:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Generate Request Analytics Report
 */
export async function generateRequestReport(period: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { start, end } = getDateRange(period);

        // Fetch request data
        const { data: requests, error } = await supabase
            .from('collection_requests')
            .select(`
                id,
                request_number,
                status,
                priority,
                barangay,
                preferred_time_slot,
                created_at,
                scheduled_date
            `)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching request data:', error);
            return { success: false, error: 'Failed to fetch request data' };
        }

        // Calculate statistics
        const totalRequests = requests?.length || 0;

        // By status
        const byStatus: Record<string, number> = {};
        requests?.forEach(r => {
            byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        });

        // By priority
        const byPriority: Record<string, number> = {};
        requests?.forEach(r => {
            const priority = r.priority || 'normal';
            byPriority[priority] = (byPriority[priority] || 0) + 1;
        });



        // By time slot
        const byTimeSlot: Record<string, number> = {};
        requests?.forEach(r => {
            const slot = r.preferred_time_slot || 'morning';
            byTimeSlot[slot] = (byTimeSlot[slot] || 0) + 1;
        });

        // By barangay
        const byBarangay: Record<string, number> = {};
        requests?.forEach(r => {
            const barangay = r.barangay || 'Unknown';
            byBarangay[barangay] = (byBarangay[barangay] || 0) + 1;
        });

        // Rejection rate
        const rejectedRequests = requests?.filter(r => r.status === 'rejected').length || 0;
        const rejectionRate = totalRequests > 0 ? Math.round((rejectedRequests / totalRequests) * 100) : 0;

        const reportData: ReportData = {
            type: 'requests',
            period,
            dateRange: {
                start: format(start, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd'),
            },
            generatedAt: new Date().toISOString(),
            data: {
                summary: {
                    totalRequests,
                    rejectionRate,
                    avgRequestsPerDay: Math.round(totalRequests / Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))),
                },
                byStatus,
                byPriority,
                byBarangay,
                byTimeSlot,
            },
        };

        return { success: true, data: reportData };
    } catch (error) {
        console.error('Error generating request report:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
