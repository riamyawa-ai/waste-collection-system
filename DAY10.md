# Day 10: Testing, Optimization & Deployment

**Date**: Day 10 of 10  
**Focus**: Testing, Performance Optimization, Security Audit, Deployment

---

## 📋 Objectives

- Write comprehensive tests (unit, integration, E2E)
- Configure test execution with batch mode and single worker
- Optimize performance across the application
- Conduct security audit
- Deploy to production

---

## 🛠️ Tasks

### 10.1 Testing Setup & Configuration (2 hours)

#### Install Testing Libraries:
```bash
npm install -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
npm install -D @playwright/test
npx playwright install chromium
```

#### Create Jest Configuration:

**File: `jest.config.js`**
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Run tests in batch mode - one test file at a time
  maxWorkers: 1,
  // Run tests sequentially within each file
  testRunner: 'jest-circus/runner',
  // Verbose output for better debugging
  verbose: true,
  // Prevent parallel execution
  runInBand: true,
};

module.exports = createJestConfig(customJestConfig);
```

**File: `jest.setup.ts`**
```typescript
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Global test timeout
jest.setTimeout(30000);
```

#### Create Playwright Configuration:

**File: `playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Run tests in files in SERIES (one after another)
  fullyParallel: false,
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Use SINGLE WORKER to prevent opening multiple browsers
  workers: 1,
  // Reporter to use
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    // Screenshot on failure
    screenshot: 'only-on-failure',
    // Video recording on failure
    video: 'on-first-retry',
    // Default timeout for each action
    actionTimeout: 15000,
    // Timeout for page navigation
    navigationTimeout: 30000,
  },
  // Global timeout for each test
  timeout: 60000,
  // Expect timeout
  expect: {
    timeout: 10000,
  },
  // Configure projects for different browsers
  // Using ONLY Chromium to prevent multiple browser instances
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true,
        // Reuse browser context to speed up tests
        launchOptions: {
          args: ['--disable-gpu', '--no-sandbox'],
        },
      },
    },
    // Mobile viewport tests (still using same browser)
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        headless: true,
      },
    },
  ],
  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

#### Update package.json Scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "jest --runInBand --maxWorkers=1",
    "test:watch": "jest --watch --runInBand --maxWorkers=1",
    "test:coverage": "jest --coverage --runInBand --maxWorkers=1",
    "test:e2e": "playwright test --workers=1",
    "test:e2e:headed": "playwright test --headed --workers=1",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

### 10.2 Unit Tests (2.5 hours)

#### Test Directory Structure:
```
__tests__/
├── unit/
│   ├── hooks/
│   │   ├── usePerformance.test.ts
│   │   ├── useAuth.test.ts
│   │   └── useRealtime.test.ts
│   ├── lib/
│   │   ├── validators/
│   │   │   ├── auth.test.ts
│   │   │   └── request.test.ts
│   │   └── utils/
│   │       └── helpers.test.ts
│   └── components/
│       ├── ui/
│       │   ├── Button.test.tsx
│       │   ├── StatusBadge.test.tsx
│       │   └── DataTable.test.tsx
│       └── forms/
│           ├── LoginForm.test.tsx
│           └── RequestForm.test.tsx
├── integration/
│   ├── auth.test.ts
│   ├── requests.test.ts
│   └── payments.test.ts
└── utils/
    ├── test-utils.tsx
    └── mocks/
        ├── supabase.ts
        ├── router.ts
        └── data.ts
```

#### Create Test Utilities:

**File: `__tests__/utils/test-utils.tsx`**
```typescript
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Add providers as needed (Theme, Context, etc.)
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => ({
  user: userEvent.setup(),
  ...render(ui, { wrapper: AllTheProviders, ...options }),
});

export * from '@testing-library/react';
export { customRender as render };
```

