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

export interface ScheduleFilters {
    search?: string;
    status?: 'draft' | 'active' | 'completed' | 'cancelled' | 'all';
    collectorId?: string;
    routeType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

export interface CreateScheduleInput {
    name: string;
    description?: string;
    scheduleType: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
    startDate: string;
    endDate?: string;
    startTime: string;
    endTime: string;
    workingDays?: string[];
    weekOfMonth?: number[];
    collectorId?: string;
    backupCollectorId?: string;
    specialInstructions?: string;
    stops: Array<{
        locationName: string;
        locationType: string;
        address: string;
        barangay: string;
        latitude?: number;
        longitude?: number;
        stopOrder: number;
        estimatedDuration?: number;
        contactPerson?: string;
        contactNumber?: string;
        specialNotes?: string;
    }>;
}

export interface UpdateScheduleInput {
    id: string;
    name?: string;
    description?: string;
    scheduleType?: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    workingDays?: string[];
    weekOfMonth?: number[];
    collectorId?: string;
    backupCollectorId?: string;
    specialInstructions?: string;
    status?: 'draft' | 'active' | 'completed' | 'cancelled';
}

// ============================================================================
// SCHEDULE MANAGEMENT
// ============================================================================

export async function getSchedules(filters: ScheduleFilters = {}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
        .from('collection_schedules')
        .select(`
            *,
            collector:assigned_collector_id(id, full_name, phone),
            backup_collector:backup_collector_id(id, full_name, phone),
            creator:created_by(id, full_name)
        `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters.collectorId) {
        query = query.or(`assigned_collector_id.eq.${filters.collectorId},backup_collector_id.eq.${filters.collectorId}`);
    }

    if (filters.dateFrom) {
        query = query.gte('start_date', filters.dateFrom);
    }

    if (filters.dateTo) {
        query = query.lte('start_date', filters.dateTo);
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
            schedules: data,
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        },
    };
}

export async function getScheduleStats() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get counts by status
    const { count: totalActive } = await supabase
        .from('collection_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    const { count: totalSchedules } = await supabase
        .from('collection_schedules')
        .select('*', { count: 'exact', head: true });

    // Get schedules this week
    const { count: schedulesThisWeek } = await supabase
        .from('collection_schedules')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', startOfWeek.toISOString().split('T')[0])
        .lte('start_date', endOfWeek.toISOString().split('T')[0]);

    // Get unique barangays covered
    const { data: stops } = await supabase
        .from('schedule_stops')
        .select('barangay');

    const uniqueAreas = new Set(stops?.map(s => s.barangay) || []).size;

    // Get collectors with assignments
    const { data: schedules } = await supabase
        .from('collection_schedules')
        .select('assigned_collector_id')
        .eq('status', 'active')
        .not('assigned_collector_id', 'is', null);

    const assignedCollectors = new Set(schedules?.map(s => s.assigned_collector_id) || []).size;

    return {
        success: true,
        data: {
            totalActive: totalActive || 0,
            totalSchedules: totalSchedules || 0,
            schedulesThisWeek: schedulesThisWeek || 0,
            areasCovered: uniqueAreas,
            collectorsAssigned: assignedCollectors,
        },
    };
}

export async function getScheduleById(scheduleId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data: schedule, error } = await supabase
        .from('collection_schedules')
        .select(`
            *,
            collector:assigned_collector_id(id, full_name, phone, email),
            backup_collector:backup_collector_id(id, full_name, phone, email),
            creator:created_by(id, full_name)
        `)
        .eq('id', scheduleId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Get stops for this schedule
    const { data: stops } = await supabase
        .from('schedule_stops')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('stop_order', { ascending: true });

    return {
        success: true,
        data: {
            schedule,
            stops: stops || [],
        },
    };
}

