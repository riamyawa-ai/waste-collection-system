/**
 * Supabase Realtime Utilities
 * 
 * This module provides utilities for setting up real-time subscriptions
 * to database changes. Will be fully implemented in DAY9.
 * 
 * Planned subscriptions:
 * - Request status changes
 * - Collector assignments
 * - Schedule updates
 * - Notifications
 * - Announcements
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Create a Supabase client for realtime subscriptions
 */
export function createRealtimeClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * Subscribe to request status changes for a specific request
 */
export function subscribeToRequestChanges(
    requestId: string,
    callback: (payload: { new: Database['public']['Tables']['collection_requests']['Row'] }) => void
): RealtimeChannel {
    const supabase = createRealtimeClient();

    return supabase
        .channel(`request-${requestId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'collection_requests',
                filter: `id=eq.${requestId}`,
            },
            callback
        )
        .subscribe();
}

/**
 * Subscribe to notifications for the current user
 */
export function subscribeToNotifications(
    userId: string,
    callback: (payload: { new: Database['public']['Tables']['notifications']['Row'] }) => void
): RealtimeChannel {
    const supabase = createRealtimeClient();

    return supabase
        .channel(`notifications-${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            },
            callback
        )
        .subscribe();
}

/**
 * Subscribe to collector assignment changes
 * Useful for collectors to receive new assignments in real-time
 */
export function subscribeToCollectorAssignments(
    collectorId: string,
    callback: (payload: { new: Database['public']['Tables']['collection_requests']['Row'] }) => void
): RealtimeChannel {
    const supabase = createRealtimeClient();

    return supabase
        .channel(`collector-assignments-${collectorId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'collection_requests',
                filter: `assigned_collector_id=eq.${collectorId}`,
            },
            callback
        )
        .subscribe();
}

/**
 * Subscribe to new announcements
 */
export function subscribeToAnnouncements(
    callback: (payload: { new: Database['public']['Tables']['announcements']['Row'] }) => void
): RealtimeChannel {
    const supabase = createRealtimeClient();

    return supabase
        .channel('announcements')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'announcements',
            },
            callback
        )
        .subscribe();
}

/**
 * Cleanup function to unsubscribe from a channel
 */
export async function unsubscribe(channel: RealtimeChannel) {
    const supabase = createRealtimeClient();
    await supabase.removeChannel(channel);
}
