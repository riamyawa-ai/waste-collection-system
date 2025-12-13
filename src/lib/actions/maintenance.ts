'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Check if system is currently in maintenance mode
 * Returns maintenance details if active, null otherwise
 */
export async function checkMaintenanceMode() {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // Check for active maintenance announcements with current time in window
    const { data: maintenanceAnnouncement, error } = await supabase
        .from('announcements')
        .select('id, title, content, maintenance_start, maintenance_end')
        .eq('type', 'maintenance')
        .eq('is_published', true)
        .lte('maintenance_start', now)
        .gte('maintenance_end', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error checking maintenance mode:', error);
        return null;
    }

    if (maintenanceAnnouncement) {
        return {
            isActive: true,
            title: maintenanceAnnouncement.title,
            message: maintenanceAnnouncement.content,
            endTime: maintenanceAnnouncement.maintenance_end,
        };
    }

    // Also check system_settings for legacy maintenance mode
    const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance')
        .single();

    const maintenanceSettings = settings?.value as {
        enabled?: boolean;
        message?: string;
        scheduledEnd?: string;
    } | null;

    if (maintenanceSettings?.enabled) {
        return {
            isActive: true,
            title: 'System Maintenance',
            message: maintenanceSettings.message || 'System is under maintenance. Please try again later.',
            endTime: maintenanceSettings.scheduledEnd || null,
        };
    }

    return null;
}

/**
 * Get active maintenance announcement details
 */
export async function getActiveMaintenanceAnnouncement() {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('type', 'maintenance')
        .eq('is_published', true)
        .lte('maintenance_start', now)
        .gte('maintenance_end', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error getting maintenance announcement:', error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}
