import { test, expect } from '@playwright/test';

test.describe('Registration UI', () => {

  test('TC_JS_REG_001 - Job Seeker tab selected', async ({ page }) => {

    await page.goto('http://localhost:3000/register');

    const jobSeekerTab = page.getByRole('button', {
      name: 'Job seeker'
    });

    await expect(jobSeekerTab).toHaveClass(
      /bg-white/
    );

  });

  test('TC_JS_REG_003 - Create Account disabled initially', async ({ page }) => {
    await page.goto('http://localhost:3000/register');

    const createAccountButton = page.getByRole('button', {
      name: 'Create Account'
    });

    await expect(createAccountButton).toBeDisabled();
  });

});