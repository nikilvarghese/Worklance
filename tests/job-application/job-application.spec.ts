import 'dotenv/config';
import { test, expect } from '@playwright/test';

test.describe('Job Application', () => {

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

    await page.getByRole('link', {
        name: /browse jobs/i
    }).click();

    await expect(page).toHaveURL(/browse/i);

});

test('TC_AP_001 - Verify application popup opens', async ({ page }) => {

    await page.getByRole('button', {
        name: /apply now/i
    }).first().click();

    await expect(page.getByText('Application', { exact: true })).toBeVisible();

    await expect(page.getByText('Cover note')).toBeVisible();
    await expect(page.getByText('Expected salary')).toBeVisible();
    await expect(page.getByText('Availability')).toBeVisible();

});

test('TC_AP_002 - Verify cover note field', async ({ page }) => {

    await page.getByRole('button', {
        name: /apply now/i
    }).first().click();

    const coverNote = page.locator('textarea');

    await coverNote.fill(
        'This is a Playwright automation test cover note.'
    );

    await expect(coverNote)
        .toHaveValue(
            'This is a Playwright automation test cover note.'
        );

});

test('TC_AP_003 - Verify expected salary field', async ({ page }) => {

    await page.getByRole('button', {
        name: /apply now/i
    }).first().click();

    await page.locator('form').getByRole('spinbutton').click();

    await page.locator('form').getByRole('spinbutton').fill('50000');

    await expect(page.locator('form').getByRole('spinbutton'))
        .toHaveValue('50000');

});

test('TC_AP_004 - Verify availability dropdown', async ({ page }) => {

    await page.getByRole('button', {
        name: /apply now/i
    }).first().click();

    const availability =
        page.locator('form').getByRole('combobox');

    await availability.selectOption({
        index: 1
    });

    await expect(availability)
        .not.toHaveValue('');

});

test('TC_AP_005 - Verify Cancel button', async ({ page }) => {

    await page.getByRole('button', {
        name: /apply now/i
    }).first().click();

    const cancelBtn = page.getByRole('button', {
        name: /cancel/i
    });

    await expect(cancelBtn)
        .toBeVisible();

    await cancelBtn.click();

    await expect(
        page.locator('textarea')
    ).not.toBeVisible();

});

test.skip('TC_AP_006 - Verify Submit Application', async () => {

    // Requires clean unapplied job state.
    // Creates persistent application data.

});

test.skip('TC_AP_007 - Verify success message', async () => {

    // Depends on successful application submission.
    // Creates persistent application data.

});

test.skip('TC_AP_008 - Verify Apply button changes after applying', async () => {

    // Depends on successful application submission.
    // Requires fresh unapplied job.

});

});
