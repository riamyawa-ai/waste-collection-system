
import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
    });

    test('should display registration form', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
        await expect(page.getByLabel(/first name/i)).toBeVisible();
        await expect(page.getByLabel(/last name/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });

    test('should validate mismatching passwords', async ({ page }) => {
        await page.getByLabel(/first name/i).fill('Test');
        await page.getByLabel(/last name/i).fill('User');
        await page.getByLabel(/email/i).fill('test@example.com');
        await page.getByLabel(/^password$/i).fill('Password123!');
        await page.getByLabel(/confirm password/i).fill('DifferentPassword123!');

        await page.getByRole('button', { name: /create account/i }).click();

        await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
        const loginLink = page.getByRole('link', { name: /sign in/i });
        await expect(loginLink).toBeVisible();
        await expect(loginLink).toHaveAttribute('href', '/login');
    });
});
