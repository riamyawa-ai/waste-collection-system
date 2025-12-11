import { z } from 'zod';
import { PANABO_BARANGAYS } from '@/constants/barangays';
import { ALL_TIME_SLOTS } from '@/constants/status';

/**
 * Schema for creating a new collection request
 */
export const createRequestSchema = z.object({
    requester_name: z
        .string()
        .min(1, 'Requester name is required')
        .max(100, 'Name must be less than 100 characters'),

    contact_number: z
        .string()
        .min(1, 'Contact number is required')
        .refine(
            (phone) => {
                const cleaned = phone.replace(/[\s-]/g, '');
                return /^(\+?63|0)?9\d{9}$/.test(cleaned);
            },
            'Please enter a valid Philippine phone number'
        ),

    alt_contact_number: z
        .string()
        .optional()
        .refine(
            (phone) => {
                if (!phone) return true;
                const cleaned = phone.replace(/[\s-]/g, '');
                return /^(\+?63|0)?9\d{9}$/.test(cleaned);
            },
            'Please enter a valid Philippine phone number'
        ),

    barangay: z
        .string()
        .min(1, 'Please select a barangay')
        .refine(
            (value) => PANABO_BARANGAYS.includes(value as typeof PANABO_BARANGAYS[number]),
            'Please select a valid barangay'
        ),

    address: z
        .string()
        .min(1, 'Address is required')
        .max(500, 'Address must be less than 500 characters'),

    priority: z.enum(['low', 'medium', 'urgent'] as const, {
        message: 'Please select a priority level',
    }),

    preferred_date: z
        .string()
        .min(1, 'Preferred date is required')
        .refine(
            (date) => {
                const selectedDate = new Date(date);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                return selectedDate >= tomorrow;
            },
            'Please select a date at least 1 day in advance'
        ),

    preferred_time_slot: z
        .string()
        .min(1, 'Preferred time is required')
        .refine(
            (slot) => ALL_TIME_SLOTS.includes(slot as typeof ALL_TIME_SLOTS[number]),
            'Please select a valid time slot'
        ),

    special_instructions: z
        .string()
        .max(500, 'Instructions must be less than 500 characters')
        .optional(),
});

/**
 * Schema for updating an existing request
 */
export const updateRequestSchema = createRequestSchema.partial().extend({
    id: z.string().uuid('Invalid request ID'),
});

/**
 * Schema for cancelling a request
 */
export const cancelRequestSchema = z.object({
    id: z.string().uuid('Invalid request ID'),
    reason: z
        .string()
        .min(1, 'Please provide a reason for cancellation')
        .max(500, 'Reason must be less than 500 characters'),
});

/**
 * Schema for request filters
 */
export const requestFiltersSchema = z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    barangay: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type CancelRequestInput = z.infer<typeof cancelRequestSchema>;
export type RequestFilters = z.infer<typeof requestFiltersSchema>;
