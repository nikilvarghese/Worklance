import 'dotenv/config';
import { test, expect } from '@playwright/test';

test.describe('Login Authentication', () => {

    test('TC_LOGIN_006 - Job seeker successful login', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder('Email')
            .fill(process.env.TESTUSER1_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.TESTUSER1_PASSWORD!);

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

        await expect(page).not.toHaveURL(/dashboard/);
    });

    test('TC_LOGIN_007 - Job seeker incorrect password', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder('Email')
            .fill(process.env.TESTUSER1_EMAIL!);

        await page.locator('input[type="password"]')
            .fill('WrongPassword123');

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

        await expect(
            page.getByText(/incorrect password|invalid credentials/i)
        ).toBeVisible();
    });

    test('TC_LOGIN_008 - Job seeker unregistered account', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByPlaceholder('Email')
            .fill('notregistered123@gmail.com');

        await page.locator('input[type="password"]')
            .fill('Password123');

        await page.getByRole('button', {
            name: /sign in as job seeker/i
        }).click();

        await expect(
            page.getByText(/account not found|register first/i)
        ).toBeVisible();
    });

    test('TC_EMP_LOGIN_006 - Employer successful login', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/use employer login/i).click();

        await page.getByPlaceholder('Work email')
            .fill(process.env.TESTUSER2_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.TESTUSER2_PASSWORD!);

        await page.getByRole('button', {
            name: /sign in as employer/i
        }).click();

        await expect(page).not.toHaveURL(/dashboard/);
    });

    test('TC_EMP_LOGIN_007 - Employer incorrect password', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/use employer login/i).click();

        await page.getByPlaceholder('Work email')
            .fill(process.env.TESTUSER2_EMAIL!);

        await page.locator('input[type="password"]')
            .fill('WrongPassword123');

        await page.getByRole('button', {
            name: /sign in as employer/i
        }).click();

        await expect(
            page.getByText(/incorrect password|invalid credentials/i)
        ).toBeVisible();
    });

    test('TC_EMP_LOGIN_008 - Employer unregistered account', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/use employer login/i).click();

        await page.getByPlaceholder('Work email')
            .fill('notregistered123@gmail.com');

        await page.locator('input[type="password"]')
            .fill('Password123');

        await page.getByRole('button', {
            name: /sign in as employer/i
        }).click();

        await expect(
            page.getByText(/account not found|register first/i)
        ).toBeVisible();
    });

});