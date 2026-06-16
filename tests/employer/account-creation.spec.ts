import { test, expect } from '@playwright/test';

test.describe('Employer Account Creation', () => {

    test('TC_EMP_REG_026 - Create Account disabled when fields are empty', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        const createBtn = page.getByRole('button', {
            name: /create account/i
        });

        await expect(createBtn).toBeVisible();
        await expect(createBtn).toBeDisabled();

    });

    test.skip('TC_EMP_REG_027 - Create Account enabled when fields are filled', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('e.g. Acme Corp').fill('Worklance');
        await page.getByPlaceholder('name@example.com').fill('test_emp@gmail.com');
        await page.locator('input[type="password"]').fill('Nikiledwin1');

        const createBtn = page.getByRole('button', {
            name: /create account/i
        });

        await expect(createBtn).toBeEnabled();

    });

    test.skip('TC_EMP_REG_028 - Successful employer registration', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await page.getByPlaceholder('First name').fill('Nikil');
        await page.getByPlaceholder('Last name').fill('Edwin');
        await page.getByPlaceholder('e.g. Acme Corp').fill('Worklance');
        
        // Use a unique email to avoid collision on repeated local runs
        const email = `employer_${Date.now()}@gmail.com`;
        await page.getByPlaceholder('name@example.com').fill(email);
        await page.locator('input[type="password"]').fill('Nikiledwin1');

        await page.getByRole('button', {
            name: /create account/i
        }).click();

        await expect(page).toHaveURL(/dashboard|home|profile|hr-dashboard/);

    });

    test('TC_EMP_REG_030 - Duplicate email registration', async ({ page }) => {

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

        // Use an email that is already registered as an Employer account
        await page.getByPlaceholder('name@example.com')
            .fill('nikiledwin6@gmail.com');

        await page.locator('input[type="password"]')
            .fill('Nikiledwin1');

        await page.getByRole('button', {
            name: /Send OTP/i
        }).click();

        await expect(
            page.getByText('Already registered, please login')
        ).toBeVisible();

    });

});