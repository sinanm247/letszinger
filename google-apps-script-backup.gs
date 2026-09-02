/**
 * BACKUP ONLY — Full Apps Script before Meta email notification rewrite
 * (Sheet1 landing page leads + original Meta short-link notification)
 *
 * DO NOT paste this into Apps Script together with google-apps-script-code.gs
 * — function names would conflict.
 *
 * Active production script:
 *   google-apps-script-code.gs
 *
 * This backup preserves:
 *   1. Sheet1 / landing page lead handling (Contact Form, Popup, Chatbot)
 *   2. Original Meta tab notification (short email with sheet link only)
 *   3. Meta Stage Updated At onEdit
 *
 * Note: In this older version, the Meta block at the bottom overwrote
 * sendEmailNotificationOnNewRow / createChangeTrigger from Sheet1.
 */

/**
 * Google Apps Script for Ellington Properties Leads
 * Spreadsheet: Meriva Collection / Soto Grande / Costa Mare
 * Handles Sheet1 (Contact Form, Popup Form & Chatbot leads)
 *
 * Sheet URL:
 * https://docs.google.com/spreadsheets/d/1h1h9WEgCwUU3yTkKQOVQA9lZj3GWEHmAcrfB1y3z7CA/edit?gid=0#gid=0
 *
 * SETUP:
 * 1. Open the Google Sheet above
 * 2. Extensions > Apps Script
 * 3. Paste this entire file and Save
 * 4. Run setup() once (authorize when prompted)
 * 5. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL into src/Utils/emailService.js → GOOGLE_SCRIPT_URL
 */

// ============================================
// SHEET CONFIGURATION
// ============================================
const SHEET1_NAME = "Sheet1";

// Sheet1 column headers (must match your Google Sheet)
const SHEET1_HEADERS = [
  "Date & Time",
  "Name",
  "Phone Number",
  "Email",
  "Message",
  "Source",
  "Project Interest"
];

// Email recipients for notifications
// const SHEET1_RECIPIENTS = "sinan@media247.digital";
const SHEET1_RECIPIENTS = "Sadik.Shaikh@media247.digital, info@skyluxe.ae, sanal.n@media247.digital";

// Sheet link
const SHEET1_LINK = "https://docs.google.com/spreadsheets/d/1h1h9WEgCwUU3yTkKQOVQA9lZj3GWEHmAcrfB1y3z7CA/edit?gid=0#gid=0";

const CAMPAIGN_NAME = "Ellington Properties — Meriva / Soto Grande / Costa Mare";
const HEADER_BG = "#111111";

// ============================================
// ONCHANGE TRIGGER (Handles Sheet1)
// ============================================
function sendEmailNotificationOnNewRow(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();

    if (sheetName === SHEET1_NAME) {
      handleSheet1Change(e, sheet);
    }
  } catch (error) {
    console.error("Error in sendEmailNotificationOnNewRow:", error);
  }
}

// ============================================
// SHEET1 HANDLER (Contact Form, Popup Form & Chatbot)
// ============================================
function handleSheet1Change(e, sheet) {
  const lastRow = sheet.getLastRow();

  const properties = PropertiesService.getScriptProperties();
  const previousRowCount = Number(properties.getProperty("lastRowCount_Sheet1")) || 0;

  if (lastRow > previousRowCount) {
    const message =
      `A new lead was added to Sheet1 (Contact Form / Popup Form / Chatbot). ` +
      `View it here: <a href="${SHEET1_LINK}">${CAMPAIGN_NAME} — Leads</a>`;

    MailApp.sendEmail({
      to: SHEET1_RECIPIENTS,
      subject: CAMPAIGN_NAME + " — New Lead",
      htmlBody: message
    });
  }

  properties.setProperty("lastRowCount_Sheet1", lastRow.toString());
}

