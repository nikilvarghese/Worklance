import 'dotenv/config';
import { test, expect } from '@playwright/test';

test.describe('Manage Jobs', () => {

test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:3000/hr-login');

    await page.getByPlaceholder('Work email')
        .fill(process.env.TESTUSER2_EMAIL!);

    await page.locator('input[type="password"]')
        .fill(process.env.TESTUSER2_PASSWORD!);

    await page.getByRole('button', {
        name: /sign in as employer/i
    }).click();

    await expect(page)
        .toHaveURL(/hr-dashboard/);

    await page.getByRole('link', {
        name: /manage jobs/i
    }).click();

    await expect(page)
        .toHaveURL(/manage-jobs/);

});

test('HR_MJ_001 - Verify Manage Jobs page opens successfully', async ({ page }) => {

    await expect(page.getByRole('heading', { name: 'Manage Jobs', exact: true })).toBeVisible();

});

test('HR_MJ_002 - Verify job details are displayed correctly', async ({ page }) => {

    const firstJobCard =
        page.getByRole('article').first();

        console.log(
    await page.getByRole('article').count()
);

    if (await firstJobCard.isVisible()) {

        await expect(
            firstJobCard.getByRole('heading')
        ).toBeVisible();

        await expect(page.getByRole('link', { name: 'View' }).first()).toBeVisible();

    } else {

        test.skip(true,
            'No jobs posted to check details');

    }

});

test('HR_MJ_003 - Verify View Job functionality', async ({ page }) => {

    const firstJobCard =
        page.getByRole('article').first();

    if (await firstJobCard.isVisible()) {

        await firstJobCard.getByRole('link', {
            name: /view/i
        }).click();

        await expect(page)
            .toHaveURL(/job/i);

    } else {

        test.skip(true,
            'No jobs posted to view');

    }

});

test('HR_MJ_004 - Verify Edit Job functionality', async ({ page }) => {

    const firstJobCard =
        page.getByRole('article').first();

    if (await firstJobCard.isVisible()) {

        await firstJobCard.getByRole('button', {
            name: /edit/i
        }).click();

        const titleInput = page.locator(
            'label:has-text("Title") input'
        );

        const currentTitle =
            await titleInput.inputValue();

        await titleInput.fill(
            `${currentTitle} Updated`
        );

        await page.getByRole('button', {
            name: /save changes/i
        }).click();

        await expect(
            page.getByText(/Job updated/i)
        ).toBeVisible();

    } else {

        test.skip(true,
            'No jobs posted to edit');

    }

});

test('HR_MJ_005 - Verify updated job details persist after refresh', async ({ page }) => {

    const firstJobCard =
        page.getByRole('article').first();

    if (await firstJobCard.isVisible()) {

        await firstJobCard.getByRole('button', {
            name: /edit/i
        }).click();

        const titleInput = page.locator(
            'label:has-text("Title") input'
        );

        const currentTitle =
            await titleInput.inputValue();

        const updatedTitle =
            `${currentTitle} Updated`;

        await titleInput.fill(updatedTitle);

        await page.getByRole('button', {
            name: /save changes/i
        }).click();

        await page.reload();

        await expect(
            page.getByText(updatedTitle)
        ).toBeVisible();

    } else {

        test.skip(true,
            'No jobs posted to check persistence');

    }

});

test('HR_MJ_006 - Verify Delete Job confirmation popup', async ({ page }) => {

    const firstJobCard =
        page.getByRole('article').first();

    if (await firstJobCard.isVisible()) {

        await firstJobCard.getByRole('button', {
            name: /delete/i
        }).click();

        await expect(
            page.locator('div')
                .filter({
                    hasText: 'Delete jobAre you sure you'
                })
                .nth(5)
        ).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Confirm delete'
            })
        ).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'Cancel'
            })
        ).toBeVisible();

    } else {

        test.skip(
            true,
            'No jobs posted to test delete'
        );

    }

});

test('HR_MJ_007 - Verify Delete Job functionality', async ({ page }) => {

    const firstJobCard =
        page.getByRole('article').first();

    if (await firstJobCard.isVisible()) {

        const jobsBefore = await page
        .getByRole('article')
        .count();

        await firstJobCard.getByRole('button', {
            name: /delete/i
        }).click();

        await page.getByRole('button', {
            name: /confirm delete/i
        }).click();

        await expect(
    page.getByText(
        /job and associated applications deleted successfully/i
    )
).toBeVisible();

await expect( page.getByRole('article') ).toHaveCount(jobsBefore - 1);

    } else {

        test.skip(
            true,
            'No jobs posted to delete'
        );

    }

});

test.skip('HR_MJ_008 - Verify deleted job is no longer available for applications', async () => {

    // Requires candidate-side validation.

});

});
