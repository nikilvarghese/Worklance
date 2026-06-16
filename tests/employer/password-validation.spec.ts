import { test, expect } from '@playwright/test';

test.describe('Employer Password Validation', () => {

    test('TC_EMP_REG_014 - Password less than 8 characters', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', { name: 'Employer' }).click();

        await page.locator('input[type="password"]')
            .fill('Pass1');

        await expect(
            page.getByText('Min 8 characters')
        ).toBeVisible();

    });

    test('TC_EMP_REG_015 - Password without uppercase letter', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', { name: 'Employer' }).click();

        await page.locator('input[type="password"]')
            .fill('password1');

        await expect(
            page.getByText('One uppercase letter')
        ).not.toHaveClass(/text-emerald-700/);

    });

    test('TC_EMP_REG_016 - Password without lowercase letter', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', { name: 'Employer' }).click();

        await page.locator('input[type="password"]')
            .fill('PASSWORD1');

        await expect(
            page.getByText('One lowercase letter')
        ).not.toHaveClass(/text-emerald-700/);

    });

    test('TC_EMP_REG_017 - Password without number', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', { name: 'Employer' }).click();

        await page.locator('input[type="password"]')
            .fill('Password');

        await expect(
            page.getByText('One number')
        ).not.toHaveClass(/text-emerald-700/);

    });

    test('TC_EMP_REG_018 - Valid password format', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', { name: 'Employer' }).click();

        await page.locator('input[type="password"]')
            .fill('Password1');

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