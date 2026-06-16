import 'dotenv/config';
import { test, expect, Page } from '@playwright/test';

let page: Page;

test.describe.configure({
    mode: 'serial'
});

test.describe('Forgot Password Flow', () => {

    test.beforeAll(async ({ browser }) => {

        page = await browser.newPage();

        await page.goto('http://localhost:3000/forgot-password');

        await page.getByPlaceholder(/email/i)
            .fill(process.env.TESTUSER1_EMAIL!);

        await page.getByRole('button', {
            name: /send otp/i
        }).click();

        await expect(
            page.getByPlaceholder(/otp/i)
        ).toBeVisible();

    });

    test.afterAll(async () => {

        await page.close();

    });

    test('TC_FP_003 - OTP sent for registered email', async () => {

        await expect(
            page.getByPlaceholder(/otp/i)
        ).toBeVisible();

        await expect(
            page.getByPlaceholder(/new password/i)
        ).toBeVisible();

    });

    test.skip('TC_FP_004 - OTP field accepts 6 digits', async () => {

        await page.getByPlaceholder(/otp|verification/i)
            .fill('123456');

        await expect(
            page.getByPlaceholder(/otp|verification/i)
        ).toHaveValue('123456');

    });

    test('TC_FP_005 - OTP field rejects less than 6 digits', async () => {

        await page.getByPlaceholder(/otp|verification/i)
            .fill('12345');

        await page.getByPlaceholder(/new password/i)
            .fill('Testuser1');

        await expect(
            page.getByRole('button', {
                name: /reset password/i
            })
        ).toBeDisabled();

    });

    test('TC_FP_006 - OTP field rejects more than 6 digits', async () => {

        const otpInput =
            page.getByPlaceholder(/otp|verification/i);

        await otpInput.fill('123456789');

        await expect(otpInput)
            .toHaveValue('123456');

    });

    test('TC_FP_007 - Invalid OTP', async () => {

        await page.getByPlaceholder(/otp|verification/i)
            .fill('111111');

        await page.getByPlaceholder(/new password/i)
            .fill('Testuser1');

        await page.getByRole('button', {
            name: /reset password/i
        }).click();

        await expect(
            page.getByText(/invalid otp|incorrect otp/i)
        ).toBeVisible();

    });

    test('TC_FP_008 - Password less than 8 characters', async () => {

        const passwordInput =
            page.getByPlaceholder(/new password/i);

        await passwordInput.clear();
        await passwordInput.fill('Pass1');

        await expect(
            page.getByText('Min 8 characters')
        ).not.toHaveClass(/text-emerald-700/);

    });

    test('TC_FP_009 - Password without uppercase letter', async () => {

        const passwordInput =
            page.getByPlaceholder(/new password/i);

        await passwordInput.clear();
        await passwordInput.fill('password1');

        await expect(
            page.getByText('One uppercase letter')
        ).not.toHaveClass(/text-emerald-700/);

    });

    test('TC_FP_010 - Password without lowercase letter', async () => {

        const passwordInput =
            page.getByPlaceholder(/new password/i);

        await passwordInput.clear();
        await passwordInput.fill('PASSWORD1');

        await expect(
            page.getByText('One lowercase letter')
        ).not.toHaveClass(/text-emerald-700/);

    });

    test('TC_FP_011 - Password without number', async () => {

        const passwordInput =
            page.getByPlaceholder(/new password/i);

        await passwordInput.clear();
        await passwordInput.fill('Password');

        await expect(
            page.getByText('One number')
        ).not.toHaveClass(/text-emerald-700/);

    });

    test('TC_FP_012 - Valid password format', async () => {

        const passwordInput =
            page.getByPlaceholder(/new password/i);

        await passwordInput.clear();
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

    test('TC_FP_013 - Password visibility toggle', async () => {

        const passwordInput =
            page.getByPlaceholder(/password/i);

        await passwordInput.fill('Password123');

        await page
            .locator('input[type="password"] + button')
            .click();

        await expect(
            page.locator('input[type="text"]')
        ).toHaveValue('Password123');

    });

    test.skip('TC_FP_014 - Successful password reset', async () => {

        // Requires real OTP retrieval

    });

    test('TC_FP_016 - Verify Resend OTP functionality', async () => {

        await expect(
            page.getByText(/resend in/i)
        ).toBeVisible();

        await expect(
            page.getByRole('button')
                .filter({ hasText: /resend in/i })
        ).toBeDisabled();

    });

});