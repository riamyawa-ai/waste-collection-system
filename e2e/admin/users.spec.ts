
import { test, expect } from '@playwright/test';
import { testUsers, routes } from '../fixtures/test-data';

test.describe('Admin User Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(routes.login);
        await page.getByLabel(/email/i).fill(testUsers.admin.email);
        await page.getByLabel(/password/i).fill(testUsers.admin.password);
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL(routes.adminDashboard); // Assumes redirect to admin dash
        await page.goto('/admin/users'); // Go to users page specifically
    });

    test('should display users table', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('should filter users', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.fill('client');
        await page.waitForTimeout(500);
        // Verify table rows match or empty state if no result
        const rows = page.locator('tbody tr');
        await expect(rows.first()).toBeVisible();
    });

    test('should open add user modal', async ({ page }) => {
        await page.getByRole('button', { name: /add user/i }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByLabel(/first name/i)).toBeVisible();
        await expect(page.getByRole('combobox', { name: /role/i })).toBeVisible();
    });
});
