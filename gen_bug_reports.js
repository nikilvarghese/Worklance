const fs = require('fs');
const path = 'd:/worklance/bug_reports.csv';
const rows = [
  ['Bug ID','Bug Title','Module/Page','Environment','Preconditions','Steps to Reproduce','Expected Result','Actual Result','Severity','Priority','Reproducibility','Status','Fix Status','Screenshot/Video Evidence','Notes'],
  ['BUG-001','Login fails with 500 on invalid OTP','Auth / Reset Password','Windows, Chrome, Staging','User account exists, valid email, OTP flow enabled','1. Request password reset. 2. Enter email and submit. 3. Enter expired/invalid OTP. 4. Submit OTP.','System displays validation error ("Invalid or expired OTP") and allows retry.','Server returns HTTP 500 and generic error page; user can\'t retry.','High','High','Sometimes','Open','Unfixed','N/A','Assume OTP expiry handling bug in Otp model or authController when verifying invalid tokens.'],
  ['BUG-002','Save Job action duplicates entry in Saved list','Job Details / Saved Jobs','Windows, Chrome, Staging','User logged in; job not yet saved','1. Open a job details page. 2. Click Save Job twice quickly. 3. Go to Saved Jobs page.','Job appears once in Saved list; second click is disabled while request pending.','Job appears twice in Saved list (duplicate entries).','Medium','Medium','Always','Open','Unfixed','N/A','Likely missing client-side debounce or server-side idempotency check on SavedJob creation.'],
  ['BUG-003','Search filters reset after pagination','Browse Jobs / Search','Windows, Firefox, Staging','Multiple filters applied (location, salary); results >1 page','1. Apply filters. 2. Click to go to page 2 of results.','Filters remain applied while paginating and results reflect same filters.','Filters reset to defaults and user sees unfiltered results.','Medium','High','Sometimes','Open','Unfixed','N/A','Assume front-end routing loses query params when changing pages.'],
  ['BUG-004','Applying to job shows Application submitted but status not updated','Job Application / Candidate Dashboard','Windows, Edge, Prod','User logged in as candidate; job accepts applications','1. Click Apply on a job. 2. Fill form and submit. 3. View candidate dashboard.','Application status shows Applied and application appears in dashboard.','UI shows success toast but dashboard still shows no application.','High','High','Sometimes','Open','Unfixed','N/A','Possible backend transaction not persisting Application record or frontend caching issue.'],
  ['BUG-005','Employer cannot access applicant details (403) despite being owner','Employer Dashboard / Applicant Profile','macOS, Safari, Staging','Employer owner of job posting; logged in as employer','1. Navigate to employer dashboard. 2. Open applicant for own job.','Employer can view full applicant profile.','Access denied (HTTP 403) on applicant profile endpoint.','High','Critical','Sometimes','Open','Unfixed','N/A','Potential RBAC middleware mis-evaluating owner role.'],
  ['BUG-006','Job description renders raw HTML (XSS risk)','Job Details','Windows, Chrome, Prod','Job posted with HTML in description (rich text)','1. Open job with HTML in description.','HTML sanitized and rendered safely; no active scripts execute.','Raw HTML including script tags renders and may execute.','Critical','Critical','Rare','Open','Unfixed','N/A','Assume missing sanitization for job descriptions.'],
  ['BUG-007','Profile picture upload fails for large files with vague error','User Profile / Uploads','Windows, Chrome, Staging','User logged in; try to upload >5MB image','1. Go to Profile > Upload avatar. 2. Select image >5MB. 3. Submit.','Client shows file-size validation message; upload rejected with clear guidance.','Request fails with Upload failed generic error; no guidance.','Medium','Low','Sometimes','Open','Unfixed','N/A','Assume server rejects large multipart without descriptive 413 handling.'],
  ['BUG-008','Notifications count not decrementing after reading','Notifications / Dashboard','Windows, Chrome, Staging','User has unread notifications','1. Open notifications panel. 2. Click Mark as read on a notification.','Unread count decrements accordingly.','Unread count remains unchanged until page refresh.','Low','Medium','Always','Open','Unfixed','N/A','Likely missing real-time state update or API response not updating client state.'],
  ['BUG-009','Forgot-password email delivered with broken link (404)','Auth / Forgot Password','Windows, Chrome, Staging','User triggers forgot-password email','1. Trigger forgot-password. 2. Click link in received email.','Link navigates to password reset page.','Link returns 404 page.','High','High','Sometimes','Open','Unfixed','N/A','Assume incorrect route generation or manifest routing issue.'],
  ['BUG-010','Session expires mid-form causing data loss','Application Form / Multi-step','Windows, Chrome, Prod','User spends >30 minutes on multi-step application form','1. Fill step 1. 2. Wait until session expires. 3. Submit next step.','User prompted to re-login, form auto-saved or restored.','User redirected to login and loses entered data.','Medium','High','Sometimes','Open','Unfixed','N/A','Recommend autosave drafts or graceful re-auth flow.'],
  ['BUG-011','Role-based menu shows employer options to candidates on mobile','Navigation / Responsive UI','iOS Safari, Mobile viewport, Staging','User logged in as candidate','1. Open site on mobile. 2. Open navigation menu.','Menu shows options appropriate to user role only.','Employer-specific menu items visible to candidate on small screens.','Low','Medium','Rare','Open','Unfixed','N/A','Likely responsive CSS/JS toggling issue.'],
  ['BUG-012','Export CSV of applicants truncates names containing commas','Candidate Dashboard / Export','Windows, Excel, Staging','Multiple applicants; some names contain commas (e.g., Doe, Jr)','1. Go to applicants list. 2. Export CSV. 3. Open CSV in Excel.','CSV fields properly quoted; names render correctly.','Names split into extra columns when opened in Excel.','Low','Low','Sometimes','Open','Unfixed','N/A','Assume CSV generation does not quote fields containing commas.'],
];

