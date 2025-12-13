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

export interface AnnouncementFilters {
    search?: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'maintenance' | 'event' | 'all';
    status?: 'draft' | 'published' | 'scheduled' | 'expired' | 'all';
    priority?: 'normal' | 'important' | 'urgent' | 'all';
    page?: number;
    limit?: number;
}

export interface CreateAnnouncementInput {
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'maintenance' | 'event';
    priority: 'normal' | 'important' | 'urgent';
    targetAudience: string[];
    imageUrl?: string;
    publishDate: string;
    expiryDate?: string;
    publishImmediately?: boolean;
    sendEmailNotification?: boolean;
    sendPushNotification?: boolean;
    // Maintenance-specific fields
    maintenanceStartDateTime?: string;
    maintenanceEndDateTime?: string;
    // Event-specific fields  
    hasEventImage?: boolean;
}

export interface UpdateAnnouncementInput {
    id: string;
    title?: string;
    content?: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'maintenance' | 'event';
    priority?: 'normal' | 'important' | 'urgent';
    targetAudience?: string[];
    imageUrl?: string;
    publishDate?: string;
    expiryDate?: string;
    isPublished?: boolean;
    sendEmailNotification?: boolean;
    sendPushNotification?: boolean;
    enableMaintenanceMode?: boolean;
}

// ============================================================================
// ANNOUNCEMENT MANAGEMENT
// ============================================================================

export async function getAnnouncements(filters: AnnouncementFilters = {}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
        .from('announcements')
        .select(`
            *,
            creator:created_by(id, full_name)
        `, { count: 'exact' });

    // Filter by target audience (visibility)
    // Users should see announcements that target 'all' OR their specific role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const userRole = profile?.role || 'client';

    // Admin sees everything
    if (userRole !== 'admin') {
        query = query.or(`target_audience.cs.{"all"},target_audience.cs.{"${userRole}"}`);
    }

    // Apply filters
    if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
    }

    if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
    }

    // Status filter logic
    const now = new Date().toISOString();
    if (filters.status && filters.status !== 'all') {
        switch (filters.status) {
            case 'published':
                query = query.eq('is_published', true).lte('publish_date', now);
                break;
            case 'draft':
                query = query.eq('is_published', false);
                break;
            case 'scheduled':
                query = query.eq('is_published', true).gt('publish_date', now);
                break;
            case 'expired':
                query = query.lt('expiry_date', now);
                break;
        }
    }

    // Order and paginate
    query = query
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            announcements: data,
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        },
    };
}

export async function getAnnouncementStats() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const now = new Date().toISOString();

    // Get total announcements
    const { count: totalAnnouncements } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true });

    // Get active (published and not expired)
    const { count: activeAnnouncements } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .lte('publish_date', now)
        .or(`expiry_date.is.null,expiry_date.gt.${now}`);

    // Get urgent priority
    const { count: urgentCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('priority', 'urgent')
        .eq('is_published', true);

    // Get scheduled (future publish date)
    const { count: scheduledCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .gt('publish_date', now);

    return {
        success: true,
        data: {
            total: totalAnnouncements || 0,
            active: activeAnnouncements || 0,
            urgent: urgentCount || 0,
            scheduled: scheduledCount || 0,
        },
    };
}

export async function getAnnouncementById(announcementId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: announcement, error } = await supabase
        .from('announcements')
        .select(`
            *,
            creator:created_by(id, full_name, email)
        `)
        .eq('id', announcementId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: announcement,
    };
}

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<ActionResult<{ id: string }>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Validate required fields
    if (!input.title || !input.content) {
        return { success: false, error: 'Title and content are required' };
    }

    // Check permissions for maintenance mode
    if (input.type === 'maintenance') {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return {
                success: false,
                error: 'Only administrators can create maintenance announcements'
            };
        }
    }

    const publishDate = input.publishImmediately
        ? new Date().toISOString()
        : input.publishDate;

    const { data: announcement, error } = await supabase
        .from('announcements')
        .insert({
            title: input.title,
            content: input.content,
            type: input.type,
            priority: input.priority,
            target_audience: input.targetAudience,
            image_url: input.imageUrl || null,
            publish_date: publishDate,
            expiry_date: input.expiryDate || null,
            is_published: input.publishImmediately || false,
            send_email_notification: input.sendEmailNotification || false,
            send_push_notification: input.sendPushNotification || false,
            // For maintenance type, store the window in metadata
            maintenance_start: input.maintenanceStartDateTime || null,
            maintenance_end: input.maintenanceEndDateTime || null,
            // maintenance_allowed_roles is deprecated in favor of target_audience (Blocklist)
            enable_maintenance_mode: input.type === 'maintenance' && !!input.maintenanceStartDateTime,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // If sending notifications, create notifications for target users
    if ((input.sendEmailNotification || input.sendPushNotification) && input.publishImmediately) {
        await sendAnnouncementNotifications(announcement.id, input.targetAudience, announcement.title);
    }

    // If maintenance mode should be activated immediately
    if (input.type === 'maintenance' && input.publishImmediately && input.maintenanceStartDateTime) {
        const startTime = new Date(input.maintenanceStartDateTime);
        const now = new Date();
        if (startTime <= now) {
            await syncMaintenanceModeWithSettings(true, input.content);
        }
    }

    revalidatePath('/staff/announcements');
    revalidatePath('/admin/announcements');
    return { success: true, data: { id: announcement.id } };
}

export async function updateAnnouncement(input: UpdateAnnouncementInput): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (input.title) updateData.title = input.title;
    if (input.content) updateData.content = input.content;
    if (input.type) updateData.type = input.type;
    if (input.priority) updateData.priority = input.priority;
    if (input.targetAudience) updateData.target_audience = input.targetAudience;
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
    if (input.publishDate) updateData.publish_date = input.publishDate;
    if (input.expiryDate !== undefined) updateData.expiry_date = input.expiryDate;
    if (input.isPublished !== undefined) updateData.is_published = input.isPublished;
    if (input.sendEmailNotification !== undefined) updateData.send_email_notification = input.sendEmailNotification;
    if (input.sendPushNotification !== undefined) updateData.send_push_notification = input.sendPushNotification;
    if (input.enableMaintenanceMode !== undefined) updateData.enable_maintenance_mode = input.enableMaintenanceMode;
    if (input.enableMaintenanceMode !== undefined) updateData.enable_maintenance_mode = input.enableMaintenanceMode;

    const { error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', input.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/announcements');
    return { success: true };
}