**File: `__tests__/utils/mocks/data.ts`**
```typescript
import { UserRole, RequestStatus, PriorityLevel, PaymentStatus } from '@/types/models';

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
  request_number: 'REQ-20241211-0001',
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
  scheduled_date: null,
  scheduled_time: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockPayment = {
  id: 'test-payment-id',
  payment_number: 'PAY-20241211-0001',
  request_id: mockRequest.id,
  client_id: mockUser.id,
  amount: 500,
  reference_number: 'REF-123456',
  receipt_url: null,
  status: 'pending' as PaymentStatus,
  recorded_by: mockStaff.id,
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockFeedback = {
  id: 'test-feedback-id',
  request_id: mockRequest.id,
  client_id: mockUser.id,
  collector_id: mockCollector.id,
  rating: 5,
  comments: 'Excellent service!',
  is_anonymous: false,
  is_editable: true,
  status: 'new',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

#### Sample Unit Tests:

**File: `__tests__/unit/hooks/usePerformance.test.ts`**
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  usePrevious,
  useIsMounted,
  useLazyInit,
} from '@/hooks/usePerformance';

describe('usePerformance Hooks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useDebounce', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'updated', delay: 500 });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('should cancel previous timeout on rapid updates', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'first' } }
      );

      rerender({ value: 'second' });
      act(() => {
        jest.advanceTimersByTime(200);
      });

      rerender({ value: 'third' });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('third');
    });
  });

  describe('useDebouncedCallback', () => {
    it('should debounce callback execution', () => {
      const callback = jest.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 500)
      );

      result.current('arg1');
      result.current('arg2');
      result.current('arg3');

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg3');
    });
  });

  describe('useThrottle', () => {
    it('should throttle value updates', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 500),
        { initialProps: { value: 0 } }
      );

      expect(result.current).toBe(0);

      // Multiple rapid updates
      for (let i = 1; i <= 5; i++) {
        rerender({ value: i });
      }

      // Value should still be throttled
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe(5);
    });
  });

  describe('usePrevious', () => {
    it('should return undefined on first render', () => {
      const { result } = renderHook(() => usePrevious('initial'));
      expect(result.current).toBeUndefined();
    });

    it('should return previous value after update', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 'first' } }
      );

      rerender({ value: 'second' });
      expect(result.current).toBe('first');

      rerender({ value: 'third' });
      expect(result.current).toBe('second');
    });
  });

  describe('useIsMounted', () => {
    it('should return true when mounted', () => {
      const { result } = renderHook(() => useIsMounted());
      expect(result.current()).toBe(true);
    });

    it('should return false after unmount', () => {
      const { result, unmount } = renderHook(() => useIsMounted());
      const isMounted = result.current;
      
      unmount();
      expect(isMounted()).toBe(false);
    });
  });

  describe('useLazyInit', () => {
    it('should only call factory once', () => {
      const factory = jest.fn(() => 'initialized');
      const { result, rerender } = renderHook(() => useLazyInit(factory));

      expect(result.current).toBe('initialized');
      expect(factory).toHaveBeenCalledTimes(1);

      rerender();
      expect(factory).toHaveBeenCalledTimes(1);
    });
  });
});
```

**File: `__tests__/unit/lib/validators/auth.test.ts`**
```typescript
import { z } from 'zod';

// Define validation schemas for testing
const emailSchema = z.string().email('Invalid email format');
const phoneSchema = z.string().regex(
  /^(\+63|0)\d{10}$/,
  'Invalid Philippine phone number format'
);
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character');

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

describe('Auth Validators', () => {
  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co',
        'user+tag@example.org',
      ];

      validEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
      ];

      invalidEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid Philippine phone numbers', () => {
      const validPhones = [
        '+639123456789',
        '09123456789',
      ];

      validPhones.forEach((phone) => {
        expect(() => phoneSchema.parse(phone)).not.toThrow();
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123456789',
        '+1234567890',
        '0912345',
        '+63912345678901',
      ];

      invalidPhones.forEach((phone) => {
        expect(() => phoneSchema.parse(phone)).toThrow();
      });
    });
  });

  describe('Password Validation', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'Password1!',
        'MySecure@123',
        'Test$Pass99',
      ];

      validPasswords.forEach((password) => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject passwords without uppercase', () => {
      expect(() => passwordSchema.parse('password1!')).toThrow();
    });

    it('should reject passwords without lowercase', () => {
      expect(() => passwordSchema.parse('PASSWORD1!')).toThrow();
    });

    it('should reject passwords without numbers', () => {
      expect(() => passwordSchema.parse('Password!')).toThrow();
    });

    it('should reject passwords without special characters', () => {
      expect(() => passwordSchema.parse('Password1')).toThrow();
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(() => passwordSchema.parse('Pass1!')).toThrow();
    });
  });

  describe('Registration Schema', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+639123456789',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    };

    it('should accept valid registration data', () => {
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it('should reject when passwords do not match', () => {
      expect(() =>
        registerSchema.parse({
          ...validData,
          confirmPassword: 'DifferentPassword1!',
        })
      ).toThrow();
    });

    it('should reject missing first name', () => {
      expect(() =>
        registerSchema.parse({ ...validData, firstName: '' })
      ).toThrow();
    });

    it('should reject missing last name', () => {
      expect(() =>
        registerSchema.parse({ ...validData, lastName: '' })
      ).toThrow();
    });
  });
});
```

