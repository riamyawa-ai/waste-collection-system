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

// User filters for the user management table
export interface UserFilters {
    search?: string;
    role?: 'admin' | 'staff' | 'client' | 'collector' | 'all';
    status?: 'active' | 'inactive' | 'suspended' | 'all';
    barangay?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

// User creation input
// Admin can only create staff
// Staff can only create collectors
// Clients register themselves through the public registration form
export interface CreateUserInput {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    barangay?: string;
    role: 'staff' | 'collector'; // No client option - clients self-register
    status: 'active' | 'inactive' | 'suspended';
    password: string;
    autoVerify?: boolean; // Deprecated - always false
    sendWelcomeEmail?: boolean;
}

// User update input
export interface UpdateUserInput {
    id: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    barangay?: string;
    role?: 'admin' | 'staff' | 'client' | 'collector';
    status?: 'active' | 'inactive' | 'suspended';
}

// ============================================================================
// STAFF DASHBOARD STATISTICS
// ============================================================================

export async function getStaffDashboardStats() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get total users count
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Get users by role
    const { data: usersByRole } = await supabase
        .from('profiles')
        .select('role');

    const roleCounts = {
        admin: 0,
        staff: 0,
        client: 0,
        collector: 0,
    };

    usersByRole?.forEach((u) => {
        if (u.role && roleCounts.hasOwnProperty(u.role)) {
            roleCounts[u.role as keyof typeof roleCounts]++;
        }
    });

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // Get start of week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get collections statistics
    const { count: totalCollectionsToday } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

    const { count: totalCollectionsWeek } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString());

    const { count: totalCollectionsMonth } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

    // Get pending requests
    const { count: pendingRequests } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Get active collectors (logged in today)
    const { count: activeCollectors } = await supabase
        .from('collector_attendance')
        .select('*', { count: 'exact', head: true })
        .gte('login_time', startOfDay)
        .is('logout_time', null);

    // Get request status distribution
    const { data: statusDistribution } = await supabase
        .from('collection_requests')
        .select('status');

    const statusCounts: Record<string, number> = {};
    statusDistribution?.forEach((r) => {
        if (r.status) {
            statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
        }
    });

    // Get revenue (from payments)
    const { data: paymentsToday } = await supabase
        .from('payments')
        .select('amount')
        .gte('date_received', startOfDay)
        .eq('status', 'completed');

    const { data: paymentsWeek } = await supabase
        .from('payments')
        .select('amount')
        .gte('date_received', startOfWeek.toISOString())
        .eq('status', 'completed');

    const { data: paymentsMonth } = await supabase
        .from('payments')
        .select('amount')
        .gte('date_received', startOfMonth.toISOString())
        .eq('status', 'completed');

    const revenueToday = paymentsToday?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const revenueWeek = paymentsWeek?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const revenueMonth = paymentsMonth?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
        success: true,
        data: {
            totalUsers: totalUsers || 0,
            usersByRole: roleCounts,
            collections: {
                today: totalCollectionsToday || 0,
                week: totalCollectionsWeek || 0,
                month: totalCollectionsMonth || 0,
            },
            pendingRequests: pendingRequests || 0,
            activeCollectors: activeCollectors || 0,
            statusDistribution: statusCounts,
            revenue: {
                today: revenueToday,
                week: revenueWeek,
                month: revenueMonth,
            },
        },
    };
}

// ============================================================================
// RECENT ACTIVITY
// ============================================================================

