/**
 * E2E Test Fixtures
 * 
 * Test data and user credentials for Playwright E2E tests.
 * 
 * NOTE: These should match users created in your test database.
 * For CI/CD, use environment variables or seed data scripts.
 */

export const testUsers = {
    client: {
        email: process.env.TEST_CLIENT_EMAIL || 'testclient@example.com',
        password: process.env.TEST_CLIENT_PASSWORD || 'TestClient1!',
        firstName: 'Test',
        lastName: 'Client',
        role: 'client',
    },
    staff: {
        email: process.env.TEST_STAFF_EMAIL || 'teststaff@example.com',
        password: process.env.TEST_STAFF_PASSWORD || 'TestStaff1!',
        firstName: 'Test',
        lastName: 'Staff',
        role: 'staff',
    },
    collector: {
        email: process.env.TEST_COLLECTOR_EMAIL || 'testcollector@example.com',
        password: process.env.TEST_COLLECTOR_PASSWORD || 'TestCollector1!',
        firstName: 'Test',
        lastName: 'Collector',
        role: 'collector',
    },
    admin: {
        email: process.env.TEST_ADMIN_EMAIL || 'testadmin@example.com',
        password: process.env.TEST_ADMIN_PASSWORD || 'TestAdmin1!',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'admin',
    },
};

export const testRequest = {
    barangay: 'Gredu (Poblacion)',
    address: '123 Test Street, Panabo City',
    priority: 'medium',
    timeSlot: 'morning',
    instructions: 'Test pickup request for E2E testing. Please use side entrance.',
};

export const testPayment = {
    amount: '500',
    reference: 'REF-E2E-TEST-001',
};

export const routes = {
    // Public routes
    home: '/',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',

    // Client routes
    clientDashboard: '/client/dashboard',
    clientRequests: '/client/requests',
    clientSchedule: '/client/schedule',
    clientPayments: '/client/payments',
    clientFeedback: '/client/feedback',
    clientProfile: '/client/profile',

    // Staff routes
    staffDashboard: '/staff/dashboard',
    staffUsers: '/staff/users',
    staffCollections: '/staff/collections',
    staffSchedules: '/staff/schedules',
    staffPayments: '/staff/payments',
    staffAnnouncements: '/staff/announcements',

    // Collector routes
    collectorDashboard: '/collector/dashboard',
    collectorSchedule: '/collector/schedule',
    collectorRequests: '/collector/requests',
    collectorProfile: '/collector/profile',

    // Admin routes
    adminDashboard: '/admin/dashboard',
    adminReports: '/admin/reports',
    adminSettings: '/admin/settings',
};

export const selectors = {
    // Form elements
    emailInput: '[name="email"], [id="email"], [data-testid="email-input"]',
    passwordInput: '[name="password"], [id="password"], [data-testid="password-input"]',
    submitButton: '[type="submit"], [data-testid="submit-button"]',

    // Navigation
    navMenu: '[data-testid="nav-menu"], nav',
    userMenu: '[data-testid="user-menu"]',
    logoutButton: '[data-testid="logout-button"]',

    // Notifications
    notificationBell: '[data-testid="notification-bell"]',
    toast: '[data-sonner-toast], [role="alert"]',

    // Tables
    dataTable: '[data-testid="data-table"], table',
    tableRow: 'tbody tr',

    // Modals
    modal: '[role="dialog"], [data-testid="modal"]',
    modalClose: '[data-testid="modal-close"], button[aria-label="Close"]',

    // Cards
    statCard: '[data-testid="stat-card"], .stat-card',
};

/**
 * Helper to get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

/**
 * Helper to wait for page load
 */
export async function waitForPageLoad(page: import('@playwright/test').Page) {
    await page.waitForLoadState('networkidle');
}
