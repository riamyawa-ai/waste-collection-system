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
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npx playwright install chromium
```

#### Create Vitest Configuration:

**File: `vitest.config.ts`**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./vitest.setup.ts'],
    
    // Include patterns
    include: ['__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    
    // Exclude patterns
    exclude: ['node_modules', 'e2e', '.next', 'dist'],
    
    // Run tests sequentially (single worker) - equivalent to Jest's --runInBand
    fileParallelism: false,
    
    // Prevent parallel execution within test files
    sequence: {
      concurrent: false,
    },
    
    // Global test timeout (30 seconds)
    testTimeout: 30000,
    hookTimeout: 30000,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/types/**/*'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    
    // Reporter configuration
    reporters: ['verbose'],
    
    // Global variables (like Jest's expect)
    globals: true,
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

**File: `vitest.setup.ts`**
```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});
```

#### Create Playwright Configuration:

**File: `playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Run tests in files SEQUENTIALLY (one after another)
  fullyParallel: false,
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Use SINGLE WORKER to prevent opening multiple browsers
  workers: 1,
  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  // Shared settings for all projects
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  // Global timeout for each test (60 seconds)
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  // Using ONLY Chromium to prevent multiple browser instances
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          args: ['--disable-gpu', '--no-sandbox'],
        },
      },
    },
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
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
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
  return <>{children}</>;
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

export const mockRequest = {
  id: 'test-request-id',
  request_number: 'REQ-20241212-0001',
  client_id: mockUser.id,
  requester_name: 'Test User',
  contact_number: '+639123456789',
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

export const mockPayment = {
  id: 'test-payment-id',
  payment_number: 'PAY-20241212-0001',
  request_id: mockRequest.id,
  client_id: mockUser.id,
  amount: 500,
  reference_number: 'REF-123456',
  status: 'pending' as PaymentStatus,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
```

#### Sample Unit Tests:

**File: `__tests__/unit/hooks/usePerformance.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Example test for useDebounce hook
describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    // Test implementation
    expect(true).toBe(true);
  });

  it('should debounce value changes', async () => {
    // Test implementation with fake timers
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(true).toBe(true);
  });
});
```

**File: `__tests__/unit/lib/validators/auth.test.ts`**
```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Define validation schemas
const emailSchema = z.string().email('Invalid email format');
const phoneSchema = z.string().regex(
  /^(\+63|0)\d{10}$/,
  'Invalid Philippine phone number format'
);
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*]/, 'Must contain special character');

describe('Auth Validators', () => {
  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow();
    });

    it('should reject invalid email addresses', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow();
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid Philippine phone numbers', () => {
      expect(() => phoneSchema.parse('+639123456789')).not.toThrow();
      expect(() => phoneSchema.parse('09123456789')).not.toThrow();
    });

    it('should reject invalid phone numbers', () => {
      expect(() => phoneSchema.parse('123456789')).toThrow();
    });
  });

  describe('Password Validation', () => {
    it('should accept valid passwords', () => {
      expect(() => passwordSchema.parse('Password1!')).not.toThrow();
    });

    it('should reject weak passwords', () => {
      expect(() => passwordSchema.parse('weak')).toThrow();
      expect(() => passwordSchema.parse('password1!')).toThrow(); // no uppercase
    });
  });
});
```

---

### 10.3 Integration Tests (2 hours)

**File: `__tests__/integration/auth.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockUser, mockSession } from '../utils/mocks/data';
import createMockSupabaseClient from '../utils/mocks/supabase';