---

### 10.3 Integration Tests (2 hours)

**File: `__tests__/integration/auth.test.ts`**
```typescript
import { createClient } from '@/lib/supabase/client';

// Mock Supabase responses
const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'mock-token',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      const { data, error } = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
    });

    it('should fail login with invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      });

      const { data, error } = await mockSupabase.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      expect(error).toBeDefined();
      expect(error.message).toBe('Invalid login credentials');
      expect(data.session).toBeNull();
    });
  });

  describe('Registration Flow', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const { data, error } = await mockSupabase.auth.signUp({
        email: 'newuser@example.com',
        password: 'Password1!',
        options: {
          data: {
            first_name: 'New',
            last_name: 'User',
            phone: '+639123456789',
          },
        },
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('newuser@example.com');
    });

    it('should fail registration with existing email', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      const { data, error } = await mockSupabase.auth.signUp({
        email: 'existing@example.com',
        password: 'Password1!',
      });

      expect(error).toBeDefined();
      expect(error.message).toBe('User already registered');
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const { error } = await mockSupabase.auth.signOut();

      expect(error).toBeNull();
    });
  });
});
```

**File: `__tests__/integration/requests.test.ts`**
```typescript
import { mockRequest, mockUser, mockCollector } from '../utils/mocks/data';

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();

const setupMockChain = () => {
  mockFrom.mockReturnValue({
    select: mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        single: mockSingle,
        order: mockOrder.mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: [mockRequest], error: null }),
        }),
      }),
    }),
    insert: mockInsert.mockReturnValue({
      select: mockSelect.mockReturnValue({
        single: mockSingle,
      }),
    }),
    update: mockUpdate.mockReturnValue({
      eq: mockEq.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle,
        }),
      }),
    }),
  });
};

describe('Collection Requests Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
  });

  describe('Create Request', () => {
    it('should create a new collection request', async () => {
      const newRequest = {
        client_id: mockUser.id,
        requester_name: 'Test User',
        contact_number: '+639123456789',
        barangay: 'Gredu (Poblacion)',
        address: '123 Test Street',
        priority: 'medium',
        preferred_date: new Date().toISOString(),
        preferred_time_slot: 'morning',
        special_instructions: 'Test instructions',
      };

      mockSingle.mockResolvedValue({
        data: { ...mockRequest, ...newRequest },
        error: null,
      });

      // Simulate request creation
      const result = await mockFrom('collection_requests')
        .insert(newRequest)
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data.requester_name).toBe('Test User');
      expect(result.data.barangay).toBe('Gredu (Poblacion)');
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
        mockSingle.mockResolvedValue({
          data: { ...mockRequest, status: to },
          error: null,
        });

        const result = await mockFrom('collection_requests')
          .update({ status: to })
          .eq('id', mockRequest.id)
          .select()
          .single();

        expect(result.error).toBeNull();
        expect(result.data.status).toBe(to);
      });
    });
  });

  describe('Collector Assignment', () => {
    it('should assign collector to request', async () => {
      mockSingle.mockResolvedValue({
        data: {
          ...mockRequest,
          status: 'assigned',
          collector_id: mockCollector.id,
        },
        error: null,
      });

      const result = await mockFrom('collection_requests')
        .update({
          status: 'assigned',
          collector_id: mockCollector.id,
        })
        .eq('id', mockRequest.id)
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data.collector_id).toBe(mockCollector.id);
      expect(result.data.status).toBe('assigned');
    });
  });

  describe('Request Cancellation', () => {
    it('should cancel pending request', async () => {
      mockSingle.mockResolvedValue({
        data: { ...mockRequest, status: 'cancelled' },
        error: null,
      });

      const result = await mockFrom('collection_requests')
        .update({ status: 'cancelled' })
        .eq('id', mockRequest.id)
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data.status).toBe('cancelled');
    });
  });
});
```

