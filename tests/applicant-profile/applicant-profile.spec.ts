import { test, expect } from '@playwright/test';

test.describe('Applicant Profile', () => {

    test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:3000/hr-login');

    await page.getByPlaceholder('Work email')
        .fill(process.env.TESTUSER2_EMAIL!);

    await page.locator('input[type="password"]')
        .fill(process.env.TESTUSER2_PASSWORD!);

    await page.getByRole('button', {
        name: /sign in as employer/i
    }).click();

    await expect(page).toHaveURL(/hr-dashboard/);

    await page.getByRole('navigation')
        .getByRole('link', { name: 'Applicants' })
        .click();

    await expect(page).toHaveURL(/applicants/);

    const jobCards = page.locator('aside button');
    const jobCount = await jobCards.count();

    let applicantFound = false;

    for (let i = 0; i < jobCount; i++) {

        const jobCard = jobCards.nth(i);

        await jobCard.scrollIntoViewIfNeeded();
        await jobCard.click();

        await page.waitForLoadState('networkidle');

        const noApplicants = page.getByText(
            /no applicants found/i
        );

        if (await noApplicants.isVisible().catch(() => false)) {
            continue;
        }

        const applicants = page.locator(
            'article button.min-w-0'
        );

        if (await applicants.count() > 0) {

            await applicants.first().click();

            applicantFound = true;

            break;
        }
    }

    if (!applicantFound) {
        test.skip(true, 'No applicants found in any job');
    }

    await expect(
        page.getByRole('heading', {
            name: /candidate details/i
        })
    ).toBeVisible();
});

    test('HR_PROF_001 - Verify applicant details are displayed correctly', async ({ page }) => {

         await expect(page.getByRole('heading', { name: 'Candidate details' })).toBeVisible();

        await expect(page.getByRole('heading', { name: 'Cover note' })).toBeVisible();

          await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible();

          await expect(page.getByRole('heading', { name: 'Preferred roles' })).toBeVisible();

          await expect(page.getByRole('heading', { name: 'Languages' })).toBeVisible();
    });

    test('HR_PROF_002 - Verify applicant can be moved to Pending status', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Pending',
            exact: true
        }).click();

        await expect(
            page.getByText(/moved to pending/i)
        ).toBeVisible();

        await expect(
            page.locator('span').filter({ hasText: 'Pending' }).first()
        ).toBeVisible();
    });

    test('HR_PROF_003 - Verify applicant can be moved to Screening status', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Screening',
            exact: true
        }).click();

        await expect(
            page.getByText(/moved to screening/i)
        ).toBeVisible();

        await expect(
            page.locator('span').filter({ hasText: 'Screening' }).first()
        ).toBeVisible();
    });

    test('HR_PROF_004 - Verify applicant can be moved to Interview status', async ({ page }) => {

        await page.getByRole('button', { name: 'Interview' }).click();
  await page.getByRole('textbox', { name: 'Date' }).fill('2026-06-16');
  await page.getByRole('textbox', { name: 'Time' }).click();
  await page.getByRole('textbox', { name: 'Time' }).press('ArrowUp');
  await page.getByRole('textbox', { name: 'Time' }).fill('09:00');
  await page.getByRole('textbox', { name: 'Contact link or phone' }).click();
  await page.getByRole('textbox', { name: 'Contact link or phone' }).fill('8678676656');
  await page.getByRole('textbox', { name: 'Notes' }).click();
  await page.getByRole('textbox', { name: 'Notes' }).fill('come to interview');
  await page.getByRole('button', { name: 'Schedule interview' }).click();
  await expect(
  page.getByText(/moved to interview/i)
).toBeVisible();
    });

    test('HR_PROF_005 - Verify applicant can be moved to Approved status', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Approved',
            exact: true
        }).click();

        await expect(
            page.getByText(/moved to approved/i)
        ).toBeVisible();

        await expect(
            page.locator('span').filter({ hasText: 'Approved' }).first()
        ).toBeVisible();
    });

    test('HR_PROF_006 - Verify applicant can be moved to Rejected status', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Rejected',
            exact: true
        }).click();

        await expect(
            page.getByText(/moved to rejected/i)
        ).toBeVisible();

        await expect(
            page.locator('span').filter({ hasText: 'Rejected' }).first()
        ).toBeVisible();
    });

    test('HR_PROF_007 - Verify applicant can be moved to Hired status', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Hired',
            exact: true
        }).click();

        await expect(
            page.getByText(/moved to hired/i)
        ).toBeVisible();

        await expect(
            page.locator('span').filter({ hasText: 'Hired' }).first()
        ).toBeVisible();
    });

    test('HR_PROF_008 - Verify applicant status badge updates correctly', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Screening',
            exact: true
        }).click();

        await expect(
            page.locator('span').filter({ hasText: 'Screening' }).first()
        ).toBeVisible();
    });

    test('HR_PROF_009 - Verify navigation back to Applicants page', async ({ page }) => {

        await page.getByRole('button', { name: 'Back to applicants' }).click();

        await expect(page).toHaveURL(/applicants/);

        await expect(page.locator('h2')).toBeVisible();
    });

});