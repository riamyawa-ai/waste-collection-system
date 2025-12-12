'use server';

/**
 * Collector Server Actions
 * 
 * This file contains server actions specific to Collector functionality.
 * Actions will be implemented as part of DAY8 and DAY9.
 * 
 * Planned actions (DAY8):
 * - getCollectorDashboardStats() - Dashboard statistics
 * - clockIn() - Record attendance login
 * - clockOut() - Record attendance logout
 * - getAttendanceHistory() - Get attendance records
 * - getCollectorFeedback() - Get feedback received
 * - getCollectorPerformance() - Get performance metrics
 * 
 * Planned actions (DAY9):
 * - getCollectorSchedule() - Get assigned schedules
 * - confirmSchedule() - Confirm a schedule assignment
 * - declineSchedule() - Decline with reason
 * - getAssignedRequests() - Get assigned pickup requests
 * - acceptRequest() - Accept an assigned request
 * - declineRequest() - Decline with reason and trigger reassignment
 * - updateRequestStatus() - Update to en_route, at_location, in_progress, completed
 * - completeRequest() - Mark request as complete
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Get collector dashboard statistics
 */
export async function getCollectorDashboardStats() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Get today's date for filtering
    const _today = new Date().toISOString().split('T')[0];

    // Get assigned requests counts
    const { data: requests } = await supabase
        .from('collection_requests')
        .select('status')
        .eq('assigned_collector_id', user.id);

    const stats = {
        todays_routes: 0,
        assigned_requests: requests?.filter(r =>
            ['assigned', 'accepted_by_collector'].includes(r.status)
        ).length || 0,
        in_progress: requests?.filter(r =>
            ['en_route', 'at_location', 'in_progress'].includes(r.status)
        ).length || 0,
        completed_today: requests?.filter(r => r.status === 'completed').length || 0,
        pending_feedback: 0,
        average_rating: 0,
    };

    // Get average rating
    const { data: feedback } = await supabase
        .from('feedback')
        .select('overall_rating')
        .eq('collector_id', user.id);

    if (feedback && feedback.length > 0) {
        const sum = feedback.reduce((acc, f) => acc + f.overall_rating, 0);
        stats.average_rating = Math.round((sum / feedback.length) * 10) / 10;
    }

    return { data: stats };
}

/**
 * Clock in - Record attendance login
 */
