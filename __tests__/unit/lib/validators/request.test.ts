import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Request Validation Tests
 * 
 * Tests for collection request form validation schemas.
 * Validates required fields, date constraints, and phone number formats.
 */

// Priority levels
const prioritySchema = z.enum(['low', 'medium', 'urgent']);

// Time slot options
const timeSlotSchema = z.enum(['morning', 'afternoon', 'flexible']);

// Collection request schema
const requestSchema = z.object({
    requesterName: z.string().min(1, 'Requester name is required').max(100, 'Name too long'),
    contactNumber: z.string().regex(
        /^(\+63|0)\d{10}$/,
        'Invalid Philippine phone number format'
    ),
    altContactNumber: z.string().regex(
        /^(\+63|0)\d{10}$/,
        'Invalid Philippine phone number format'
    ).optional().or(z.literal('')),
    barangay: z.string().min(1, 'Barangay is required'),
    address: z.string().min(5, 'Address is required (min 5 characters)').max(500, 'Address too long'),
    priority: prioritySchema,
    preferredDate: z.string().refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return selectedDate >= tomorrow;
    }, { message: 'Preferred date must be at least 1 day in advance' }),
    preferredTimeSlot: timeSlotSchema,
    specialInstructions: z.string().max(1000, 'Instructions too long').optional(),
});

// Barangay list for validation
const validBarangays = [
    'A.O. Floirendo',
    'Buenavista',
    'Datu Abdul Dadia',
    'Gredu (Poblacion)',
    'J.P. Laurel (Poblacion)',
    'Kasilak',
    'Katipunan',
    'Katualan',
    'Kauswagan',
    'Kiotoy',
    'Little Panay (Poblacion)',
    'Lower Panaga (Poblacion)',
    'Mabini',
    'Magsaysay',
    'Malativas',
    'Manay',
    'Nanyo',
    'New Malaga (Dalisay)',
    'New Malitbog',
    'New Pandan (Poblacion)',
    'New Visayas',
    'Quezon',
    'Salvacion',
    'San Francisco (Poblacion)',
    'San Nicolas',
    'San Pedro',
    'San Roque',
    'San Vicente',
    'Santa Cruz',
    'Santo Niño (Poblacion)',
    'Sindaton',
    'Southern Davao',
    'Tagpore',
    'Tibungol',
    'Upper Licanan',
    'Waterfall',
];