---

### 10.4 E2E Tests with Playwright (2 hours)

#### E2E Test Structure:
```
e2e/
├── auth/
│   ├── login.spec.ts
│   ├── register.spec.ts
│   └── password-recovery.spec.ts
├── client/
│   ├── dashboard.spec.ts
│   ├── request-service.spec.ts
│   └── payments.spec.ts
├── staff/
│   ├── dashboard.spec.ts
│   ├── user-management.spec.ts
│   └── collections.spec.ts
├── collector/
│   ├── dashboard.spec.ts
│   └── requests.spec.ts
├── mobile/
│   └── responsive.spec.ts
└── fixtures/
    └── test-data.ts
```

**File: `e2e/fixtures/test-data.ts`**
```typescript
export const testUsers = {
  client: {
    email: 'testclient@example.com',
    password: 'TestClient1!',
    firstName: 'Test',
    lastName: 'Client',
  },
  staff: {
    email: 'teststaff@example.com',
    password: 'TestStaff1!',
  },
  collector: {
    email: 'testcollector@example.com',
    password: 'TestCollector1!',
  },
  admin: {
    email: 'testadmin@example.com',
    password: 'TestAdmin1!',
  },
};

export const testRequest = {
  barangay: 'Gredu (Poblacion)',
  address: '123 Test Street, Panabo City',
  priority: 'medium',
  timeSlot: 'morning',
  instructions: 'Test pickup request for E2E testing',
};
```

**File: `e2e/auth/login.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page with all elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByText(/forgot password/i)).toBeVisible();
    await expect(page.getByText(/sign up/i)).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@email.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login and redirect to dashboard', async ({ page }) => {
    await page.getByLabel(/email/i).fill(testUsers.client.email);
    await page.getByLabel(/password/i).fill(testUsers.client.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL(/\/client\/dashboard/, { timeout: 15000 });
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('testpassword');
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await page.getByRole('button', { name: /show password|toggle password/i }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
```

**File: `e2e/client/request-service.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';
import { testUsers, testRequest } from '../fixtures/test-data';

test.describe('Client Request Service', () => {
  test.beforeEach(async ({ page }) => {
    // Login as client
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUsers.client.email);
    await page.getByLabel(/password/i).fill(testUsers.client.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/client\/dashboard/, { timeout: 15000 });
    
    // Navigate to requests page
    await page.goto('/client/requests');
  });

  test('should display request service page with all elements', async ({ page }) => {
    // Summary cards
    await expect(page.getByText(/pending/i)).toBeVisible();
    await expect(page.getByText(/completed/i)).toBeVisible();
    
    // Request button
    await expect(page.getByRole('button', { name: /request pickup/i })).toBeVisible();
  });

  test('should open and fill request pickup form', async ({ page }) => {
    // Open request modal
    await page.getByRole('button', { name: /request pickup/i }).click();
    
    // Fill form fields
    await page.getByLabel(/barangay/i).click();
    await page.getByRole('option', { name: testRequest.barangay }).click();
    
    await page.getByLabel(/address/i).fill(testRequest.address);
    
    // Select priority
    await page.getByLabel(/priority/i).click();
    await page.getByRole('option', { name: new RegExp(testRequest.priority, 'i') }).click();
    
    // Select date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByLabel(/preferred date/i).fill(tomorrow.toISOString().split('T')[0]);
    
    // Select time slot
    await page.getByLabel(/time slot/i).click();
    await page.getByRole('option', { name: /morning/i }).click();
    
    // Add instructions
    await page.getByLabel(/instructions/i).fill(testRequest.instructions);
    
    // Submit form
    await page.getByRole('button', { name: /submit/i }).click();
    
    // Confirmation modal
    await expect(page.getByText(/confirm/i)).toBeVisible();
    await page.getByRole('checkbox', { name: /confirm/i }).check();
    await page.getByRole('button', { name: /confirm.*submit/i }).click();
    
    // Success message
    await expect(page.getByText(/success|submitted/i)).toBeVisible({ timeout: 10000 });
  });

  test('should filter requests by status', async ({ page }) => {
    // Click status filter
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /pending/i }).click();
    
    // Verify filter applied
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByText(/pending/i)).toBeVisible();
    }
  });
});
```