const bugTemplates = [
  {
    title: 'Registration form validation fails to show inline errors',
    module: 'Auth / Sign Up',
  },
  {
    title: 'Password reset token expires immediately',
    module: 'Auth / Reset Password',
  },
  {
    title: 'Dashboard widgets overlap on small screens',
    module: 'Dashboard',
  },
  {
    title: 'Search suggestions not appearing for typed keywords',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Job alert email not generated after subscribing',
    module: 'Notifications / Alerts',
  },
  {
    title: 'App throws client-side error on quick tab switching',
    module: 'Navigation / Tabs',
  },
  {
    title: 'Employer dashboard metrics stale after hiring update',
    module: 'Employer Dashboard / Metrics',
  },
  {
    title: 'Candidate resume upload fails with unsupported format',
    module: 'User Profile / Resume Upload',
  },
  {
    title: 'Terms and conditions link missing on signup',
    module: 'Auth / Sign Up',
  },
  {
    title: 'Language selector resets after page refresh',
    module: 'Global Header',
  },
  {
    title: 'Social login button not rendered for Facebook',
    module: 'Auth / Social Login',
  },
  {
    title: 'Apply button disabled for eligible applicants',
    module: 'Job Application / Candidate Dashboard',
  },
  {
    title: 'Job cards show incorrect location label',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Saved jobs action unavailable on Safari',
    module: 'Saved Jobs',
  },
  {
    title: 'Unread messages badge not updating',
    module: 'Notifications / Dashboard',
  },
  {
    title: 'Interview scheduling page crashes on date selection',
    module: 'Interview Scheduling',
  },
  {
    title: 'Wrong salary range displayed in search results',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Filter chips disappear after filter change',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Company logo fails to load on job details',
    module: 'Job Details',
  },
  {
    title: 'Browser back button returns to unauthenticated page',
    module: 'Navigation / Browser Flow',
  },
  {
    title: 'Billing address fields missing for paid postings',
    module: 'Billing / Payments',
  },
  {
    title: 'Review submission form resets after image upload',
    module: 'Reviews / Candidate Feedback',
  },
  {
    title: 'Employer analytics export includes duplicates',
    module: 'Employer Dashboard / Export',
  },
  {
    title: 'Mobile menu overlaps footer on Android',
    module: 'Navigation / Responsive UI',
  },
  {
    title: 'Applicant status label missing on dashboard',
    module: 'Candidate Dashboard',
  },
  {
    title: 'Forgot-password form accepts invalid email',
    module: 'Auth / Forgot Password',
  },
  {
    title: 'Notification dropdown remains open after logout',
    module: 'Notifications / Global',
  },
  {
    title: 'Job preview print layout cuts off text',
    module: 'Job Details',
  },
  {
    title: 'Form continues to show loading spinner forever',
    module: 'Application Form / Multi-step',
  },
  {
    title: 'Password complexity guidance not displayed',
    module: 'Auth / Password Policy',
  },
  {
    title: 'Resume parser misses credential fields',
    module: 'Resume / Upload',
  },
  {
    title: 'Job preview modal does not close',
    module: 'Job Details / Preview',
  },
  {
    title: 'Employer profile update fails silently',
    module: 'Employer Dashboard',
  },
  {
    title: 'Search by salary does not include upper bound',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Job posting preview loads incorrect company',
    module: 'Job Posting / Preview',
  },
  {
    title: 'Calendar widget does not allow past dates',
    module: 'Interview Scheduling',
  },
  {
    title: 'Link to privacy policy opens blank page',
    module: 'Legal / Footer Links',
  },
  {
    title: 'Email notifications sent twice for same event',
    module: 'Notifications / Email',
  },
  {
    title: 'Draft application deleted after browser refresh',
    module: 'Application Form',
  },
  {
    title: 'Subscription payment card details not saved',
    module: 'Billing / Subscription',
  },
  {
    title: 'Candidate profile photo not displayed in emails',
    module: 'Notifications / Email',
  },
  {
    title: 'Application upload progress bar stuck at 99%',
    module: 'Application Upload',
  },
  {
    title: 'Job results count mismatches after filter update',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Saved job count not persisted after logout',
    module: 'Saved Jobs',
  },
  {
    title: 'Recruiter search field loses focus after typing',
    module: 'Employer Dashboard',
  },
  {
    title: 'Reset password form submits empty fields',
    module: 'Auth / Reset Password',
  },
  {
    title: 'Mobile chat input blocked by keyboard',
    module: 'Interview Scheduling',
  },
  {
    title: 'Job bookmark icon not toggling state',
    module: 'Saved Jobs',
  },
  {
    title: 'Employer page title duplicates text',
    module: 'Employer Dashboard',
  },
  {
    title: 'Search autocomplete suggestions include duplicates',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Invalid coupon code accepted during checkout',
    module: 'Billing / Checkout',
  },
  {
    title: 'Email verification link redirects to login',
    module: 'Auth / Email Verification',
  },
  {
    title: 'Performance issues when loading job list',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'PDF export file corrupted or unreadable',
    module: 'Reports / Export',
  },
  {
    title: 'Account deletion confirmation missing',
    module: 'Account Settings',
  },
  {
    title: 'Candidate status change email not sent',
    module: 'Notifications / Email',
  },
  {
    title: 'Feedback button hidden behind navbar',
    module: 'UI / Feedback',
  },
  {
    title: 'Resume template preview loads in wrong language',
    module: 'Resume / Templates',
  },
  {
    title: 'Timezone conversion wrong for interview slots',
    module: 'Interview Scheduling',
  },
  {
    title: 'Simple text fields not editable after save',
    module: 'User Profile',
  },
  {
    title: 'Employer onboarding steps do not save progress',
    module: 'Employer Onboarding',
  },
  {
    title: 'Notifications filter resets after page refresh',
    module: 'Notifications / Dashboard',
  },
  {
    title: 'Incorrect applicant count shown on job post',
    module: 'Job Posting',
  },
  {
    title: 'Paywall message displayed for free users',
    module: 'Pricing / Access',
  },
  {
    title: 'Application deadline not enforced properly',
    module: 'Job Posting',
  },
  {
    title: 'CV download button returns 404',
    module: 'Candidate Dashboard',
  },
  {
    title: 'Form input autofocus not applied for new steps',
    module: 'Application Form',
  },
  {
    title: 'Billing invoice date wrong in PDF',
    module: 'Billing / Invoice',
  },
  {
    title: 'Search filter URL not shareable',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Signup success redirect goes to wrong page',
    module: 'Auth / Signup',
  },
  {
    title: 'Archived jobs appear in active listings',
    module: 'Job Listings / Archive',
  },
  {
    title: 'Job expiration countdown stops unexpectedly',
    module: 'Job Posting',
  },
  {
    title: 'Email alert preferences reset unexpectedly',
    module: 'Notifications / Settings',
  },
  {
    title: 'Training video modal does not play',
    module: 'Training / Video',
  },
  {
    title: 'Data privacy checkbox not required on signup',
    module: 'Auth / Signup',
  },
  {
    title: 'Message attachment download fails silently',
    module: 'Messages / Attachments',
  },
  {
    title: 'HR dashboard charts do not render',
    module: 'HR Dashboard',
  },
  {
    title: 'App shows stale data after back navigation',
    module: 'Navigation / Browser Flow',
  },
  {
    title: 'Mobile footer CTA blocked by keyboard',
    module: 'Mobile UI',
  },
  {
    title: 'Interview reminder SMS not delivered',
    module: 'Notifications / SMS',
  },
  {
    title: 'Job salary confidentiality badge missing',
    module: 'Job Details',
  },
  {
    title: 'User profile language preference does not persist',
    module: 'User Profile',
  },
  {
    title: 'Backend returns 502 for bulk job import',
    module: 'Import / Backend',
  },
  {
    title: 'Candidate search page times out on large dataset',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Duplicate notifications generated for one event',
    module: 'Notifications / Alerts',
  },
  {
    title: 'Job recommendation cards overlap on desktop',
    module: 'Browse Jobs / UI',
  },
  {
    title: 'Intermittent 401 when accessing employer resources',
    module: 'Auth / Authorization',
  },
  {
    title: 'Saved search alerts fail after editing filters',
    module: 'Saved Search / Alerts',
  },
  {
    title: 'Edit job posting form loses entered description',
    module: 'Job Posting / Edit',
  },
  {
    title: 'Resume download file name contains invalid characters',
    module: 'Resume / Download',
  },
  {
    title: 'Audit log entry missing for admin action',
    module: 'Admin / Audit',
  },
  {
    title: 'Sticky header flickers during scroll',
    module: 'UI / Layout',
  },
  {
    title: 'Incorrect total count on applicants export',
    module: 'Reports / Export',
  },
  {
    title: 'Chat message fails to send with attachments',
    module: 'Messaging / Chat',
  },
  {
    title: 'Password change form allows weak password',
    module: 'Auth / Password',
  },
  {
    title: 'Referral bonus banner not displayed for eligible users',
    module: 'Marketing / Banner',
  },
  {
    title: 'Access denied for HR manager on team tab',
    module: 'Employer Dashboard / Access',
  },
  {
    title: 'Email digest frequency setting ignored',
    module: 'Notifications / Email',
  },
  {
    title: 'Search results ignore remote work filter',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'Rating stars not visible on mobile profile cards',
    module: 'Profile / Mobile',
  },
  {
    title: 'Two-factor auth prompt bypassed after session restore',
    module: 'Auth / Security',
  },
  {
    title: 'Candidate consent checkbox not required before submit',
    module: 'Application Form',
  },
  {
    title: 'Mobile push notifications delivered late',
    module: 'Notifications / Push',
  },
  {
    title: 'In-app browser blocks video playback',
    module: 'Media / Playback',
  },
  {
    title: 'Application history export includes inactive items',
    module: 'Reports / Export',
  },
  {
    title: 'Discover page loads blank on slow networks',
    module: 'Landing Page',
  },
  {
    title: 'Employer account type upgrade request fails',
    module: 'Billing / Upgrade',
  },
  {
    title: 'Network error shown when offline and saving draft',
    module: 'Offline / Drafts',
  },
  {
    title: 'Live chat support button disappears after refresh',
    module: 'Support / Chat',
  },
  {
    title: 'Multiple browser tabs create double submissions',
    module: 'Forms / Submit',
  },
  {
    title: 'New job postings do not appear without refresh',
    module: 'Jobs / Feed',
  },
  {
    title: 'Incorrect skill tags displayed on job card',
    module: 'Browse Jobs / Search',
  },
  {
    title: 'FAQ search returns unrelated articles',
    module: 'Help / FAQ',
  },
  {
    title: 'Scheduled interview invitations show wrong timezone',
    module: 'Interview Scheduling',
  },
  {
    title: 'Unauthenticated users see restricted content',
    module: 'Content / Access',
  },
  {
    title: 'Support form email subject is missing',
    module: 'Support / Forms',
  },
  {
    title: 'Job expiration emails sent after expiry date',
    module: 'Notifications / Email',
  },
  {
    title: 'Company review score calculated incorrectly',
    module: 'Reviews / Scoring',
  },
  {
    title: 'Bulk candidate deletion does not confirm',
    module: 'Admin / Delete',
  },
  {
    title: 'Homepage hero carousel failing on touch devices',
    module: 'Homepage / Carousel',
  },
  {
    title: 'Candidate demographic fields not saved',
    module: 'Candidate Profile',
  },
  {
    title: 'User preferences reset after app update',
    module: 'Settings / Preferences',
  },
  {
    title: 'Video resume upload accepted but not playable',
    module: 'Media / Resume',
  },
  {
    title: 'Deprecated browser warning missing for IE users',
    module: 'Auth / Browser Support',
  },
  {
    title: 'Admin panel search does not filter correctly',
    module: 'Admin / Search',
  },
  {
    title: 'Application requirements list truncates long text',
    module: 'Application Form',
  },
  {
    title: 'Candidate self-description field overlaps buttons',
    module: 'Candidate Profile',
  },
  {
    title: 'Scheduler invites users to incorrect event',
    module: 'Scheduler / Invitations',
  },
  {
    title: 'Preview mode uses wrong branding for employer',
    module: 'Employer Preview',
  },
  {
    title: 'Tax invoice amount calculated without discount',
    module: 'Billing / Invoice',
  },
  {
    title: 'Landing page hero CTA scrolls to wrong section',
    module: 'Landing Page',
  },
  {
    title: 'Referral link tracked incorrectly for signups',
    module: 'Referral / Tracking',
  },
  {
    title: 'Recruiter pipeline stage not updating',
    module: 'Recruiter Pipeline',
  },
  {
    title: 'Exported JSON object contains null fields',
    module: 'Data Export',
  },
  {
    title: 'Session timeout warning does not appear',
    module: 'Session / Timeout',
  },
];

