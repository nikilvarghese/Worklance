import { test, expect } from '@playwright/test';

test.describe.skip('Employer OTP Flow', () => {

    test('TC_EMP_REG_019 - Send OTP with valid details', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await page.getByPlaceholder('First name')
            .fill('Nikil');

        await page.getByPlaceholder('Last name')
            .fill('Edwin');

        await page.getByPlaceholder('e.g. Acme Corp')
            .fill('Worklance');

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

    test('TC_EMP_REG_024 - Incorrect OTP', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await page.getByPlaceholder('First name')
            .fill('Nikil');

        await page.getByPlaceholder('Last name')
            .fill('Edwin');

        await page.getByPlaceholder('e.g. Acme Corp')
            .fill('Worklance');

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

    test.skip('TC_EMP_REG_025 - Correct OTP', async () => {
        // Requires dynamic OTP retrieval
    });

});