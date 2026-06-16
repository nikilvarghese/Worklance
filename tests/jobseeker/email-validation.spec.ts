import { test, expect } from '@playwright/test';

test.describe('Email Validation', () => {

    test('TC_JS_REG_009 - Invalid email', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('name@example.com').fill('abc');

        await page.locator('input[type="password"]').fill('Password1');

        await page.getByRole('button', { name: 'Send OTP' }).click();

        await expect(
            page.getByText('Enter a valid Email address.')
        ).toBeVisible();

    });

    test('TC_JS_REG_011 - Valid email accepted', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('name@example.com').fill('test@gmail.com');

        await page.locator('input[type="password"]').fill('Password1');

        await page.getByRole('button', { name: 'Send OTP' }).click();

        await expect(
            page.getByText('OTP sent to email')
        ).not.toBeVisible();

    });

});