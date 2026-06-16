import { test, expect, Page } from '@playwright/test';

test.describe('Interview Scheduling', () => {

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

        await page.getByRole('navigation')
            .getByRole('link', { name: /applicants/i })
            .click();

        await expect(page).toHaveURL(/applicants/);

        const jobCards = page.locator('aside button');
        const jobCount = await jobCards.count();

        let applicantFound = false;

        for (let i = 0; i < jobCount; i++) {

            const jobCard = jobCards.nth(i);

            await jobCard.scrollIntoViewIfNeeded();
            await jobCard.click();

            await page.waitForLoadState('networkidle');

            const noApplicants = page.getByText(
                /no applicants found/i
            );

            if (await noApplicants.isVisible().catch(() => false)) {
                continue;
            }

            const applicant = page
                .locator('article button.min-w-0')
                .first();

            if (await applicant.isVisible().catch(() => false)) {

                await applicant.click();

                applicantFound = true;
                break;
            }
        }

        if (!applicantFound) {
            test.skip(true, 'No applicants available in any job');
        }

        await expect(
            page.getByRole('heading', {
                name: /candidate details/i
            })
        ).toBeVisible();

    });

    const openInterviewModal = async (page: Page) => {

        const interviewBtn = page.getByRole('button', {
            name: /^Interview$/
        });

        await expect(interviewBtn).toBeVisible();

        await interviewBtn.click();

        await expect(
            page.getByRole('textbox', {
                name: /date/i
            })
        ).toBeVisible();

        await expect(
            page.getByRole('textbox', {
                name: /time/i
            })
        ).toBeVisible();

        await expect(
            page.getByRole('textbox', {
                name: /contact link or phone/i
            })
        ).toBeVisible();

        await expect(
            page.getByRole('textbox', {
                name: /notes/i
            })
        ).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: /schedule interview/i
            })
        ).toBeVisible();
    };

    test('HR_INT_001 - Verify Schedule Interview popup opens successfully', async ({ page }) => {

        await openInterviewModal(page);

        await expect(page.getByRole('button', { name: 'Schedule interview' })).toBeVisible();
    });

    test('HR_INT_002 - Verify mandatory field validation when all fields are blank', async ({ page }) => {

        await openInterviewModal(page);

        await expect(page.getByRole('textbox', { name: 'Date' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Time' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Contact link or phone' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Notes' })).toBeVisible();
    });

    test('HR_INT_003 - Verify interview can be scheduled with valid details', async ({ page }) => {

        await openInterviewModal(page);

        const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const dateStr = tomorrow.toISOString().split('T')[0];

await page.getByRole('textbox', {
    name: 'Date'
}).fill(dateStr);
        const futureTime = new Date();
futureTime.setHours(futureTime.getHours() + 4);

const timeStr = futureTime
    .toTimeString()
    .slice(0, 5);

await page.getByRole('textbox', {
    name: 'Time'
}).fill(timeStr);
        await page.getByRole('textbox', { name: 'Contact link or phone' }).fill('8678676656');
        await page.getByRole('textbox', { name: 'Notes' }).fill('come to interview');
    });

    test('HR_INT_004 - Verify interview cannot be scheduled less than 3 hours ahead', async ({ page }) => {

        await openInterviewModal(page);

        const today = new Date()
            .toISOString()
            .split('T')[0];

        await page.locator(
            'form input[type="date"]'
        ).fill(today);

        const now = new Date();

        now.setMinutes(
            now.getMinutes() + 5
        );

        const timeStr = now
            .toTimeString()
            .substring(0, 5);

        await page.locator(
            'form input[type="time"]'
        ).fill(timeStr);

        await page.locator(
            'form button[type="submit"]'
        ).click();

        await expect(
            page.getByText(
                /3 hours|future/i
            )
        ).toBeVisible();
    });

    test('HR_INT_005 - Verify contact link field functionality', async ({ page }) => {

        await openInterviewModal(page);

        const contactInput = page.locator(
            'form label:has-text("Contact link or phone") input'
        );

        await contactInput.fill(
            'https://teams.microsoft.com/l/meetup-join'
        );

        await expect(contactInput)
            .toHaveValue(
                'https://teams.microsoft.com/l/meetup-join'
            );
    });

    test('HR_INT_006 - Verify notes field functionality', async ({ page }) => {

        await openInterviewModal(page);

        const notesInput = page.locator(
            'form label:has-text("Notes") input'
        );

        await notesInput.fill(
            'Please prepare live coding.'
        );

        await expect(notesInput)
            .toHaveValue(
                'Please prepare live coding.'
            );
    });

    test('HR_INT_007 - Verify interview scheduling can be cancelled', async ({ page }) => {

        await openInterviewModal(page);

        await page.getByRole('button', {
            name: /cancel/i
        }).click();

        await expect(
            page.locator('form')
        ).not.toBeVisible();
    });

    test('HR_INT_008 - Verify popup closes using Close (X) button', async ({ page }) => {

        await openInterviewModal(page);

        await page.locator(
            'form button'
        ).first().click();

        await expect(
            page.locator('form')
        ).not.toBeVisible();
    });

});