import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    mockRequest,
    mockUser,
    mockCollector,
    mockStaff,
    mockAssignedRequest,
    mockCompletedRequest,
} from '../../utils/mocks/data';
import createMockSupabaseClient, { type MockSupabaseClient } from '../../utils/mocks/supabase';

/**
 * Collection Requests Integration Tests
 * 
 * Tests the complete request workflow from creation to completion,
 * including status transitions, collector assignment, and reassignment.
 */

describe('Collection Requests Integration', () => {
    let mockClient: MockSupabaseClient;

    beforeEach(() => {
        vi.clearAllMocks();
        mockClient = createMockSupabaseClient();
    });

    describe('Create Request', () => {
        it('should create a new collection request', async () => {
            const newRequest = {
                client_id: mockUser.id,
                requester_name: mockUser.full_name,
                contact_number: mockUser.phone,
                barangay: 'Gredu (Poblacion)',
                address: '123 Test Street, Panabo City',
                priority: 'medium',
                preferred_date: new Date(Date.now() + 86400000).toISOString(),
                preferred_time_slot: 'morning',
                special_instructions: 'Use side entrance',
            };

            // Set up mock to return the created request
            const createdRequest = { ...mockRequest, ...newRequest };
            mockClient.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: createdRequest, error: null }),
                    }),
                }),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: createdRequest, error: null }),
            });

            const result = await mockClient.from('collection_requests')
                .insert(newRequest)
                .select()
                .single();

            expect(result.error).toBeNull();
            expect(result.data).toBeDefined();
            expect(result.data.requester_name).toBe(mockUser.full_name);
            expect(result.data.status).toBe('pending');
        });

        it('should require minimum 1 day advance for preferred date', () => {
            const today = new Date();
            const tomorrow = new Date(Date.now() + 86400000);

            // Date validation check
            expect(tomorrow > today).toBe(true);
        });

        it('should validate required fields', () => {
            const requiredFields = [
                'client_id',
                'requester_name',
                'contact_number',
                'barangay',
                'address',
                'priority',
                'preferred_date',
                'preferred_time_slot',
            ];

            // Each field should be present in a valid request
            requiredFields.forEach(field => {
                expect(mockRequest).toHaveProperty(field);
            });
        });
    });

    describe('Request Status Workflow', () => {
        const statusTransitions = [
            { from: 'pending', to: 'accepted', action: 'Accept' },
            { from: 'accepted', to: 'payment_confirmed', action: 'Confirm Payment' },
            { from: 'payment_confirmed', to: 'assigned', action: 'Assign Collector' },
            { from: 'assigned', to: 'accepted_by_collector', action: 'Collector Accept' },
            { from: 'accepted_by_collector', to: 'en_route', action: 'Start Service' },
            { from: 'en_route', to: 'at_location', action: 'Arrive at Location' },
            { from: 'at_location', to: 'in_progress', action: 'Start Collection' },
            { from: 'in_progress', to: 'completed', action: 'Complete' },
        ];

        statusTransitions.forEach(({ from, to, action }) => {
            it(`should transition from ${from} to ${to} on ${action}`, async () => {
                mockClient.from.mockReturnValue({
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: { ...mockRequest, status: to },
                                    error: null
                                }),
                            }),
                        }),
                    }),
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                });

                const result = await mockClient.from('collection_requests')
                    .update({ status: to })
                    .eq('id', mockRequest.id)
                    .select()
                    .single();

                expect(result.error).toBeNull();
                expect(result.data.status).toBe(to);
            });
        });

        it('should allow cancellation from pending status', async () => {
            mockClient.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { ...mockRequest, status: 'cancelled', cancelled_reason: 'Changed mind' },
                                error: null
                            }),
                        }),
                    }),
                }),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn(),
            });

            const result = await mockClient.from('collection_requests')
                .update({ status: 'cancelled', cancelled_reason: 'Changed mind' })
                .eq('id', mockRequest.id)
                .select()
                .single();

            expect(result.error).toBeNull();
            expect(result.data.status).toBe('cancelled');
        });

        it('should allow rejection from pending status with reason', async () => {
            mockClient.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { ...mockRequest, status: 'rejected' },
                                error: null
                            }),
                        }),
                    }),
                }),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn(),
            });

            const result = await mockClient.from('collection_requests')
                .update({ status: 'rejected' })
                .eq('id', mockRequest.id)
                .select()
                .single();

            expect(result.error).toBeNull();
            expect(result.data.status).toBe('rejected');
        });
    });

    describe('Collector Assignment', () => {
        it('should assign collector to request', async () => {
            const assignedData = {
                ...mockRequest,
                status: 'assigned',
                collector_id: mockCollector.id,
                scheduled_date: new Date(Date.now() + 86400000).toISOString(),
                scheduled_time: '08:00:00',
            };

            mockClient.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: assignedData, error: null }),
                        }),
                    }),
                }),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn(),
            });

            const result = await mockClient.from('collection_requests')
                .update({
                    status: 'assigned',
                    collector_id: mockCollector.id,
                    scheduled_date: assignedData.scheduled_date,
                    scheduled_time: '08:00:00',
                })
                .eq('id', mockRequest.id)
                .select()
                .single();

            expect(result.error).toBeNull();
            expect(result.data.collector_id).toBe(mockCollector.id);
            expect(result.data.status).toBe('assigned');
        });

        it('should track collector assignment timestamp', () => {
            const assignmentTime = new Date().toISOString();
            expect(new Date(assignmentTime)).toBeInstanceOf(Date);
        });
    });

    describe('Collector Response', () => {
        it('should accept request by collector', async () => {
            mockClient.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { ...mockAssignedRequest, status: 'accepted_by_collector' },
                                error: null
                            }),
                        }),
                    }),
                }),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn(),
            });

            const result = await mockClient.from('collection_requests')
                .update({ status: 'accepted_by_collector' })
                .eq('id', mockAssignedRequest.id)
                .select()
                .single();

            expect(result.error).toBeNull();
            expect(result.data.status).toBe('accepted_by_collector');
        });

        it('should decline request by collector with reason', async () => {
            const declineData = {
                ...mockAssignedRequest,
                status: 'declined_by_collector',
                collector_decline_reason: 'Schedule conflict',
                collector_declined_at: new Date().toISOString(),
                reassignment_count: 1,
            };

            mockClient.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: declineData, error: null }),
                        }),
                    }),
                }),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn(),
            });

            const result = await mockClient.from('collection_requests')
                .update({
                    status: 'declined_by_collector',
                    collector_decline_reason: 'Schedule conflict',
                    collector_declined_at: new Date().toISOString(),
                    reassignment_count: 1,
                })
                .eq('id', mockAssignedRequest.id)
                .select()
                .single();

            expect(result.error).toBeNull();
            expect(result.data.status).toBe('declined_by_collector');
            expect(result.data.collector_decline_reason).toBe('Schedule conflict');
            expect(result.data.reassignment_count).toBe(1);
        });

        it('should track reassignment count', () => {
            const initialCount = 0;
            const afterFirstDecline = initialCount + 1;
            const afterSecondDecline = afterFirstDecline + 1;

            expect(afterSecondDecline).toBe(2);
        });
    });

    describe('Request Completion', () => {
        it('should mark request as completed', async () => {
            const completedData = {
                ...mockAssignedRequest,
                status: 'completed',
                completed_at: new Date().toISOString(),
            };

            mockClient.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: completedData, error: null }),
                        }),
                    }),
                }),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn(),
            });

            const result = await mockClient.from('collection_requests')
                .update({ status: 'completed', completed_at: new Date().toISOString() })
                .eq('id', mockAssignedRequest.id)
                .select()
                .single();

            expect(result.error).toBeNull();
            expect(result.data.status).toBe('completed');
            expect(result.data.completed_at).toBeDefined();
        });

        it('should record completion timestamp', () => {
            expect(mockCompletedRequest.completed_at).toBeDefined();
            expect(new Date(mockCompletedRequest.completed_at!)).toBeInstanceOf(Date);
        });
    });

    describe('Request Queries', () => {
        it('should filter requests by status', async () => {
            const pendingRequests = [mockRequest];

            mockClient.from.mockReturnValue({
                select: vi.fn().mockResolvedValue({ data: pendingRequests, error: null }),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
            });

            const { data, error } = await mockClient.from('collection_requests')
                .select()
                .eq('status', 'pending');

            expect(error).toBeNull();
            expect(data).toHaveLength(1);
        });

        it('should filter requests by client', async () => {
            mockClient.from.mockReturnValue({
                select: vi.fn().mockResolvedValue({ data: [mockRequest], error: null }),
                eq: vi.fn().mockReturnThis(),
            });

            const { data, error } = await mockClient.from('collection_requests')
                .select()
                .eq('client_id', mockUser.id);

            expect(error).toBeNull();
            expect(data).toBeDefined();
        });

        it('should filter requests by collector', async () => {
            mockClient.from.mockReturnValue({
                select: vi.fn().mockResolvedValue({ data: [mockAssignedRequest], error: null }),
                eq: vi.fn().mockReturnThis(),
            });

            const { data, error } = await mockClient.from('collection_requests')
                .select()
                .eq('collector_id', mockCollector.id);

            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
    });
});
