'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
    createRequestSchema,
    updateRequestSchema,
    cancelRequestSchema,
    requestFiltersSchema,
    type CreateRequestInput,
    type UpdateRequestInput,
    type CancelRequestInput,
    type RequestFilters,
} from '@/lib/validators/request';

export interface ActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Create a new collection request
 */
export async function createRequest(
    input: CreateRequestInput
): Promise<ActionResult<{ id: string }>> {
    try {
        const validation = createRequestSchema.safeParse(input);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues[0]?.message || 'Invalid form data',
            };
        }

        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in to create a request',
            };
        }

        // Get user profile for default values
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', user.id)
            .single();

        const requestData = {
            client_id: user.id,
            requester_name: validation.data.requester_name || profile?.full_name,
            contact_number: validation.data.contact_number || profile?.phone,
            alt_contact_number: validation.data.alt_contact_number || null,
            barangay: validation.data.barangay,
            address: validation.data.address,
            priority: validation.data.priority,
            preferred_date: validation.data.preferred_date,
            preferred_time_slot: validation.data.preferred_time_slot,
            special_instructions: validation.data.special_instructions || null,
            status: 'pending',
        };

        const { data, error } = await supabase
            .from('collection_requests')
            .insert(requestData)
            .select('id')
            .single();

        if (error) {
            console.error('Error creating request:', JSON.stringify(error, null, 2));
            console.error('Request data was:', JSON.stringify(requestData, null, 2));

            // Check if table doesn't exist
            const errorStr = JSON.stringify(error);
            if (errorStr.includes('does not exist') || errorStr.includes('relation') || error.code === '42P01') {
                return {
                    success: false,
                    error: 'Database not configured. Please deploy the schema to Supabase first.',
                };
            }

            // RLS policy violation
            if (error.code === '42501' || errorStr.includes('policy') || errorStr.includes('permission')) {
                return {
                    success: false,
                    error: 'Permission denied. Please ensure you are logged in as a client.',
                };
            }

            return {
                success: false,
                error: `Failed to create request: ${error.message || error.code || 'Unknown error'}`,
            };
        }

        revalidatePath('/client/requests');
        revalidatePath('/client/dashboard');

        return {
            success: true,
            data: { id: data.id },
        };
    } catch (error) {
        console.error('Error in createRequest:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Update an existing request (only for pending requests)
 */
export async function updateRequest(
    input: UpdateRequestInput
): Promise<ActionResult> {
    try {
        const validation = updateRequestSchema.safeParse(input);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues[0]?.message || 'Invalid form data',
            };
        }

        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in to update a request',
            };
        }

        const { id, ...updateData } = validation.data;

        // Check if request exists and belongs to user
        const { data: existingRequest } = await supabase
            .from('collection_requests')
            .select('id, status, client_id')
            .eq('id', id)
            .single();

        if (!existingRequest) {
            return {
                success: false,
                error: 'Request not found',
            };
        }

        if (existingRequest.client_id !== user.id) {
            return {
                success: false,
                error: 'You can only update your own requests',
            };
        }

        if (existingRequest.status !== 'pending') {
            return {
                success: false,
                error: 'You can only edit pending requests',
            };
        }

        const { error } = await supabase
            .from('collection_requests')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating request:', error);
            return {
                success: false,
                error: 'Failed to update request. Please try again.',
            };
        }

        revalidatePath('/client/requests');
        revalidatePath('/client/dashboard');

        return { success: true };
    } catch (error) {
        console.error('Error in updateRequest:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Cancel a request
 */
export async function cancelRequest(
    input: CancelRequestInput
): Promise<ActionResult> {
    try {
        const validation = cancelRequestSchema.safeParse(input);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues[0]?.message || 'Invalid input',
            };
        }

        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in to cancel a request',
            };
        }

        // Check if request exists and belongs to user
        const { data: existingRequest } = await supabase
            .from('collection_requests')
            .select('id, status, client_id')
            .eq('id', validation.data.id)
            .single();

        if (!existingRequest) {
            return {
                success: false,
                error: 'Request not found',
            };
        }

        if (existingRequest.client_id !== user.id) {
            return {
                success: false,
                error: 'You can only cancel your own requests',
            };
        }

        // Can only cancel pending or accepted requests
        if (!['pending', 'accepted'].includes(existingRequest.status)) {
            return {
                success: false,
                error: 'This request cannot be cancelled',
            };
        }

        const { error } = await supabase
            .from('collection_requests')
            .update({
                status: 'cancelled',
                cancellation_reason: validation.data.reason,
                cancelled_by: user.id,
                cancelled_at: new Date().toISOString(),
            })
            .eq('id', validation.data.id)
            .eq('client_id', user.id);

        if (error) {
            console.error('Error cancelling request:', JSON.stringify(error, null, 2));
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);

            // Check for RLS policy violation
            if (error.code === '42501' || error.message?.includes('policy')) {
                return {
                    success: false,
                    error: 'Permission denied by database policy. Please contact support.',
                };
            }

            return {
                success: false,
                error: `Failed to cancel request: ${error.message || error.code || 'Unknown error'}`,
            };
        }

        revalidatePath('/client/requests');
        revalidatePath('/client/dashboard');

        return { success: true };
    } catch (error) {
        console.error('Error in cancelRequest:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Get client's requests with filters
 */
export async function getClientRequests(filters: Partial<RequestFilters> = {}) {
    try {
        const validation = requestFiltersSchema.safeParse(filters);
        const validFilters = validation.success ? validation.data : {
            page: 1,
            limit: 10,
            sortOrder: 'desc' as const,
        };

        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in to view requests',
                data: null,
            };
        }

        let query = supabase
            .from('collection_requests')
            .select('*, assigned_collector:profiles!collection_requests_assigned_collector_id_fkey(id, full_name, phone)', { count: 'exact' })
            .eq('client_id', user.id);

        // Apply filters
        if (validFilters.status) {
            query = query.eq('status', validFilters.status);
        }

        if (validFilters.priority) {
            query = query.eq('priority', validFilters.priority);
        }

        if (validFilters.barangay) {
            query = query.eq('barangay', validFilters.barangay);
        }

        if (validFilters.dateFrom) {
            query = query.gte('preferred_date', validFilters.dateFrom);
        }

        if (validFilters.dateTo) {
            query = query.lte('preferred_date', validFilters.dateTo);
        }

        if (validFilters.search) {
            query = query.or(`request_number.ilike.%${validFilters.search}%,address.ilike.%${validFilters.search}%`);
        }

        // Apply sorting
        const sortColumn = validFilters.sortBy || 'created_at';
        query = query.order(sortColumn, { ascending: validFilters.sortOrder === 'asc' });

        // Apply pagination
        const from = (validFilters.page - 1) * validFilters.limit;
        const to = from + validFilters.limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            // If table doesn't exist yet, return empty data gracefully
            const errorStr = JSON.stringify(error);
            const isTableMissing =
                error.code === '42P01' ||
                error.code === 'PGRST116' ||
                errorStr.includes('does not exist') ||
                errorStr.includes('relation') ||
                errorStr.includes('undefined');

            if (isTableMissing) {
                return {
                    success: true,
                    data: {
                        requests: [],
                        total: 0,
                        page: validFilters.page,
                        limit: validFilters.limit,
                        totalPages: 0,
                    },
                };
            }
            console.error('Error fetching requests:', errorStr);
            return {
                success: false,
                error: 'Failed to fetch requests',
                data: null,
            };
        }

        return {
            success: true,
            data: {
                requests: data || [],
                total: count || 0,
                page: validFilters.page,
                limit: validFilters.limit,
                totalPages: Math.ceil((count || 0) / validFilters.limit),
            },
        };
    } catch (error) {
        console.error('Error in getClientRequests:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
            data: null,
        };
    }
}

