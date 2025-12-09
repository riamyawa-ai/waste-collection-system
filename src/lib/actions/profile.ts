'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Get current user's profile
 */
export async function getProfile() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in', data: null };
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return { success: false, error: 'Failed to fetch profile', data: null };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in getProfile:', error);
        return { success: false, error: 'An unexpected error occurred', data: null };
    }
}

/**
 * Update user profile
 */
export async function updateProfile(input: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    barangay?: string;
}): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in' };
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: input.first_name,
                last_name: input.last_name,
                phone: input.phone,
                address: input.address,
                barangay: input.barangay,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            console.error('Error updating profile:', error);
            return { success: false, error: 'Failed to update profile' };
        }

        revalidatePath('/client/profile');
        return { success: true };
    } catch (error) {
        console.error('Error in updateProfile:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Change user password
 */
export async function changePassword(input: {
    currentPassword: string;
    newPassword: string;
}): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in' };
        }

        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: input.currentPassword,
        });

        if (signInError) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Update password
        const { error } = await supabase.auth.updateUser({
            password: input.newPassword,
        });

        if (error) {
            console.error('Error changing password:', error);
            return { success: false, error: 'Failed to change password' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in changePassword:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Get user account statistics
 */
export async function getAccountStats() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in', data: null };
        }

        // Get profile creation date
        const { data: profile } = await supabase
            .from('profiles')
            .select('created_at')
            .eq('id', user.id)
            .single();

        // Get request counts
        const { data: requests } = await supabase
            .from('collection_requests')
            .select('status')
            .eq('client_id', user.id);

        const stats = {
            memberSince: profile?.created_at || user.created_at,
            totalRequests: requests?.length || 0,
            completedRequests: requests?.filter(r => r.status === 'completed').length || 0,
        };

        return { success: true, data: stats };
    } catch (error) {
        console.error('Error in getAccountStats:', error);
        return { success: false, error: 'An unexpected error occurred', data: null };
    }
}

/**
 * Delete user account (soft delete with 30-day grace period)
 */
export async function deleteAccount(password: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in' };
        }

        // Verify password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: password,
        });

        if (signInError) {
            return { success: false, error: 'Password is incorrect' };
        }

        // Mark account as suspended (soft delete)
        const { error } = await supabase
            .from('profiles')
            .update({
                status: 'suspended',
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            console.error('Error deleting account:', error);
            return { success: false, error: 'Failed to delete account' };
        }

        // Sign out the user
        await supabase.auth.signOut();

        return { success: true };
    } catch (error) {
        console.error('Error in deleteAccount:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Get pending feedback requests (completed requests without feedback)
 */
export async function getPendingFeedback() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in', data: null };
        }

        // Get completed requests that don't have feedback yet
        const { data: completedRequests, error: reqError } = await supabase
            .from('collection_requests')
            .select(`
                id,
                request_number,
                barangay,
                completed_at,
                assigned_collector:profiles!collection_requests_assigned_collector_id_fkey(full_name)
            `)
            .eq('client_id', user.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false });

        if (reqError) {
            const errorStr = JSON.stringify(reqError);
            if (reqError.code === '42P01' || errorStr.includes('does not exist')) {
                return { success: true, data: [] };
            }
            console.error('Error fetching completed requests:', reqError);
            return { success: false, error: 'Failed to fetch requests', data: null };
        }

        // Get existing feedback
        const { data: existingFeedback } = await supabase
            .from('feedback')
            .select('request_id')
            .eq('client_id', user.id);

        const feedbackRequestIds = new Set(existingFeedback?.map(f => f.request_id) || []);

        // Filter out requests that already have feedback
        const pendingFeedback = completedRequests?.filter(r => !feedbackRequestIds.has(r.id)) || [];

        return { success: true, data: pendingFeedback };
    } catch (error) {
        console.error('Error in getPendingFeedback:', error);
        return { success: false, error: 'An unexpected error occurred', data: null };
    }
}

/**
 * Get user's feedback history
 */
export async function getFeedbackHistory() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in', data: null };
        }

        const { data, error } = await supabase
            .from('feedback')
            .select(`
                *,
                request:collection_requests(request_number),
                collector:profiles!feedback_collector_id_fkey(full_name)
            `)
            .eq('client_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            const errorStr = JSON.stringify(error);
            if (error.code === '42P01' || errorStr.includes('does not exist')) {
                return { success: true, data: [] };
            }
            console.error('Error fetching feedback history:', error);
            return { success: false, error: 'Failed to fetch feedback', data: null };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error in getFeedbackHistory:', error);
        return { success: false, error: 'An unexpected error occurred', data: null };
    }
}

/**
 * Submit feedback for a completed request
 */
export async function submitFeedback(input: {
    requestId: string;
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
}): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in' };
        }

        // Get the request to verify ownership and get collector
        const { data: request, error: reqError } = await supabase
            .from('collection_requests')
            .select('client_id, assigned_collector_id, status')
            .eq('id', input.requestId)
            .single();

        if (reqError || !request) {
            return { success: false, error: 'Request not found' };
        }

        if (request.client_id !== user.id) {
            return { success: false, error: 'You can only give feedback for your own requests' };
        }

        if (request.status !== 'completed') {
            return { success: false, error: 'You can only give feedback for completed requests' };
        }

        // Check if feedback already exists
        const { data: existingFeedback } = await supabase
            .from('feedback')
            .select('id')
            .eq('request_id', input.requestId)
            .single();

        if (existingFeedback) {
            return { success: false, error: 'Feedback already submitted for this request' };
        }

        // Insert feedback
        const { error } = await supabase.from('feedback').insert({
            request_id: input.requestId,
            client_id: user.id,
            collector_id: request.assigned_collector_id,
            overall_rating: input.rating,
            comments: input.comment || null,
            is_anonymous: input.isAnonymous || false,
            status: 'new',
        });

        if (error) {
            console.error('Error submitting feedback:', error);
            return { success: false, error: 'Failed to submit feedback' };
        }

        revalidatePath('/client/feedback');
        return { success: true };
    } catch (error) {
        console.error('Error in submitFeedback:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
