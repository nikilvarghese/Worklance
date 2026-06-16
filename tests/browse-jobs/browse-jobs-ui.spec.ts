import {test, expect } from '@playwright/test';

test.describe('browse-jobs UI',()=> {

    test('TC_BJ_001 - Browse Jobs page loads successfully', async ({ page }) => {

    await page.goto('http://localhost:3000/login');

    await page.getByPlaceholder(/email/i)
        .fill(process.env.TESTUSER1_EMAIL!);

    await page.locator('input[type="password"]')
        .fill(process.env.TESTUSER1_PASSWORD!);

        await page.getByRole('button',
            {name: /sign in as job seeker/i}).click();
        

    await page.getByRole('link', {name: /browse jobs/i}).click();
    await expect(page).toHaveURL(/browse/i);
        });
});