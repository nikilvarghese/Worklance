import { test, expect } from '@playwright/test';

test.describe('Account Creation', () => {

    test('TC_JS_REG_024 - Create Account disabled when fields are empty', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        const createAccountButton =
            page.getByRole('button', { name: 'Create account' });

        await expect(createAccountButton).toBeDisabled();

    });

    test.skip('TC_JS_REG_025 - Create Account enabled when fields are filled', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('name@example.com')
            .fill('test@gmail.com');

        await page.locator('input[type="password"]')
            .fill('Password1');

        const createAccountButton =
            page.getByRole('button', { name: 'Create account' });

        await expect(createAccountButton).toBeEnabled();

    });

    test.skip('TC_JS_REG_026 - Successful registration', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        
        // Use a unique email to avoid collision on repeated local runs
        const email = `newuser_${Date.now()}@gmail.com`;
        await page.getByPlaceholder('name@example.com')
            .fill(email);

        await page.locator('input[type="password"]')
            .fill('Password1');

        await page.getByRole('button', {
            name: 'Create account'
        }).click();

        await expect(page).toHaveURL(/dashboard|home|profile/);

    });

    test('TC_JS_REG_028 - Duplicate email registration', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('name@example.com')
            .fill('nikiledwin6@gmail.com');

        await page.locator('input[type="password"]')
            .fill('Password1');

        await page.getByRole('button', {
            name: 'Send OTP'
        }).click();

        await expect(
            page.getByText('Already registered, please login')
        ).toBeVisible();

    });

});