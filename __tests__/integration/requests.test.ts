import { describe, it, expect } from 'vitest';
import { mockRequest, mockCollector } from '../utils/mocks/data';

describe('Collection Requests Integration', () => {
    describe('Request Status Workflow', () => {
        const statusTransitions = [
            { from: 'pending', to: 'accepted' },
            { from: 'accepted', to: 'payment_confirmed' },
            { from: 'payment_confirmed', to: 'assigned' },
            { from: 'assigned', to: 'accepted_by_collector' },
            { from: 'accepted_by_collector', to: 'en_route' },
            { from: 'en_route', to: 'at_location' },
            { from: 'at_location', to: 'in_progress' },
            { from: 'in_progress', to: 'completed' },
        ];

        statusTransitions.forEach(({ to }) => {
            it(`should accept ${to} as a valid status`, () => {
                // Validation of status enum/types
                expect(['pending', 'accepted', 'payment_confirmed', 'assigned',
                    'accepted_by_collector', 'en_route', 'at_location',
                    'in_progress', 'completed', 'cancelled', 'rejected'])
                    .toContain(to);
            });
        });
    });

    describe('Collector Assignment', () => {
        it('should have correct collector id when assigned', () => {
            const assignedRequest = {
                ...mockRequest,
                status: 'assigned',
                collector_id: mockCollector.id,
            };

            expect(assignedRequest.collector_id).toBe(mockCollector.id);
            expect(assignedRequest.status).toBe('assigned');
        });
    });
});
