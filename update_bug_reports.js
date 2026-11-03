const fs = require('fs');
const path = 'd:/worklance/bug_reports.csv';
const text = fs.readFileSync(path, 'utf8').trim();
const rows = text.split(/\r?\n/);
const newBugs = [
  ['BUG-148','Mobile push notification permission prompt not shown','Notifications / Push','Android Chrome, Mobile viewport, Staging','User has push notifications enabled for the app','1. Open the mobile app. 2. Attempt to enable push notifications. 3. Observe if prompt appears.','System asks the user to grant push notification permissions.','No permission prompt appears; notifications remain disabled.','Medium','Medium','Sometimes','Open','Unfixed','N/A','Likely missing mobile permission request flow for push notifications.'],
  ['BUG-149','Job filter state lost after browser refresh','Browse Jobs / Search','Windows, Chrome, Staging','User applies multiple filters on job search page','1. Apply filters. 2. Refresh the browser page. 3. Observe the filter state.','Filters remain applied after refresh.','Filters reset to default after refresh.','High','High','Sometimes','Open','Unfixed','N/A','Assume filter state is not persisted in URL or session storage.'],
  ['BUG-150','Employer cannot edit saved job templates','Employer Dashboard / Templates','macOS, Safari, Prod','Employer has saved job templates in dashboard','1. Open employer templates page. 2. Select saved template to edit. 3. Attempt to save changes.','Template updates successfully.','Save action fails or changes are not retained.','Medium','High','Sometimes','Open','Unfixed','N/A','Likely missing update handler for saved job template records.']
];
const quote = v => {
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
};
const out = rows.concat(newBugs.map(r => r.map(quote).join(','))).join('\n') + '\n';
fs.writeFileSync(path, out, 'utf8');
console.log('Updated', path, 'with 150 entries');
