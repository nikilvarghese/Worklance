import 'dotenv/config';
import { test, expect } from '@playwright/test';

test.describe('Job Details', () => {

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

test('TC_JD_001 - Verify Job Details page opens', async ({ page }) => {

    await page.locator('article')
        .first()
        .getByRole('link', {
            name: /view details/i
        })
        .click();

    await expect(page).toHaveURL(/job/i);

    await expect(
        page.getByText(/job description/i)
    ).toBeVisible();

});

test('TC_JD_002 - Verify job information displayed', async ({ page }) => {

    await page.locator('article')
        .first()
        .getByRole('link', {
            name: /view details/i
        })
        .click();

    await expect(
        page.getByText(/job description/i)
    ).toBeVisible();

    await expect(
        page.getByText(/role overview/i)
    ).toBeVisible();

    await expect(
        page.getByText(/inr/i)
    ).toBeVisible();

});

test('TC_JD_003 - Verify Apply Now button visibility', async ({ page }) => {

    await page.locator('article')
        .first()
        .getByRole('link', {
            name: /view details/i
        })
        .click();

    const applyNow = page.getByRole('link', {
        name: /apply now/i
    });

    const applied = page.getByRole('link', {
        name: /applied/i
    });

    await expect(
        applyNow.or(applied)
    ).toBeVisible();

});

test.skip('TC_JD_004 - Verify incomplete profile blocks application', async () => {

    // Requires incomplete profile state.
    // Cannot be reliably automated using existing test account.

});

test.skip('TC_JD_005 - Verify Complete Profile button functionality', async () => {

    // Depends on incomplete profile warning state.
    // Cannot be reliably automated using existing test account.

});

test('TC_JD_006 - Verify Apply Now with completed profile', async ({ page }) => {

    const cards = page.locator('article');
    const count = await cards.count();

    let found = false;

    for (let i = 0; i < count; i++) {

        const card = cards.nth(i);

        const applyBtn = card.getByRole('button', {
            name: /apply now/i
        });

        if (await applyBtn.count() > 0) {

            await card.getByRole('link', {
                name: /view details/i
            }).click();

            found = true;
            break;
        }
    }

    if (!found) {
        test.skip(true, 'No jobs available for application');
    }

    await page.getByRole('button', {
        name: /apply now/i
    }).click();

    await expect(
        page.getByRole('heading', {
            name: /apply for this role/i
        })
    ).toBeVisible();

});
});
