import { test, expect } from '@playwright/test';

test.describe('Navigation Links', () => {

    test('TC_LOGIN_012 - Job seeker Forgot Password link', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/forgot password/i).click();

        await expect(page).toHaveURL(/forgot-password/);

    });

    test('TC_LOGIN_013 - Job seeker Create Account link', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/create an account/i).click();

        await expect(page).toHaveURL(/register/);

    });

    test('TC_LOGIN_014 - Navigate to employer login', async ({ page }) => {

        await page.goto('http://localhost:3000/login');

        await page.getByText(/use employer login/i).click();

        await expect(page).toHaveURL(/hr-login/);

    });

    test('TC_EMP_LOGIN_012 - Employer Forgot Password link', async ({ page }) => {

        await page.goto('http://localhost:3000/hr-login');

        await page.getByText(/forgot password/i).click();

        await expect(page).toHaveURL(/forgot-password/);

    });

    test('TC_EMP_LOGIN_013 - Employer Create Account link', async ({ page }) => {

        await page.goto('http://localhost:3000/hr-login');

        await page.getByText(/create an account/i).click();

        await expect(page).toHaveURL(/register/);

    });

    test('TC_EMP_LOGIN_014 - Navigate to candidate login', async ({ page }) => {

        await page.goto('http://localhost:3000/hr-login');

        await page.getByText(/use candidate login/i).click();

        await expect(page).toHaveURL(/login/);

    });

});