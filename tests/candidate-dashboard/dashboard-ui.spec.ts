import { test, expect } from '@playwright/test';

test.describe('Candidate Dashboard UI', () => {

    test.beforeEach(async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder(/email/i)
            .fill(process.env.TESTUSER1_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.TESTUSER1_PASSWORD!);

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

        await expect(page).toHaveURL(/dashboard/);

    });

    test('TC_CD_001 - Dashboard loads successfully', async ({ page }) => {

        await expect(page).toHaveURL(/dashboard/);

    });

    test('TC_CD_007 - Notification icon visibility', async ({ page }) => {

        await expect(page.getByRole('button', { name: 'Open notifications' })).toBeVisible();

    });

    test('TC_CD_008 - Profile dropdown visibility', async ({ page }) => {

        await page.getByRole('button', { name: 'TU test user' }).click();
  await expect(page.getByRole('paragraph').filter({ hasText: 'test user' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Profile settings' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    });

});