import { test, expect } from '@playwright/test';

test.describe('Saved Jobs', () => {

    test.beforeEach(async ({ page }) => {
        // Log in as a job seeker
        await page.goto('http://localhost:3000/login');
        await page.getByPlaceholder('Email').fill(process.env.TESTUSER1_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TESTUSER1_PASSWORD!);
        await page.getByRole('button', { name: /sign in as job seeker/i }).click();
        
        await expect(page).toHaveURL(/dashboard/);
    });

    test('TC_SJ_001 - Verify Saved Jobs page opens', async ({ page }) => {
        /*
        Test Scenario: Verify Saved Jobs page opens
        Steps: Click Saved Jobs
        Expected Result: Saved Jobs page displayed
        */
        await page.getByRole('link', { name: /saved jobs/i }).click();
        await expect(page).toHaveURL(/saved/);
        await expect(page.locator('h2:has-text("Saved jobs")')).toBeVisible();
    });

    test('TC_SJ_002 - Verify saved jobs displayed', async ({ page }) => {
    /*
    Test Scenario: Verify saved jobs displayed
    Steps: Save a job
    Expected Result: Job visible in Saved Jobs
    */

    // Open Browse Jobs
    await page.getByRole('link', {
        name: /browse jobs/i
    }).click();

    await expect(page).toHaveURL(/browse/);

    // Get first job card
    const firstJobCard = page.locator('article.panel').first();

    await expect(firstJobCard).toBeVisible();

    // Capture job title
    const jobTitle = await firstJobCard
        .locator('h3')
        .innerText();

    // Click Save / Saved / Unsave button
    await firstJobCard
        .getByRole('button', {
            name: /save job|saved|unsave/i
        })
        .click();

    const savedToast = page.getByText(/job saved/i);

    const removedToast = page.getByText(
        /job removed from saved/i
    );

    // Wait for either toast
    await Promise.race([
        savedToast.waitFor({ state: 'visible' }),
        removedToast.waitFor({ state: 'visible' })
    ]);

    // If the job was already saved,
    // clicking removed it, so save it again
    if (await removedToast.isVisible()) {

        await firstJobCard
            .getByRole('button', {
                name: /save job|saved|unsave/i
            })
            .click();

        await expect(savedToast).toBeVisible();

    } else {

        await expect(savedToast).toBeVisible();

    }

    // Navigate to Saved Jobs page
    await page.getByRole('link', {
        name: /saved jobs/i
    }).click();

    await expect(page).toHaveURL(/saved/);

    // Verify the saved job is displayed
    await expect(
        page.locator('article.panel h3', {
            hasText: jobTitle
        })
    ).toBeVisible();
});

    test('TC_SJ_003 - Verify Apply Now from Saved Jobs', async ({ page }) => {
    /*
    Test Scenario: Verify Apply Now from Saved Jobs
    Steps: Click Apply Now
    Expected Result: Application process starts
    */

    await page.getByRole('link', {
        name: /saved jobs/i
    }).click();

    await expect(page).toHaveURL(/saved/);

    const firstSavedCard = page.locator('article.panel').first();

    if (await firstSavedCard.isVisible()) {

        const appliedBtn = firstSavedCard.getByRole('button', {
            name: /applied/i
        });

        const applyBtn = firstSavedCard.getByRole('button', {
            name: /apply now/i
        });

        // Already applied
        if (await appliedBtn.count() > 0) {

            await expect(appliedBtn).toBeDisabled();

        }
        // Not applied yet
        else if (await applyBtn.count() > 0) {

            await applyBtn.click();

            await expect(
                page.getByText(/application submitted/i)
            ).toBeVisible();

        }

    } else {

        test.skip(true, 'No saved jobs found to test application');

    }
});

    test('TC_SJ_004 - Verify View Details from Saved Jobs', async ({ page }) => {
        /*
        Test Scenario: Verify View Details from Saved Jobs
        Steps: Click View Details
        Expected Result: Job Details page opens
        */
        await page.getByRole('link', { name: /saved jobs/i }).click();
        await expect(page).toHaveURL(/saved/);

        const firstSavedCard = page.locator('article.panel').first();
        if (await firstSavedCard.isVisible()) {
            await firstSavedCard.getByRole('link', { name: /view details/i }).first().click();
            await expect(page).toHaveURL(/\/job\//);
        } else {
            test.skip(true, 'No saved jobs found to view details');
        }
    });

    test('TC_SJ_005 - Verify unsave bookmarked job', async ({ page }) => {
        /*
        Test Scenario: Verify unsave bookmarked job
        Steps: Click bookmark icon again
        Expected Result: Job removed from Saved Jobs
        */
        await page.getByRole('link', { name: /saved jobs/i }).click();
        await expect(page).toHaveURL(/saved/);

        const firstSavedCard = page.locator('article.panel').first();
        if (await firstSavedCard.isVisible()) {
            // Click the unsave icon
            await firstSavedCard.getByRole('button', { name: /unsave job/i }).first().click();
            // Expect toast success
            await expect(page.getByText(/removed from saved jobs|removed/i)).toBeVisible();
        } else {
            test.skip(true, 'No saved jobs found to unsave');
        }
    });
});
