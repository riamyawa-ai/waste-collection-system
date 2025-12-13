'use server';

import { createClient } from '@/lib/supabase/server';
import { ActionResult } from './requests';

/**
 * Get all public accepted/active schedules
 * This is used for the client's public calendar view
 */
export async function getPublicSchedules() {
    try {
        const supabase = await createClient();

        // Get schedules with status that indicates they are confirmed/active
        const { data, error } = await supabase
            .from('collection_schedules')
            .select(`
                id,
                name,
                description,
                start_date,
                end_date,
                start_time,
                end_time,
                status,
                assigned_collector:profiles!collection_schedules_assigned_collector_id_fkey(full_name),
                stops_count:schedule_stops(count)
            `)
            .in('status', ['active', 'accepted', 'completed'])
            .order('start_date', { ascending: false });

        if (error) {
            console.error('Error fetching public schedules:', error);
            return {
                success: false,
                error: 'Failed to fetch schedules',
                data: []
            };
        }

        return {
            success: true,
            data: data || []
        };
    } catch (error) {
        console.error('Error in getPublicSchedules:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
            data: []
        };
    }
}