export async function deleteAnnouncement(announcementId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/announcements');
    return { success: true };
}

export async function publishAnnouncement(announcementId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get announcement details
    const { data: announcement } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', announcementId)
        .single();

    if (!announcement) {
        return { success: false, error: 'Announcement not found' };
    }

    const { error } = await supabase
        .from('announcements')
        .update({
            is_published: true,
            publish_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', announcementId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Send notifications
    if (announcement.send_email_notification || announcement.send_push_notification) {
        await sendAnnouncementNotifications(
            announcementId,
            announcement.target_audience,
            announcement.title
        );
    }

    revalidatePath('/staff/announcements');
    return { success: true };
}

export async function extendAnnouncementExpiry(
    announcementId: string,
    newExpiryDate: string
): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('announcements')
        .update({
            expiry_date: newExpiryDate,
            updated_at: new Date().toISOString(),
        })
        .eq('id', announcementId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/announcements');
    return { success: true };
}

export async function duplicateAnnouncement(announcementId: string): Promise<ActionResult<{ id: string }>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get original announcement
    const { data: original, error: fetchError } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', announcementId)
        .single();

    if (fetchError || !original) {
        return { success: false, error: 'Announcement not found' };
    }

    // Create duplicate
    const { data: duplicate, error: createError } = await supabase
        .from('announcements')
        .insert({
            title: `${original.title} (Copy)`,
            content: original.content,
            type: original.type,
            priority: original.priority,
            target_audience: original.target_audience,
            image_url: original.image_url,
            publish_date: new Date().toISOString(),
            expiry_date: null,
            is_published: false,
            send_email_notification: original.send_email_notification,
            send_push_notification: original.send_push_notification,
            enable_maintenance_mode: false,
            created_by: user.id,
        })
        .select()
        .single();

    if (createError) {
        return { success: false, error: createError.message };
    }

    revalidatePath('/staff/announcements');
    return { success: true, data: { id: duplicate.id } };
}

// Helper function to send notifications
async function sendAnnouncementNotifications(
    announcementId: string,
    targetAudience: string[],
    title: string
) {
    const supabase = await createClient();

    // Build role filter
    let roleFilter: string[] = [];
    if (targetAudience.includes('all')) {
        roleFilter = ['admin', 'staff', 'client', 'collector'];
    } else {
        roleFilter = targetAudience;
    }

    // Get target users
    const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .in('role', roleFilter)
        .eq('status', 'active');

    if (!users || users.length === 0) return;

    // Create notifications for each user
    const notifications = users.map(u => ({
        user_id: u.id,
        type: 'system_announcement' as const,
        title: 'New Announcement',
        message: title,
        data: { announcement_id: announcementId },
    }));

    await supabase.from('notifications').insert(notifications);
}

// Helper function to sync maintenance mode with system settings
async function syncMaintenanceModeWithSettings(enabled: boolean, message: string) {
    const supabase = await createClient();

    try {
        // Get current maintenance settings
        const { data: currentSettings } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'maintenance')
            .single();

        const currentMaintenance = (currentSettings?.value || {
            enabled: false,
            message: 'System is under maintenance.',
            allowedRoles: ['admin'],
            scheduledStart: null,
            scheduledEnd: null,
        }) as {
            enabled: boolean;
            message: string;
            allowedRoles: string[];
            scheduledStart: string | null;
            scheduledEnd: string | null;
        };

        const newMaintenance = {
            ...currentMaintenance,
            enabled,
            message: message || currentMaintenance.message,
        };

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        await supabase
            .from('system_settings')
            .upsert(
                {
                    key: 'maintenance',
                    value: newMaintenance,
                    category: 'maintenance',
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id,
                },
                { onConflict: 'key' }
            );
    } catch (error) {
        console.error('Error syncing maintenance mode:', error);
    }
}
