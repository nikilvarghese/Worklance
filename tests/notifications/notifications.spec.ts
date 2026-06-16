import { test, expect } from '@playwright/test';

test.describe('Notifications', () => {

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

    });

    test('HR_NOTIF_001 - Verify notification panel opens successfully', async ({ page }) => {

        await page.getByRole('button')
            .filter({ has: page.locator('svg') })
            .first()
            .click();

        await expect(
            page.getByText('Notifications')
        ).toBeVisible();

    });

    test('HR_NOTIF_002 - Verify new notification is displayed', async ({ page }) => {

        await page.getByRole('button')
            .filter({ has: page.locator('svg') })
            .first()
            .click();

        const noUpdates = page.getByText(
            /no updates yet/i
        );

        if (await noUpdates.isVisible()) {

            test.skip(
                true,
                'No notifications available'
            );

        }

        await expect(
            page.getByText(/applied for/i).first()
        ).toBeVisible();

    });

    test('HR_NOTIF_003 - Verify notification redirects to relevant page', async ({ page }) => {

        await page.getByRole('button')
            .filter({ has: page.locator('svg') })
            .first()
            .click();

        const noUpdates = page.getByText(
            /no updates yet/i
        );

        if (await noUpdates.isVisible()) {

            test.skip(
                true,
                'No notifications available'
            );

        }

        await page.getByText(/applied for/i)
            .first()
            .click();

        await expect(page)
            .not.toHaveURL(/hr-dashboard/);

    });

    test('HR_NOTIF_004 - Verify unread notification indicator displays', async ({ page }) => {

        const bellButton = page.getByRole('button')
            .filter({ has: page.locator('svg') })
            .first();

        await expect(bellButton)
            .toBeVisible();

        await bellButton.click();

        const noUpdates = page.getByText(
            /no updates yet/i
        );

        if (await noUpdates.isVisible()) {

            test.skip(
                true,
                'No notifications available'
            );

        }

        await expect(
            page.getByText(/applied for/i).first()
        ).toBeVisible();

    });

    test('HR_NOTIF_005 - Verify notifications persist after page refresh', async ({ page }) => {

    const bell = page.getByRole('button')
        .filter({ has: page.locator('svg') })
        .first();

    await bell.click();

    const notifications = page.locator('.notification-item'); // use your actual selector

    const countBefore = await notifications.count();

    if (countBefore === 0) {
        test.skip(true, 'No notifications available');
    }

    await page.reload();
    await page.waitForLoadState('networkidle');

    await bell.click();

    await expect(notifications.first()).toBeVisible();

    const countAfter = await notifications.count();

    expect(countAfter).toBeGreaterThan(0);
});

    test('HR_NOTIF_006 - Verify Clear All confirmation dialog opens', async ({ page }) => {

        await page.getByRole('button')
            .filter({ has: page.locator('svg') })
            .first()
            .click();

        const clearAll = page.getByText(
            'Clear All'
        );

        if (!(await clearAll.isVisible())) {

            test.skip(
                true,
                'No notifications available'
            );

        }

        await page.getByRole('button', { name: 'Clear All' }).click();
  await expect(page.getByText('Clear all notifications?YesNo')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'No', exact: true })).toBeVisible();

    });

    test('HR_NOTIF_007 - Verify No button cancels Clear All', async ({ page }) => {

    await page.getByRole('button')
        .filter({ has: page.locator('svg') })
        .first()
        .click();

    const clearAll = page.getByText('Clear All');

    if (await clearAll.count() === 0) {

        test.skip(
            true,
            'No notifications available'
        );

    }

    await clearAll.click();

    await expect(
        page.getByText(/clear all notifications/i)
    ).toBeVisible();

    await page.getByRole('button', {
        name: /^No$/
    }).last().click();

    await expect(
        page.getByText(/clear all notifications/i)
    ).not.toBeVisible();

});

    test('HR_NOTIF_008 - Verify Yes button clears notifications', async ({ page }) => {

        await page.getByRole('button')
            .filter({ has: page.locator('svg') })
            .first()
            .click();

        const clearAll = page.getByText(
            'Clear All'
        );

        if (!(await clearAll.isVisible())) {

            test.skip(
                true,
                'No notifications available'
            );

        }

        await clearAll.click();

        await page.getByRole('button', {
            name: 'Yes'
        }).click();

        await expect(
            page.getByText(/no updates yet/i)
        ).toBeVisible();

    });

});