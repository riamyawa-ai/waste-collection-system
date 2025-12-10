'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================================================
// TYPES
// ============================================================================

interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface PaymentFilters {
    search?: string;
    status?: 'pending' | 'verified' | 'completed' | 'all';
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

export interface UpdatePaymentInput {
    id: string;
    amount?: number;
    referenceNumber?: string;
    dateReceived?: string;
    receiptUrl?: string;
    status?: 'pending' | 'verified' | 'completed';
    staffNotes?: string;
}

// ============================================================================
// PAYMENT MANAGEMENT
// ============================================================================

export async function getPayments(filters: PaymentFilters = {}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
        .from('payments')
        .select(`
            *,
            client:client_id(id, full_name, email, phone),
            request:request_id(id, request_number, barangay, preferred_date),
            verifier:verified_by(id, full_name)
        `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
        query = query.or(`payment_number.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`);
    }

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
    }

    if (filters.dateFrom) {
        query = query.gte('date_received', filters.dateFrom);
    }

    if (filters.dateTo) {
        query = query.lte('date_received', filters.dateTo);
    }

    // Order and paginate
    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            payments: data,
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        },
    };
}

export async function getPaymentStats() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get total revenue
    const { data: allPayments } = await supabase
        .from('payments')
        .select('amount, status, date_received, created_at');

    const completedPayments = allPayments?.filter(p => p.status === 'completed') || [];
    const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Revenue today
    const todayPayments = completedPayments.filter(
        p => new Date(p.date_received || p.created_at) >= new Date(startOfDay)
    );
    const revenueToday = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Revenue this week
    const weekPayments = completedPayments.filter(
        p => new Date(p.date_received || p.created_at) >= startOfWeek
    );
    const revenueWeek = weekPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Revenue this month
    const monthPayments = completedPayments.filter(
        p => new Date(p.date_received || p.created_at) >= startOfMonth
    );
    const revenueMonth = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Get pending verification count
    const { count: pendingVerification } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Get verified count
    const { count: verifiedCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'verified');

    // Calculate average transaction
    const avgTransaction = completedPayments.length > 0
        ? totalRevenue / completedPayments.length
        : 0;

    return {
        success: true,
        data: {
            totalRevenue,
            revenueToday,
            revenueWeek,
            revenueMonth,
            pendingVerification: pendingVerification || 0,
            verified: verifiedCount || 0,
            averageTransaction: Math.round(avgTransaction * 100) / 100,
            totalTransactions: allPayments?.length || 0,
        },
    };
}

export async function getPaymentById(paymentId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: payment, error } = await supabase
        .from('payments')
        .select(`
            *,
            client:client_id(id, full_name, email, phone, address, barangay),
            request:request_id(id, request_number, barangay, address, preferred_date, priority, completed_at),
            verifier:verified_by(id, full_name, email)
        `)
        .eq('id', paymentId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: payment,
    };
}

export async function updatePayment(input: UpdatePaymentInput): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.referenceNumber !== undefined) updateData.reference_number = input.referenceNumber;
    if (input.dateReceived !== undefined) updateData.date_received = input.dateReceived;
    if (input.receiptUrl !== undefined) updateData.receipt_url = input.receiptUrl;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.staffNotes !== undefined) updateData.staff_notes = input.staffNotes;

    const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', input.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/payments');
    return { success: true };
}

export async function verifyPayment(paymentId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get payment details
    const { data: payment } = await supabase
        .from('payments')
        .select('*, request:request_id(request_number, client_id)')
        .eq('id', paymentId)
        .single();

    if (!payment) {
        return { success: false, error: 'Payment not found' };
    }

    const { error } = await supabase
        .from('payments')
        .update({
            status: 'verified',
            verified_by: user.id,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Notify client
    const requestData = payment.request as { request_number: string; client_id: string } | null;
    if (requestData?.client_id) {
        await supabase.from('notifications').insert({
            user_id: requestData.client_id,
            type: 'payment_verification',
            title: 'Payment Verified',
            message: `Your payment for request ${requestData.request_number} has been verified.`,
            data: { payment_id: paymentId },
        });
    }

    revalidatePath('/staff/payments');
    return { success: true };
}

export async function completePayment(paymentId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('payments')
        .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/payments');
    return { success: true };
}

export async function getPaymentsByDateRange(startDate: string, endDate: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: payments, error } = await supabase
        .from('payments')
        .select(`
            *,
            client:client_id(id, full_name),
            request:request_id(id, request_number, barangay)
        `)
        .gte('date_received', startDate)
        .lte('date_received', endDate)
        .order('date_received', { ascending: false });

    if (error) {
        return { success: false, error: error.message };
    }

    // Calculate summary
    const summary = {
        total: payments?.length || 0,
        totalAmount: payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
        pending: payments?.filter(p => p.status === 'pending').length || 0,
        verified: payments?.filter(p => p.status === 'verified').length || 0,
        completed: payments?.filter(p => p.status === 'completed').length || 0,
    };

    return {
        success: true,
        data: {
            payments,
            summary,
        },
    };
}

export async function getRevenueByBarangay() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: payments } = await supabase
        .from('payments')
        .select(`
            amount,
            status,
            request:request_id(barangay)
        `)
        .eq('status', 'completed');

    if (!payments) {
        return { success: true, data: [] };
    }

    // Group by barangay
    const barangayRevenue: Record<string, number> = {};
    payments.forEach(p => {
        const requestData = p.request as { barangay: string } | null;
        const barangay = requestData?.barangay || 'Unknown';
        barangayRevenue[barangay] = (barangayRevenue[barangay] || 0) + (p.amount || 0);
    });

    // Convert to array and sort
    const result = Object.entries(barangayRevenue)
        .map(([barangay, revenue]) => ({ barangay, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

    return {
        success: true,
        data: result,
    };
}
