import { test, expect,  Page} from '@playwright/test';

test.describe('HR Delete Account', () => {


    test.beforeEach(async ({ page }) => {
        // Log in as employer
        await page.goto('http://localhost:3000/hr-login');
        await page.getByPlaceholder('Work email').fill(process.env.TESTUSER2_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TESTUSER2_PASSWORD!);
        await page.getByRole('button', { name: /sign in as employer/i }).click();

        await expect(page).toHaveURL(/hr-dashboard/);

        // Go to HR Profile page
        await page.getByRole('link', { name: /profile/i }).click();
        await expect(page).toHaveURL(/hr-profile/);
    });

    const openDeleteModal = async (page:Page) => {
        await page.getByRole('button', { name: /delete account/i }).click();
        await expect(page.locator('h3:has-text("Delete account")')).toBeVisible();
    };

    test('HR_DEL_001 - Verify Delete Account popup opens successfully', async ({ page }) => {
        /*
        Test Scenario: Verify Delete Account popup opens successfully
        Steps: Open Profile page → Click Delete Account
        Expected Result: Delete Account popup opens with password field and action buttons visible
        */
        await openDeleteModal(page);
        await expect(page.locator('input[placeholder="••••••••"]')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
        await expect(page.locator('form').getByRole('button', { name: 'Delete account' })).toBeVisible();
    });

    test('HR_DEL_002 - Verify popup closes using Close icon', async ({ page }) => {
        /*
        Test Scenario: Verify popup closes using Close icon
        Steps: Open Delete Account popup → Click X icon
        Expected Result: Delete Account popup closes successfully
        */
        await openDeleteModal(page);
        await page.getByLabel('Close modal').click();
        await expect(page.locator('h3:has-text("Delete account")')).not.toBeVisible();
    });

    test('HR_DEL_003 - Verify popup closes using Cancel button', async ({ page }) => {
        /*
        Test Scenario: Verify popup closes using Cancel button
        Steps: Open Delete Account popup → Click Cancel
        Expected Result: Delete Account popup closes successfully
        */
        await openDeleteModal(page);
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.locator('h3:has-text("Delete account")')).not.toBeVisible();
    });

    test('HR_DEL_004 - Verify required password validation', async ({ page }) => {
        /*
        Test Scenario: Verify required password validation
        Steps: Open Delete Account popup → Leave password field blank → Click Delete Account
        Expected Result: Required field validation message is displayed
        */
        await openDeleteModal(page);
        const passInput = page.locator('input[placeholder="••••••••"]');
        await passInput.fill('');
        
        // Button should be disabled or HTML5 validator prevents submit
        const deleteBtn = page.locator('form').getByRole('button', {
    name: 'Delete account'
});

await expect(deleteBtn).toBeDisabled();
    });

    test('HR_DEL_005 - Verify incorrect password validation', async ({ page }) => {
        /*
        Test Scenario: Verify incorrect password validation
        Steps: Enter incorrect password → Click Delete Account
        Expected Result: Error message displayed for incorrect password
        */
        await openDeleteModal(page);
         await page.getByRole('textbox', { name: '••••••••' }).fill('WrongPassword123');
  await page.locator('form').getByRole('button', { name: 'Delete account' }).click();
  await expect(page.locator('div').filter({ hasText: 'Incorrect password. Account' }).nth(2)).toBeVisible();
    });

    test('HR_DEL_006 - Verify correct password validation', async ({ page }) => {
        /*
        Test Scenario: Verify correct password validation
        Steps: Enter valid account password
        Expected Result: System accepts password and allows account deletion request
        */
        await openDeleteModal(page);
        const passInput = page.locator('input[placeholder="••••••••"]');
        await passInput.fill(process.env.TESTUSER2_PASSWORD!);
        
        // The delete button should be enabled
        await expect(page.locator('form').getByRole('button', { name: 'Delete account' })).toBeEnabled();
    });

    test('HR_DEL_007 - Verify Show Password functionality', async ({ page }) => {
        /*
        Test Scenario: Verify Show Password functionality
        Steps: Enter password → Click Show Password icon
        Expected Result: Password becomes visible
        */
        await openDeleteModal(page);
        const passInput = page.locator('input[placeholder="••••••••"]');
        await passInput.fill('TempPass123');
        
        await expect(passInput).toHaveAttribute('type', 'password');
        await page.getByRole('button', { name: 'Show' }).click();
        await expect(passInput).toHaveAttribute('type', 'text');
    });

    test('HR_DEL_008 - Verify Hide Password functionality', async ({ page }) => {
        /*
        Test Scenario: Verify Hide Password functionality
        Steps: Click Hide Password icon after showing password
        Expected Result: Password becomes masked
        */
        await openDeleteModal(page);
        const passInput = page.locator('input[placeholder="••••••••"]');
        await passInput.fill('TempPass123');

        await page.getByRole('button', { name: 'Show' }).click();
        await page.getByRole('button', { name: 'Hide' }).click();
        await expect(passInput).toHaveAttribute('type', 'password');
    });

    test.skip('HR_DEL_009 - Verify account deletion with valid password', async ({ page }) => {
        // Skip: Account deletion permanently destroys the seed credentials for subsequent test runs
    });

    test.skip('HR_DEL_010 - Verify success message after account deletion', async ({ page }) => {
        // Skip: Account deletion permanently destroys the seed credentials
    });

    test.skip('HR_DEL_011 - Verify automatic logout after account deletion', async ({ page }) => {
        // Skip: Account deletion permanently destroys the seed credentials
    });

    test.skip('HR_DEL_012 - Verify deleted account cannot log in', async ({ page }) => {
        // Skip: Account deletion permanently destroys the seed credentials
    });

    test.skip('HR_DEL_013 - Verify protected pages are inaccessible after deletion', async ({ page }) => {
        // Skip: Account deletion permanently destroys the seed credentials
    });

    test.skip('HR_DEL_014 - Verify session invalidation after browser refresh', async ({ page }) => {
        // Skip: Account deletion permanently destroys the seed credentials
    });

    test.skip('HR_DEL_015 - Verify browser Back button cannot restore deleted session', async ({ page }) => {
        // Skip: Account deletion permanently destroys the seed credentials
    });

    test.skip('HR_DEL_016 - Verify deletion behavior with active applications/jobs', async ({ page }) => {
        // Skip: Account deletion permanently destroys the seed credentials
    });

    test('HR_DEL_017 - Verify protection against SQL/script injection in password field', async ({ page }) => {
        /*
        Test Scenario: Verify protection against SQL/script injection in password field
        Steps: Enter SQL/script payload in password field → Click Delete Account
        Expected Result: Input is safely handled and no security issue occurs
        */
        await openDeleteModal(page);
        await page.locator('input[placeholder="••••••••"]').fill("' OR '1'='1");
        await page.locator('form').getByRole('button', { name: 'Delete account' }).click();
        
         await expect(page.locator('div').filter({ hasText: 'Incorrect password. Account' }).nth(2)).toBeVisible();
    });

    test('HR_DEL_018 - Verify handling of extremely long password input', async ({ page }) => {
        /*
        Test Scenario: Verify handling of extremely long password input
        Steps: Enter excessively long password string → Click Delete Account
        Expected Result: Validation is handled safely without application failure
        */
        await openDeleteModal(page);
        const longPassword = 'a'.repeat(500);
        await page.locator('input[placeholder="••••••••"]').fill(longPassword);
        await page.locator('form').getByRole('button', { name: 'Delete account' }).click();
        
        await expect(page.locator('div').filter({ hasText: 'Incorrect password. Account' }).nth(2)).toBeVisible();
    });
});