export async function clockIn() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if already clocked in today
    const { data: existing } = await supabase
        .from('collector_attendance')
        .select('*')
        .eq('collector_id', user.id)
        .eq('date', today)
        .is('logout_time', null)
        .single();

    if (existing) {
        return { error: 'Already clocked in today' };
    }

    // Create attendance record
    const { data, error } = await supabase
        .from('collector_attendance')
        .insert({
            collector_id: user.id,
            date: today,
            login_time: now,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/collector/dashboard');
    return { data };
}

/**
 * Clock out - Record attendance logout
 */
export async function clockOut() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Find active attendance record
    const { data: existing } = await supabase
        .from('collector_attendance')
        .select('*')
        .eq('collector_id', user.id)
        .eq('date', today)
        .is('logout_time', null)
        .order('login_time', { ascending: false })
        .limit(1)
        .single();

    if (!existing) {
        return { error: 'No active clock-in found' };
    }

    // Update with logout time
    const { data, error } = await supabase
        .from('collector_attendance')
        .update({ logout_time: now })
        .eq('id', existing.id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/collector/dashboard');
    return { data };
}

/**
 * Get attendance history for the collector
 */
export async function getAttendanceHistory(filters?: {
    from_date?: string;
    to_date?: string;
    page?: number;
    limit?: number;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 30;

    let query = supabase
        .from('collector_attendance')
        .select('*', { count: 'exact' })
        .eq('collector_id', user.id)
        .order('date', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (filters?.from_date) {
        query = query.gte('date', filters.from_date);
    }
    if (filters?.to_date) {
        query = query.lte('date', filters.to_date);
    }

    const { data, error, count } = await query;

    if (error) {
        return { error: error.message };
    }

    return { data, total: count };
}

/**
 * Accept an assigned request
 */
export async function acceptRequest(requestId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Verify request is assigned to this collector
    const { data: request } = await supabase
        .from('collection_requests')
        .select('*')
        .eq('id', requestId)
        .eq('assigned_collector_id', user.id)
        .eq('status', 'assigned')
        .single();

    if (!request) {
        return { error: 'Request not found or not assigned to you' };
    }

    // Update status to accepted_by_collector
    const { data, error } = await supabase
        .from('collection_requests')
        .update({
            status: 'accepted_by_collector',
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // TODO: Send notification to client with collector details

    revalidatePath('/collector/requests');
    revalidatePath('/collector/dashboard');
    return { data };
}

/**
 * Decline an assigned request with reason
 */
export async function declineRequest(requestId: string, reason: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Verify request is assigned to this collector
    const { data: request } = await supabase
        .from('collection_requests')
        .select('*, reassignment_count')
        .eq('id', requestId)
        .eq('assigned_collector_id', user.id)
        .eq('status', 'assigned')
        .single();

    if (!request) {
        return { error: 'Request not found or not assigned to you' };
    }

    // Update status to declined_by_collector
    const { data, error } = await supabase
        .from('collection_requests')
        .update({
            status: 'declined_by_collector',
            collector_decline_reason: reason,
            collector_declined_at: new Date().toISOString(),
            reassignment_count: (request.reassignment_count || 0) + 1,
            assigned_collector_id: null, // Clear assignment for reassignment
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // TODO: Trigger reassignment workflow
    // - Find next available collector on duty
    // - Auto-assign or alert staff if no collectors available

    revalidatePath('/collector/requests');
    revalidatePath('/collector/dashboard');
    return { data, message: 'Request declined. Staff will reassign to another collector.' };
}

/**
 * Update request status (en_route, at_location, in_progress)
 */
export async function updateRequestStatus(
    requestId: string,
    status: 'en_route' | 'at_location' | 'in_progress'
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Verify request is assigned to this collector
    const { data: request } = await supabase
        .from('collection_requests')
        .select('status')
        .eq('id', requestId)
        .eq('assigned_collector_id', user.id)
        .single();

    if (!request) {
        return { error: 'Request not found or not assigned to you' };
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
        'accepted_by_collector': ['en_route'],
        'en_route': ['at_location'],
        'at_location': ['in_progress'],
    };

    if (!validTransitions[request.status]?.includes(status)) {
        return { error: `Cannot transition from ${request.status} to ${status}` };
    }

    const updates: Record<string, unknown> = { status };

    if (status === 'in_progress') {
        updates.started_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('collection_requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // TODO: Send notification to client

    revalidatePath('/collector/requests');
    revalidatePath('/collector/dashboard');
    return { data };
}

/**
 * Complete a request
 */
export async function completeRequest(requestId: string, notes?: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Verify request is in_progress and assigned to this collector
    const { data: request } = await supabase
        .from('collection_requests')
        .select('status')
        .eq('id', requestId)
        .eq('assigned_collector_id', user.id)
        .eq('status', 'in_progress')
        .single();

    if (!request) {
        return { error: 'Request not found or not ready for completion' };
    }

    const { data, error } = await supabase
        .from('collection_requests')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            completion_notes: notes,
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // TODO: Send completion notification to client
    // TODO: Send feedback request to client

    revalidatePath('/collector/requests');
    revalidatePath('/collector/dashboard');
    return { data };
}

/**
 * Get assigned requests for the collector
 */
export async function getAssignedRequests(filters?: {
    status?: string;
    page?: number;
    limit?: number;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 25;

    let query = supabase
        .from('collection_requests')
        .select(`
      *,
      client:profiles!collection_requests_client_id_fkey(id, full_name, phone, email)
    `, { count: 'exact' })
        .eq('assigned_collector_id', user.id)
        .order('preferred_date', { ascending: true })
        .range((page - 1) * limit, page * limit - 1);

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    } else if (!filters?.status) {
        // By default, exclude completed and cancelled
        query = query.not('status', 'in', '("completed","cancelled","rejected")');
    }
    // If status is 'all', don't add any status filter

    const { data, error, count } = await query;

    if (error) {
        return { error: error.message };
    }

    return { data, total: count };
}
