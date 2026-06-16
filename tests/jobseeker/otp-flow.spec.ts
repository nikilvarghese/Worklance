import { test, expect } from '@playwright/test';

test.describe.skip('OTP Flow', () => {

    test('TC_JS_REG_017 - Send OTP', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('name@example.com')
            .fill('test@gmail.com');

        await page.locator('input[type="password"]')
            .fill('Password1');

        await page.getByRole('button', {
            name: 'Send OTP'
        }).click();

        await expect(
            page.getByText('OTP sent to email')
        ).toBeVisible();

    });

    test('TC_JS_REG_022 - Incorrect OTP', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('name@example.com')
            .fill('test@gmail.com');

        await page.locator('input[type="password"]')
            .fill('Password1');

        await page.getByRole('button', {
            name: 'Send OTP'
        }).click();

        await page.getByPlaceholder('Enter 6-digit OTP')
            .fill('123456');

        await page.getByRole('button', {
            name: 'Verify OTP'
        }).click();

        await expect(
            page.getByText('Invalid OTP')
        ).toBeVisible();

    });

    test.skip('TC_JS_REG_023 - Correct OTP', async () => {
        // Requires dynamic OTP retrieval from email/database
    });

});