/**
 * Get a single request by ID
 */
export async function getRequestById(id: string) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in to view this request',
                data: null,
            };
        }

        const { data, error } = await supabase
            .from('collection_requests')
            .select(`
        *,
        assigned_collector:profiles!collection_requests_assigned_collector_id_fkey(id, full_name, phone, avatar_url),
        photos:request_photos(id, photo_url, created_at),
        status_history:request_status_history(id, previous_status, new_status, change_reason, created_at)
      `)
            .eq('id', id)
            .eq('client_id', user.id)
            .single();

        if (error) {
            console.error('Error fetching request:', error);
            return {
                success: false,
                error: 'Request not found',
                data: null,
            };
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error('Error in getRequestById:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
            data: null,
        };
    }
}

/**
 * Get dashboard statistics for client
 */
export async function getClientDashboardStats() {
    try {
        const supabase = await createClient();

        // Get current user
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

        // Get counts by status
        const { data: requests, error } = await supabase
            .from('collection_requests')
            .select('status')
            .eq('client_id', user.id);

        if (error) {
            // If table doesn't exist yet, return zero stats gracefully
            const errorStr = JSON.stringify(error);
            const isTableMissing =
                error.code === '42P01' ||
                error.code === 'PGRST116' ||
                errorStr.includes('does not exist') ||
                errorStr.includes('relation') ||
                errorStr.includes('undefined');

            if (isTableMissing) {
                return {
                    success: true,
                    data: {
                        total_requests: 0,
                        completed_collections: 0,
                        pending_requests: 0,
                        active_collections: 0,
                        completion_rate: 0,
                    },
                };
            }
            console.error('Error fetching stats:', errorStr);
            return {
                success: false,
                error: 'Failed to fetch statistics',
                data: null,
            };
        }

        const stats = {
            total_requests: requests?.length || 0,
            completed_collections: requests?.filter((r) => r.status === 'completed').length || 0,
            pending_requests: requests?.filter((r) => r.status === 'pending').length || 0,
            active_collections: requests?.filter((r) =>
                ['assigned', 'accepted_by_collector', 'en_route', 'at_location', 'in_progress'].includes(r.status)
            ).length || 0,
        };

        const completion_rate = stats.total_requests > 0
            ? Math.round((stats.completed_collections / stats.total_requests) * 100)
            : 0;

        return {
            success: true,
            data: {
                ...stats,
                completion_rate,
            },
        };
    } catch (error) {
        console.error('Error in getClientDashboardStats:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
            data: null,
        };
    }
}

