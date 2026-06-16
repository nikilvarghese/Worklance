import { test, expect } from '@playwright/test';

test.describe('Password Visibility', () => {

    test('TC_LOGIN_009 - Job seeker password visibility toggle', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder('Password')
            .fill('Password123');

        await page.locator('input[placeholder="Password"] + button')
            .click();

        await expect(
            page.locator('input[type="text"]')
        ).toHaveValue('Password123');

    });

    test('TC_EMP_LOGIN_009 - Employer password visibility toggle', async ({ page }) => {

        await page.goto('http://localhost:3000/hr-login');

        await page.getByPlaceholder('Password')
            .fill('Password123');

        await page.locator('input[placeholder="Password"] + button')
            .click();

        await expect(
            page.locator('input[type="text"]')
        ).toHaveValue('Password123');

    });

});