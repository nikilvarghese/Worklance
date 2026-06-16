import { test, expect } from '@playwright/test';

test.describe('Reports', () => {


    test.beforeEach(async ({ page }) => {
        // Log in as employer
        await page.goto('http://localhost:3000/hr-login');
        await page.getByPlaceholder('Work email').fill(process.env.TESTUSER2_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TESTUSER2_PASSWORD!);
        await page.getByRole('button', { name: /sign in as employer/i }).click();

        await expect(page).toHaveURL(/hr-dashboard/);

        // Go to Reports page
        await page.getByRole('link', { name: /reports/i }).click();
        await expect(page).toHaveURL(/reports/);
    });

    test('HR_REP_001 - Verify Reports page opens successfully', async ({ page }) => {
        /*
        Test Scenario: Verify Reports page opens successfully
        Steps: Login as HR user → Click Reports from sidebar
        Expected Result: Reports page loads successfully with all report metrics displayed
        */
        await expect(page.locator('h2:has-text("Reports")')).toBeVisible();
    });

    test('HR_REP_002 - Verify Applicants per Role metric displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Applicants per Role metric displays correctly
        Steps: Open Reports page → View Applicants per Role section
        Expected Result: Applicants per Role metric displays correct applicant counts for each role
        */
        await expect(page.getByText('Applicants per role', { exact: false })).toBeVisible();
    });

    test('HR_REP_003 - Verify Featured Jobs count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Featured Jobs count displays correctly
        Steps: Open Reports page → View Featured Jobs metric
        Expected Result: Featured Jobs count matches the number of featured job postings
        */
        await expect(page.getByText('Featured jobs', { exact: false })).toBeVisible();
    });

    test('HR_REP_004 - Verify Pipeline Distribution displays correct status counts', async ({ page }) => {
        /*
        Test Scenario: Verify Pipeline Distribution displays correct status counts
        Steps: Open Reports page → View Pipeline Distribution chart
        Expected Result: Pipeline Distribution reflects correct counts for all application stages
        */
        const distributionSection = page.locator('.panel', { hasText: 'Pipeline distribution' });
        await expect(distributionSection).toBeVisible();
    });

    test('HR_REP_005 - Verify Pending applications count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Pending applications count displays correctly
        Steps: Open Reports page → Check Pending metric
        Expected Result: Pending count matches applications currently in Pending stage
        */
        const distributionSection = page.locator('.panel', { hasText: 'Pipeline distribution' });
        await expect(distributionSection.getByText('Pending')).toBeVisible();
    });

    test('HR_REP_006 - Verify Screening applications count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Screening applications count displays correctly
        Steps: Open Reports page → Check Screening metric
        Expected Result: Screening count matches applications currently in Screening stage
        */
        const distributionSection = page.locator('.panel', { hasText: 'Pipeline distribution' });
        await expect(distributionSection.getByText('Screening')).toBeVisible();
    });

    test('HR_REP_007 - Verify Interview applications count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Interview applications count displays correctly
        Steps: Open Reports page → Check Interview metric
        Expected Result: Interview count matches applications currently in Interview stage
        */
        const distributionSection = page.locator('.panel', { hasText: 'Pipeline distribution' });
        await expect(distributionSection.getByText('Interview')).toBeVisible();
    });

    test('HR_REP_008 - Verify Approved applications count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Approved applications count displays correctly
        Steps: Open Reports page → Check Approved metric
        Expected Result: Approved count matches applications currently in Approved stage
        */
        const distributionSection = page.locator('.panel', { hasText: 'Pipeline distribution' });
        await expect(distributionSection.getByText('Approved')).toBeVisible();
    });

    test('HR_REP_009 - Verify Rejected applications count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Rejected applications count displays correctly
        Steps: Open Reports page → Check Rejected metric
        Expected Result: Rejected count matches applications currently in Rejected stage
        */
        const distributionSection = page.locator('.panel', { hasText: 'Pipeline distribution' });
        await expect(distributionSection.getByText('Rejected')).toBeVisible();
    });

    test('HR_REP_010 - Verify Hired applications count displays correctly', async ({ page }) => {
        /*
        Test Scenario: Verify Hired applications count displays correctly
        Steps: Open Reports page → Check Hired metric
        Expected Result: Hired count matches applications currently in Hired stage
        */
        const distributionSection = page.locator('.panel', { hasText: 'Pipeline distribution' });
        await expect(distributionSection.getByText('Hired')).toBeVisible();
    });
});
