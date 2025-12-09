'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Get client's payment records
 */
export async function getClientPayments(filters: {
    status?: string;
    search?: string;
    limit?: number;
} = {}) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in',
                data: null,
            };
        }

        let query = supabase
            .from('payments')
            .select(`
                *,
                request:collection_requests(
                    id,
                    request_number,
                    barangay,
                    address,
                    priority,
                    preferred_date,
                    assigned_collector:profiles!collection_requests_assigned_collector_id_fkey(full_name)
                )
            `)
            .eq('client_id', user.id)
            .order('created_at', { ascending: false });

        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters.search) {
            query = query.or(`payment_number.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`);
        }

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) {
            const errorStr = JSON.stringify(error);
            if (error.code === '42P01' || errorStr.includes('does not exist')) {
                return { success: true, data: [] };
            }
            console.error('Error fetching payments:', error);
            return { success: false, error: 'Failed to fetch payments', data: null };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error in getClientPayments:', error);
        return { success: false, error: 'An unexpected error occurred', data: null };
    }
}

/**
 * Get payment statistics for client
 */
export async function getClientPaymentStats() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in', data: null };
        }

        const { data: payments, error } = await supabase
            .from('payments')
            .select('amount, status, created_at')
            .eq('client_id', user.id);

        if (error) {
            const errorStr = JSON.stringify(error);
            if (error.code === '42P01' || errorStr.includes('does not exist')) {
                return {
                    success: true,
                    data: {
                        totalPayments: 0,
                        totalAmount: 0,
                        completedPayments: 0,
                        completedAmount: 0,
                        pendingPayments: 0,
                        pendingAmount: 0,
                        thisMonthAmount: 0,
                    },
                };
            }
            console.error('Error fetching payment stats:', error);
            return { success: false, error: 'Failed to fetch payment stats', data: null };
        }

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const stats = {
            totalPayments: payments?.length || 0,
            totalAmount: payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
            completedPayments: payments?.filter(p => p.status === 'completed').length || 0,
            completedAmount: payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
            pendingPayments: payments?.filter(p => p.status === 'pending').length || 0,
            pendingAmount: payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
            thisMonthAmount: payments?.filter(p => {
                const date = new Date(p.created_at);
                return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
        };

        return { success: true, data: stats };
    } catch (error) {
        console.error('Error in getClientPaymentStats:', error);
        return { success: false, error: 'An unexpected error occurred', data: null };
    }
}

/**
 * Get announcements for client
 */
export async function getClientAnnouncements(filters: {
    type?: string;
    search?: string;
} = {}) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in', data: null };
        }

        let query = supabase
            .from('announcements')
            .select('*')
            .eq('is_published', true)
            .or('target_audience.cs.{all},target_audience.cs.{client}')
            .gte('expiry_date', new Date().toISOString())
            .order('priority', { ascending: false })
            .order('publish_date', { ascending: false });

        if (filters.type && filters.type !== 'all') {
            query = query.eq('type', filters.type);
        }

        if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
            const errorStr = JSON.stringify(error);
            if (error.code === '42P01' || errorStr.includes('does not exist')) {
                return { success: true, data: [] };
            }
            console.error('Error fetching announcements:', error);
            return { success: false, error: 'Failed to fetch announcements', data: null };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error in getClientAnnouncements:', error);
        return { success: false, error: 'An unexpected error occurred', data: null };
    }
}

/**
 * Get notifications for current user
 */
export async function getClientNotifications(limit: number = 20) {
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
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            const errorStr = JSON.stringify(error);
            if (error.code === '42P01' || errorStr.includes('does not exist')) {
                return { success: true, data: [] };
            }
            console.error('Error fetching notifications:', error);
            return { success: false, error: 'Failed to fetch notifications', data: null };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error in getClientNotifications:', error);
        return { success: false, error: 'An unexpected error occurred', data: null };
    }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<ActionResult> {
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
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error marking notification as read:', error);
            return { success: false, error: 'Failed to update notification' };
        }

        revalidatePath('/client/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error in markNotificationAsRead:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ActionResult> {
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
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all notifications as read:', error);
            return { success: false, error: 'Failed to update notifications' };
        }

        revalidatePath('/client/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error in markAllNotificationsAsRead:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<ActionResult> {
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
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting notification:', error);
            return { success: false, error: 'Failed to delete notification' };
        }

        revalidatePath('/client/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error in deleteNotification:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Clear all read notifications
 */
export async function clearReadNotifications(): Promise<ActionResult> {
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
            .from('notifications')
            .delete()
            .eq('user_id', user.id)
            .eq('is_read', true);

        if (error) {
            console.error('Error clearing notifications:', error);
            return { success: false, error: 'Failed to clear notifications' };
        }

        revalidatePath('/client/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error in clearReadNotifications:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
