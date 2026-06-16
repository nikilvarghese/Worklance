import { test, expect } from '@playwright/test';

test.describe('Employer Email Validation', () => {

    test('TC_EMP_REG_011 - Invalid email format', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', { name: 'Employer' }).click();

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('e.g. Acme Corp').fill('Worklance');

        await page.locator('input[type="password"]')
            .fill('Nikiledwin1');

        await page.getByPlaceholder('name@example.com')
            .fill('abc');

        await page.getByRole('button', {
            name: /send otp/i
        }).click();

        await expect(
            page.getByText('Enter a valid Email address.')
        ).toBeVisible();

    });

    test('TC_EMP_REG_012 - Email without @ symbol', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', { name: 'Employer' }).click();

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('e.g. Acme Corp').fill('Worklance');

        await page.locator('input[type="password"]')
            .fill('Nikiledwin1');

        await page.getByPlaceholder('name@example.com')
            .fill('testgmail.com');

        await page.getByRole('button', {
            name: /send otp/i
        }).click();

        await expect(
            page.getByText('Enter a valid Email address.')
        ).toBeVisible();

    });

    test('TC_EMP_REG_013 - Valid email format accepted', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', { name: 'Employer' }).click();

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('e.g. Acme Corp').fill('Worklance');

        await page.locator('input[type="password"]')
            .fill('Nikiledwin1');

        // Use a unique email every run
        const email = `playwright${Date.now()}@gmail.com`;

        await page.getByPlaceholder('name@example.com')
            .fill(email);

        await page.getByRole('button', {
            name: /Send OTP/i
        }).click();

       await expect(
            page.getByText('OTP sent to email')
        ).toBeVisible();

    });

});