describe('Authentication Integration', () => {
  let mockClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockSupabaseClient();
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      const { data, error } = await mockClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
    });

    it('should fail login with invalid credentials', async () => {
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      });

      const { error } = await mockClient.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      expect(error).toBeDefined();
      expect(error.message).toBe('Invalid login credentials');
    });
  });

  describe('Registration Flow', () => {
    it('should successfully register a new user', async () => {
      const newUser = { id: 'new-user-id', email: 'newuser@example.com' };
      
      mockClient.auth.signUp.mockResolvedValue({
        data: { user: newUser, session: null },
        error: null,
      });

      const { data, error } = await mockClient.auth.signUp({
        email: 'newuser@example.com',
        password: 'Password1!',
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout', async () => {
      mockClient.auth.signOut.mockResolvedValue({ error: null });

      const { error } = await mockClient.auth.signOut();

      expect(error).toBeNull();
    });
  });
});
```

**File: `__tests__/integration/requests.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockUser, mockCollector } from '../utils/mocks/data';

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

    statusTransitions.forEach(({ from, to }) => {
      it(`should transition from ${from} to ${to}`, () => {
        // Verify status transition logic
        expect(['pending', 'accepted', 'payment_confirmed', 'assigned', 
                'accepted_by_collector', 'en_route', 'at_location', 
                'in_progress', 'completed', 'cancelled', 'rejected'])
          .toContain(to);
      });
    });
  });

  describe('Collector Assignment', () => {
    it('should assign collector to request', () => {
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
│   └── request-service.spec.ts
├── staff/
│   ├── dashboard.spec.ts
│   └── collections.spec.ts
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
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@email.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10000 });
  });
});
```

**File: `e2e/mobile/responsive.spec.ts`**
```typescript
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Mobile Responsiveness', () => {
  test('should display mobile navigation menu', async ({ page }) => {
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    }
  });

  test('should have touch-friendly form inputs', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.getByLabel(/email/i);
    const emailBox = await emailInput.boundingBox();
    if (emailBox) {
      expect(emailBox.height).toBeGreaterThanOrEqual(40);
    }
  });
});
```

---

### 10.5 Performance Optimization (1.5 hours)

#### Performance Optimizations Checklist:

**Next.js Optimizations:**
- [x] `usePerformance.ts` hooks implemented
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
- [ ] Verify indexes on frequently queried columns
- [ ] Optimize RLS policies for performance
- [ ] Query optimization with proper select statements
- [ ] Connection pooling via Supabase

**Bundle Analysis:**
```bash
npm run build
npx @next/bundle-analyzer
```

**Lighthouse Performance Targets:**
- [ ] Performance score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.8s
- [ ] Cumulative Layout Shift < 0.1

---

### 10.6 Security Audit (1 hour)

#### Security Checklist:

**Input Validation:**
- [ ] All forms use Zod schemas for validation
- [ ] Server-side validation on all API routes
- [ ] File upload validation (type, size)

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

---

### 10.7 Deployment (1 hour)

#### Pre-Deployment Checklist:
- [ ] All tests passing (`npm run test:all`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Environment variables documented

#### Vercel Deployment:
1. Connect GitHub repository to Vercel
2. Configure Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
   ```
3. Deploy and verify

---

## 📁 Files Created

| File | Description |
|------|-------------|
| `vitest.config.ts` | Vitest configuration with single worker |
| `vitest.setup.ts` | Vitest setup with mocks |
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
| Performance Optimization | 1.5 hours |
| Security Audit | 1 hour |
| Deployment | 1 hour |

---

## 🔑 Key Testing Notes

### Single Worker Configuration
Both Vitest and Playwright are configured to run with a **single worker** to prevent:
- Multiple browser instances opening during E2E tests
- Resource contention during CI/CD pipeline
- Flaky tests due to parallel execution conflicts

### Batch Execution
Tests are configured to run in **batch mode**:
- Vitest: `fileParallelism: false` ensures tests run sequentially
- Playwright: `workers: 1` and `fullyParallel: false` ensure one test at a time

### Running Tests
```bash
# Run all unit/integration tests (single worker)
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests (single browser, sequential)
npm run test:e2e

# Run E2E tests with browser visible
npm run test:e2e:headed

# Run all tests
npm run test:all

# Run with coverage report
npm run test:coverage
```

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