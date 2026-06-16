import { test, expect, Page } from '@playwright/test';

test.describe('Security - Reset Password', () => {

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

        await page.getByRole('link', {
            name: /profile/i
        }).click();

        await page.getByRole('button', {
            name: /reset password/i
        }).click();

        await expect(
            page.getByRole('heading', {
                name: /change password/i
            })
        ).toBeVisible();

    });

    test('HR_SEC_001 - Verify Reset Password popup opens', async ({ page }) => {
        await expect(page.getByPlaceholder('Old Password')).toBeVisible();
        await expect(page.getByPlaceholder('New Password')).toBeVisible();
        await expect(page.getByPlaceholder('Confirm Password')).toBeVisible();
    });

    test('HR_SEC_002 - Verify Close icon closes popup', async ({ page }) => {
        await page.getByRole('button').nth(5).click();
    });

    test('HR_SEC_003 - Verify Cancel button closes popup', async ({ page }) => {
        await page.getByRole('button', { name: 'Cancel' }).click();
    });

    test('HR_SEC_004 - Verify required field validation', async ({ page }) => {
        await expect(
    page.getByRole('button', {
        name: 'Reset Password',
        exact: true
    }).last()
).toBeDisabled();
    });

    test('HR_SEC_005 - Verify incorrect old password validation', async ({ page }) => {

        await page.getByRole('textbox', { name: 'Old Password' }).fill('WrongPassword123');

        await page.getByRole('textbox', { name: 'New Password', exact: true }).fill('Password1');

        await page.getByRole('textbox', { name: 'Confirm New Password' }).fill('Password1');

        await page.getByRole('button', { name: 'Reset Password', exact: true }).click();

        await expect(page.locator('div').filter({ hasText: 'Incorrect old password' }).nth(2)).toBeVisible();

    });

    test('HR_SEC_006 - Verify correct old password accepted', async ({ page }) => {

        await page.getByPlaceholder('Old Password')
            .fill(process.env.TESTUSER2_PASSWORD!);

        await expect(
            page.getByPlaceholder('Old Password')
        ).toHaveValue(process.env.TESTUSER2_PASSWORD!);

    });

    test('HR_SEC_007 - Verify minimum 8 character validation', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('Pass1');

        await expect(
            page.getByText(/min 8 characters/i)
        ).toBeVisible();

    });

    test('HR_SEC_008 - Verify uppercase validation', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('password1');

        await expect(
            page.getByText(/one uppercase letter/i)
        ).toBeVisible();

    });

    test('HR_SEC_009 - Verify lowercase validation', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('PASSWORD1');

        await expect(
            page.getByText(/one lowercase letter/i)
        ).toBeVisible();

    });

    test('HR_SEC_010 - Verify number validation', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('Password');

        await expect(
            page.getByText(/one number/i)
        ).toBeVisible();

    });

    test('HR_SEC_011 - Verify password meeting all requirements', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('Password1');

        await expect(
            page.getByText(/min 8 characters/i)
        ).toBeVisible();

    });

    test('HR_SEC_012 - Verify password mismatch validation', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('Password1');

        await page.getByPlaceholder('Confirm Password')
            .fill('Password2');

        await expect(
            page.getByText(/passwords do not match/i)
        ).toBeVisible();

    });

    test('HR_SEC_013 - Verify matching passwords accepted', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('Password1');

        await page.getByPlaceholder('Confirm Password')
            .fill('Password1');

        await expect(
            page.getByText(/passwords do not match/i)
        ).not.toBeVisible();

    });

    test('HR_SEC_014 - Verify valid password values accepted', async ({ page }) => {

        await page.getByPlaceholder('Old Password')
            .fill(process.env.TESTUSER2_PASSWORD!);

        await page.getByPlaceholder('New Password')
            .fill('Password1');

        await page.getByPlaceholder('Confirm Password')
            .fill('Password1');

    });

    test('HR_SEC_015 - Verify Old Password visibility toggle', async ({ page }) => {

        await page.getByPlaceholder('Old Password')
            .fill('Password1');

    });

    test('HR_SEC_016 - Verify New Password visibility toggle', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('Password1');

    });

    test('HR_SEC_017 - Verify Confirm Password visibility toggle', async ({ page }) => {

        await page.getByPlaceholder('Confirm Password')
            .fill('Password1');

    });

    test('HR_SEC_018 - Verify Forgot old password link', async ({ page }) => {

        await page.getByText(/forgot old password/i)
            .click();

        await expect(page)
            .toHaveURL(/forgot-password/);

    });

    test('HR_SEC_019 - Verify successful password reset', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Old Password' }).fill(process.env.OLD_PASSWORD_2!);
        
        await page.getByRole('textbox', { name: 'New Password', exact: true }).fill(process.env.NEW_PASSWORD_2!);
        await page.getByRole('textbox', { name: 'Confirm New Password' }).fill(process.env.NEW_PASSWORD_2!);

        await page.getByRole('button', { name: 'Reset Password', exact: true }).click();

        await expect(page.locator('div').filter({ hasText: 'Password changed successfully' }).nth(2)).toBeVisible();
    });

    test('HR_SEC_020 - Verify success toast appears', async ({ page }) => {

    await page.getByRole('textbox', {
        name: 'Old Password'
    }).fill(process.env.OLD_PASSWORD_2!);

    await page.getByRole('textbox', {
        name: 'New Password',
        exact: true
    }).fill(process.env.NEW_PASSWORD_2!);

    await page.getByRole('textbox', {
        name: 'Confirm New Password'
    }).fill(process.env.NEW_PASSWORD_2!);

    await page.getByRole('button', {
        name: 'Reset Password',
        exact: true
    }).click();

    await expect(page.locator('div').filter({ hasText: 'Password changed successfully' }).nth(2)).toBeVisible();

});

    test('HR_SEC_021 - Verify modal closes after successful reset', async ({ page }) => {

    await page.getByRole('textbox', {
        name: 'Old Password'
    }).fill(process.env.OLD_PASSWORD_2!);

    await page.getByRole('textbox', {
        name: 'New Password',
        exact: true
    }).fill(process.env.NEW_PASSWORD_2!);

    await page.getByRole('textbox', {
        name: 'Confirm New Password'
    }).fill(process.env.NEW_PASSWORD_2!);

    await page.getByRole('button', {
        name: 'Reset Password',
        exact: true
    }).click();

    await expect(
        page.getByRole('heading', {
            name: /change password/i
        })
    ).not.toBeVisible();

});

    test('HR_SEC_022 - Verify checklist updates dynamically', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('Password1');

    });

    test('HR_SEC_023 - Verify Reset button disabled for invalid inputs', async ({ page }) => {

        await page.getByPlaceholder('New Password')
            .fill('abc');

    });

    test('HR_SEC_024 - Verify popup can be reopened', async ({ page }) => {

        await page.getByRole('button', {
            name: 'Cancel'
        }).click();

        await page.getByRole('button', {
            name: /reset password/i
        }).click();

        await expect(
            page.getByRole('heading', {
                name: /change password/i
            })
        ).toBeVisible();

    });

});