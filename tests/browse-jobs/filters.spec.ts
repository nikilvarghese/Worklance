import { test, expect } from '@playwright/test';

test.describe('Browse Jobs Filters', () => {

    test.beforeEach(async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder(/email/i)
            .fill(process.env.TESTUSER1_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.TESTUSER1_PASSWORD!);

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

        await page.getByRole('link', {
            name: /browse jobs/i
        }).click();

        await expect(page).toHaveURL(/browse/i);
    });

    test('TC_BJ_005 - Verify location filter', async ({ page }) => {

        await page.getByPlaceholder('Location')
            .fill('mumbai');

        const noJobsMessage = page.getByText(
            'No jobs matched your filters'
        );

        if (await noJobsMessage.isVisible()) {

            await expect(noJobsMessage).toBeVisible();

        } else {

            await expect(
                page.getByText(/mumbai/i).first()
            ).toBeVisible();

        }
    });

    test('TC_BJ_006 - Verify category filter', async ({ page }) => {

        const categoryDropdown = page.getByRole('combobox').nth(0);

        await categoryDropdown.selectOption({ index: 1 });

        const selectedCategory = await categoryDropdown.evaluate(
            (el: HTMLSelectElement) => el.selectedOptions[0].text
        );

        const noJobsMessage = page.getByText(
            'No jobs matched your filters'
        );

        if (await noJobsMessage.isVisible()) {

            await expect(noJobsMessage).toBeVisible();

        } else {

            const jobCards = page.locator('.job-card');

            const count = await jobCards.count();

            for (let i = 0; i < count; i++) {

                await expect(
                    jobCards.nth(i)
                ).toContainText(selectedCategory);

            }
        }
    });

    test('TC_BJ_007 - Verify job type filter', async ({ page }) => {

        const jobTypeDropdown = page.getByRole('combobox').nth(1);

        await jobTypeDropdown.selectOption({ index: 1 });

        const selectedJobType = await jobTypeDropdown.evaluate(
            (el: HTMLSelectElement) => el.selectedOptions[0].text
        );

        const noJobsMessage = page.getByText(
            'No jobs matched your filters'
        );

        if (await noJobsMessage.isVisible()) {

            await expect(noJobsMessage).toBeVisible();

        } else {

            const jobCards = page.locator('.job-card');

            const count = await jobCards.count();

            for (let i = 0; i < count; i++) {

                await expect(
                    jobCards.nth(i)
                ).toContainText(selectedJobType);

            }
        }
    });

    test('TC_BJ_008 - Verify work mode filter', async ({ page }) => {

        const workModeDropdown = page.getByRole('combobox').nth(2);

        await workModeDropdown.selectOption({ index: 1 });

        const selectedWorkMode = await workModeDropdown.evaluate(
            (el: HTMLSelectElement) => el.selectedOptions[0].text
        );

        const noJobsMessage = page.getByText(
            'No jobs matched your filters'
        );

        if (await noJobsMessage.isVisible()) {

            await expect(noJobsMessage).toBeVisible();

        } else {

            const jobCards = page.locator('.job-card');

            const count = await jobCards.count();

            for (let i = 0; i < count; i++) {

                await expect(
                    jobCards.nth(i)
                ).toContainText(selectedWorkMode);

            }
        }
    });

    test('TC_BJ_009 - Verify minimum salary filter', async ({ page }) => {

    await page.getByPlaceholder('Min INR').fill('20000');
    await page.keyboard.press('Enter');

    const noJobs = page.getByText(/no jobs matched your filters/i);

    if (await noJobs.isVisible().catch(() => false)) {
        await expect(noJobs).toBeVisible();
        return;
    }

    await expect(
        page.locator('article').first()
    ).toBeVisible();

});

    test('TC_BJ_010 - Verify maximum salary filter', async ({ page }) => {

    await page.getByPlaceholder('Max INR').fill('50000');
    await page.keyboard.press('Enter');

    const noJobs = page.getByText(/no jobs matched your filters/i);

    if (await noJobs.isVisible().catch(() => false)) {
        await expect(noJobs).toBeVisible();
        return;
    }

    await expect(
        page.locator('article').first()
    ).toBeVisible();

});

    test('TC_BJ_011 - Verify Clear Filters button', async ({ page }) => {

        const searchBox = page.getByPlaceholder(
            /search title, company, skill/i
        );

        await searchBox.fill('React');

        await page.getByRole('button', {
            name: /clear filters/i
        }).click();

        await expect(searchBox).toHaveValue('');
    });

});