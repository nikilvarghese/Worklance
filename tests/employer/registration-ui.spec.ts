import { test, expect } from '@playwright/test';

test.describe('Employer Registration UI', () => {

    test('TC_EMP_REG_001 - Employer tab selected', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        const employerTab = page.getByRole('button', {
            name: 'Employer'
        });

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await expect(
            page.getByPlaceholder('e.g. Acme Corp')
        ).toBeVisible();

    });

    test('TC_EMP_REG_002 - Company Name field displayed', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await expect(
            page.getByPlaceholder('e.g. Acme Corp')
        ).toBeVisible();

    });

    test('TC_EMP_REG_003 - All mandatory fields displayed', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await expect(
            page.getByPlaceholder('First name')
        ).toBeVisible();

        await expect(
            page.getByPlaceholder('Last name')
        ).toBeVisible();

        await expect(
            page.getByPlaceholder('e.g. Acme Corp')
        ).toBeVisible();

        await expect(
            page.getByPlaceholder('name@example.com')
        ).toBeVisible();

        await expect(
            page.locator('input[type="password"]')
        ).toBeVisible();

    });

    test('TC_EMP_REG_004 - Create Account disabled by default', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await expect(
            page.getByRole('button', {
                name: 'Create account'
            })
        ).toBeDisabled();

    });

});