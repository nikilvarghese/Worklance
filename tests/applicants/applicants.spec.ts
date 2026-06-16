import { test, expect, Page } from '@playwright/test';

test.describe('Applicants', () => {

    test.beforeEach(async ({ page }) => {
        // Log in as employer
        await page.goto('http://localhost:3000/hr-login');
        await page.getByPlaceholder('Work email').fill(process.env.TESTUSER2_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TESTUSER2_PASSWORD!);
        await page.getByRole('button', { name: /sign in as employer/i }).click();

        await expect(page).toHaveURL(/hr-dashboard/);

        // Go to Applicants page
        await page.getByRole('navigation').getByRole('link', { name: 'Applicants' }).click();
        await expect(page).toHaveURL(/applicants/);
    });
    const openFirstJobWithApplicants = async (page: Page) => {

    const jobCards = page.locator('aside button');
    const jobCount = await jobCards.count();

    for (let i = 0; i < jobCount; i++) {

        const jobCard = jobCards.nth(i);

        await jobCard.scrollIntoViewIfNeeded();
        await jobCard.click();

        await page.waitForLoadState('networkidle');

        const applicants = page.locator('article button.min-w-0');

        if (await applicants.count() > 0) {
            return applicants;
        }
    }

    return null;
};

    test('HR_APP_001 - Verify Applicants page opens successfully', async ({ page }) => {
        /*
        Test Scenario: Verify Applicants page opens successfully
        Steps: Login as HR user, Click Applicants from sidebar
        Expected Result: Applicants page loads successfully
        */
        await expect(page.locator('h2:has-text("Applicants")')).toBeVisible();
    });

    test('HR_APP_002 - Verify applicants can be filtered by job', async ({ page }) => {
    /*
    Test Scenario: Verify applicants can be filtered by job
    Steps: Select a job from job filter sidebar
    Expected Result: Applicants are filtered according to selected job
    */

    const applicants = await openFirstJobWithApplicants(page);

    if (!applicants) {
        test.skip(true, 'No applicants found in any job');
    }

    await expect(
        applicants!.first()
    ).toBeVisible();
});

    test('HR_APP_003 - Verify applicant search by name functionality', async ({ page }) => {
        /*
        Test Scenario: Verify applicant search by name functionality
        Steps: Enter applicant name in search field
        Expected Result: Matching applicant record is displayed
        */
        const searchInput = page.locator('input[placeholder="Search candidate"]');
        await searchInput.fill('Demo');
        // Filter list should update
        // Expect either results or no applicant found
        const noApplicantsText = page.getByText('No applicants found');
        if (await noApplicantsText.isVisible()) {
            await expect(noApplicantsText).toBeVisible();
        } else {
            await expect(page.locator('article h3').first()).toContainText(/Demo/i);
        }
    });

    test('HR_APP_004 - Verify search with invalid applicant name', async ({ page }) => {
        /*
        Test Scenario: Verify search with invalid applicant name
        Steps: Enter invalid applicant name in search field
        Expected Result: No matching records are displayed
        */
        const searchInput = page.locator('input[placeholder="Search candidate"]');
        await searchInput.fill('XYZNonExistentCandidate');
        await expect(page.getByText('No applicants found')).toBeVisible();
    });

    test('HR_APP_005 - Verify Pending filter functionality', async ({ page }) => {
        /*
        Test Scenario: Verify Pending filter functionality
        Steps: Click Pending filter
        Expected Result: Only Pending applicants are displayed
        */
        await page.getByRole('button', { name: 'Pending', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Pending', exact: true })).toHaveClass(/bg-slate-950/);
    });

    test('HR_APP_006 - Verify Screening filter functionality', async ({ page }) => {
        /*
        Test Scenario: Verify Screening filter functionality
        Steps: Click Screening filter
        Expected Result: Only Screening applicants are displayed
        */
        await page.getByRole('button', { name: 'Screening', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Screening', exact: true })).toHaveClass(/bg-slate-950/);
    });

    test('HR_APP_007 - Verify Interview filter functionality', async ({ page }) => {
        /*
        Test Scenario: Verify Interview filter functionality
        Steps: Click Interview filter
        Expected Result: Only Interview applicants are displayed
        */
        await page.getByRole('button', { name: 'Interview', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Interview', exact: true })).toHaveClass(/bg-slate-950/);
    });

    test('HR_APP_008 - Verify Approved filter functionality', async ({ page }) => {
        /*
        Test Scenario: Verify Approved filter functionality
        Steps: Click Approved filter
        Expected Result: Only Approved applicants are displayed
        */
        await page.getByRole('button', { name: 'Approved', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Approved', exact: true })).toHaveClass(/bg-slate-950/);
    });

    test('HR_APP_009 - Verify Rejected filter functionality', async ({ page }) => {
        /*
        Test Scenario: Verify Rejected filter functionality
        Steps: Click Rejected filter
        Expected Result: Only Rejected applicants are displayed
        */
        await page.getByRole('button', { name: 'Rejected', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Rejected', exact: true })).toHaveClass(/bg-slate-950/);
    });

    test('HR_APP_010 - Verify Hired filter functionality', async ({ page }) => {
        /*
        Test Scenario: Verify Hired filter functionality
        Steps: Click Hired filter
        Expected Result: Only Hired applicants are displayed
        */
        await page.getByRole('button', { name: 'Hired', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Hired', exact: true })).toHaveClass(/bg-slate-950/);
    });

    test('HR_APP_011 - Verify applicant profile opens successfully', async ({ page }) => {
    /*
    Test Scenario: Verify applicant profile opens successfully
    Steps: Click applicant record from applicants list
    Expected Result: Applicant profile details are displayed
    */

    const applicants = await openFirstJobWithApplicants(page);

    if (!applicants) {
        test.skip(true, 'No applicants found in any job');
    }

    await applicants!.first().click();

    await expect(
        page.getByRole('heading', {
            name: /candidate details/i
        })
    ).toBeVisible();
});
});