export async function createSchedule(input: CreateScheduleInput): Promise<ActionResult<{ id: string }>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Validate required fields
    if (!input.name || !input.startDate || !input.startTime || !input.endTime) {
        return { success: false, error: 'Missing required fields' };
    }

    // Determine initial status:
    // - If collector is assigned, status is 'draft' (Pending collector acceptance)
    // - If no collector is assigned, status is 'active' (Unassigned but ready)
    const initialStatus = input.collectorId ? 'draft' : 'active';

    // Create schedule
    const { data: schedule, error: scheduleError } = await supabase
        .from('collection_schedules')
        .insert({
            name: input.name,
            description: input.description,
            schedule_type: input.scheduleType,
            start_date: input.startDate,
            end_date: input.endDate || null,
            start_time: input.startTime,
            end_time: input.endTime,
            working_days: input.workingDays || null,
            week_of_month: input.weekOfMonth || null,
            assigned_collector_id: input.collectorId || null,
            backup_collector_id: input.backupCollectorId || null,
            special_instructions: input.specialInstructions,
            status: initialStatus,
            created_by: user.id,
        })
        .select()
        .single();

    if (scheduleError) {
        return { success: false, error: scheduleError.message };
    }

    // Create stops
    if (input.stops && input.stops.length > 0) {
        const stopsData = input.stops.map(stop => ({
            schedule_id: schedule.id,
            location_name: stop.locationName,
            location_type: stop.locationType,
            address: stop.address,
            barangay: stop.barangay,
            latitude: stop.latitude,
            longitude: stop.longitude,
            stop_order: stop.stopOrder,
            estimated_duration: stop.estimatedDuration,
            contact_person: stop.contactPerson,
            contact_number: stop.contactNumber,
            special_notes: stop.specialNotes,
        }));

        const { error: stopsError } = await supabase
            .from('schedule_stops')
            .insert(stopsData);

        if (stopsError) {
            // Rollback schedule creation
            await supabase.from('collection_schedules').delete().eq('id', schedule.id);
            return { success: false, error: stopsError.message };
        }
    }

    // Notify assigned collector
    if (input.collectorId) {
        await supabase.from('notifications').insert({
            user_id: input.collectorId,
            type: 'schedule_assignment',
            title: 'New Schedule Assignment - Action Required',
            message: `You have been assigned to schedule: ${input.name}. Please review and accept or decline this assignment.`,
            data: { schedule_id: schedule.id },
        });
    }

    revalidatePath('/staff/schedules');
    return { success: true, data: { id: schedule.id } };
}

export async function updateSchedule(input: UpdateScheduleInput): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (input.name) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.scheduleType) updateData.schedule_type = input.scheduleType;
    if (input.startDate) updateData.start_date = input.startDate;
    if (input.endDate !== undefined) updateData.end_date = input.endDate;
    if (input.startTime) updateData.start_time = input.startTime;
    if (input.endTime) updateData.end_time = input.endTime;
    if (input.workingDays !== undefined) updateData.working_days = input.workingDays;
    if (input.weekOfMonth !== undefined) updateData.week_of_month = input.weekOfMonth;
    if (input.collectorId !== undefined) updateData.assigned_collector_id = input.collectorId;
    if (input.backupCollectorId !== undefined) updateData.backup_collector_id = input.backupCollectorId;
    if (input.specialInstructions !== undefined) updateData.special_instructions = input.specialInstructions;
    if (input.status) updateData.status = input.status;

    const { error } = await supabase
        .from('collection_schedules')
        .update(updateData)
        .eq('id', input.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/schedules');
    return { success: true };
}

export async function deleteSchedule(scheduleId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Delete stops first (cascade should handle this, but being explicit)
    await supabase.from('schedule_stops').delete().eq('schedule_id', scheduleId);

    // Delete schedule
    const { error } = await supabase
        .from('collection_schedules')
        .delete()
        .eq('id', scheduleId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/staff/schedules');
    return { success: true };
}

export async function duplicateSchedule(scheduleId: string): Promise<ActionResult<{ id: string }>> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get original schedule
    const { data: original, error: fetchError } = await supabase
        .from('collection_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

    if (fetchError || !original) {
        return { success: false, error: 'Schedule not found' };
    }

    // Get original stops
    const { data: originalStops } = await supabase
        .from('schedule_stops')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('stop_order', { ascending: true });

    // Create new schedule
    const { data: newSchedule, error: createError } = await supabase
        .from('collection_schedules')
        .insert({
            name: `${original.name} (Copy)`,
            description: original.description,
            schedule_type: original.schedule_type,
            start_date: original.start_date,
            end_date: original.end_date,
            start_time: original.start_time,
            end_time: original.end_time,
            working_days: original.working_days,
            week_of_month: original.week_of_month,
            special_instructions: original.special_instructions,
            status: 'draft',
            created_by: user.id,
        })
        .select()
        .single();

    if (createError) {
        return { success: false, error: createError.message };
    }

    // Duplicate stops
    if (originalStops && originalStops.length > 0) {
        const newStops = originalStops.map(stop => ({
            schedule_id: newSchedule.id,
            location_name: stop.location_name,
            location_type: stop.location_type,
            address: stop.address,
            barangay: stop.barangay,
            latitude: stop.latitude,
            longitude: stop.longitude,
            stop_order: stop.stop_order,
            estimated_duration: stop.estimated_duration,
            contact_person: stop.contact_person,
            contact_number: stop.contact_number,
            special_notes: stop.special_notes,
        }));

        await supabase.from('schedule_stops').insert(newStops);
    }

    revalidatePath('/staff/schedules');
    return { success: true, data: { id: newSchedule.id } };
}
