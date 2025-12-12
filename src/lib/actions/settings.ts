'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface SystemSettings {
    general: {
        systemName: string;
        organizationName: string;
        contactEmail: string;
        contactPhone: string;
        address: string;
        timezone: string;
    };
    service: {
        workingHoursStart: string;
        workingHoursEnd: string;
        workingDays: string[];
        maxRequestsPerDay: string;
        advanceBookingDays: string;
        maxPhotosPerRequest: string;
    };
    security: {
        sessionTimeout: string;
        maxLoginAttempts: string;
        lockoutDuration: string;
        requireTwoFactor: boolean;
        passwordMinLength: string;
        passwordRequireSpecial: boolean;
        passwordRequireNumbers: boolean;
        passwordRequireUppercase: boolean;
    };
    email: {
        smtpHost: string;
        smtpPort: string;
        smtpUser: string;
        smtpPassword: string;
        fromEmail: string;
        fromName: string;
        enableNotifications: boolean;
    };
    maintenance: {
        enabled: boolean;
        message: string;
        allowedRoles: string[];
        scheduledStart: string | null;
        scheduledEnd: string | null;
    };
}

export interface ActionResult {
    success: boolean;
    error?: string;
    data?: unknown;
}

/**
 * Get all system settings
 */
export async function getSystemSettings(): Promise<{ success: boolean; data?: SystemSettings; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return { success: false, error: 'Unauthorized - Admin access required' };
        }

        const { data, error } = await supabase
            .from('system_settings')
            .select('key, value');

        if (error) {
            // If table doesn't exist, return default settings
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                return { success: true, data: getDefaultSettings() };
            }
            console.error('Error fetching settings:', error);
            return { success: false, error: 'Failed to fetch settings' };
        }

        // Convert array of settings to object
        const settings: Partial<SystemSettings> = {};
        for (const row of data || []) {
            settings[row.key as keyof SystemSettings] = row.value;
        }

        // Merge with defaults for any missing keys
        const defaultSettings = getDefaultSettings();
        const mergedSettings: SystemSettings = {
            general: { ...defaultSettings.general, ...settings.general },
            service: { ...defaultSettings.service, ...settings.service },
            security: { ...defaultSettings.security, ...settings.security },
            email: { ...defaultSettings.email, ...settings.email },
            maintenance: { ...defaultSettings.maintenance, ...settings.maintenance },
        };

        return { success: true, data: mergedSettings };
    } catch (error) {
        console.error('Error in getSystemSettings:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Update settings for a specific category
 */
export async function updateSettings(
    category: keyof SystemSettings,
    value: Record<string, unknown>
): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return { success: false, error: 'Unauthorized - Admin access required' };
        }

        // Use upsert to create or update
        const { error } = await supabase
            .from('system_settings')
            .upsert(
                {
                    key: category,
                    value,
                    category,
                    updated_at: new Date().toISOString(),
                    updated_by: user.id,
                },
                { onConflict: 'key' }
            );

        if (error) {
            console.error('Error updating settings:', error);
            return { success: false, error: 'Failed to update settings' };
        }

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Error in updateSettings:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Get maintenance mode status (public, used for login blocking)
 */
export async function getMaintenanceMode(): Promise<{
    enabled: boolean;
    message: string;
    allowedRoles: string[];
}> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'maintenance')
            .single();

        if (error || !data) {
            return { enabled: false, message: '', allowedRoles: ['admin'] };
        }

        const maintenance = data.value as SystemSettings['maintenance'];
        return {
            enabled: maintenance.enabled || false,
            message: maintenance.message || 'System is under maintenance.',
            allowedRoles: maintenance.allowedRoles || ['admin'],
        };
    } catch (error) {
        console.error('Error in getMaintenanceMode:', error);
        return { enabled: false, message: '', allowedRoles: ['admin'] };
    }
}

/**
 * Toggle maintenance mode
 */
export async function toggleMaintenanceMode(enabled: boolean, message?: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return { success: false, error: 'Unauthorized - Admin access required' };
        }

        // Get current maintenance settings
        const { data: currentSettings } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'maintenance')
            .single();

        const currentMaintenance = (currentSettings?.value || {}) as SystemSettings['maintenance'];

        const newMaintenance = {
            ...currentMaintenance,
            enabled,
            message: message || currentMaintenance.message || 'System is under maintenance.',
        };

        const { error } = await supabase
            .from('system_settings')
            .upsert(
                {
                    key: 'maintenance',
                    value: newMaintenance,
                    category: 'maintenance',
                    updated_at: new Date().toISOString(),
                    updated_by: user.id,
                },
                { onConflict: 'key' }
            );

        if (error) {
            console.error('Error toggling maintenance mode:', error);
            return { success: false, error: 'Failed to toggle maintenance mode' };
        }

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Error in toggleMaintenanceMode:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Get default settings
 */
function getDefaultSettings(): SystemSettings {
    return {
        general: {
            systemName: 'Waste Collection Management System',
            organizationName: 'Panabo City CENRO',
            contactEmail: 'cenro@panabocity.gov.ph',
            contactPhone: '(084) 822-1234',
            address: 'City Hall, Panabo City, Davao del Norte',
            timezone: 'Asia/Manila',
        },
        service: {
            workingHoursStart: '07:00',
            workingHoursEnd: '17:00',
            workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            maxRequestsPerDay: '50',
            advanceBookingDays: '1',
            maxPhotosPerRequest: '5',
        },
        security: {
            sessionTimeout: '30',
            maxLoginAttempts: '5',
            lockoutDuration: '15',
            requireTwoFactor: false,
            passwordMinLength: '8',
            passwordRequireSpecial: true,
            passwordRequireNumbers: true,
            passwordRequireUppercase: true,
        },
        email: {
            smtpHost: '',
            smtpPort: '587',
            smtpUser: '',
            smtpPassword: '',
            fromEmail: 'noreply@panabocity.gov.ph',
            fromName: 'Waste Collection System',
            enableNotifications: true,
        },
        maintenance: {
            enabled: false,
            message: 'System is under maintenance. Please try again later.',
            allowedRoles: ['admin'],
            scheduledStart: null,
            scheduledEnd: null,
        },
    };
}
