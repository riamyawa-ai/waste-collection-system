/**
 * Mock Data for Tests
 * 
 * Provides consistent test data across all test files.
 * Matches the database schema types from src/types/models.ts
 */

// User Roles
export type UserRole = 'admin' | 'staff' | 'client' | 'collector';

// Request Status
export type RequestStatus =
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'payment_confirmed'
    | 'assigned'
    | 'accepted_by_collector'
    | 'declined_by_collector'
    | 'en_route'
    | 'at_location'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

// Priority Level
export type PriorityLevel = 'low' | 'medium' | 'urgent';

// Payment Status
export type PaymentStatus = 'pending' | 'verified' | 'completed';

// Mock Users
export const mockUser = {
    id: 'test-user-id-123',
    email: 'testclient@example.com',
    first_name: 'Test',
    last_name: 'User',
    full_name: 'Test User',
    phone: '+639123456789',
    role: 'client' as UserRole,
    status: 'active',
    barangay: 'Gredu (Poblacion)',
    address: '123 Test Street, Panabo City',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const mockCollector = {
    ...mockUser,
    id: 'test-collector-id-456',
    email: 'testcollector@example.com',
    first_name: 'Collector',
    last_name: 'Test',
    full_name: 'Collector Test',
    role: 'collector' as UserRole,
};

export const mockStaff = {
    ...mockUser,
    id: 'test-staff-id-789',
    email: 'teststaff@example.com',
    first_name: 'Staff',
    last_name: 'Test',
    full_name: 'Staff Test',
    role: 'staff' as UserRole,
};

export const mockAdmin = {
    ...mockUser,
    id: 'test-admin-id-101',
    email: 'testadmin@example.com',
    first_name: 'Admin',
    last_name: 'Test',
    full_name: 'Admin Test',
    role: 'admin' as UserRole,
};

// Mock Collection Request
export const mockRequest = {
    id: 'test-request-id-001',
    request_number: 'REQ-20241212-0001',
    client_id: mockUser.id,
    requester_name: 'Test User',
    contact_number: '+639123456789',
    alt_contact_number: null,
    barangay: 'Gredu (Poblacion)',
    address: '123 Test Street, Panabo City',
    priority: 'medium' as PriorityLevel,
    preferred_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    preferred_time_slot: 'morning',
    special_instructions: 'Please use the side entrance. Ring the bell twice.',
    status: 'pending' as RequestStatus,
    collector_id: null,
    scheduled_date: null,
    scheduled_time: null,
    collector_decline_reason: null,
    collector_declined_at: null,
    reassignment_count: 0,
    completed_at: null,
    cancelled_at: null,
    cancelled_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const mockAssignedRequest = {
    ...mockRequest,
    id: 'test-request-id-002',
    request_number: 'REQ-20241212-0002',
    status: 'assigned' as RequestStatus,
    collector_id: mockCollector.id,
    scheduled_date: new Date(Date.now() + 86400000).toISOString(),
    scheduled_time: '08:00:00',
};

export const mockCompletedRequest = {
    ...mockRequest,
    id: 'test-request-id-003',
    request_number: 'REQ-20241212-0003',
    status: 'completed' as RequestStatus,
    collector_id: mockCollector.id,
    completed_at: new Date().toISOString(),
};

// Mock Payment
export const mockPayment = {
    id: 'test-payment-id-001',
    payment_number: 'PAY-20241212-0001',
    request_id: mockRequest.id,
    client_id: mockUser.id,
    amount: 500,
    reference_number: 'REF-123456789',
    receipt_url: null,
    status: 'pending' as PaymentStatus,
    recorded_by: mockStaff.id,
    notes: null,
    date_received: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const mockVerifiedPayment = {
    ...mockPayment,
    id: 'test-payment-id-002',
    payment_number: 'PAY-20241212-0002',
    status: 'verified' as PaymentStatus,
};

// Mock Feedback
export const mockFeedback = {
    id: 'test-feedback-id-001',
    request_id: mockCompletedRequest.id,
    client_id: mockUser.id,
    collector_id: mockCollector.id,
    rating: 5,
    comments: 'Excellent service! Very professional and punctual.',
    is_anonymous: false,
    is_editable: true,
    status: 'new',
    last_edited_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

// Mock Announcement
export const mockAnnouncement = {
    id: 'test-announcement-id-001',
    title: 'System Maintenance Notice',
    content: 'The system will undergo scheduled maintenance on Saturday from 12:00 AM to 6:00 AM.',
    type: 'maintenance',
    priority: 'important',
    target_audience: ['all'],
    image_url: null,
    publish_date: new Date().toISOString(),
    expiry_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    is_published: true,
    enable_email_notification: true,
    enable_push_notification: true,
    views_count: 0,
    created_by: mockAdmin.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

// Mock Notification
export const mockNotification = {
    id: 'test-notification-id-001',
    user_id: mockUser.id,
    type: 'request_status_update',
    title: 'Request Status Updated',
    message: 'Your collection request REQ-20241212-0001 has been accepted.',
    data: { request_id: mockRequest.id },
    is_read: false,
    created_at: new Date().toISOString(),
};

// Mock Collector Attendance
export const mockAttendance = {
    id: 'test-attendance-id-001',
    collector_id: mockCollector.id,
    login_time: new Date().toISOString(),
    logout_time: null,
    total_duration: null,
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

// Mock Session
export const mockSession = {
    access_token: 'mock-access-token-abc123',
    refresh_token: 'mock-refresh-token-xyz789',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: {
        id: mockUser.id,
        email: mockUser.email,
        app_metadata: {},
        user_metadata: {
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
        },
        aud: 'authenticated',
        created_at: mockUser.created_at,
    },
};

// Panabo City Barangays (sample)
export const sampleBarangays = [
    'A.O. Floirendo',
    'Buenavista',
    'Gredu (Poblacion)',
    'J.P. Laurel (Poblacion)',
    'Kasilak',
    'San Francisco (Poblacion)',
];

// Time Slots
export const timeSlots = {
    morning: [
        '7:00 AM - 8:00 AM',
        '8:00 AM - 9:00 AM',
        '9:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
    ],
    afternoon: [
        '1:00 PM - 2:00 PM',
        '2:00 PM - 3:00 PM',
        '3:00 PM - 4:00 PM',
        '4:00 PM - 5:00 PM',
    ],
    flexible: ['Flexible'],
};