// ============================================
// WEB APP ENDPOINT (Receives form submissions)
// ============================================
function doPost(e) {
  try {
    let data;

    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonError) {
        data = e.parameter || {};
        data = normalizeVisitedBefore(data);
      }
    } else {
      data = e.parameter || {};
      data = normalizeVisitedBefore(data);
    }

    Logger.log("Received data: " + JSON.stringify(data));
    Logger.log("Source from data: " + data.source);
    Logger.log("Project Interest from data: " + (data.configuration || data.projectInterest));

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet1 = ss.getSheetByName(SHEET1_NAME);

    if (!sheet1) {
      sheet1 = ss.insertSheet(SHEET1_NAME);
    }

    ensureSheet1Headers(sheet1);

    const dateTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dubai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const getValue = (value) => {
      if (value === null || value === undefined || value === "") {
        return "-";
      }
      return value.toString();
    };

    let source = "Contact Form";
    if (data.source !== undefined && data.source !== null && String(data.source).trim() !== "") {
      source = String(data.source).trim();
    } else if (
      data.selectedOption !== undefined &&
      data.selectedOption !== null &&
      String(data.selectedOption).trim() !== ""
    ) {
      source = "Chatbot";
    }

    const message = getValue(data.message);
    const projectInterest = getValue(data.configuration || data.projectInterest);

    const rowData = [
      dateTime,
      getValue(data.name),
      getValue(data.phone),
      getValue(data.email),
      message,
      getValue(source),
      projectInterest
    ];

    Logger.log("Row data: " + JSON.stringify(rowData));

    const nextRow = sheet1.getLastRow() + 1;
    sheet1.getRange(nextRow, 1, 1, SHEET1_HEADERS.length).setValues([rowData]);

    Logger.log("Data saved successfully to Sheet1 at row: " + nextRow);

    try {
      const emailMessage = `
        <h2>New Lead — ${CAMPAIGN_NAME}</h2>
        <p>A new lead has been submitted through the website.</p>
        <hr>
        <p><strong>Name:</strong> ${getValue(data.name)}</p>
        <p><strong>Phone:</strong> ${getValue(data.phone)}</p>
        <p><strong>Email:</strong> ${getValue(data.email)}</p>
        <p><strong>Source:</strong> ${getValue(source)}</p>
        <p><strong>Project Interest:</strong> ${projectInterest}</p>
        <p><strong>Date & Time:</strong> ${dateTime}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>
          <a href="${SHEET1_LINK}"
             style="background-color: #14332B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View in Google Sheet
          </a>
        </p>
      `;

      MailApp.sendEmail({
        to: SHEET1_RECIPIENTS,
        subject: CAMPAIGN_NAME + " — New Lead: " + getValue(data.name),
        htmlBody: emailMessage
      });

      Logger.log("Email notification sent successfully to: " + SHEET1_RECIPIENTS);
    } catch (emailError) {
      Logger.log("Error sending email notification: " + emailError.toString());
      Logger.log("Form data was saved successfully, but email notification failed.");
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "Data saved successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    Logger.log("Error stack: " + error.stack);

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function normalizeVisitedBefore(data) {
  if (data.visitedBefore === "true") {
    data.visitedBefore = true;
  } else if (data.visitedBefore === "false") {
    data.visitedBefore = false;
  } else if (
    data.visitedBefore === "" ||
    data.visitedBefore === null ||
    data.visitedBefore === undefined
  ) {
    data.visitedBefore = null;
  }
  return data;
}

function ensureSheet1Headers(sheet1) {
  const currentLastColumn = sheet1.getLastColumn();

  if (currentLastColumn < SHEET1_HEADERS.length || currentLastColumn === 0) {
    sheet1.getRange(1, 1, 1, SHEET1_HEADERS.length).setValues([SHEET1_HEADERS]);
    formatHeaderRow(sheet1);
    Logger.log("Updated Sheet1 headers");
    return;
  }

  const currentHeaders = sheet1.getRange(1, 1, 1, SHEET1_HEADERS.length).getValues()[0];
  let headersMatch = true;
  for (let i = 0; i < SHEET1_HEADERS.length; i++) {
    if (currentHeaders[i] !== SHEET1_HEADERS[i]) {
      headersMatch = false;
      break;
    }
  }

  if (!headersMatch) {
    sheet1.getRange(1, 1, 1, SHEET1_HEADERS.length).setValues([SHEET1_HEADERS]);
    formatHeaderRow(sheet1);
    Logger.log("Corrected Sheet1 headers");
  }
}

function formatHeaderRow(sheet1) {
  const headerRange = sheet1.getRange(1, 1, 1, SHEET1_HEADERS.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground(HEADER_BG);
  headerRange.setFontColor("#ffffff");
}

// ============================================
// OPTIONS HANDLER (For CORS preflight requests)
// ============================================
function doOptions() {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// GET ENDPOINT (For testing)
// ============================================
function doGet(e) {
  return ContentService
    .createTextOutput(
      JSON.stringify({
        message: CAMPAIGN_NAME + " — Google Apps Script is running",
        sheet: SHEET1_LINK,
        timestamp: new Date()
      })
    )
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// SETUP FUNCTIONS
// ============================================

/**
 * Create onChange trigger programmatically
 * Run this function once to set up the trigger
 */
function createChangeTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const triggers = ScriptApp.getUserTriggers(ss);
  const triggerExists = triggers.some(
    (trigger) => trigger.getHandlerFunction() === "sendEmailNotificationOnNewRow"
  );

  if (!triggerExists) {
    ScriptApp.newTrigger("sendEmailNotificationOnNewRow")
      .forSpreadsheet(ss)
      .onChange()
      .create();
    Logger.log("Change trigger created successfully");
  } else {
    Logger.log("Trigger already exists");
  }
}

/**
 * Initialize Sheet1 with headers if it doesn't exist
 * Run this function once to set up Sheet1
 */
function initializeSheet1() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet1 = ss.getSheetByName(SHEET1_NAME);

  if (!sheet1) {
    sheet1 = ss.insertSheet(SHEET1_NAME);
  }

  sheet1.getRange(1, 1, 1, SHEET1_HEADERS.length).setValues([SHEET1_HEADERS]);
  formatHeaderRow(sheet1);

  sheet1.setColumnWidth(1, 160); // Date & Time
  sheet1.setColumnWidth(2, 150); // Name
  sheet1.setColumnWidth(3, 150); // Phone Number
  sheet1.setColumnWidth(4, 200); // Email
  sheet1.setColumnWidth(5, 320); // Message
  sheet1.setColumnWidth(6, 130); // Source
  sheet1.setColumnWidth(7, 180); // Project Interest

  Logger.log("Sheet1 initialized successfully");
}

/**
 * Update existing Sheet1 with all required columns
 */
function updateSheet1Headers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = ss.getSheetByName(SHEET1_NAME);

  if (!sheet1) {
    Logger.log("Sheet1 does not exist. Run initializeSheet1() first.");
    return;
  }

  sheet1.getRange(1, 1, 1, SHEET1_HEADERS.length).setValues([SHEET1_HEADERS]);
  formatHeaderRow(sheet1);

  sheet1.setColumnWidth(1, 160);
  sheet1.setColumnWidth(2, 150);
  sheet1.setColumnWidth(3, 150);
  sheet1.setColumnWidth(4, 200);
  sheet1.setColumnWidth(5, 320);
  sheet1.setColumnWidth(6, 130);
  sheet1.setColumnWidth(7, 180);

  Logger.log("Sheet1 headers updated successfully");
}

/**
 * Verify and fix Sheet1 structure
 */
function verifyAndFixSheet1() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet1 = ss.getSheetByName(SHEET1_NAME);

  if (!sheet1) {
    Logger.log("Sheet1 does not exist. Creating it...");
    initializeSheet1();
    return;
  }

  ensureSheet1Headers(sheet1);
  Logger.log("Sheet1 verified. Columns: " + SHEET1_HEADERS.join(", "));
}

