import { test, expect } from '@playwright/test';

test.describe('Google Login', () => {

    test('TC_LOGIN_010 - Job seeker Google login button visible', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await expect(
            page.getByLabel('Continue with Google')
        ).toBeVisible();

    });

    test('TC_LOGIN_011 - Job seeker Google login redirect', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByLabel('Continue with Google').click();

        await page.waitForURL(/accounts\.google\.com/);

        await expect(page).toHaveURL(/accounts\.google\.com/);

    });

    test('TC_EMP_LOGIN_010 - Employer Google login button visible', async ({ page }) => {

        await page.goto('http://localhost:3000/hr-login');

        await expect(
            page.getByLabel('Continue with Google')
        ).toBeVisible();

    });

    test('TC_EMP_LOGIN_011 - Employer Google login redirect', async ({ page }) => {

        await page.goto('http://localhost:3000/hr-login');

        await page.getByLabel('Continue with Google').click();

        await page.waitForURL(/accounts\.google\.com/);

        await expect(page).toHaveURL(/accounts\.google\.com/);

    });

});