/**
 * Get recent activity for client
 */
export async function getClientRecentActivity(limit: number = 5) {
    try {
        const supabase = await createClient();

        // Get current user
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

        // Get recent requests with status history
        const { data, error } = await supabase
            .from('collection_requests')
            .select(`
        id,
        request_number,
        status,
        barangay,
        updated_at,
        created_at
      `)
            .eq('client_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(limit);

        if (error) {
            // If table doesn't exist yet, return empty data gracefully
            const errorStr = JSON.stringify(error);
            const isTableMissing =
                error.code === '42P01' ||
                error.code === 'PGRST116' ||
                errorStr.includes('does not exist') ||
                errorStr.includes('relation') ||
                errorStr.includes('undefined');

            if (isTableMissing) {
                return {
                    success: true,
                    data: [],
                };
            }
            console.error('Error fetching activity:', errorStr);
            return {
                success: false,
                error: 'Failed to fetch activity',
                data: null,
            };
        }

        return {
            success: true,
            data: data || [],
        };
    } catch (error) {
        console.error('Error in getClientRecentActivity:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
            data: null,
        };
    }
}

/**
 * Upload photos for a request
 */
export async function uploadRequestPhotos(
    requestId: string,
    photoUrls: string[]
): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: 'You must be logged in',
            };
        }

        // Verify request belongs to user
        const { data: request } = await supabase
            .from('collection_requests')
            .select('client_id')
            .eq('id', requestId)
            .single();

        if (!request || request.client_id !== user.id) {
            return {
                success: false,
                error: 'Request not found',
            };
        }

        // Insert photos
        const photos = photoUrls.map((url) => ({
            request_id: requestId,
            photo_url: url,
            uploaded_by: user.id,
            photo_type: 'before',
        }));

        const { error } = await supabase.from('request_photos').insert(photos);

        if (error) {
            console.error('Error uploading photos:', error);
            return {
                success: false,
                error: 'Failed to upload photos',
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in uploadRequestPhotos:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}