describe('Request Validators', () => {
    describe('Priority Validation', () => {
        it('should accept valid priority levels', () => {
            expect(() => prioritySchema.parse('low')).not.toThrow();
            expect(() => prioritySchema.parse('medium')).not.toThrow();
            expect(() => prioritySchema.parse('urgent')).not.toThrow();
        });

        it('should reject invalid priority levels', () => {
            expect(() => prioritySchema.parse('high')).toThrow();
            expect(() => prioritySchema.parse('critical')).toThrow();
            expect(() => prioritySchema.parse('')).toThrow();
        });
    });

    describe('Time Slot Validation', () => {
        it('should accept valid time slots', () => {
            expect(() => timeSlotSchema.parse('morning')).not.toThrow();
            expect(() => timeSlotSchema.parse('afternoon')).not.toThrow();
            expect(() => timeSlotSchema.parse('flexible')).not.toThrow();
        });

        it('should reject invalid time slots', () => {
            expect(() => timeSlotSchema.parse('evening')).toThrow();
            expect(() => timeSlotSchema.parse('night')).toThrow();
            expect(() => timeSlotSchema.parse('')).toThrow();
        });
    });

    describe('Request Schema', () => {
        // Helper to create a valid tomorrow date
        const getTomorrow = () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        };

        const validRequest = {
            requesterName: 'Juan Dela Cruz',
            contactNumber: '+639123456789',
            barangay: 'Gredu (Poblacion)',
            address: '123 Main Street, Panabo City, Davao del Norte',
            priority: 'medium',
            preferredDate: getTomorrow(),
            preferredTimeSlot: 'morning',
        };

        it('should accept valid request data', () => {
            expect(() => requestSchema.parse(validRequest)).not.toThrow();
        });

        it('should accept request with optional fields', () => {
            const requestWithOptional = {
                ...validRequest,
                altContactNumber: '09987654321',
                specialInstructions: 'Please call before arriving. Gate code is 1234.',
            };
            expect(() => requestSchema.parse(requestWithOptional)).not.toThrow();
        });

        it('should accept empty alternative contact number', () => {
            const requestWithEmptyAlt = {
                ...validRequest,
                altContactNumber: '',
            };
            expect(() => requestSchema.parse(requestWithEmptyAlt)).not.toThrow();
        });

        it('should reject empty requester name', () => {
            const result = requestSchema.safeParse({
                ...validRequest,
                requesterName: '',
            });
            expect(result.success).toBe(false);
        });

        it('should reject invalid contact number format', () => {
            const result = requestSchema.safeParse({
                ...validRequest,
                contactNumber: '1234567890',
            });
            expect(result.success).toBe(false);
        });

        it('should reject contact number without proper prefix', () => {
            const invalidNumbers = [
                '9123456789',     // Missing leading 0 or +63
                '+1234567890',    // Wrong country code
                '0912345',        // Too short
            ];

            invalidNumbers.forEach(number => {
                const result = requestSchema.safeParse({
                    ...validRequest,
                    contactNumber: number,
                });
                expect(result.success).toBe(false);
            });
        });

        it('should reject empty barangay', () => {
            const result = requestSchema.safeParse({
                ...validRequest,
                barangay: '',
            });
            expect(result.success).toBe(false);
        });

        it('should reject address shorter than 5 characters', () => {
            const result = requestSchema.safeParse({
                ...validRequest,
                address: '123',
            });
            expect(result.success).toBe(false);
        });

        it('should reject past dates', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const result = requestSchema.safeParse({
                ...validRequest,
                preferredDate: yesterday.toISOString().split('T')[0],
            });
            expect(result.success).toBe(false);
        });

        it('should reject today as preferred date', () => {
            const today = new Date().toISOString().split('T')[0];

            const result = requestSchema.safeParse({
                ...validRequest,
                preferredDate: today,
            });
            expect(result.success).toBe(false);
        });

        it('should accept date at least 1 day in advance', () => {
            const twoDaysLater = new Date();
            twoDaysLater.setDate(twoDaysLater.getDate() + 2);

            const result = requestSchema.safeParse({
                ...validRequest,
                preferredDate: twoDaysLater.toISOString().split('T')[0],
            });
            expect(result.success).toBe(true);
        });

        it('should reject special instructions longer than 1000 characters', () => {
            const result = requestSchema.safeParse({
                ...validRequest,
                specialInstructions: 'A'.repeat(1001),
            });
            expect(result.success).toBe(false);
        });
    });

    describe('Barangay Validation', () => {
        it('should have all Panabo City barangays', () => {
            // Check that we have a reasonable number of barangays
            expect(validBarangays.length).toBeGreaterThan(30);
        });

        it('should include common barangays', () => {
            const commonBarangays = [
                'Gredu (Poblacion)',
                'San Francisco (Poblacion)',
                'J.P. Laurel (Poblacion)',
            ];

            commonBarangays.forEach(barangay => {
                expect(validBarangays).toContain(barangay);
            });
        });

        it('should not have duplicate barangays', () => {
            const uniqueBarangays = new Set(validBarangays);
            expect(uniqueBarangays.size).toBe(validBarangays.length);
        });
    });

    describe('Contact Number Formats', () => {
        const phoneSchema = z.string().regex(/^(\+63|0)\d{10}$/);

        it('should accept +63 format', () => {
            const validNumbers = [
                '+639123456789',
                '+639001234567',
                '+639876543210',
            ];

            validNumbers.forEach(number => {
                expect(() => phoneSchema.parse(number)).not.toThrow();
            });
        });

        it('should accept 09 format', () => {
            const validNumbers = [
                '09123456789',
                '09001234567',
                '09876543210',
            ];

            validNumbers.forEach(number => {
                expect(() => phoneSchema.parse(number)).not.toThrow();
            });
        });

        it('should reject numbers with spaces', () => {
            expect(() => phoneSchema.parse('+63 912 345 6789')).toThrow();
            expect(() => phoneSchema.parse('0912 345 6789')).toThrow();
        });

        it('should reject numbers with dashes', () => {
            expect(() => phoneSchema.parse('+63-912-345-6789')).toThrow();
            expect(() => phoneSchema.parse('0912-345-6789')).toThrow();
        });
    });
});
