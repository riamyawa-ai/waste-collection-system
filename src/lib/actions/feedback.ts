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

export interface FeedbackFilters {
    search?: string;
    status?: 'new' | 'reviewed' | 'responded' | 'flagged' | 'all';
    rating?: number;
    collectorId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

export interface UpdateFeedbackInput {
    id: string;
    status?: 'new' | 'reviewed' | 'responded' | 'flagged';
    staffResponse?: string;
}

// ============================================================================
// FEEDBACK MANAGEMENT
// ============================================================================

export async function getFeedback(filters: FeedbackFilters = {}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
        .from('feedback')
        .select(`
            *,
            client:client_id(id, full_name, email),
            collector:collector_id(id, full_name, phone),
            request:request_id(id, request_number, barangay)
        `, { count: 'exact' });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters.rating) {
        query = query.eq('overall_rating', filters.rating);
    }

    if (filters.collectorId) {
        query = query.eq('collector_id', filters.collectorId);
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
            feedback: data,
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        },
    };
}

export async function getFeedbackStats() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get total feedback
    const { count: totalFeedback } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });

    // Get average rating
    const { data: ratingData } = await supabase
        .from('feedback')
        .select('overall_rating');

    const avgRating = ratingData && ratingData.length > 0
        ? ratingData.reduce((sum, f) => sum + f.overall_rating, 0) / ratingData.length
        : 0;

    // Get pending review (new status)
    const { count: pendingReview } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

    // Get this month's feedback
    const { count: thisMonth } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

    // Get rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingData?.forEach(f => {
        if (f.overall_rating >= 1 && f.overall_rating <= 5) {
            ratingDistribution[f.overall_rating]++;
        }
    });

    return {
        success: true,
        data: {
            total: totalFeedback || 0,
            averageRating: Math.round(avgRating * 10) / 10,
            pendingReview: pendingReview || 0,
            thisMonth: thisMonth || 0,
            ratingDistribution,
        },
    };
}

export async function getFeedbackById(feedbackId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: feedback, error } = await supabase
        .from('feedback')
        .select(`
            *,
            client:client_id(id, full_name, email, phone),
            collector:collector_id(id, full_name, phone, email),
            request:request_id(id, request_number, barangay, address, preferred_date, completed_at),
            responder:responded_by(id, full_name)
        `)
        .eq('id', feedbackId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: feedback,
    };
}

export async function updateFeedback(input: UpdateFeedbackInput): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (input.status) {
        updateData.status = input.status;
    }

    if (input.staffResponse !== undefined) {
        updateData.staff_response = input.staffResponse;
        updateData.responded_by = user.id;
        updateData.responded_at = new Date().toISOString();
        updateData.status = 'responded';
    }

    const { error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', input.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/feedback');
    return { success: true };
}

export async function markFeedbackAsReviewed(feedbackId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('feedback')
        .update({
            status: 'reviewed',
            updated_at: new Date().toISOString(),
        })
        .eq('id', feedbackId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/feedback');
    return { success: true };
}

export async function flagFeedback(feedbackId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('feedback')
        .update({
            status: 'flagged',
            updated_at: new Date().toISOString(),
        })
        .eq('id', feedbackId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/feedback');
    return { success: true };
}

export async function getCollectorPerformance() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get all collectors
    const { data: collectors } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'collector')
        .eq('status', 'active');

    if (!collectors) {
        return { success: true, data: [] };
    }

    // Get feedback stats for each collector
    const performanceData = await Promise.all(
        collectors.map(async (collector) => {
            const { data: feedback } = await supabase
                .from('feedback')
                .select('overall_rating')
                .eq('collector_id', collector.id);

            const totalFeedback = feedback?.length || 0;
            const avgRating = totalFeedback > 0
                ? feedback!.reduce((sum, f) => sum + f.overall_rating, 0) / totalFeedback
                : 0;

            // Get completed collections count
            const { count: completedCollections } = await supabase
                .from('collection_requests')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_collector_id', collector.id)
                .eq('status', 'completed');

            return {
                id: collector.id,
                name: collector.full_name,
                totalFeedback,
                averageRating: Math.round(avgRating * 10) / 10,
                completedCollections: completedCollections || 0,
            };
        })
    );

    // Sort by average rating
    performanceData.sort((a, b) => b.averageRating - a.averageRating);

    return {
        success: true,
        data: performanceData,
    };
}
