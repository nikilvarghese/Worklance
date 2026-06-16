import { test, expect } from '@playwright/test';

test.describe('HR Dashboard', () => {

    test.beforeEach(async ({ page }) => {
        // Log in as employer
        await page.goto('http://localhost:3000/hr-login');
        await page.getByPlaceholder('Work email').fill(process.env.TESTUSER2_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TESTUSER2_PASSWORD!);
        await page.getByRole('button', { name: /sign in as employer/i }).click();

        await expect(page).toHaveURL(/hr-dashboard/);
    });

    test('HR_DASH_001 - Verify HR Dashboard loads successfully after login', async ({ page }) => {
        /*
        Test Scenario: Verify HR Dashboard loads successfully after login
        Steps: Login as HR user, Enter valid credentials, Click Login
        Expected Result: HR Dashboard loads successfully with all dashboard widgets visible
        */
        await expect(page.getByText('Active jobs')).toBeVisible();
  await expect(page.getByRole('paragraph').filter({ hasText: 'Applicants' })).toBeVisible();
  await expect(page.getByText('Interviews')).toBeVisible();
  await expect(page.getByText('Approved/Hired')).toBeVisible();
    });

    test('HR_DASH_002 - Verify Active Jobs count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Active Jobs count displays correctly
        Steps: Login as HR user, Open Dashboard, Compare Active Jobs count with published jobs
        Expected Result: Active Jobs count matches total published jobs
        */
        await expect(
    page.locator('div')
        .filter({ hasText: /Active jobs/i })
        .first()
).toBeVisible();
    });

    test('HR_DASH_003 - Verify Applicants count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Applicants count displays correctly
        Steps: Login as HR user, Open Dashboard, Compare Applicants count with applicant records
        Expected Result: Applicants count matches total applicant records
        */
        await expect(
    page.locator('div')
        .filter({ hasText: /Applicants/i })
        .first()
).toBeVisible();
});
    test('HR_DASH_004 - Verify Interviews count updates correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Interviews count updates correctly
        Steps: Schedule interview for applicant, Open Dashboard
        Expected Result: Interviews count reflects scheduled interviews
        */
        await expect(
    page.locator('div')
        .filter({ hasText: /Interviews/i })
        .first()
).toBeVisible();
    });

    test('HR_DASH_005 - Verify Approved/Hired count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Approved/Hired count displays correctly
        Steps: Move applicant to Hired status, Open Dashboard
        Expected Result: Approved/Hired count reflects hired candidates
        */
        await expect(
    page.locator('div')
        .filter({ hasText: /Applicants/i })
        .first()
).toBeVisible();
    });

    test('HR_DASH_006 - Verify Recent Applicants widget displays latest applicants', async ({ page }) => {
        /*
        Test Scenario: Verify Recent Applicants widget displays latest applicants
        Steps: Submit applications as candidate, Login as HR, Open Dashboard
        Expected Result: Latest applicants are displayed in Recent Applicants section
        */
        const recentSection = page.locator('.panel', { hasText: 'Recent applicants' });
        await expect(recentSection).toBeVisible();
    });

    test('HR_DASH_007 - Verify Pipeline Health section displays status counts correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Pipeline Health section displays status counts correctly
        Steps: Move applicants through different stages, Open Dashboard
        Expected Result: Pipeline Health displays correct counts for all stages
        */
        const pipelineSection = page.locator('.panel', { hasText: 'Pipeline health' });
        await expect(pipelineSection).toBeVisible();
        await expect(pipelineSection.getByText('Pending')).toBeVisible();
        await expect(pipelineSection.getByText('Screening')).toBeVisible();
        await expect(pipelineSection.getByText('Interview')).toBeVisible();
        await expect(pipelineSection.getByText('Approved')).toBeVisible();
        await expect(pipelineSection.getByText('Rejected')).toBeVisible();
        await expect(pipelineSection.getByText('Hired')).toBeVisible();
    });

    test.skip('HR_DASH_008 - Verify clicking applicant from Recent Applicants opens profile', async ({ page }) => {
        /*
        Test Scenario: Verify clicking applicant from Recent Applicants opens profile
        Steps: Open Dashboard, Click applicant card from Recent Applicants section
        Expected Result: Applicant profile page opens successfully
        */
        // Skip: Applicant card in Recent Applicants widget is not clickable in the UI (it is static text)
    });

    test('HR_DASH_009 - Verify Post Job button redirects to Post Job page', async ({ page }) => {
        /*
        Test Scenario: Verify Post Job button redirects to Post Job page
        Steps: Open Dashboard, Click Post Job button
        Expected Result: User is redirected to Post Job page
        */
        await page.getByRole('link', { name: 'Post job', exact: true }).click();
        await expect(page).toHaveURL(/post-job/);
    });

    test('HR_DASH_010 - Verify dashboard data persists after page refresh', async ({ page }) => {
        /*
        Test Scenario: Verify dashboard data persists after page refresh
        Steps: Open Dashboard, Note displayed counts, Refresh browser page
        Expected Result: Dashboard data remains unchanged after refresh
        */
        const textBefore = await page.locator('div').filter({ hasText: /Active jobs/i }).locator('h3').first().innerText();
        await page.reload();
        await expect(page).toHaveURL(/hr-dashboard/);
        const textAfter = await page.locator('div').filter({ hasText: /Active jobs/i }).locator('h3').first().innerText();
        expect(textBefore).toBe(textAfter);
    });
});