/**
 * Test Contact Form / Popup Form submission
 */
function testDoPost() {
  const testData = {
    name: "Test User",
    phone: "+971501234567",
    email: "test@example.com",
    message: "Test enquiry for Meriva Collection",
    source: "Contact Form",
    configuration: "Meriva Collection"
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
      type: "application/json"
    }
  };

  const result = doPost(mockEvent);
  Logger.log("Result: " + result.getContent());
  Logger.log("Test completed — check Sheet1 for the new row");
}

/**
 * Test Chatbot submission
 */
function testChatbotDoPost() {
  const testData = {
    name: "Chatbot Test User",
    phone: "+971509876543",
    email: "",
    message:
      "Chatbot Inquiry Details:\nSelected Option: Pricing & Plans\nVisited Before: Yes\nConfiguration: Soto Grande\nPage URL: http://localhost:5173/",
    source: "Chatbot",
    selectedOption: "Pricing & Plans",
    visitedBefore: true,
    configuration: "Soto Grande",
    pageUrl: "http://localhost:5173/"
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
      type: "application/json"
    }
  };

  const result = doPost(mockEvent);
  Logger.log("Result: " + result.getContent());
  Logger.log("Chatbot test completed — check Sheet1");
}

/**
 * Setup function — run this once after pasting the script
 */
