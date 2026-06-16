import { test, expect } from '@playwright/test';

test.describe('Candidate Profile', () => {

    test.beforeEach(async ({ page }) => {
        // Log in as a job seeker
        await page.goto('http://localhost:3000/login');
        await page.getByPlaceholder('Email').fill(process.env.TESTUSER1_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.TESTUSER1_PASSWORD!);
        await page.getByRole('button', { name: /sign in as job seeker/i }).click();
        
        await expect(page).toHaveURL(/dashboard/);
        
        // Navigate to Profile page via sidebar
        await page.getByRole('link', { name: 'Profile' }).click();
        await expect(page).toHaveURL(/profile/);
    });

    test('TC_CP_001 - Verify Profile page opens', async ({ page }) => {

    await expect(
        page.getByText(/profile completion/i)
    ).toBeVisible();

    await expect(
        page.getByRole('button', {
            name: /edit profile/i
        })
    ).toBeVisible();

});

    test('TC_CP_002 - Verify Edit Profile button', async ({ page }) => {
        /*
        Test Scenario: Verify Edit Profile button
        Steps: Click Edit Profile
        Expected Result: Edit Profile modal opens
        */
        await page.getByRole('button', { name: /edit profile/i }).click();
        await expect(page.getByText('Edit candidate profile')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save profile' })).toBeVisible();
    });

    test('TC_CP_003 - Verify mandatory fields validation', async ({ page }) => {
        /*
        Test Scenario: Verify mandatory fields validation
        Steps: Leave required fields blank
        Expected Result: Validation errors displayed
        */
        await page.getByRole('button', { name: /edit profile/i }).click();
        
        // Clear mandatory field (Name)
        const nameField = page.locator('label:has-text("Name *") input');
        await nameField.fill('');
        
        // Try submitting
        await page.getByRole('button', { name: 'Save profile' }).click();

        // Browser HTML5 validation prevents submission or shows tooltip.
        // We can check that the input is in an invalid state or matches `:invalid`
        const isInvalid = await nameField.evaluate((input: HTMLInputElement) => !input.checkValidity());
        expect(isInvalid).toBe(true);
    });

    test('TC_CP_004 - Verify phone number minimum length validation', async ({ page }) => {
        /*
        Test Scenario: Verify phone number minimum length validation
        Steps: Enter short phone number
        Expected Result: Error displayed: Phone number is too short
        */
        await page.getByRole('button', { name: /edit profile/i }).click();
        
        const phoneField = page.locator('input[placeholder="Enter phone number"]');
        await phoneField.fill('123');
        await phoneField.blur();

        // Check validation warning
        await expect(page.getByText(/the phone number is too short|please enter a valid phone number/i)).toBeVisible();
    });

    test('TC_CP_005 - Verify age validation below 18', async ({ page }) => {
        /*
        Test Scenario: Verify age validation below 18
        Steps: Enter DOB below 18 years
        Expected Result: Age validation message displayed
        */
        await page.getByRole('button', { name: /edit profile/i }).click();
        
        const dobField = page.locator('label:has-text("Date of birth *") input');
        // Set date of birth to 5 years ago (under 18)
        const date = new Date();
        date.setFullYear(date.getFullYear() - 5);
        const dateStr = date.toISOString().split('T')[0];
        
        await dobField.fill(dateStr);
        await page.getByRole('button', { name: 'Save profile' }).click();

        // Verify toast error
        await expect(page.getByText(/age must be between 18 and 65/i)).toBeVisible();
    });

    test('TC_CP_006 - Verify age validation above 65', async ({ page }) => {
        /*
        Test Scenario: Verify age validation above 65
        Steps: Enter DOB above 65 years
        Expected Result: Age validation message displayed
        */
        await page.getByRole('button', { name: /edit profile/i }).click();
        
        const dobField = page.locator('label:has-text("Date of birth *") input');
        // Set date of birth to 70 years ago
        const date = new Date();
        date.setFullYear(date.getFullYear() - 70);
        const dateStr = date.toISOString().split('T')[0];
        
        await dobField.fill(dateStr);
        await page.getByRole('button', { name: 'Save profile' }).click();

        // Verify toast error
        await expect(page.getByText(/age must be between 18 and 65/i)).toBeVisible();
    });

    test('TC_CP_007 - Verify valid profile update', async ({ page }) => {
        /*
        Test Scenario: Verify valid profile update
        Steps: Enter valid details and save
        Expected Result: Profile updated successfully
        */
        await page.getByRole('button', { name: /edit profile/i }).click();
        
        const nameField = page.locator('label:has-text("Name *") input');
        await nameField.fill('Test User Name');

        await page.getByRole('button', { name: 'Save profile' }).click();
        
        // Expect success toast
        await expect(page.getByText(/profile updated/i)).toBeVisible();
        await expect(page.locator('h2', { hasText: 'Test User Name' })).toBeVisible();
    });

    test('TC_CP_008 - Verify resume upload', async ({ page }) => {
        /*
        Test Scenario: Verify resume upload
        Steps: Upload resume
        Expected Result: Resume uploaded successfully
        */
        await page.getByRole('button', { name: /edit profile/i }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'resume.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('dummy pdf content')
        });

        await page.getByRole('button', { name: 'Save profile' }).click();
        
        // Expect success toast
        await expect(page.getByText(/profile updated/i)).toBeVisible();
    });

    test('TC_CP_009 - Verify skills field', async ({ page }) => {
    /*
    Test Scenario: Verify skills field
    Steps: Add skills
    Expected Result: Skills saved successfully
    */

    await page.getByRole('button', {
        name: /edit profile/i
    }).click();

    const skillsInput = page.locator(
        'input[placeholder*="Add skill"]'
    );

    await skillsInput.fill('Playwright');
    await skillsInput.press('Enter');

    await page.getByRole('button', {
        name: 'Save profile'
    }).click();

    await expect(
        page.getByText(/profile updated/i)
    ).toBeVisible();

    await expect(
        page.getByText('Playwright', {
            exact: true
        }).first()
    ).toBeVisible();
});

    test('TC_CP_010 - Verify languages field', async ({ page }) => {
    /*
    Test Scenario: Verify languages field
    Steps: Add languages
    Expected Result: Languages saved successfully
    */

    await page.getByRole('button', {
        name: /edit profile/i
    }).click();

    const languageInput = page.locator(
        'input[placeholder*="Add language"]'
    );

    await languageInput.fill('TypeScript');
    await languageInput.press('Enter');

    await page.getByRole('button', {
        name: 'Save profile'
    }).click();

    await expect(
        page.getByText(/profile updated/i)
    ).toBeVisible();

    await expect(
        page.getByText('TypeScript', {
            exact: true
        }).first()
    ).toBeVisible();
});

    test('TC_CP_011 - Verify specialization field', async ({ page }) => {
        /*
        Test Scenario: Verify specialization field
        Steps: Add specialization
        Expected Result: Specialization saved successfully
        */
        await page.getByRole('button', { name: /edit profile/i }).click();
        const specInput = page.locator('input[placeholder*="Add specialization"]');
        await specInput.fill('QA Testing');
        await specInput.press('Enter');

        await page.getByRole('button', { name: 'Save profile' }).click();
        await expect(page.getByText(/profile updated/i)).toBeVisible();
    });

    test('TC_CP_012 - Verify preferred roles field', async ({ page }) => {
    /*
    Test Scenario: Verify preferred roles field
    Steps: Add preferred role
    Expected Result: Preferred role saved successfully
    */

    await page.getByRole('button', {
        name: /edit profile/i
    }).click();

    const roleInput = page.locator(
        'input[placeholder*="Add preferred role"]'
    );

    await roleInput.fill('Automation Engineer');
    await roleInput.press('Enter');

    await page.getByRole('button', {
        name: 'Save profile'
    }).click();

    await expect(
        page.getByText(/profile updated/i)
    ).toBeVisible();

    await expect(
        page.getByText('Automation Engineer', {
            exact: true
        }).first()
    ).toBeVisible();
});

    test('TC_CP_013 - Verify portfolio field', async ({ page }) => {
        /*
        Test Scenario: Verify portfolio field
        Steps: Add portfolio link
        Expected Result: Portfolio saved successfully
        */
        await page.getByRole('button', { name: /edit profile/i }).click();
        const portfolioInput = page.locator('input[placeholder*="Add portfolio"]');
        await portfolioInput.fill('https://github.com/testuser');
        await portfolioInput.press('Enter');

        await page.getByRole('button', { name: 'Save profile' }).click();
        await expect(page.getByText(/profile updated/i)).toBeVisible();
    });

    test('TC_CP_014 - Verify Reset Password button', async ({ page }) => {
        /*
        Test Scenario: Verify Reset Password button
        Steps: Click Reset Password
        Expected Result: Reset Password process initiated
        */
        await page.getByRole('button', { name: /reset password/i }).click();
        // Reset password modal should open
        await expect(page.locator('h3:has-text("Change Password")')).toBeVisible();
    });

    test('TC_CP_015 - Verify Delete Account button', async ({ page }) => {
        /*
        Test Scenario: Verify Delete Account button
        Steps: Click Delete Account
        Expected Result: Delete Account confirmation displayed
        */
        await page.getByRole('button', { name: /delete account/i }).click();
        // Delete account modal should open
        await expect(page.locator('h3:has-text("Delete account")')).toBeVisible();
    });

    test('TC_CP_016 - Verify profile completion percentage updates', async ({ page }) => {
        /*
        Test Scenario: Verify profile completion percentage updates
        Steps: Save profile information
        Expected Result: Completion percentage increases
        */
        const text = await page.getByText(/% complete/i).innerText();
        const initialPercent = parseInt(text.split('%')[0], 10);
        
        // Open edit modal and update headline or another field to trigger completion percentage update
        await page.getByRole('button', { name: /edit profile/i }).click();
        await page.locator('label:has-text("Headline") input').fill('Automated QA Specialist');
        await page.getByRole('button', { name: 'Save profile' }).click();
        
        // Wait for page profile update
        await expect(page.getByText(/profile updated/i)).toBeVisible();
        const updatedText = await page.getByText(/% complete/i).innerText();
        const updatedPercent = parseInt(updatedText.split('%')[0], 10);
        
        expect(updatedPercent).toBeGreaterThanOrEqual(initialPercent);
    });
});
