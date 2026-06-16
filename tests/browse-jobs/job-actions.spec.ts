import 'dotenv/config';
import { test, expect } from '@playwright/test';

test.describe('Browse Jobs Actions', () => {

    test.beforeEach(async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder(/email/i)
            .fill(process.env.TESTUSER1_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.TESTUSER1_PASSWORD!);

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

       await page.getByRole('link', {
            name: /browse jobs/i
        }).click();

        await expect(page).toHaveURL(/browse/i);

    });

    test('TC_BJ_012 - Verify View Details button', async ({ page }) => {

        await page.getByRole('link', {
            name: /view details/i
        }).first().click();

        await expect(page).not.toHaveURL(/browse-jobs/);

        await expect(
            page.getByText(/job description/i)
        ).toBeVisible();

    });

    test('TC_BJ_013 - Verify Save Job button', async ({ page }) => {

    await page.getByRole('button', {
        name: /save|saved/i
    }).first().click();

    const savedToast = page.getByText(/job saved/i);
    const removedToast = page.getByText(/job removed/i);

    await Promise.race([
        savedToast.waitFor({ state: 'visible' }),
        removedToast.waitFor({ state: 'visible' })
    ]);

    await expect(
        savedToast.or(removedToast)
    ).toBeVisible();

});

});