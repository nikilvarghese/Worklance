import { test, expect } from '@playwright/test';

test.describe('Email Validation', () => {

    test('TC_LOGIN_003 - Job seeker email without @ symbol', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder('Email')
            .fill('testgmail.com');

        await page.locator('input[type="password"]')
            .fill('Password123');

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

        await expect(page.getByPlaceholder('Email'))
            .toBeVisible();
    });

    test('TC_LOGIN_004 - Job seeker email without domain', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder('Email')
            .fill('test@');

        await page.locator('input[type="password"]')
            .fill('Password123');

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

        await expect(page.getByPlaceholder('Email'))
            .toBeVisible();
    });

    test('TC_LOGIN_005 - Job seeker invalid email format', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder('Email')
            .fill('abc');

        await page.locator('input[type="password"]')
            .fill('Password123');

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

        await expect(page.getByPlaceholder('Email'))
            .toBeVisible();
    });

    test('TC_EMP_LOGIN_003 - Employer email without @ symbol', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/use employer login/i).click();

        await page.getByPlaceholder('Work email')
            .fill('testgmail.com');

        await page.locator('input[type="password"]')
            .fill('Password123');

        await page.getByRole('button', {
            name: /sign in as employer/i
        }).click();

        await expect(page.getByPlaceholder('Work email'))
            .toBeVisible();
    });

    test('TC_EMP_LOGIN_004 - Employer email without domain', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/use employer login/i).click();

        await page.getByPlaceholder('Work email')
            .fill('test@');

        await page.locator('input[type="password"]')
            .fill('Password123');

        await page.getByRole('button', {
            name: /sign in as employer/i
        }).click();

        await expect(page.getByPlaceholder('Work email'))
            .toBeVisible();
    });

    test('TC_EMP_LOGIN_005 - Employer invalid email format', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/use employer login/i).click();

        await page.getByPlaceholder('Work email')
            .fill('abc');

        await page.locator('input[type="password"]')
            .fill('Password123');

        await page.getByRole('button', {
            name: /sign in as employer/i
        }).click();

        await expect(page.getByPlaceholder('Work email'))
            .toBeVisible();
    });

});