# Google Sheets Integration Debugging Guide

## Issue: Data Not Appearing in Google Sheets

If data is not appearing in Google Sheets after form submission, follow these steps:

## Step 1: Verify Script is Updated

1. Open your Google Apps Script editor
2. Make sure you've copied the latest code from `google-apps-script-code.gs`
3. **Save** the script (Ctrl+S or Cmd+S)

## Step 2: Redeploy the Web App (IMPORTANT!)

After updating the script, you **MUST** redeploy the web app:

1. In Apps Script, click **Deploy** → **Manage deployments**
2. Click the **pencil icon** (Edit) next to your existing deployment
3. Click **Deploy** (you can update the version number or description)
4. **Copy the new Web App URL** if it changed
5. Update `GOOGLE_SCRIPT_URL` in `src/Utils/emailService.js` if the URL changed

**Note:** Simply saving the script is NOT enough - you must redeploy!

## Step 3: Check Execution Logs

1. In Apps Script, go to **Executions** (clock icon in left sidebar)
2. Look for recent executions of `doPost`
3. Check if there are any errors
4. Click on an execution to see the logs

## Step 4: Test the Script Directly

You can test the script with this test function:

```javascript
function testDoPost() {
  const testData = {
    name: "Test User",
    phone: "+971501234567",
    email: "test@example.com",
    message: "Test message",
    source: "Contact Form"
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
      type: "application/json"
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log("Result: " + result.getContent());
}
```

1. Add this function to your Apps Script
2. Run it from the function dropdown
3. Check the logs and Sheet2 to see if data was saved

## Step 5: Verify Sheet2 Exists

1. Open your Google Sheet
2. Check if **Sheet2** exists
3. If not, run the `initializeSheet2()` function in Apps Script
4. Verify the headers are correct:
   - Date & Time
   - Name
   - Phone Number
   - Email
   - Message
   - Source
   - Selected Option
   - Visited Before
   - Configuration
   - Page URL

## Step 6: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Submit a form
4. Look for:
   - "Data sent to Google Sheets (response not readable due to no-cors mode)" - This is normal
   - Any error messages

## Step 7: Verify Web App Permissions

1. In Apps Script, go to **Deploy** → **Manage deployments**
2. Click on your deployment
3. Verify:
   - **Execute as:** Me
   - **Who has access:** Anyone (or specific users if you prefer)

## Common Issues and Solutions

### Issue: "Script function not found"
- **Solution:** Make sure you've saved and redeployed the web app

### Issue: "Permission denied"
- **Solution:** 
  1. Run the script manually once to authorize it
  2. Go to **Executions** and authorize any pending executions

### Issue: Data appears but fields are wrong
- **Solution:** 
  1. Check that Sheet2 headers match the script
  2. Run `initializeSheet2()` again to reset headers

### Issue: Script runs but no data saved
- **Solution:**
  1. Check execution logs for errors
  2. Verify Sheet2 exists and is accessible
  3. Make sure the script has permission to edit the sheet

## Testing Checklist

- [ ] Script code is updated and saved
- [ ] Web app is redeployed
- [ ] Web app URL is correct in `emailService.js`
- [ ] Sheet2 exists with correct headers
- [ ] Script has proper permissions
- [ ] Test execution shows success in logs
- [ ] Form submission shows "Data sent" message in console
- [ ] Data appears in Sheet2 after submission

## Still Not Working?

1. **Check the execution logs** - This is the most important step
2. **Try the test function** - This will help isolate the issue
3. **Verify the Web App URL** - Make sure it's the latest deployment URL
4. **Check Sheet2 permissions** - Make sure the script can edit it

## Quick Fix: Redeploy

If nothing else works, try this:

1. Delete the existing deployment
2. Create a new deployment
3. Copy the new URL
4. Update `GOOGLE_SCRIPT_URL` in your code
5. Test again

The most common issue is **forgetting to redeploy after updating the script code**.
