import { test, expect } from '@playwright/test';

test.describe('Employer Google Signup', () => {

    test('TC_EMP_REG_031 - Google signup button is visible', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await expect(
            page.getByRole('button', {
                name: /google/i
            })
        ).toBeVisible();

    });

    test('TC_EMP_REG_032 - Google signup redirects to Google login page', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

        await page.getByRole('button', {
            name: 'Employer'
        }).click();

        await page.getByRole('button', {
            name: /google/i
        }).click();

        await page.waitForURL(/accounts\.google\.com/, {
            timeout: 10000
        });

        const currentUrl = page.url();

        expect(currentUrl).toContain('accounts.google.com');
        expect(currentUrl).toContain('state=');
        expect(currentUrl).toContain('openid');
        expect(currentUrl).toContain('profile');

    });

});