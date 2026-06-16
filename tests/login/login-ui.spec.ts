import { test, expect } from '@playwright/test';

test.describe('Login UI', () => {

    test('TC_LOGIN_001 - Job seeker login page elements displayed', async ({ page }) => {
        await page.goto('http://localhost:3000/login');

        await expect(page.getByPlaceholder(/email/i)).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.getByRole('button', {
            name: /sign in as job seeker/i
        })).toBeVisible();
    });

    test('TC_EMP_LOGIN_001 - Employer login page elements displayed', async ({ page }) => {
        await page.goto('http://localhost:3000/login');

        await page.getByText(/use employer login/i).click();

        await expect(page.getByPlaceholder(/work email/i)).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.getByRole('button', {
            name: /sign in as employer/i
        })).toBeVisible();
    });

});