function setup() {
  initializeSheet1();
  createChangeTrigger();
  Logger.log("Setup completed for: " + SHEET1_LINK);
}

/**
 * meta tab - email notification
 */

function sendEmailNotificationOnNewRow(e) {
  const sheet = e.source.getActiveSheet();
  const sheetName = "Meta";

  // Exit if the change is not on the specified sheet
  if (sheet.getName() !== sheetName) return;

  const lastRow = sheet.getLastRow();

  // Check if a new row is added
  const properties = PropertiesService.getScriptProperties();
  const previousRowCount = Number(properties.getProperty("lastRowCount")) || 0;

  // If the current row count is greater than the previous count, a new row was added
  if (lastRow > previousRowCount) {
    const sheetLink =
      "https://docs.google.com/spreadsheets/d/1h1h9WEgCwUU3yTkKQOVQA9lZj3GWEHmAcrfB1y3z7CA/edit?gid=1221265523#gid=1221265523";
    const message =
      `A new lead is added to the Meta tab. You can view it here: <a href="${sheetLink}">Media247 Digital x Skyluxe - Leads</a>`;

    // List of email recipients (comma-separated)
    const recipients =
      "sanal.n@media247.digital, info@skyluxe.ae, Sadik.Shaikh@media247.digital";

    // Send the email notification to multiple recipients
    MailApp.sendEmail({
      to: recipients,
      subject: "Media247 Digital x Skyluxe - New Lead - Meta",
      htmlBody: message // Using htmlBody to include a clickable link
    });
  }

  // Update the last row count
  properties.setProperty("lastRowCount", lastRow);
}

// Create an onChange trigger programmatically
function createChangeTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check if a trigger already exists to avoid duplicates
  const triggers = ScriptApp.getUserTriggers(ss);
  const triggerExists = triggers.some(
    (trigger) => trigger.getHandlerFunction() === "sendEmailNotificationOnNewRow"
  );

  if (!triggerExists) {
    ScriptApp.newTrigger("sendEmailNotificationOnNewRow")
      .forSpreadsheet(ss)
      .onChange()
      .create();
  }
}

// Stage updated At
function onEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== "Meta") return; // your sheet/tab name
  const STAGE_COL = 11; // column number of "Stage"
  const STAMP_COL = 14; // column number of "Stage Updated At"
  if (e.range.getColumn() !== STAGE_COL || e.range.getRow() === 1) return;
  const tz = Session.getScriptTimeZone();
  const ts = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss");
  sh.getRange(e.range.getRow(), STAMP_COL).setValue(ts);
}
