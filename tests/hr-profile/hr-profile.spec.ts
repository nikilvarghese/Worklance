import { test, expect } from '@playwright/test';

test.describe('HR Profile', () => {


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

    test('HR_PRF_001 - Verify Profile page opens successfully', async ({ page }) => {
        /*
        Test Scenario: Verify Profile page opens successfully
        Steps: Login as HR user → Click Profile from sidebar
        Expected Result: Profile page loads successfully with employer information displayed
        */
        await expect(
    page.getByRole('heading').first()
).toBeVisible();

await expect(
    page.getByRole('button', {
        name: /edit profile/i
    })
).toBeVisible();
    });

    test('HR_PRF_002 - Verify Edit Profile form opens successfully', async ({ page }) => {
        /*
        Test Scenario: Verify Edit Profile form opens successfully
        Steps: Open Profile page → Click Edit Profile
        Expected Result: Edit Profile form opens with editable fields
        */
        await page.getByRole('button', { name: 'Edit profile' }).click();
        await expect(page.getByText('Edit company profile')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save profile' })).toBeVisible();
    });

    test('HR_PRF_003 - Verify valid website URL is accepted', async ({ page }) => {
        /*
        Test Scenario: Verify valid website URL is accepted
        Steps: Open Edit Profile → Enter valid website URL → Save changes
        Expected Result: Valid website URL is accepted and profile is updated successfully
        */
        await page.getByRole('button', { name: 'Edit profile' }).click();
        
        const websiteInput = page.locator('label:has-text("Website") input');
        await websiteInput.fill('https://worklance-test.com');
        await page.getByRole('button', { name: 'Save profile' }).click();

        await expect(page.locator('div').filter({ hasText: 'Employer profile updated' }).nth(2)).toBeVisible();
    });

    test('HR_PRF_004 - Verify invalid website URL validation', async ({ page }) => {
        /*
        Test Scenario: Verify invalid website URL validation
        Steps: Open Edit Profile → Enter invalid website URL → Save changes
        Expected Result: Validation message is displayed for invalid website URL
        */
        await page.getByRole('button', { name: 'Edit profile' }).click();
        
        const websiteInput = page.locator('label:has-text("Website") input');
        await websiteInput.fill('invalid-url-format');
        await page.getByRole('button', { name: 'Save profile' }).click();

        await expect(page.getByText('Enter a valid website link (')).toBeVisible();
    });

    test('HR_PRF_005 - Verify company name can be updated successfully', async ({ page }) => {
        /*
        Test Scenario: Verify company name can be updated successfully
        Steps: Open Edit Profile → Update company name → Save changes
        Expected Result: Company name is updated and saved successfully
        */
        await page.getByRole('button', { name: 'Edit profile' }).click();
        
        const companyInput = page.locator('label:has-text("Company *") input');
        await companyInput.fill('Updated Company Name');
        await page.getByRole('button', { name: 'Save profile' }).click();

        await expect(page.locator('div').filter({ hasText: 'Employer profile updated' }).nth(2)).toBeVisible();
        await expect(page.locator('h2', { hasText: 'Updated Company Name' })).toBeVisible();
    });

    test('HR_PRF_006 - Verify designation can be updated successfully', async ({ page }) => {
        /*
        Test Scenario: Verify designation can be updated successfully
        Steps: Open Edit Profile → Update designation → Save changes
        Expected Result: Designation is updated and saved successfully
        */
        await page.getByRole('button', { name: 'Edit profile' }).click();
        
        const designationInput = page.locator('label:has-text("Designation *") input');
        await designationInput.fill('Lead Talent Acquisition');
        await page.getByRole('button', { name: 'Save profile' }).click();

        await expect(page.locator('div').filter({ hasText: 'Employer profile updated' }).nth(2)).toBeVisible();
        await expect(page.getByText('Lead Talent Acquisition')).toBeVisible();
    });

    test('HR_PRF_007 - Verify phone number can be updated successfully', async ({ page }) => {
        /*
        Test Scenario: Verify phone number can be updated successfully
        Steps: Open Edit Profile → Update phone number → Save changes
        Expected Result: Phone number is updated and saved successfully
        */
        await page.getByRole('button', { name: 'Edit profile' }).click();
        
        const phoneInput = page.locator('input[placeholder="Enter phone number"]');
        await phoneInput.fill('9876543210');
        await page.getByRole('button', { name: 'Save profile' }).click();

        await expect(page.locator('div').filter({ hasText: 'Employer profile updated' }).nth(2)).toBeVisible();
    });

    test('HR_PRF_008 - Verify location can be updated successfully', async ({ page }) => {
        /*
        Test Scenario: Verify location can be updated successfully
        Steps: Open Edit Profile → Update location → Save changes
        Expected Result: Location is updated and saved successfully
        */
        await page.getByRole('button', { name: 'Edit profile' }).click();
        
        const locationInput = page.locator('label:has-text("Location *") input');
        await locationInput.fill('Mumbai, India');
        await page.getByRole('button', { name: 'Save profile' }).click();

        await expect(page.locator('div').filter({ hasText: 'Employer profile updated' }).nth(2)).toBeVisible();
        await expect(page.getByText('Mumbai, India')).toBeVisible();
    });

    test('HR_PRF_009 - Verify team size can be updated successfully', async ({ page }) => {
        /*
        Test Scenario: Verify team size can be updated successfully
        Steps: Open Edit Profile → Update team size → Save changes
        Expected Result: Team size is updated and saved successfully
        */
        await page.getByRole('button', { name: 'Edit profile' }).click();
        
        const teamInput = page.locator('label:has-text("Team size") input');
        await teamInput.fill('150');
        await page.getByRole('button', { name: 'Save profile' }).click();

        await expect(page.locator('div').filter({ hasText: 'Employer profile updated' }).nth(2)).toBeVisible();
        await expect(page.getByText('150')).toBeVisible();
    });

    test('HR_PRF_010 - Verify profile changes are saved successfully', async ({ page }) => {
        /*
        Test Scenario: Verify profile changes are saved successfully
        Steps: Update profile information → Click Save Profile
        Expected Result: Success message is displayed and profile changes are saved
        */
        await page.getByRole('button', { name: 'Edit profile' }).click();
        await page.getByRole('button', { name: 'Save profile' }).click();
        await expect(page.locator('div').filter({ hasText: 'Employer profile updated' }).nth(2)).toBeVisible();
    });
});
