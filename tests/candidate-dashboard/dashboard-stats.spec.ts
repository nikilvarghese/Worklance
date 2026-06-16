import { test, expect } from '@playwright/test';

test.describe('Candidate Dashboard Statistics', () => {

    test.beforeEach(async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder(/email/i)
            .fill(process.env.TESTUSER1_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.TESTUSER1_PASSWORD!);

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

    });

    test('TC_CD_002 - Dashboard statistics display', async ({ page }) => {

        await expect(page.getByText(/Open roles/i)).toBeVisible();

        await expect(page.getByRole('main').getByText('Applications', { exact: true })).toBeVisible();

        await expect(page.getByText('Saved jobs', { exact: true })).toBeVisible();
        
        await expect(page.getByText('Interview signals')).toBeVisible();

    });

    test('TC_CD_004 - Application Status section', async ({ page }) => {

        await expect(
            page.getByText(/Application status/i)
        ).toBeVisible();

    });

});