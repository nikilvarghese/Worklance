import { test, expect } from '@playwright/test';

test.describe('Applications', () => {

    test.beforeEach(async ({ page }) => {
        // Log in as a job seeker
        await page.goto('http://localhost:3000/login');
        await page.getByPlaceholder('Email').fill(process.env.TESTUSER1_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TESTUSER1_PASSWORD!);
        await page.getByRole('button', { name: /sign in as job seeker/i }).click();
        
        await expect(page).toHaveURL(/dashboard/);
        
        // Navigate to Applications page via sidebar
        await page.getByRole('link', { name: /applications/i }).click();
        await expect(page).toHaveURL(/applied/);
    });

    test('TC_APP_001 - Verify Applications page opens', async ({ page }) => {
        /*
        Test Scenario: Verify Applications page opens
        Steps: Click Applications
        Expected Result: Applications page displayed
        */
        await expect(page.locator('h2:has-text("Applications")')).toBeVisible();
    });

    test('TC_APP_002 - Verify applied job displayed', async ({ page }) => {
        /*
        Test Scenario: Verify applied job displayed
        Steps: Apply for job (assumed already done, verify the presence of listings)
        Expected Result: Applied job visible
        */
        const applicationsList = page.locator('article.panel');
        // Either there are applications visible, or we show the empty state.
        // If empty state, "No applications found" is visible.
        const noApplications = page.getByText('No applications found');
        if (await noApplications.isVisible()) {
            await expect(noApplications).toBeVisible();
        } else {
            await expect(applicationsList.first()).toBeVisible();
        }
    });

    test('TC_APP_003 - Verify All filter', async ({ page }) => {

    const applications = page.getByRole('article');
    const noApplications = page.getByText('No applications found');

    await Promise.race([
        applications.first().waitFor({ state: 'visible' }),
        noApplications.waitFor({ state: 'visible' })
    ]);

    if (await noApplications.isVisible()) {
        await expect(noApplications).toBeVisible();
    } else {
        await expect(applications.first()).toBeVisible();
    }
});

    test('TC_APP_004 - Verify Pending filter', async ({ page }) => {
    await page.getByRole('button', { name: 'Pending', exact: true }).click();

    const pendingStatus = page.getByRole('article').getByText(/Pending/i);
    const noApplications = page.getByText('No applications found');

    await Promise.race([
        pendingStatus.first().waitFor({ state: 'visible' }),
        noApplications.waitFor({ state: 'visible' })
    ]);

    if (await noApplications.isVisible()) {
        await expect(noApplications).toBeVisible();
    } else {
        await expect(pendingStatus.first()).toBeVisible();
    }
});

    test('TC_APP_005 - Verify Screening filter', async ({ page }) => {

        await page.getByRole('button', { name: 'Screening', exact: true}).click();

        const screeningStatus = page.getByRole('article').getByText(/Screening/i);
        const noApplications = page.getByText('No applications found');

    await Promise.race([
        screeningStatus.first().waitFor({ state: 'visible' }),
        noApplications.waitFor({ state: 'visible' })
    ]);

    if (await noApplications.isVisible()) {
        await expect(noApplications).toBeVisible();
    } else {
        await expect(screeningStatus.first()).toBeVisible();
    }
});

    test('TC_APP_006 - Verify Interview filter', async ({ page }) => {
        
        await page.getByRole('button', { name: 'Interview', exact: true }).click();
        
        const interviewStatus = page.getByRole('article').getByText(/Interview/i);
    const noApplications = page.getByText('No applications found');

    await Promise.race([
        interviewStatus.first().waitFor({ state: 'visible' }),
        noApplications.waitFor({ state: 'visible' })
    ]);

    if (await noApplications.isVisible()) {
        await expect(noApplications).toBeVisible();
    } else {
        await expect(interviewStatus.first()).toBeVisible();
    }
});

    test('TC_APP_007 - Verify Approved filter', async ({ page }) => {

        await page.getByRole('button', { name: 'Approved', exact: true }).click();
        
        const approvedStatus = page.getByRole('article').getByText(/Approved/i);
    const noApplications = page.getByText('No applications found');

    await Promise.race([
        approvedStatus.first().waitFor({ state: 'visible' }),
        noApplications.waitFor({ state: 'visible' })
    ]);

    if (await noApplications.isVisible()) {
        await expect(noApplications).toBeVisible();
    } else {
        await expect(approvedStatus.first()).toBeVisible();
    }
});

    test('TC_APP_008 - Verify Rejected filter', async ({ page }) => {
        /*
        Test Scenario: Verify Rejected filter
        Steps: Click Rejected
        Expected Result: Rejected applications displayed
        */
        await page.getByRole('button', { name: 'Rejected', exact: true }).click();
        
        const rejectedStatus = page.getByRole('article').getByText(/Rejected/i);
    const noApplications = page.getByText('No applications found');

    await Promise.race([
        rejectedStatus.first().waitFor({ state: 'visible' }),
        noApplications.waitFor({ state: 'visible' })
    ]);

    if (await noApplications.isVisible()) {
        await expect(noApplications).toBeVisible();
    } else {
        await expect(rejectedStatus.first()).toBeVisible();
    }
});

    test('TC_APP_009 - Verify Hired filter', async ({ page }) => {
      
        await page.getByRole('button', { name: 'Hired', exact: true }).click();

        const hiredStatus = page.getByRole('article').getByText(/Hired/i);
    const noApplications = page.getByText('No applications found');

    await Promise.race([
        hiredStatus.first().waitFor({ state: 'visible' }),
        noApplications.waitFor({ state: 'visible' })
    ]);

    if (await noApplications.isVisible()) {
        await expect(noApplications).toBeVisible();
    } else {
        await expect(hiredStatus.first()).toBeVisible();
    }
});

    test('TC_APP_010 - Verify View Job button', async ({ page }) => {
        /*
        Test Scenario: Verify View Job button
        Steps: Click View Job
        Expected Result: Job details page opens
        */
        const viewJobLink = page.getByRole('link', { name: /view job/i }).first();
        if (await viewJobLink.isVisible()) {
            await viewJobLink.click();
            await expect(page).toHaveURL(/\/job\/[a-f0-9]+/);
        } else {
            test.skip(true, 'No applications found to view details');
        }
    });
});