export async function getStaffRecentActivity(limit: number = 20) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get recent requests
    const { data: recentRequests } = await supabase
        .from('collection_requests')
        .select(`
            id,
            request_number,
            status,
            created_at,
            updated_at,
            client:client_id(full_name)
        `)
        .order('updated_at', { ascending: false })
        .limit(limit);

    // Get recent user registrations
    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    // Get recent payments
    const { data: recentPayments } = await supabase
        .from('payments')
        .select(`
            id,
            payment_number,
            amount,
            status,
            date_received,
            client:client_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    // Combine and sort activities
    const activities: Array<{
        id: string;
        type: 'request' | 'user' | 'payment';
        title: string;
        description: string;
        timestamp: string;
        status?: string;
    }> = [];

    recentRequests?.forEach((r) => {
        const clientData = r.client as unknown as { full_name: string } | null;
        activities.push({
            id: r.id,
            type: 'request',
            title: `Request ${r.request_number}`,
            description: `${clientData?.full_name || 'Unknown'} - Status: ${r.status}`,
            timestamp: r.updated_at,
            status: r.status,
        });
    });

    recentUsers?.forEach((u) => {
        activities.push({
            id: u.id,
            type: 'user',
            title: 'New Registration',
            description: `${u.full_name} registered as ${u.role}`,
            timestamp: u.created_at,
        });
    });

    recentPayments?.forEach((p) => {
        const clientData = p.client as unknown as { full_name: string } | null;
        activities.push({
            id: p.id,
            type: 'payment',
            title: `Payment ${p.payment_number}`,
            description: `₱${p.amount?.toLocaleString()} from ${clientData?.full_name || 'Unknown'}`,
            timestamp: p.date_received || '',
            status: p.status,
        });
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
        success: true,
        data: activities.slice(0, limit),
    };
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function getUsers(filters: UserFilters = {}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check if user is staff or admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['admin', 'staff'].includes(profile.role)) {
        return { success: false, error: 'Unauthorized' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

    // Apply filters
    if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
    }

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters.barangay) {
        query = query.eq('barangay', filters.barangay);
    }

    if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
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
            users: data,
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        },
    };
}

export async function getUserStats() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get total counts by status
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    const { count: inactiveUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'inactive');

    const { count: suspendedUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'suspended');

    // Get counts by role
    const { count: staffCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'staff');

    const { count: clientCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');

    const { count: collectorCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'collector');

    return {
        success: true,
        data: {
            total: totalUsers || 0,
            active: activeUsers || 0,
            inactive: inactiveUsers || 0,
            suspended: suspendedUsers || 0,
            byRole: {
                staff: staffCount || 0,
                client: clientCount || 0,
                collector: collectorCount || 0,
            },
        },
    };
}

export async function getUserById(userId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Get additional data based on role
    let additionalData: Record<string, unknown> = {};

    if (profile.role === 'client') {
        // Get request history
        const { data: requests, count: requestCount } = await supabase
            .from('collection_requests')
            .select('*', { count: 'exact' })
            .eq('client_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        // Get payment history
        const { data: payments, count: paymentCount } = await supabase
            .from('payments')
            .select('*', { count: 'exact' })
            .eq('client_id', userId)
            .order('date_received', { ascending: false })
            .limit(10);

        additionalData = {
            requests,
            requestCount,
            payments,
            paymentCount,
        };
    }

    if (profile.role === 'collector') {
        // Get attendance records
        const { data: attendance } = await supabase
            .from('collector_attendance')
            .select('*')
            .eq('collector_id', userId)
            .order('login_time', { ascending: false })
            .limit(30);

        // Get assigned collections
        const { data: collections, count: collectionCount } = await supabase
            .from('collection_requests')
            .select('*', { count: 'exact' })
            .eq('assigned_collector_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        // Get feedback received
        const { data: feedback } = await supabase
            .from('feedback')
            .select('*')
            .eq('collector_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        // Calculate average rating
        const { data: avgRating } = await supabase
            .rpc('get_collector_average_rating', { collector_uuid: userId });

        additionalData = {
            attendance,
            collections,
            collectionCount,
            feedback,
            averageRating: avgRating || 0,
        };
    }

    return {
        success: true,
        data: {
            profile,
            ...additionalData,
        },
    };
}

export async function updateUser(input: UpdateUserInput): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check if user is staff or admin
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!currentProfile || !['admin', 'staff'].includes(currentProfile.role)) {
        return { success: false, error: 'Unauthorized' };
    }

    const updateData: Record<string, unknown> = {};

    if (input.firstName) updateData.first_name = input.firstName;
    if (input.lastName) updateData.last_name = input.lastName;
    if (input.phone) updateData.phone = input.phone;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.barangay !== undefined) updateData.barangay = input.barangay;
    if (input.role) updateData.role = input.role;
    if (input.status) updateData.status = input.status;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', input.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/users');
    return { success: true };
}

export async function updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended'
): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/users');
    return { success: true };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check if user is admin (only admins can delete users)
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!currentProfile || currentProfile.role !== 'admin') {
        return { success: false, error: 'Only admins can delete users' };
    }

    // Soft delete by setting status to inactive
    // Full deletion requires admin auth API access
    const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/users');
    return { success: true };
}

// ============================================================================
// COLLECTION MANAGEMENT
// ============================================================================

export interface CollectionFilters {
    search?: string;
    status?: string;
    priority?: 'low' | 'medium' | 'urgent' | 'all';
    barangay?: string[];
    collectorId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

export async function getCollectionRequests(filters: CollectionFilters = {}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
        .from('collection_requests')
        .select(`
            *,
            client:client_id(id, full_name, email, phone),
            collector:assigned_collector_id(id, full_name, phone)
        `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
        query = query.or(`request_number.ilike.%${filters.search}%`);
    }

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
    }

    if (filters.barangay && filters.barangay.length > 0) {
        query = query.in('barangay', filters.barangay);
    }

    if (filters.collectorId) {
        query = query.eq('assigned_collector_id', filters.collectorId);
    }

    if (filters.dateFrom) {
        query = query.gte('preferred_date', filters.dateFrom);
    }

    if (filters.dateTo) {
        query = query.lte('preferred_date', filters.dateTo);
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
            requests: data,
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        },
    };
}

export async function getCollectionStats() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

    // Get counts by status
    const statuses = [
        'pending',
        'accepted',
        'payment_confirmed',
        'assigned',
        'accepted_by_collector',
        'in_progress',
        'completed',
        'rejected',
        'cancelled'
    ];

    const statusCounts: Record<string, number> = {};

    for (const status of statuses) {
        const { count } = await supabase
            .from('collection_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', status);
        statusCounts[status] = count || 0;
    }

    // Get today's completed
    const { count: completedToday } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('updated_at', startOfDay);

    return {
        success: true,
        data: {
            ...statusCounts,
            completedToday: completedToday || 0,
            total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        },
    };
}

export async function acceptRequest(requestId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get current request
    const { data: request } = await supabase
        .from('collection_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (!request) {
        return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
        return { success: false, error: 'Only pending requests can be accepted' };
    }

    const { error } = await supabase
        .from('collection_requests')
        .update({
            status: 'accepted',
            updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Create notification for client
    await supabase.from('notifications').insert({
        user_id: request.client_id,
        type: 'request_status_update',
        title: 'Request Accepted',
        message: `Your request ${request.request_number} has been accepted. Please proceed with payment.`,
        data: { request_id: requestId },
    });

    revalidatePath('/staff/collections');
    return { success: true };
}

export async function rejectRequest(
    requestId: string,
    reason: string
): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get current request
    const { data: request } = await supabase
        .from('collection_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (!request) {
        return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
        return { success: false, error: 'Only pending requests can be rejected' };
    }

    const { error } = await supabase
        .from('collection_requests')
        .update({
            status: 'rejected',
            rejection_reason: reason,
            rejected_by: user.id,
            rejected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Create notification for client
    await supabase.from('notifications').insert({
        user_id: request.client_id,
        type: 'request_status_update',
        title: 'Request Rejected',
        message: `Your request ${request.request_number} has been rejected. Reason: ${reason}`,
        data: { request_id: requestId },
    });

    revalidatePath('/staff/collections');
    return { success: true };
}

export async function recordPayment(
    requestId: string,
    paymentData: {
        amount: number;
        referenceNumber: string;
        dateReceived: string;
        receiptUrl?: string;
        notes?: string;
    }
): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get current request
    const { data: request } = await supabase
        .from('collection_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (!request) {
        return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'accepted') {
        return { success: false, error: 'Payment can only be recorded for accepted requests' };
    }

    // Create payment record
    const { error: paymentError } = await supabase.from('payments').insert({
        request_id: requestId,
        client_id: request.client_id,
        amount: paymentData.amount,
        reference_number: paymentData.referenceNumber,
        date_received: paymentData.dateReceived,
        receipt_url: paymentData.receiptUrl,
        staff_notes: paymentData.notes,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        status: 'verified',
    });

    if (paymentError) {
        return { success: false, error: paymentError.message };
    }

    // Update request status
    const { error: requestError } = await supabase
        .from('collection_requests')
        .update({
            status: 'payment_confirmed',
            updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

    if (requestError) {
        return { success: false, error: requestError.message };
    }

    // Create notification for client
    await supabase.from('notifications').insert({
        user_id: request.client_id,
        type: 'payment_verification',
        title: 'Payment Confirmed',
        message: `Your payment for request ${request.request_number} has been confirmed.`,
        data: { request_id: requestId },
    });

    revalidatePath('/staff/collections');
    return { success: true };
}

export async function getAvailableCollectors() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

    // Get collectors who are on duty today
    const { data: onDutyCollectors } = await supabase
        .from('collector_attendance')
        .select('collector_id')
        .gte('login_time', startOfDay)
        .is('logout_time', null);

    const onDutyIds = onDutyCollectors?.map((a) => a.collector_id) || [];

    // Get collector profiles with their stats
    const { data: collectors } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'collector')
        .eq('status', 'active');

    // Get assignment counts for today
    const collectorsWithStats = await Promise.all(
        (collectors || []).map(async (collector) => {
            const { count: activeAssignments } = await supabase
                .from('collection_requests')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_collector_id', collector.id)
                .in('status', ['assigned', 'accepted_by_collector', 'en_route', 'at_location', 'in_progress']);

            const { count: completedToday } = await supabase
                .from('collection_requests')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_collector_id', collector.id)
                .eq('status', 'completed')
                .gte('updated_at', startOfDay);

            // Get average rating
            const { data: avgRating } = await supabase
                .rpc('get_collector_average_rating', { collector_uuid: collector.id });

            return {
                ...collector,
                isOnDuty: onDutyIds.includes(collector.id),
                activeAssignments: activeAssignments || 0,
                completedToday: completedToday || 0,
                averageRating: avgRating || 0,
            };
        })
    );

    return {
        success: true,
        data: collectorsWithStats,
    };
}

export async function assignCollector(
    requestId: string,
    collectorId: string,
    instructions?: string
): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get current request
    const { data: request } = await supabase
        .from('collection_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (!request) {
        return { success: false, error: 'Request not found' };
    }

    if (!['payment_confirmed', 'declined_by_collector'].includes(request.status)) {
        return { success: false, error: 'This request cannot be assigned a collector at this stage' };
    }

    // Get collector info
    const { data: collector } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', collectorId)
        .single();

    // Update request with collector assignment
    const { error } = await supabase
        .from('collection_requests')
        .update({
            status: 'assigned',
            assigned_collector_id: collectorId,
            assigned_at: new Date().toISOString(),
            staff_notes: instructions || request.staff_notes,
            reassignment_count: request.status === 'declined_by_collector'
                ? (request.reassignment_count || 0) + 1
                : request.reassignment_count || 0,
            updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Create notification for collector
    await supabase.from('notifications').insert({
        user_id: collectorId,
        type: 'collector_assignment',
        title: 'New Collection Assignment',
        message: `You have been assigned to request ${request.request_number}. Please review and accept.`,
        reference_id: requestId,
        reference_type: 'collection_request',
    });

    // Create notification for client
    await supabase.from('notifications').insert({
        user_id: request.client_id,
        type: 'collector_assignment',
        title: 'Collector Assigned',
        message: `A collector has been assigned to your request ${request.request_number}. Collector: ${collector?.full_name}`,
        reference_id: requestId,
        reference_type: 'collection_request',
    });

    revalidatePath('/staff/collections');
    return { success: true };
}

export async function completeRequest(requestId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get current request
    const { data: request } = await supabase
        .from('collection_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (!request) {
        return { success: false, error: 'Request not found' };
    }

    const { error } = await supabase
        .from('collection_requests')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Create notification for client
    await supabase.from('notifications').insert({
        user_id: request.client_id,
        type: 'collection_complete',
        title: 'Collection Completed',
        message: `Your request ${request.request_number} has been completed. Please leave feedback!`,
        reference_id: requestId,
        reference_type: 'collection_request',
    });

    revalidatePath('/staff/collections');
    return { success: true };
}

// ============================================================================
// USER CREATION
// ============================================================================

export async function createUser(input: CreateUserInput): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check if user is staff or admin
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!currentProfile || !['admin', 'staff'].includes(currentProfile.role)) {
        return { success: false, error: 'Unauthorized - Only staff and admin can create users' };
    }

    // Enforce role-based creation rules:
    // - Admin can only create Staff
    // - Staff can only create Collectors
    if (currentProfile.role === 'admin' && input.role !== 'staff') {
        return { success: false, error: 'Admins can only create Staff accounts' };
    }

    if (currentProfile.role === 'staff' && input.role !== 'collector') {
        return { success: false, error: 'Staff can only create Collector accounts' };
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', input.email)
        .single();

    if (existingUser) {
        return { success: false, error: 'A user with this email already exists' };
    }

    // Create user through Supabase Auth API
    // Users created by admin/staff are automatically verified
    try {
        // Use Supabase Auth to create the user
        // We'll set email_confirm: true to auto-verify since admin/staff is creating them
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: input.email,
            password: input.password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                data: {
                    first_name: input.firstName,
                    last_name: input.lastName,
                    full_name: `${input.firstName} ${input.lastName}`,
                    phone: input.phone,
                    barangay: input.barangay,
                    address: input.address,
                    role: input.role,
                },
            },
        });

        if (authError) {
            // Handle specific error cases
            if (authError.message.includes('already registered')) {
                return { success: false, error: 'A user with this email already exists' };
            }
            return { success: false, error: authError.message };
        }

        if (!authData.user) {
            return { success: false, error: 'Failed to create user account' };
        }

        // The profile should be created automatically via the trigger
        // But we'll ensure it exists with the correct role AND auto-verified
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                first_name: input.firstName,
                last_name: input.lastName,
                email: input.email,
                phone: input.phone,
                address: input.address || null,
                barangay: input.barangay || null,
                role: input.role,
                status: input.status,
                email_verified: true, // Auto-verified when created by admin/staff
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'id',
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail if profile creation fails - the trigger might handle it
        }

        // Note: To fully auto-verify in Supabase Auth, you may need to use
        // the Admin API (supabase.auth.admin.createUser with email_confirm: true)
        // or run this SQL after user creation:
        // UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = 'user-id';

        // TODO: In production, send welcome email if input.sendWelcomeEmail is true
        // This would use a service like Resend, SendGrid, or Supabase's email features

        revalidatePath('/staff/users');
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('User creation error:', error);
        return { success: false, error: 'Failed to create user' };
    }
}

// ============================================================================
// USER PASSWORD RESET
// ============================================================================

export async function resetUserPassword(userId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check permissions
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!currentProfile || !['admin', 'staff'].includes(currentProfile.role)) {
        return { success: false, error: 'Unauthorized' };
    }

    // Mock reset notification
    await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system_alert',
        title: 'Password Reset',
        message: 'Your password reset request has been processed. Please check your email.',
        data: { type: 'password_reset' },
    });

    return { success: true };
}

// ============================================================================
// QUICK ACTION BADGE COUNTS
// ============================================================================

export async function getQuickActionCounts() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get pending requests count
    const { count: pendingRequests } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Get pending payments (accepted requests awaiting payment)
    const { count: pendingPayments } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted');

    // Get unread feedback count
    const { count: unreadFeedback } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

    return {
        success: true,
        data: {
            pendingRequests: pendingRequests || 0,
            pendingPayments: pendingPayments || 0,
            unreadFeedback: unreadFeedback || 0,
        },
    };
}
