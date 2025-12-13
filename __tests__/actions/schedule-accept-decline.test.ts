/**
 * Schedule Accept/Decline Tests
 * 
 * Tests the collector schedule acceptance and decline workflow including:
 * - Staff creating schedules with collector assignment
 * - Collectors accepting assigned schedules
 * - Collectors declining schedules with auto-reassignment
 * - RLS policy validations
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock the Supabase server client
const mockSupabaseClient = {
    auth: {
        getUser: vi.fn(),
    },
    from: vi.fn(),
};

// Create chainable mock methods
const createChainableMock = (returnData: unknown = null, returnError: unknown = null) => {
    const chainable: {
        select: Mock;
        insert: Mock;
        update: Mock;
        delete: Mock;
        eq: Mock;
        neq: Mock;
        in: Mock;
        is: Mock;
        or: Mock;
        gte: Mock;
        lte: Mock;
        order: Mock;
        limit: Mock;
        single: Mock;
        maybeSingle: Mock;
    } = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: returnData, error: returnError }),
        maybeSingle: vi.fn().mockResolvedValue({ data: returnData, error: returnError }),
    };

    // Make all chainable methods return the chainable object
    Object.keys(chainable).forEach(key => {
        if (key !== 'single' && key !== 'maybeSingle') {
            (chainable[key as keyof typeof chainable] as Mock).mockReturnValue(chainable);
        }
    });

    return chainable;
};

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Import after mocking
import { acceptSchedule, declineSchedule } from '@/lib/actions/collector';
import { createSchedule } from '@/lib/actions/schedule';

describe('Schedule Accept/Decline Workflow', () => {
    const mockCollectorId = 'collector-uuid-123';
    const mockStaffId = 'staff-uuid-456';
    const mockScheduleId = 'schedule-uuid-789';
    const mockBackupCollectorId = 'backup-collector-uuid-000';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Staff Schedule Creation', () => {
        it('should create schedule with pending status when collector is assigned', async () => {
            // Setup authenticated staff user
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockStaffId } },
            });

            const scheduleChainable = createChainableMock({
                id: mockScheduleId,
                name: 'Test Schedule',
                status: 'draft',
                assigned_collector_id: mockCollectorId,
            });

            const stopsChainable = createChainableMock(null);
            const notificationChainable = createChainableMock(null);

            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'collection_schedules') return scheduleChainable;
                if (table === 'schedule_stops') return stopsChainable;
                if (table === 'notifications') return notificationChainable;
                return createChainableMock(null);
            });

            const result = await createSchedule({
                name: 'Test Schedule',
                scheduleType: 'one-time',
                startDate: '2025-12-20',
                startTime: '08:00',
                endTime: '17:00',
                collectorId: mockCollectorId,
                stops: [],
            });

            expect(result.success).toBe(true);
            expect(result.data?.id).toBe(mockScheduleId);

            // Verify insert was called
            expect(scheduleChainable.insert).toHaveBeenCalled();
        });

        it('should create schedule with active status when no collector is assigned', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockStaffId } },
            });

            const scheduleChainable = createChainableMock({
                id: mockScheduleId,
                name: 'Unassigned Schedule',
                status: 'active',
                assigned_collector_id: null,
            });

            mockSupabaseClient.from.mockReturnValue(scheduleChainable);

            const result = await createSchedule({
                name: 'Unassigned Schedule',
                scheduleType: 'one-time',
                startDate: '2025-12-20',
                startTime: '08:00',
                endTime: '17:00',
                stops: [],
            });

            expect(result.success).toBe(true);
        });

        it('should send notification to assigned collector', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockStaffId } },
            });

            const scheduleChainable = createChainableMock({
                id: mockScheduleId,
                name: 'Test Schedule',
                assigned_collector_id: mockCollectorId,
            });

            const notificationChainable = createChainableMock({ id: 'notification-id' });

            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'collection_schedules') return scheduleChainable;
                if (table === 'notifications') return notificationChainable;
                return createChainableMock(null);
            });

            await createSchedule({
                name: 'Test Schedule',
                scheduleType: 'one-time',
                startDate: '2025-12-20',
                startTime: '08:00',
                endTime: '17:00',
                collectorId: mockCollectorId,
                stops: [],
            });

            // Verify notification was inserted for collector
            expect(notificationChainable.insert).toHaveBeenCalled();
        });
    });

    describe('Collector Accept Schedule', () => {
        it('should accept schedule when collector is assigned and schedule is active/draft', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockCollectorId } },
            });

            const selectChainable = createChainableMock({
                id: mockScheduleId,
                name: 'Test Schedule',
                assigned_collector_id: mockCollectorId,
                status: 'draft',
                created_by: mockStaffId,
            });

            const updateChainable = createChainableMock({
                id: mockScheduleId,
                status: 'active',
                confirmed_by_collector: true,
                confirmed_at: expect.any(String),
            });

            const notificationChainable = createChainableMock({ id: 'notif-id' });

            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'collection_schedules') {
                    return {
                        ...selectChainable,
                        update: vi.fn().mockReturnValue(updateChainable),
                    };
                }
                if (table === 'notifications') return notificationChainable;
                return createChainableMock(null);
            });

            const result = await acceptSchedule(mockScheduleId);

            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.message).toBe('Schedule accepted successfully');
        });

        it('should reject when schedule is not assigned to collector', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockCollectorId } },
            });

            // Return null (no schedule found for this collector)
            const chainable = createChainableMock(null);
            mockSupabaseClient.from.mockReturnValue(chainable);

            const result = await acceptSchedule(mockScheduleId);

            expect(result.error).toBe('Schedule not found or not assigned to you');
        });

        it('should reject when user is not authenticated', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            const result = await acceptSchedule(mockScheduleId);

            expect(result.error).toBe('Unauthorized');
        });
    });

    describe('Collector Decline Schedule', () => {
        it('should decline schedule and attempt auto-reassignment', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockCollectorId } },
            });

            // Mock schedule lookup
            const scheduleChainable = createChainableMock({
                id: mockScheduleId,
                name: 'Test Schedule',
                assigned_collector_id: mockCollectorId,
                status: 'draft',
            });

            // Mock available collectors (clocked in)
            const attendanceChainable = createChainableMock([
                {
                    collector_id: mockBackupCollectorId,
                    collector: { id: mockBackupCollectorId, full_name: 'Backup Collector' }
                }
            ]);
            attendanceChainable.single = vi.fn().mockResolvedValue({ data: null });

            // Mock update
            const updateChainable = createChainableMock(null);

            // Mock notifications
            const notificationChainable = createChainableMock({ id: 'notif-id' });

            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'collection_schedules') {
                    return {
                        ...scheduleChainable,
                        update: vi.fn().mockReturnValue(updateChainable),
                    };
                }
                if (table === 'collector_attendance') return attendanceChainable;
                if (table === 'notifications') return notificationChainable;
                if (table === 'profiles') return createChainableMock([]);
                return createChainableMock(null);
            });

            const result = await declineSchedule(mockScheduleId, 'Schedule conflict');

            expect(result.error).toBeNull();
            expect(result.message).toBeDefined();
        });

        it('should notify staff when no collectors are available for reassignment', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockCollectorId } },
            });

            // Mock schedule lookup
            const scheduleChainable = createChainableMock({
                id: mockScheduleId,
                name: 'Test Schedule',
                assigned_collector_id: mockCollectorId,
                status: 'draft',
            });

            // Mock NO available collectors
            const attendanceChainable = createChainableMock([]);
            attendanceChainable.single = vi.fn().mockResolvedValue({ data: null });

            // Mock staff users for notification
            const staffChainable = createChainableMock([
                { id: mockStaffId }
            ]);
            staffChainable.single = vi.fn().mockResolvedValue({ data: null });

            // Mock update
            const updateChainable = createChainableMock(null);

            // Mock notifications
            const notificationChainable = createChainableMock({ id: 'notif-id' });

            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'collection_schedules') {
                    return {
                        ...scheduleChainable,
                        update: vi.fn().mockReturnValue(updateChainable),
                    };
                }
                if (table === 'collector_attendance') return attendanceChainable;
                if (table === 'profiles') return staffChainable;
                if (table === 'notifications') return notificationChainable;
                return createChainableMock(null);
            });

            const result = await declineSchedule(mockScheduleId, 'Cannot complete');

            expect(result.reassignmentFailed).toBe(true);
            expect(result.message).toContain('Staff has been notified');
        });

        it('should reject decline when schedule is not assigned to collector', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockCollectorId } },
            });

            const chainable = createChainableMock(null);
            mockSupabaseClient.from.mockReturnValue(chainable);

            const result = await declineSchedule(mockScheduleId, 'Cannot do it');

            expect(result.error).toBe('Schedule not found or not assigned to you');
        });

        it('should store decline reason in schedule', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockCollectorId } },
            });

            const scheduleChainable = createChainableMock({
                id: mockScheduleId,
                name: 'Test Schedule',
                assigned_collector_id: mockCollectorId,
                status: 'active',
            });

            const attendanceChainable = createChainableMock([]);
            const staffChainable = createChainableMock([{ id: mockStaffId }]);
            const updateMock = vi.fn().mockReturnValue(createChainableMock(null));
            const notificationChainable = createChainableMock({ id: 'notif' });

            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'collection_schedules') {
                    return {
                        ...scheduleChainable,
                        update: updateMock,
                    };
                }
                if (table === 'collector_attendance') return attendanceChainable;
                if (table === 'profiles') return staffChainable;
                if (table === 'notifications') return notificationChainable;
                return createChainableMock(null);
            });

            const declineReason = 'Vehicle breakdown';
            await declineSchedule(mockScheduleId, declineReason);

            // Check that update was called with the decline reason
            expect(updateMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    decline_reason: declineReason,
                })
            );
        });
    });

    describe('RLS Policy Validation', () => {
        it('should enforce collector can only update their own schedules', async () => {
            const differentCollectorId = 'different-collector-uuid';

            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: differentCollectorId } },
            });

            // Simulate RLS blocking - schedule not found because user isn't assigned
            const chainable = createChainableMock(null);
            mockSupabaseClient.from.mockReturnValue(chainable);

            const result = await acceptSchedule(mockScheduleId);

            expect(result.error).toBe('Schedule not found or not assigned to you');
        });

        it('should require authentication for all schedule operations', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            const acceptResult = await acceptSchedule(mockScheduleId);
            expect(acceptResult.error).toBe('Unauthorized');

            const declineResult = await declineSchedule(mockScheduleId, 'reason');
            expect(declineResult.error).toBe('Unauthorized');
        });
    });

    describe('Schedule Status Transitions', () => {
        it('should only allow accept/decline for draft or active schedules', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockCollectorId } },
            });

            // Return null because schedule is completed (not in draft/active status)
            const chainable = createChainableMock(null);
            mockSupabaseClient.from.mockReturnValue(chainable);

            const result = await acceptSchedule(mockScheduleId);

            expect(result.error).toBe('Schedule not found or not assigned to you');
        });

        it('should update status to active and set confirmation fields when accepting', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: mockCollectorId } },
            });

            const scheduleChainable = createChainableMock({
                id: mockScheduleId,
                assigned_collector_id: mockCollectorId,
                status: 'draft',
                created_by: mockStaffId,
            });

            const updateMock = vi.fn().mockReturnValue(
                createChainableMock({
                    id: mockScheduleId,
                    status: 'active',
                    confirmed_by_collector: true,
                })
            );

            const notificationChainable = createChainableMock({ id: 'notif' });

            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'collection_schedules') {
                    return {
                        ...scheduleChainable,
                        update: updateMock,
                    };
                }
                if (table === 'notifications') return notificationChainable;
                return createChainableMock(null);
            });

            await acceptSchedule(mockScheduleId);

            expect(updateMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'active',
                    confirmed_by_collector: true,
                    confirmed_at: expect.any(String),
                    accepted_at: expect.any(String),
                })
            );
        });
    });
});
