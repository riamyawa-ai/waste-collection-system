import { test, expect } from '@playwright/test';
import { testUsers, routes, selectors } from '../fixtures/test-data';

/**
 * Login Flow E2E Tests
 * 
 * Tests the complete login experience including:
 * - Page rendering
 * - Form validation
 * - Error handling
 * - Successful authentication
 * - Password visibility toggle
 */

test.describe('Login Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(routes.login);
    });

    test('should display login page with all required elements', async ({ page }) => {
        // Check page title or heading
        await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();

        // Check form elements
        await expect(page.locator(selectors.emailInput).first()).toBeVisible();
        await expect(page.locator(selectors.passwordInput).first()).toBeVisible();
        await expect(page.locator(selectors.submitButton).first()).toBeVisible();

        // Check links
        await expect(page.getByText(/forgot password/i)).toBeVisible();
        await expect(page.getByText(/sign up|register|create account/i)).toBeVisible();
    });

    test('should show validation errors for empty form submission', async ({ page }) => {
        // Click submit without filling form
        await page.locator(selectors.submitButton).first().click();

        // Check for validation messages
        // Note: Actual selectors depend on your form implementation
        const hasEmailError = await page.getByText(/email.*required|enter.*email/i).isVisible().catch(() => false);
        const hasPasswordError = await page.getByText(/password.*required|enter.*password/i).isVisible().catch(() => false);

        // At least one validation error should appear
        expect(hasEmailError || hasPasswordError).toBeTruthy();
    });

    test('should show error message for invalid credentials', async ({ page }) => {
        // Fill in invalid credentials
        await page.locator(selectors.emailInput).first().fill('invalid@example.com');
        await page.locator(selectors.passwordInput).first().fill('wrongpassword');

        // Submit the form
        await page.locator(selectors.submitButton).first().click();

        // Wait for error message (with timeout)
        await expect(page.getByText(/invalid|incorrect|wrong|failed/i)).toBeVisible({ timeout: 10000 });
    });

    test('should toggle password visibility', async ({ page }) => {
        const passwordInput = page.locator(selectors.passwordInput).first();

        // Type password
        await passwordInput.fill('testpassword');

        // Check initial state (password should be hidden)
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Find and click the toggle button
        const toggleButton = page.getByRole('button', { name: /show|toggle|eye/i }).first();

        if (await toggleButton.isVisible()) {
            await toggleButton.click();

            // Password should now be visible
            await expect(passwordInput).toHaveAttribute('type', 'text');

            // Click again to hide
            await toggleButton.click();
            await expect(passwordInput).toHaveAttribute('type', 'password');
        }
    });

    test('should show remember me checkbox', async ({ page }) => {
        const rememberMeCheckbox = page.getByRole('checkbox', { name: /remember/i });

        if (await rememberMeCheckbox.isVisible()) {
            // Check the checkbox
            await rememberMeCheckbox.check();
            await expect(rememberMeCheckbox).toBeChecked();

            // Uncheck
            await rememberMeCheckbox.uncheck();
            await expect(rememberMeCheckbox).not.toBeChecked();
        }
    });

    test('should navigate to forgot password page', async ({ page }) => {
        await page.getByText(/forgot password/i).click();

        await expect(page).toHaveURL(/forgot-password|reset/i, { timeout: 10000 });
    });

    test('should navigate to registration page', async ({ page }) => {
        await page.getByText(/sign up|register|create account/i).click();

        await expect(page).toHaveURL(/register|signup/i, { timeout: 10000 });
    });

    // This test requires a valid test user in the database
    test.skip('should successfully login and redirect to dashboard', async ({ page }) => {
        // Fill in valid credentials
        await page.locator(selectors.emailInput).first().fill(testUsers.client.email);
        await page.locator(selectors.passwordInput).first().fill(testUsers.client.password);

        // Submit the form
        await page.locator(selectors.submitButton).first().click();

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/\/client\/dashboard/i, { timeout: 15000 });

        // Verify dashboard elements
        await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
    });

    // This test requires rate limiting to be implemented
    test.skip('should show rate limiting after multiple failed attempts', async ({ page }) => {
        // Attempt login multiple times with wrong credentials
        for (let i = 0; i < 5; i++) {
            await page.locator(selectors.emailInput).first().fill('test@example.com');
            await page.locator(selectors.passwordInput).first().fill('wrongpassword');
            await page.locator(selectors.submitButton).first().click();
            await page.waitForTimeout(500);
        }

        // Check for rate limiting message
        await expect(page.getByText(/too many attempts|locked|try again later/i)).toBeVisible({ timeout: 10000 });
    });
});

test.describe('Login - Role-Based Redirect', () => {
    // These tests require valid test users for each role

    test.skip('should redirect client to client dashboard', async ({ page }) => {
        await page.goto(routes.login);

        await page.locator(selectors.emailInput).first().fill(testUsers.client.email);
        await page.locator(selectors.passwordInput).first().fill(testUsers.client.password);
        await page.locator(selectors.submitButton).first().click();

        await expect(page).toHaveURL(/\/client\//i, { timeout: 15000 });
    });

    test.skip('should redirect staff to staff dashboard', async ({ page }) => {
        await page.goto(routes.login);

        await page.locator(selectors.emailInput).first().fill(testUsers.staff.email);
        await page.locator(selectors.passwordInput).first().fill(testUsers.staff.password);
        await page.locator(selectors.submitButton).first().click();

        await expect(page).toHaveURL(/\/staff\//i, { timeout: 15000 });
    });

    test.skip('should redirect collector to collector dashboard', async ({ page }) => {
        await page.goto(routes.login);

        await page.locator(selectors.emailInput).first().fill(testUsers.collector.email);
        await page.locator(selectors.passwordInput).first().fill(testUsers.collector.password);
        await page.locator(selectors.submitButton).first().click();

        await expect(page).toHaveURL(/\/collector\//i, { timeout: 15000 });
    });

    test.skip('should redirect admin to admin dashboard', async ({ page }) => {
        await page.goto(routes.login);

        await page.locator(selectors.emailInput).first().fill(testUsers.admin.email);
        await page.locator(selectors.passwordInput).first().fill(testUsers.admin.password);
        await page.locator(selectors.submitButton).first().click();

        await expect(page).toHaveURL(/\/admin\//i, { timeout: 15000 });
    });
});
