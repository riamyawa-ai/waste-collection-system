import type { UserRole, RequestStatus, PriorityLevel, PaymentStatus } from '@/types/models';

export const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    full_name: 'Test User',
    phone: '+639123456789',
    role: 'client' as UserRole,
    status: 'active',
    barangay: 'Gredu (Poblacion)',
    address: '123 Test Street',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
};

export const mockCollector = {
    ...mockUser,
    id: 'test-collector-id',
    email: 'collector@example.com',
    first_name: 'Collector',
    last_name: 'Test',
    full_name: 'Collector Test',
    role: 'collector' as UserRole,
};

export const mockStaff = {
    ...mockUser,
    id: 'test-staff-id',
    email: 'staff@example.com',
    first_name: 'Staff',
    last_name: 'Test',
    full_name: 'Staff Test',
    role: 'staff' as UserRole,
};

export const mockAdmin = {
    ...mockUser,
    id: 'test-admin-id',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'Test',
    full_name: 'Admin Test',
    role: 'admin' as UserRole,
};

export const mockRequest = {
    id: 'test-request-id',
    request_number: 'REQ-20241212-0001',
    client_id: mockUser.id,
    requester_name: 'Test User',
    contact_number: '+639123456789',
    alt_contact_number: null,
    barangay: 'Gredu (Poblacion)',
    address: '123 Test Street',
    priority: 'medium' as PriorityLevel,
    preferred_date: new Date().toISOString(),
    preferred_time_slot: 'morning',
    special_instructions: 'Test instructions',
    status: 'pending' as RequestStatus,
    collector_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const mockAssignedRequest = {
    ...mockRequest,
    id: 'test-assigned-request-id',
    status: 'assigned' as RequestStatus,
    collector_id: mockCollector.id,
};

export const mockCompletedRequest = {
    ...mockRequest,
    id: 'test-completed-request-id',
    request_number: 'REQ-20241212-0002',
    status: 'completed' as RequestStatus,
    collector_id: mockCollector.id,
    completed_at: new Date().toISOString(),
};

export const mockPayment = {
    id: 'test-payment-id-001',
    payment_number: 'PAY-20241212-0001',
    request_id: mockRequest.id,
    client_id: mockUser.id,
    amount: 500,
    reference_number: 'REF-123456789',
    status: 'pending' as PaymentStatus,
    recorded_by: mockStaff.id,
    receipt_url: null as string | null,
    date_received: new Date().toISOString(),
    notes: null as string | null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const mockVerifiedPayment = {
    ...mockPayment,
    id: 'test-verified-payment-id',
    payment_number: 'PAY-20241212-0002',
    status: 'verified' as PaymentStatus,
};

export const mockFeedback = {
    id: 'test-feedback-id',
    request_id: mockCompletedRequest.id,
    client_id: mockUser.id,
    collector_id: mockCollector.id,
    rating: 5,
    comment: 'Great service!',
    is_anonymous: false,
    is_editable: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const mockAnnouncement = {
    id: 'test-announcement-id',
    title: 'Test Announcement', // < 100 chars
    content: 'This is a test announcement content.', // < 2000 chars
    type: 'info',
    priority: 'normal',
    target_audience: ['all'],
    scheduled_at: null,
    expires_at: null,
    created_by: mockStaff.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const mockNotification = {
    id: 'test-notification-id',
    user_id: mockUser.id,
    type: 'request_status_update',
    title: 'Request Updated',
    message: 'Your request has been updated.',
    reference_id: mockRequest.id,
    reference_type: 'request',
    is_read: false,
    created_at: new Date().toISOString(),
};

export const mockAttendance = {
    id: 'test-attendance-id',
    collector_id: mockCollector.id,
    date: '2024-12-12', // YYYY-MM-DD
    login_time: '08:00:00',
    logout_time: '17:00:00',
    status: 'present',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};
