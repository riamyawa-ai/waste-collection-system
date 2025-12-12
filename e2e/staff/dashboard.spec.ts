
import { test, expect } from '@playwright/test';
import { testUsers, routes } from '../fixtures/test-data';

test.describe('Staff Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(routes.login);
        await page.getByLabel(/email/i).fill(testUsers.staff.email);
        await page.getByLabel(/password/i).fill(testUsers.staff.password);
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL(routes.staffDashboard);
    });

    test('should display overview statistics', async ({ page }) => {
        await expect(page.getByText(/total collections/i)).toBeVisible();
        await expect(page.getByText(/pending requests/i)).toBeVisible();
        await expect(page.getByText(/active collectors/i)).toBeVisible();
    });

    test('should have quick action buttons', async ({ page }) => {
        await expect(page.getByRole('button', { name: /create schedule/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /process requests/i })).toBeVisible();
    });

    test('should show recent activity', async ({ page }) => {
        await expect(page.getByText(/recent activity/i)).toBeVisible();
        // Check if list has items
        const listItems = page.locator('[class*="activity-item"]');
        if (await listItems.count() > 0) {
            await expect(listItems.first()).toBeVisible();
        }
    });
});