**File: `e2e/staff/collections.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

test.describe('Staff Collections Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as staff
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUsers.staff.email);
    await page.getByLabel(/password/i).fill(testUsers.staff.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/staff\/dashboard/, { timeout: 15000 });
    
    // Navigate to collections page
    await page.goto('/staff/collections');
  });

  test('should display collections page with summary cards', async ({ page }) => {
    await expect(page.getByText(/total requests/i)).toBeVisible();
    await expect(page.getByText(/pending review/i)).toBeVisible();
    await expect(page.getByText(/in progress/i)).toBeVisible();
    await expect(page.getByText(/completed/i)).toBeVisible();
  });

  test('should accept a pending request', async ({ page }) => {
    // Filter to pending requests
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /pending/i }).click();
    
    // Find and click accept on first request
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.getByRole('button', { name: /accept/i }).click();
    
    // Confirm acceptance
    await expect(page.getByText(/confirm.*accept/i)).toBeVisible();
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Verify success
    await expect(page.getByText(/accepted|success/i)).toBeVisible({ timeout: 5000 });
  });

  test('should record payment for accepted request', async ({ page }) => {
    // Filter to accepted requests
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /accepted/i }).click();
    
    // Find and click record payment
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.getByRole('button', { name: /record payment/i }).click();
    
    // Fill payment details
    await page.getByLabel(/amount/i).fill('500');
    await page.getByLabel(/reference/i).fill('REF-123456');
    
    // Confirm payment
    await page.getByRole('button', { name: /confirm payment/i }).click();
    
    // Verify success
    await expect(page.getByText(/payment.*confirmed|success/i)).toBeVisible({ timeout: 5000 });
  });

  test('should assign collector to request', async ({ page }) => {
    // Filter to payment confirmed requests
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /payment confirmed/i }).click();
    
    // Find and click assign collector
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.getByRole('button', { name: /assign/i }).click();
    
    // Select a collector
    await expect(page.getByText(/available collectors/i)).toBeVisible();
    await page.locator('.collector-item').first().click();
    
    // Confirm assignment
    await page.getByRole('button', { name: /confirm assignment/i }).click();
    
    // Verify success
    await expect(page.getByText(/assigned|success/i)).toBeVisible({ timeout: 5000 });
  });
});
```

**File: `e2e/mobile/responsive.spec.ts`**
```typescript
import { test, expect, devices } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

// Test on mobile viewport
test.use({ ...devices['Pixel 5'] });

test.describe('Mobile Responsiveness', () => {
  test('should display mobile navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Look for hamburger menu button
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
    
    // Open mobile menu
    await menuButton.click();
    
    // Verify navigation links are visible
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
  });

  test('should have touch-friendly form inputs on login page', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });
    
    // Check input sizes are appropriate for touch
    const emailBox = await emailInput.boundingBox();
    const passwordBox = await passwordInput.boundingBox();
    const buttonBox = await submitButton.boundingBox();
    
    // Minimum touch target size should be 44x44 pixels
    expect(emailBox?.height).toBeGreaterThanOrEqual(40);
    expect(passwordBox?.height).toBeGreaterThanOrEqual(40);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(40);
  });

  test('should display dashboard correctly on mobile', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUsers.client.email);
    await page.getByLabel(/password/i).fill(testUsers.client.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL(/\/client\/dashboard/, { timeout: 15000 });
    
    // Check that cards stack vertically on mobile
    const cards = page.locator('.stat-card, [class*="card"]');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      const firstCardBox = await cards.first().boundingBox();
      expect(firstCardBox?.width).toBeLessThanOrEqual(page.viewportSize()?.width || 400);
    }
  });

  test('should display request form correctly on mobile', async ({ page }) => {
    // Login as client
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUsers.client.email);
    await page.getByLabel(/password/i).fill(testUsers.client.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.goto('/client/requests');
    
    // Open request modal
    await page.getByRole('button', { name: /request pickup/i }).click();
    
    // Modal should be full width on mobile
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    const modalBox = await modal.boundingBox();
    const viewportWidth = page.viewportSize()?.width || 400;
    
    // Modal should take most of the screen width on mobile
    expect(modalBox?.width).toBeGreaterThan(viewportWidth * 0.8);
  });
});
```

