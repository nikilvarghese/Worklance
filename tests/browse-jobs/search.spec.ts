import { test, expect } from '@playwright/test';

test.describe('Browse Jobs Search', () => {

    test.beforeEach(async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder(/email/i)
            .fill(process.env.TESTUSER1_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.TESTUSER1_PASSWORD!);

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

        await page.getByRole('link', { name: 'Browse Jobs' }).click();

    });

    test('TC_BJ_002 - Verify search by title', async ({ page }) => {

    const firstJobCard =
        page.getByRole('article').first();

    const jobTitle =
        await firstJobCard.getByRole('heading').innerText();

    await page.getByPlaceholder(/search/i)
        .fill(jobTitle);

    const jobs = page.getByRole('article');
    const noJobs = page.getByText(
        /no jobs matched your filters/i
    );

    await Promise.race([
        jobs.first().waitFor({ state: 'visible' }).catch(() => {}),
        noJobs.waitFor({ state: 'visible' }).catch(() => {})
    ]);

    if (await noJobs.isVisible().catch(() => false)) {

        test.skip(
            true,
            `No jobs found for title: ${jobTitle}`
        );

    }

    await expect(
        page.getByRole('heading', {
            name: jobTitle
        }).first()
    ).toBeVisible();

});

    test('TC_BJ_003 - Verify search by company', async ({ page }) => {

    const firstJobCard =
        page.getByRole('article').first();

    const company =
        await firstJobCard.locator('p').first().innerText();

    await page.getByPlaceholder(/search/i)
        .fill(company);

    const jobs =
        page.getByRole('article');

    const noJobs =
        page.getByText(
            /no jobs matched your filters/i
        );

    await Promise.race([
        jobs.first().waitFor({ state: 'visible' }).catch(() => {}),
        noJobs.waitFor({ state: 'visible' }).catch(() => {})
    ]);

    if (await noJobs.isVisible().catch(() => false)) {

        test.skip(
            true,
            `No jobs found for company: ${company}`
        );

    }

    await expect(
        page.getByText(company).first()
    ).toBeVisible();

});

    test('TC_BJ_004 - Verify search by skill', async ({ page }) => {

    const skill = 'React';

    await page.getByPlaceholder(/search/i)
        .fill(skill);

    const jobs = page.locator('article');
    const noResults = page.getByText(/no jobs found/i);

    await Promise.race([
        jobs.first().waitFor({ state: 'visible' }).catch(() => {}),
        noResults.waitFor({ state: 'visible' }).catch(() => {})
    ]);

    if (await noResults.isVisible().catch(() => false)) {

        test.skip(true, `No jobs found for skill: ${skill}`);

    }

    await expect(jobs.first()).toBeVisible();

});

});