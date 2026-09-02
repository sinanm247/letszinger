# Google Sheets Integration Setup Guide

This guide will help you integrate ContactForm and PopupForm with Google Sheets.

## Step 1: Set Up Google Apps Script

1. Open your Google Sheet: `https://docs.google.com/spreadsheets/d/1noXYNVlhkaFItscvK6uH5Y9FN8O3xACSNwsvrWt8WAA/edit`

2. Go to **Extensions** → **Apps Script**

3. Delete any existing code and paste the entire contents of `google-apps-script-code.gs`

4. **Update the following constants in the script:**
   - `SHEET2_LINK`: Replace `YOUR_SHEET2_GID` with the actual Sheet2 GID (you can find this in the URL when viewing Sheet2)
   - Update email recipients if needed

5. **Save the script** (Ctrl+S or Cmd+S)

## Step 2: Initialize Sheet2

1. In the Apps Script editor, click on the function dropdown and select `initializeSheet2`
2. Click the **Run** button (▶️)
3. Authorize the script when prompted (click "Review permissions" → "Allow")
4. This will create Sheet2 with proper headers if it doesn't exist

## Step 3: Set Up the Trigger

1. In the Apps Script editor, click on the function dropdown and select `setup`
2. Click the **Run** button (▶️)
3. This will:
   - Initialize Sheet2
   - Create the onChange trigger for both sheets

**OR** you can run them separately:
- Run `initializeSheet2` first
- Then run `createChangeTrigger`

## Step 4: Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**

2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**

3. Configure the deployment:
   - **Description**: "Contact Form Integration"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (this allows your website to send data)

4. Click **Deploy**

5. **Copy the Web App URL** - you'll need this for the next step

6. Click **Authorize access** when prompted

## Step 5: Update Your React Code

1. Open `src/Utils/emailService.js`

2. Find this line:
   ```javascript
   const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```

3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with the Web App URL you copied in Step 4

4. Save the file

## Step 6: Test the Integration

1. Fill out the Contact Form or Popup Form on your website
2. Submit the form
3. Check Sheet2 in your Google Sheet - you should see a new row with the data
4. Check your email - you should receive a notification

## How It Works

### Sheet1 (Google Ads Leads)
- Handled by the existing `handleSheet1Change` function
- Sends email notifications when new rows are added
- Uses separate tracking (`lastRowCount_Sheet1`)

### Sheet2 (Contact Form & Popup Form)
- Receives data via the Web App endpoint (`doPost`)
- Sends email notifications when new rows are added via `handleSheet2Change`
- Uses separate tracking (`lastRowCount_Sheet2`)

### No Interference
- Both sheets are handled independently
- Each sheet has its own:
  - Handler function
  - Row count tracking
  - Email notification settings
- The unified `sendEmailNotificationOnNewRow` function routes to the correct handler based on sheet name

## Troubleshooting

### Issue: "Script function not found"
- Make sure you've saved the script after pasting the code
- Try running `setup()` function again

### Issue: "Permission denied"
- Make sure you've authorized the script
- Go to Apps Script → Run → Authorize

### Issue: Data not appearing in Sheet2
- Check the Web App URL in `emailService.js`
- Make sure the Web App is deployed with "Anyone" access
- Check the browser console for errors
- Verify Sheet2 exists in your Google Sheet

### Issue: Email notifications not working
- Check that the trigger is created (Extensions → Apps Script → Triggers)
- Verify email addresses are correct in the script
- Check the Apps Script execution log for errors

## Security Notes

- The Web App URL allows anyone to submit data - this is necessary for your website
- Consider adding basic validation or API key authentication if needed
- The script validates data structure before saving

## Updating Email Recipients

To change email recipients:
1. Open Apps Script
2. Update `SHEET1_RECIPIENTS` or `SHEET2_RECIPIENTS` constants
3. Save the script
4. No redeployment needed for email changes

## Column Structure

Sheet2 should have these columns (in order):
1. Date & Time
2. Name
3. Phone Number
4. Email
5. Message

The script automatically creates these headers if Sheet2 doesn't exist.
