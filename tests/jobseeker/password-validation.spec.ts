import { test, expect } from '@playwright/test';

test.describe('Password Validation', () => {

    test('TC_JS_REG_012 - Password less than 8 characters', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        const passwordInput = page.locator('input[type="password"]');

        await passwordInput.fill('Pass1');

        await expect(
            page.getByText('Min 8 characters')
        ).not.toHaveClass(/text-emerald-700/);

    });

    test('TC_JS_REG_016 - Valid password format', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        const passwordInput = page.locator('input[type="password"]');

        await passwordInput.fill('Password1');

        await expect(
            page.getByText('Min 8 characters')
        ).toHaveClass(/text-emerald-700/);

        await expect(
            page.getByText('One uppercase letter')
        ).toHaveClass(/text-emerald-700/);

        await expect(
            page.getByText('One lowercase letter')
        ).toHaveClass(/text-emerald-700/);

        await expect(
            page.getByText('One number')
        ).toHaveClass(/text-emerald-700/);

    });

});