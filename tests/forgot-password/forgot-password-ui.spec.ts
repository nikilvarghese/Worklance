import { test, expect } from '@playwright/test';

test.describe('Forgot Password UI', () => {

    test('TC_FP_001 - Forgot Password page navigation', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/forgot password/i).click();

        await expect(page).toHaveURL(/forgot-password/);

    });

    test('TC_FP_002 - Account not found message', async ({ page }) => {

        await page.goto('http://localhost:3000/forgot-password');

        await page.getByPlaceholder(/email/i)
            .fill('dtgjg@rfsd.bom');

        await page.getByRole('button', {
            name: 'Send OTP'
        }).click();

        await expect(
            page.getByText('Account not found')
        ).toBeVisible();

    });

    test('TC_FP_015 - Sign In link functionality', async ({ page }) => {

        await page.goto('http://localhost:3000/forgot-password');

        await page.getByText(/sign in/i).click();

        await expect(page).toHaveURL(/login/);

    });

});