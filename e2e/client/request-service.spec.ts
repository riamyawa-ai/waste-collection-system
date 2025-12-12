
import { test, expect } from '@playwright/test';
import { testUsers, testRequest } from '../fixtures/test-data';

test.describe('Client Request Service Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock login state or actual login
        await page.goto('/login');
        await page.getByLabel(/email/i).fill(testUsers.client.email);
        await page.getByLabel(/password/i).fill(testUsers.client.password);
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('/dashboard');
    });

    test('should navigate to request page', async ({ page }) => {
        await page.getByRole('link', { name: /request pickup/i }).click();
        await expect(page).toHaveURL(/.*request/);
        await expect(page.getByRole('heading', { name: /request waste collection/i })).toBeVisible();
    });

    test('should submit a request successfully', async ({ page }) => {
        await page.goto('/request');

        await page.getByLabel(/barangay/i).click();
        // Assuming select/dropdown behavior match shadoncn/radix
        await page.getByRole('option', { name: testRequest.barangay }).click();

        await page.getByLabel(/address/i).fill(testRequest.address);

        // Handling radio group for priority
        await page.getByLabel(testRequest.priority, { exact: false }).check();

        // Time slot
        await page.getByLabel(/time slot/i).click();
        await page.getByRole('option', { name: 'Morning' }).click(); // Adjust based on exact text

        await page.getByLabel(/instructions/i).fill(testRequest.instructions);

        await page.getByRole('button', { name: /submit request/i }).click();

        // Confirmation modal
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: /confirm/i }).click();

        // Success message or redirect
        await expect(page.getByText(/request submitted successfully/i)).toBeVisible();
        await expect(page).toHaveURL('/dashboard');
    });
});
