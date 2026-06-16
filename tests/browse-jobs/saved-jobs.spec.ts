import 'dotenv/config';
import { test, expect } from '@playwright/test';

test.describe('Saved Jobs', () => {

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

    test('TC_BJ_014 - Verify saved job appears in Saved Jobs page', async ({ page }) => {

        await page.getByRole('link', {
            name: /browse jobs/i
        }).click();

        await expect(page).toHaveURL(/browse/i);

        // Capture first job title
        const jobTitle = await page
            .locator('h3')
            .first()
            .textContent();

        // Click save/unsave button
        await page.getByRole('button', {
            name: /save|saved|unsave/i
        }).first().click();

        const savedToast = page.getByText(/job saved/i);
        const removedToast = page.getByText(/job removed from saved/i);

        // Wait for either toast
        await Promise.race([
            savedToast.waitFor({ state: 'visible' }),
            removedToast.waitFor({ state: 'visible' })
        ]);

        // If already saved, save it again
        if (await removedToast.isVisible()) {

            await page.getByRole('button', {
                name: /save|saved|unsave/i
            }).first().click();

            await expect(savedToast).toBeVisible();

        } else {

            await expect(savedToast).toBeVisible();

        }

        // Open Saved Jobs
        await page.getByRole('link', {
            name: /saved jobs/i
        }).click();

        await expect(page).toHaveURL(/saved/i);

        // Verify job exists
        await expect(
    page.locator('h3').filter({
        hasText: jobTitle!
    }).first()
).toBeVisible();

        // Return to Browse Jobs
        await page.getByRole('link', {
            name: /browse jobs/i
        }).click();

        await expect(page).toHaveURL(/browse/i);

        // Unsave job
        await page.getByRole('button', {
            name: /saved|unsave/i
        }).first().click();

        await expect(
            page.getByText(/job removed from saved/i)
        ).toBeVisible();

        // Open Saved Jobs again
        await page.getByRole('link', {
            name: /saved jobs/i
        }).click();

        const noSavedJobs = page.getByText(/no saved jobs yet/i);

        if (await noSavedJobs.isVisible().catch(() => false)) {

            await expect(noSavedJobs).toBeVisible();

        } else {

            await expect(
    page.locator('h3').filter({
        hasText: jobTitle!
    })
).toHaveCount(0);

        }

    });

});