const environments = ['Windows, Chrome, Staging','Windows, Chrome, Prod','Windows, Firefox, Staging','macOS, Safari, Staging','iOS Safari, Mobile viewport, Prod'];
const preconditions = ['User has active session and relevant permissions','User loads the relevant page with a valid account','User enters applicable data in form fields'];
const steps = ['1. Navigate to page. 2. Perform action. 3. Observe result.','1. Enter required values. 2. Submit the form. 3. Verify response.','1. Trigger feature action. 2. Observe whether feature behaves correctly.'];
const expected = ['Feature functions correctly with clear success state.','Validation prevents incorrect entries and shows correct information.','Data displays accurately and no UI errors occur.'];
const actual = ['Feature fails silently or shows incorrect output.','Unexpected error or missing feedback is displayed.','UI breaks or does not update after action.'];
const severities = ['Low','Medium','High','Critical'];
const priorities = ['Low','Medium','High','Critical'];
const reproducibility = ['Always','Sometimes','Rare'];

for (let i = 0; i < bugTemplates.length; i++) {
  const num = 13 + i;
  const item = bugTemplates[i];
  const env = environments[num % environments.length];
  const pre = preconditions[num % preconditions.length];
  const st = steps[num % steps.length];
  const exp = expected[num % expected.length];
  const act = actual[num % actual.length];
  const sev = severities[num % severities.length];
  const pri = priorities[(num + 1) % priorities.length];
  const repro = reproducibility[num % reproducibility.length];
  rows.push([`BUG-${String(num).padStart(3, '0')}`, item.title, item.module, env, pre, st, exp, act, sev, pri, repro, 'Open', 'Unfixed', 'N/A', 'Plausible issue derived from app flow and current feature set.']);
}

const text = rows.map(row => row.map(cell => {
  const str = String(cell).replace(/"/g, '""');
  return /[",\n]/.test(str) ? `"${str}"` : str;
}).join(',')).join('\n');
fs.writeFileSync(path, text + '\n', 'utf8');
console.log(`Wrote ${rows.length - 1} bug reports to ${path}`);