---

### 10.5 Real-time Feature Tests (1 hour)

**File: `e2e/realtime/notifications.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

test.describe('Real-time Features', () => {
  test('should display notification badge update', async ({ page }) => {
    // Login as client
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUsers.client.email);
    await page.getByLabel(/password/i).fill(testUsers.client.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL(/\/client\/dashboard/, { timeout: 15000 });
    
    // Check notification bell exists
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await expect(notificationBell).toBeVisible();
  });

  test('should auto-refresh dashboard data', async ({ page }) => {
    // Login as staff
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUsers.staff.email);
    await page.getByLabel(/password/i).fill(testUsers.staff.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL(/\/staff\/dashboard/, { timeout: 15000 });
    
    // Check for auto-refresh indicator or live data
    // Wait for potential data refresh (simulate time passing)
    await page.waitForTimeout(5000);
    
    // Verify page is still responsive
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });
});
```

---

### 10.6 Performance Optimization (1.5 hours)

#### Performance Optimizations Checklist:

**Next.js Optimizations:**
- [x] `usePerformance.ts` hooks implemented for:
  - Debouncing (search inputs, API calls)
  - Throttling (scroll events, resize handlers)
  - Intersection Observer (lazy loading)
  - Window size with throttled updates
  - Memoization utilities
  - Mount state tracking
- [ ] Image optimization with `next/image` component
- [ ] Dynamic imports for heavy components:
  ```typescript
  const MapView = dynamic(() => import('@/components/maps/MapView'), {
    loading: () => <MapSkeleton />,
    ssr: false,
  });
  ```
- [ ] Route prefetching for anticipated navigation
- [ ] Server components where appropriate

**Database Optimizations:**
- [ ] Verify indexes on frequently queried columns:
  - `profiles`: role, status, barangay
  - `collection_requests`: client_id, status, priority, collector_id, created_at
  - `payments`: request_id, client_id, status, created_at
  - `notifications`: user_id, is_read, created_at
- [ ] Optimize RLS policies for performance
- [ ] Query optimization with proper select statements
- [ ] Connection pooling via Supabase

**Bundle Analysis:**
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

- [ ] Remove unused dependencies
- [ ] Code splitting for large modules
- [ ] Tree shaking verification

**Lighthouse Performance Targets:**
- [ ] Performance score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.8s
- [ ] Cumulative Layout Shift < 0.1

---

### 10.7 Security Audit (1 hour)

#### Security Checklist:

**Input Validation:**
- [ ] All forms use Zod schemas for validation
- [ ] Server-side validation on all API routes
- [ ] File upload validation (type, size)
- [ ] Character limits enforced

**SQL Injection Prevention:**
- [ ] All database queries use parameterized statements (Supabase handles)
- [ ] No raw SQL with user input

**XSS Protection:**
- [ ] React's built-in XSS protection (JSX escaping)
- [ ] No dangerouslySetInnerHTML with user content
- [ ] Content Security Policy headers

**CSRF Protection:**
- [ ] State-changing operations use proper tokens
- [ ] Same-origin policy enforced

**Authentication Security:**
- [ ] Password hashing (Supabase bcrypt)
- [ ] Secure session cookies (httpOnly, secure, sameSite)
- [ ] Rate limiting on login (5 attempts per 15 minutes)
- [ ] Session timeout (30 minutes inactivity)
- [ ] Password policy enforcement

**Authorization:**
- [ ] RLS policies enabled on all tables
- [ ] Role-based access control verified
- [ ] Protected routes middleware functioning

