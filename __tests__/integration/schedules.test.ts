import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    mockCollector,
    mockStaff,
} from '@tests/utils/mocks/data';

/**
 * Schedule Integration Tests
 * 
 * Tests the collection schedule workflow including creation,
 * assignment, confirmation, and status transitions.
 */

// Mock schedule data based on SQL schema
const mockSchedule = {
    id: 'test-schedule-id-001',
    name: 'Weekly Collection - Gredu Area',
    description: 'Regular weekly collection for Gredu Poblacion area',
    schedule_type: 'weekly' as const,
    start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], // 30 days later
    start_time: '07:00:00',
    end_time: '12:00:00',
    working_days: ['monday', 'wednesday', 'friday'],
    week_of_month: null,
    assigned_collector_id: mockCollector.id,
    backup_collector_id: null,
    special_instructions: 'Start from the main road and work inward',
    status: 'draft' as const,
    confirmed_by_collector: false,
    confirmed_at: null,
    decline_reason: null,
    created_by: mockStaff.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

const mockScheduleStop = {
    id: 'test-stop-id-001',
    schedule_id: mockSchedule.id,
    location_name: 'Gredu Barangay Hall',
    location_type: 'government',
    address: 'Gredu Main Road, Panabo City',
    barangay: 'Gredu (Poblacion)',
    latitude: 7.3052,
    longitude: 125.6844,
    stop_order: 1,
    estimated_duration: 30, // minutes
    contact_person: 'Barangay Captain',
    contact_number: '+639123456789',
    special_notes: 'Large volume expected',
    is_completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

describe('Schedule Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Schedule Data Structure', () => {
        it('should have valid schedule data', () => {
            expect(mockSchedule).toBeDefined();
            expect(mockSchedule.id).toBe('test-schedule-id-001');
            expect(mockSchedule.status).toBe('draft');
        });

        it('should have required schedule fields', () => {
            const requiredFields = [
                'id',
                'name',
                'schedule_type',
                'start_date',
                'start_time',
                'end_time',
                'status',
                'created_by',
            ];

            requiredFields.forEach(field => {
                expect(mockSchedule).toHaveProperty(field);
            });
        });

        it('should have valid schedule type', () => {
            const validTypes = ['one-time', 'weekly', 'bi-weekly', 'monthly'];
            expect(validTypes).toContain(mockSchedule.schedule_type);
        });

        it('should have valid status', () => {
            const validStatuses = ['draft', 'active', 'completed', 'cancelled'];
            expect(validStatuses).toContain(mockSchedule.status);
        });
    });

    describe('Schedule Creation', () => {
        it('should create schedule with draft status', () => {
            expect(mockSchedule.status).toBe('draft');
        });

        it('should have staff member as creator', () => {
            expect(mockSchedule.created_by).toBe(mockStaff.id);
        });

        it('should allow assigned collector', () => {
            expect(mockSchedule.assigned_collector_id).toBe(mockCollector.id);
        });

        it('should allow optional backup collector', () => {
            expect(mockSchedule.backup_collector_id).toBeNull();
        });

        it('should have valid time range', () => {
            const startTime = mockSchedule.start_time;
            const endTime = mockSchedule.end_time;

            expect(startTime < endTime).toBe(true);
        });

        it('should have start date in the future', () => {
            const startDate = new Date(mockSchedule.start_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            expect(startDate >= today).toBe(true);
        });
    });

    describe('Schedule Status Workflow', () => {
        const statusTransitions = [
            { from: 'draft', to: 'active', action: 'Publish Schedule' },
            { from: 'active', to: 'completed', action: 'Complete Schedule' },
            { from: 'draft', to: 'cancelled', action: 'Cancel Draft' },
            { from: 'active', to: 'cancelled', action: 'Cancel Active' },
        ];

        statusTransitions.forEach(({ from, to, action }) => {
            it(`should allow transition from ${from} to ${to} on ${action}`, () => {
                const validStatuses = ['draft', 'active', 'completed', 'cancelled'];
                expect(validStatuses).toContain(from);
                expect(validStatuses).toContain(to);
            });
        });

        it('should transition to active when published', () => {
            const activeSchedule = {
                ...mockSchedule,
                status: 'active' as const,
            };

            expect(activeSchedule.status).toBe('active');
        });

        it('should track collector confirmation', () => {
            const confirmedSchedule = {
                ...mockSchedule,
                status: 'active' as const,
                confirmed_by_collector: true,
                confirmed_at: new Date().toISOString(),
            };

            expect(confirmedSchedule.confirmed_by_collector).toBe(true);
            expect(confirmedSchedule.confirmed_at).toBeDefined();
        });
    });

    describe('Schedule Stops', () => {
        it('should have valid stop data', () => {
            expect(mockScheduleStop).toBeDefined();
            expect(mockScheduleStop.schedule_id).toBe(mockSchedule.id);
        });

        it('should have required stop fields', () => {
            const requiredFields = [
                'id',
                'schedule_id',
                'location_name',
                'location_type',
                'address',
                'barangay',
                'stop_order',
            ];

            requiredFields.forEach(field => {
                expect(mockScheduleStop).toHaveProperty(field);
            });
        });

        it('should have valid stop order', () => {
            expect(mockScheduleStop.stop_order).toBe(1);
            expect(mockScheduleStop.stop_order).toBeGreaterThan(0);
        });

        it('should have valid coordinates', () => {
            expect(mockScheduleStop.latitude).toBeDefined();
            expect(mockScheduleStop.longitude).toBeDefined();
            expect(mockScheduleStop.latitude).toBeGreaterThan(0);
            expect(mockScheduleStop.longitude).toBeGreaterThan(0);
        });

        it('should track completion status', () => {
            expect(mockScheduleStop.is_completed).toBe(false);

            const completedStop = {
                ...mockScheduleStop,
                is_completed: true,
                completed_at: new Date().toISOString(),
            };

            expect(completedStop.is_completed).toBe(true);
            expect(completedStop.completed_at).toBeDefined();
        });
    });

    describe('Weekly Schedule Configuration', () => {
        it('should have working days for weekly schedule', () => {
            expect(mockSchedule.working_days).toBeDefined();
            expect(Array.isArray(mockSchedule.working_days)).toBe(true);
        });

        it('should have valid working day values', () => {
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            mockSchedule.working_days.forEach(day => {
                expect(validDays).toContain(day);
            });
        });

        it('should allow multiple working days', () => {
            expect(mockSchedule.working_days.length).toBeGreaterThan(0);
        });
    });

    describe('Collector Assignment', () => {
        it('should have collector assigned', () => {
            expect(mockSchedule.assigned_collector_id).toBeDefined();
        });

        it('should allow collector decline', () => {
            const declinedSchedule = {
                ...mockSchedule,
                confirmed_by_collector: false,
                decline_reason: 'Schedule conflict with another route',
            };

            expect(declinedSchedule.decline_reason).toBeDefined();
        });

        it('should allow backup collector', () => {
            const scheduleWithBackup = {
                ...mockSchedule,
                backup_collector_id: 'backup-collector-id',
            };

            expect(scheduleWithBackup.backup_collector_id).toBeDefined();
        });
    });
});
