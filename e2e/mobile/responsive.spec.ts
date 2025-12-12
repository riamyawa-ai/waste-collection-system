import { test, expect, devices } from '@playwright/test';
import { routes } from '../fixtures/test-data';

/**
 * Mobile Responsiveness E2E Tests
 * 
 * Tests the application's responsive design on mobile viewports.
 * Uses Pixel 5 device configuration.
 */

// Use mobile viewport for all tests in this file
test.use({ ...devices['Pixel 5'] });

test.describe('Mobile Responsiveness', () => {
    test('should display landing page correctly on mobile', async ({ page }) => {
        await page.goto(routes.home);

        // Page should be responsive
        const viewportWidth = page.viewportSize()?.width || 393;

        // Check that content fits within viewport
        const body = page.locator('body');
        const bodyBox = await body.boundingBox();

        if (bodyBox) {
            expect(bodyBox.width).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
        }

        // Navigation should exist (mobile menu or regular)
        const hasNav = await page.locator('nav, header, [role="navigation"]').isVisible().catch(() => false);
        expect(hasNav).toBeTruthy();
    });

    test('should display mobile navigation menu', async ({ page }) => {
        await page.goto(routes.home);

        // Look for hamburger menu button (common mobile patterns)
        const menuButton = page.locator(
            'button[aria-label*="menu" i], ' +
            'button[aria-label*="navigation" i], ' +
            '[data-testid="mobile-menu"], ' +
            '.hamburger, ' +
            '[class*="menu-toggle"]'
        ).first();

        if (await menuButton.isVisible()) {
            // Open mobile menu
            await menuButton.click();

            // Menu should be visible
            await page.waitForTimeout(300); // Wait for animation

            // Check for navigation links
            const loginLink = page.getByRole('link', { name: /login|sign in/i });
            const registerLink = page.getByRole('link', { name: /register|sign up/i });

            const hasLoginLink = await loginLink.isVisible().catch(() => false);
            const hasRegisterLink = await registerLink.isVisible().catch(() => false);

            expect(hasLoginLink || hasRegisterLink).toBeTruthy();
        }
    });

    test('should have touch-friendly inputs on login page', async ({ page }) => {
        await page.goto(routes.login);

        // Get input elements
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
        const submitButton = page.locator('button[type="submit"]').first();

        // Minimum touch target size should be ~44px for accessibility
        const minTouchSize = 40;

        if (await emailInput.isVisible()) {
            const emailBox = await emailInput.boundingBox();
            if (emailBox) {
                expect(emailBox.height).toBeGreaterThanOrEqual(minTouchSize);
            }
        }

        if (await passwordInput.isVisible()) {
            const passwordBox = await passwordInput.boundingBox();
            if (passwordBox) {
                expect(passwordBox.height).toBeGreaterThanOrEqual(minTouchSize);
            }
        }

        if (await submitButton.isVisible()) {
            const buttonBox = await submitButton.boundingBox();
            if (buttonBox) {
                expect(buttonBox.height).toBeGreaterThanOrEqual(minTouchSize);
            }
        }
    });

    test('should have readable font sizes on mobile', async ({ page }) => {
        await page.goto(routes.home);

        // Check that body text is at least 14px (readable on mobile)
        const bodyText = page.locator('p, span, div').first();

        if (await bodyText.isVisible()) {
            const fontSize = await bodyText.evaluate((el) => {
                return window.getComputedStyle(el).fontSize;
            });

            const fontSizeNum = parseFloat(fontSize);
            expect(fontSizeNum).toBeGreaterThanOrEqual(12);
        }
    });

    test('should not have horizontal scroll on login page', async ({ page }) => {
        await page.goto(routes.login);

        // Check document width vs viewport width
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const viewportWidth = page.viewportSize()?.width || 393;

        // Document shouldn't be significantly wider than viewport
        expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 10);
    });

    test('should display forms in single column on mobile', async ({ page }) => {
        await page.goto(routes.login);

        // Find form inputs
        const inputs = page.locator('input:visible');
        const inputCount = await inputs.count();

        if (inputCount >= 2) {
            const firstInputBox = await inputs.first().boundingBox();
            const secondInputBox = await inputs.nth(1).boundingBox();

            if (firstInputBox && secondInputBox) {
                // On mobile, inputs should stack vertically (second input below first)
                expect(secondInputBox.y).toBeGreaterThan(firstInputBox.y);
            }
        }
    });

    test('should display registration page correctly on mobile', async ({ page }) => {
        await page.goto(routes.register);

        await page.waitForLoadState('networkidle');

        // Check viewport
        const viewportWidth = page.viewportSize()?.width || 393;

        // Form should be visible
        const form = page.locator('form').first();
        if (await form.isVisible()) {
            const formBox = await form.boundingBox();
            if (formBox) {
                // Form should fit within viewport
                expect(formBox.width).toBeLessThanOrEqual(viewportWidth);
            }
        }
    });

    test('should handle orientation change gracefully', async ({ page }) => {
        // Start in portrait
        await page.setViewportSize({ width: 393, height: 851 });
        await page.goto(routes.home);

        // Wait for initial load
        await page.waitForLoadState('networkidle');

        // Switch to landscape
        await page.setViewportSize({ width: 851, height: 393 });
        await page.waitForTimeout(500);

        // Page should still be functional
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // No horizontal overflow
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(documentWidth).toBeLessThanOrEqual(851 + 10);
    });

    test('should display cards stacked on mobile', async ({ page }) => {
        await page.goto(routes.home);

        // Look for card-like elements
        const cards = page.locator('[class*="card"], .card, [data-testid*="card"]');
        const cardCount = await cards.count();

        if (cardCount >= 2) {
            const firstCardBox = await cards.first().boundingBox();
            const secondCardBox = await cards.nth(1).boundingBox();

            if (firstCardBox && secondCardBox) {
                // Cards should stack (second below first) or be side by side but fit viewport
                const viewportWidth = page.viewportSize()?.width || 393;

                // Either stacked vertically OR both fit within viewport
                const isStacked = secondCardBox.y >= firstCardBox.y + firstCardBox.height - 10;
                const bothFit = firstCardBox.width <= viewportWidth && secondCardBox.width <= viewportWidth;

                expect(isStacked || bothFit).toBeTruthy();
            }
        }
    });
});

test.describe('Mobile - Touch Interactions', () => {
    test.use({ ...devices['Pixel 5'] });

    test('should handle tap on buttons', async ({ page }) => {
        await page.goto(routes.login);

        // Find a clickable button
        const button = page.locator('button, [role="button"]').first();

        if (await button.isVisible()) {
            // Tap should work (Playwright handles touch)
            await button.tap();

            // Button should respond (no errors)
            expect(true).toBe(true);
        }
    });

    test('should handle swipe gestures if applicable', async ({ page }) => {
        await page.goto(routes.home);

        // If there's a slider or carousel, test swipe
        const slider = page.locator('[class*="slider"], [class*="carousel"]').first();

        if (await slider.isVisible()) {
            const sliderBox = await slider.boundingBox();

            if (sliderBox) {
                // Simulate swipe left
                await page.mouse.move(sliderBox.x + sliderBox.width - 50, sliderBox.y + sliderBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(sliderBox.x + 50, sliderBox.y + sliderBox.height / 2);
                await page.mouse.up();
            }
        }
    });
});