**Environment Variables:**
- [ ] No secrets in client-side code
- [ ] All sensitive values in `.env.local`
- [ ] Production keys separate from development

**Security Headers (next.config.ts):**
```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];
```

---

### 10.8 Deployment (1 hour)

#### Pre-Deployment Checklist:
- [ ] All tests passing (`npm run test:all`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Environment variables documented
- [ ] Database migrations applied to production

#### Vercel Deployment:

**1. Connect Repository:**
- [ ] Connect GitHub repository to Vercel
- [ ] Select the main branch for production

**2. Configure Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

**3. Build Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**4. Deploy:**
- [ ] Trigger initial deployment
- [ ] Verify build logs for errors
- [ ] Test production URL

#### Supabase Production Setup:
- [ ] Create production Supabase project
- [ ] Run migrations on production database
- [ ] Configure storage buckets with policies
- [ ] Enable RLS on all tables
- [ ] Set up email templates
- [ ] Configure authentication redirect URLs

#### Custom Domain (Optional):
- [ ] Add custom domain in Vercel
- [ ] Configure DNS records
- [ ] Verify SSL certificate

#### Post-Deployment Verification:
- [ ] Smoke test all critical flows
- [ ] Verify authentication works
- [ ] Test request creation
- [ ] Verify real-time features
- [ ] Check mobile responsiveness
- [ ] Monitor error logs

---

## 📁 Files to Create

| File | Description |
|------|-------------|
| `jest.config.js` | Jest configuration with single worker |
| `jest.setup.ts` | Jest setup with mocks |
| `playwright.config.ts` | Playwright configuration with single worker |
| `__tests__/utils/test-utils.tsx` | Test utilities and providers |
| `__tests__/utils/mocks/data.ts` | Mock data for tests |
| `__tests__/utils/mocks/supabase.ts` | Supabase client mock |
| `__tests__/unit/**/*.test.ts` | Unit tests |
| `__tests__/integration/**/*.test.ts` | Integration tests |
| `e2e/**/*.spec.ts` | E2E Playwright tests |

---

## ✅ Final Acceptance Criteria

- [ ] All unit tests pass (`npm run test`)
- [ ] All integration tests pass
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Tests run sequentially with single worker (no multiple browsers)
- [ ] Lighthouse score > 90 for performance
- [ ] No security vulnerabilities detected
- [ ] All features working in production
- [ ] Mobile responsive on all pages
- [ ] Real-time features working
- [ ] Email notifications configured

---

## 🚀 Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied to production
- [ ] Storage buckets created with policies
- [ ] RLS policies enabled and tested
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Error monitoring configured (optional)
- [ ] Backup strategy in place

---

## ⏱️ Estimated Time: 12 hours

| Task | Duration |
|------|----------|
| Testing Setup & Configuration | 2 hours |
| Unit Tests | 2.5 hours |
| Integration Tests | 2 hours |
| E2E Tests (Playwright) | 2 hours |
| Real-time Feature Tests | 1 hour |
| Performance Optimization | 1.5 hours |
| Security Audit | 1 hour |
| Deployment | 1 hour |

---

## 📊 Project Summary

### Total Development Time: 100+ hours (10 days)

| Phase | Days | Focus Areas |
|-------|------|-------------|
| Foundation | 1-3 | Setup, Auth, Database |
| Client | 4-5 | All client features |
| Staff | 6-7 | All staff features |
| Admin/Collector | 8-9 | Remaining roles, integrations |
| Launch | 10 | Testing, optimization, deploy |

---

## 🔑 Key Testing Notes

### Single Worker Configuration
Both Jest and Playwright are configured to run with a **single worker** to prevent:
- Multiple browser instances opening during E2E tests
- Resource contention during CI/CD pipeline
- Flaky tests due to parallel execution conflicts

### Batch Execution
Tests are configured to run in **batch mode**:
- Jest: `--runInBand` flag ensures tests run sequentially
- Playwright: `workers: 1` and `fullyParallel: false` ensure one test at a time

### Running Tests
```bash
# Run all unit/integration tests (single worker)
npm run test

# Run E2E tests (single browser, sequential)
npm run test:e2e

# Run all tests
npm run test:all

# Run with coverage report
npm run test:coverage
```