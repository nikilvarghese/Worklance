import { test, expect } from '@playwright/test';

test.describe('Employer Password Visibility', () => {

    test('TC_EMP_REG_029 - Verify password visibility toggle', async ({ page }) => {

        await page.goto('http://localhost:3000/register');

         await page.getByRole('button', { name: 'Employer' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Nikiledwin1');
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await expect(page.getByRole('textbox', { name: '••••••••' })).toBeVisible();
    });

});