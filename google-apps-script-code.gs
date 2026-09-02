/**
 * Google Apps Script for Ellington Properties Leads
 *
 * PART 1 (this top section): Landing page Sheet1 leads
 *   - Contact Form, Popup Form, Chatbot
 *
 * PART 2 (bottom of this file): Meta tab leads
 *   - Kept separately so Meta sheet owners can edit Meta code
 *     without touching landing page lead logic
 *
 * Sheet URL:
 * https://docs.google.com/spreadsheets/d/1h1h9WEgCwUU3yTkKQOVQA9lZj3GWEHmAcrfB1y3z7CA/edit?gid=0#gid=0
 *
 * SETUP:
 * 1. Open the Google Sheet above
 * 2. Extensions > Apps Script
 * 3. Paste this entire file and Save
 * 4. Run setup() once (authorize when prompted)
 * 5. Run setupMeta() once (for Meta tab notifications)
 * 6. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the Web App URL into src/Utils/emailService.js → GOOGLE_SCRIPT_URL
 */

// ############################################################################
// ############################################################################
//
//  PART 1 — LANDING PAGE LEADS (Sheet1)
//  Contact Form / Popup Form / Chatbot
//
// ############################################################################
// ############################################################################

// ============================================
// LANDING PAGE — SHEET CONFIGURATION
// ============================================
const SHEET1_NAME = "Sheet1";

const SHEET1_HEADERS = [
  "Date & Time",
  "Name",
  "Phone Number",
  "Email",
  "Message",
  "Source",
  "Project Interest"
];

// const SHEET1_RECIPIENTS = "sinan@media247.digital";
const SHEET1_RECIPIENTS = "Sadik.Shaikh@media247.digital, info@skyluxe.ae, sanal.n@media247.digital";

const SHEET1_LINK = "https://docs.google.com/spreadsheets/d/1h1h9WEgCwUU3yTkKQOVQA9lZj3GWEHmAcrfB1y3z7CA/edit?gid=0#gid=0";

const CAMPAIGN_NAME = "Ellington Properties — Meriva / Soto Grande / Costa Mare";
const HEADER_BG = "#111111";

// ============================================
// LANDING PAGE — SHARED EMAIL HELPERS
// (also reused by Meta section below for the same email format)
// ============================================
function getDisplayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, "Asia/Dubai", "yyyy-MM-dd HH:mm:ss");
  }
  return value.toString();
}

function buildLeadEmailHtml(options) {
  const {
    title,
    intro,
    name,
    phone,
    email,
    source,
    projectInterest,
    dateTime,
    message,
    sheetLink,
    sheetLinkLabel,
    extraFields
  } = options;

  let extraHtml = "";
  if (extraFields && extraFields.length) {
    extraHtml = extraFields
      .map(function (field) {
        return "<p><strong>" + field.label + ":</strong> " + getDisplayValue(field.value) + "</p>";
      })
      .join("");
  }

  const safeMessage = getDisplayValue(message).replace(/\n/g, "<br>");

  return `
    <h2>${title}</h2>
    <p>${intro}</p>
    <hr>
    <p><strong>Name:</strong> ${getDisplayValue(name)}</p>
    <p><strong>Phone:</strong> ${getDisplayValue(phone)}</p>
    <p><strong>Email:</strong> ${getDisplayValue(email)}</p>
    <p><strong>Source:</strong> ${getDisplayValue(source)}</p>
    <p><strong>Project Interest:</strong> ${getDisplayValue(projectInterest)}</p>
    <p><strong>Date & Time:</strong> ${getDisplayValue(dateTime)}</p>
    ${extraHtml}
    <hr>
    <p><strong>Message:</strong></p>
    <p>${safeMessage}</p>
    <hr>
    <p>
      <a href="${sheetLink}"
         style="background-color: #14332B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        ${sheetLinkLabel || "View in Google Sheet"}
      </a>
    </p>
  `;
}

function sendLeadEmail(recipients, subject, htmlBody) {
  MailApp.sendEmail({
    to: recipients,
    subject: subject,
    htmlBody: htmlBody
  });
}

function mapRowToObject(headers, values) {
  const result = {};
  for (var i = 0; i < headers.length; i++) {
    result[headers[i]] = values[i];
  }
  return result;
}

// ============================================
// LANDING PAGE — ONCHANGE (Sheet1)
// Also checks Meta so a single existing onChange trigger still covers Meta leads.
// ============================================
function sendEmailNotificationOnNewRow(e) {
  try {
    const ss = e && e.source ? e.source : SpreadsheetApp.getActiveSpreadsheet();

    const sheet1 = ss.getSheetByName(SHEET1_NAME);
    if (sheet1) {
      handleSheet1Change(sheet1);
    }

    // Safety net: if Meta-specific trigger is missing, still notify Meta leads
    const metaSheet = ss.getSheetByName(META_SHEET_NAME);
    if (metaSheet) {
      handleMetaChange(metaSheet);
    }
  } catch (error) {
    console.error("Error in sendEmailNotificationOnNewRow:", error);
    Logger.log("Error in sendEmailNotificationOnNewRow: " + error.toString());
  }
}

function handleSheet1Change(sheet) {
  const lastRow = sheet.getLastRow();
  const properties = PropertiesService.getScriptProperties();
  const previousRowCount = Number(properties.getProperty("lastRowCount_Sheet1")) || 0;

  if (lastRow > previousRowCount && lastRow > 1) {
    const startRow = Math.max(previousRowCount + 1, 2);
    const numRows = lastRow - startRow + 1;
    const headers = sheet.getRange(1, 1, 1, SHEET1_HEADERS.length).getValues()[0];
    const rows = sheet.getRange(startRow, 1, numRows, SHEET1_HEADERS.length).getValues();

    rows.forEach(function (rowValues) {
      const lead = mapRowToObject(headers, rowValues);
      const html = buildLeadEmailHtml({
        title: "New Lead — " + CAMPAIGN_NAME,
        intro: "A new lead has been submitted through the website.",
        name: lead["Name"],
        phone: lead["Phone Number"],
        email: lead["Email"],
        source: lead["Source"] || "Contact Form",
        projectInterest: lead["Project Interest"],
        dateTime: lead["Date & Time"],
        message: lead["Message"],
        sheetLink: SHEET1_LINK,
        sheetLinkLabel: "View in Google Sheet"
      });

      sendLeadEmail(
        SHEET1_RECIPIENTS,
        CAMPAIGN_NAME + " — New Lead: " + getDisplayValue(lead["Name"]),
        html
      );
    });
  }

  properties.setProperty("lastRowCount_Sheet1", lastRow.toString());
}

// ============================================
// LANDING PAGE — WEB APP ENDPOINT (doPost)
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

    const message = getDisplayValue(data.message);
    const projectInterest = getDisplayValue(data.configuration || data.projectInterest);

    const rowData = [
      dateTime,
      getDisplayValue(data.name),
      getDisplayValue(data.phone),
      getDisplayValue(data.email),
      message,
      getDisplayValue(source),
      projectInterest
    ];

    Logger.log("Row data: " + JSON.stringify(rowData));

    const nextRow = sheet1.getLastRow() + 1;
    sheet1.getRange(nextRow, 1, 1, SHEET1_HEADERS.length).setValues([rowData]);

    // Keep Sheet1 row-count in sync so onChange does not send a duplicate email
    PropertiesService.getScriptProperties().setProperty(
      "lastRowCount_Sheet1",
      sheet1.getLastRow().toString()
    );

    Logger.log("Data saved successfully to Sheet1 at row: " + nextRow);

    try {
      const emailMessage = buildLeadEmailHtml({
        title: "New Lead — " + CAMPAIGN_NAME,
        intro: "A new lead has been submitted through the website.",
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: source,
        projectInterest: projectInterest,
        dateTime: dateTime,
        message: message,
        sheetLink: SHEET1_LINK,
        sheetLinkLabel: "View in Google Sheet"
      });

      sendLeadEmail(
        SHEET1_RECIPIENTS,
        CAMPAIGN_NAME + " — New Lead: " + getDisplayValue(data.name),
        emailMessage
      );

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

function doOptions() {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}

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
// LANDING PAGE — SETUP / TEST HELPERS
// ============================================
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
    Logger.log("Sheet1 change trigger created successfully");
  } else {
    Logger.log("Sheet1 change trigger already exists");
  }
}

function initializeSheet1() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet1 = ss.getSheetByName(SHEET1_NAME);

  if (!sheet1) {
    sheet1 = ss.insertSheet(SHEET1_NAME);
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

  Logger.log("Sheet1 initialized successfully");
}

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
 * Landing page setup — run once after pasting the script
 */
function setup() {
  initializeSheet1();
  createChangeTrigger();
  setupMeta();
  Logger.log("Landing page setup completed for: " + SHEET1_LINK);
}


// ############################################################################
// ############################################################################
//
//  PART 2 — META LEADS (Meta tab)
//
//  Edit ONLY this section when changing Meta lead notifications / Stage stamp.
//  Do not change PART 1 (landing page Sheet1) above.
//
//  Meta sheet:
//  https://docs.google.com/spreadsheets/d/1h1h9WEgCwUU3yTkKQOVQA9lZj3GWEHmAcrfB1y3z7CA/edit?gid=1221265523#gid=1221265523
//
//  After deploying Meta changes, run: setupMeta()
//
// ############################################################################
// ############################################################################

const META_SHEET_NAME = "Meta";
const META_RECIPIENTS = "sanal.n@media247.digital, info@skyluxe.ae, Sadik.Shaikh@media247.digital";
const META_LINK = "https://docs.google.com/spreadsheets/d/1h1h9WEgCwUU3yTkKQOVQA9lZj3GWEHmAcrfB1y3z7CA/edit?gid=1221265523#gid=1221265523";

// Only these Meta sheet fields are included in the email notification
const META_EMAIL_FIELDS = [
  "full_name",
  "email",
  "phone",
  "Country",
  "Budget",
  "When are you planning to invest?",
  "What matters most?"
];

/**
 * Meta onChange trigger — new Meta row → email with selected fields only
 *
 * IMPORTANT: Do NOT use getActiveSheet() here.
 * Meta leads often arrive while another tab is open (or via API sync),
 * so getActiveSheet() may not be "Meta" and the email would never send.
 */
function sendMetaEmailNotificationOnNewRow(e) {
  try {
    const ss = e && e.source ? e.source : SpreadsheetApp.getActiveSpreadsheet();
    const metaSheet = ss.getSheetByName(META_SHEET_NAME);

    if (!metaSheet) {
      Logger.log("Meta sheet not found — check tab name is exactly: " + META_SHEET_NAME);
      return;
    }

    handleMetaChange(metaSheet);
  } catch (error) {
    console.error("Error in sendMetaEmailNotificationOnNewRow:", error);
    Logger.log("Error in sendMetaEmailNotificationOnNewRow: " + error.toString());
  }
}

function handleMetaChange(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = Math.max(sheet.getLastColumn(), META_EMAIL_FIELDS.length);
  const properties = PropertiesService.getScriptProperties();

  // Support both new and old property keys (old backup used "lastRowCount")
  var previousRowCount = Number(properties.getProperty("lastRowCount_Meta"));
  if (!previousRowCount) {
    previousRowCount = Number(properties.getProperty("lastRowCount")) || 0;
  }

  Logger.log(
    "Meta check — lastRow: " +
      lastRow +
      ", previousRowCount: " +
      previousRowCount +
      ", lastColumn: " +
      lastColumn
  );

  if (lastRow > previousRowCount && lastRow > 1 && lastColumn > 0) {
    const startRow = Math.max(previousRowCount + 1, 2);
    const numRows = lastRow - startRow + 1;
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    const rows = sheet.getRange(startRow, 1, numRows, lastColumn).getValues();

    rows.forEach(function (rowValues, index) {
      const fullName = getMetaFieldByHeader(headers, rowValues, "full_name");
      const phone = getMetaFieldByHeader(headers, rowValues, "phone");
      const email = getMetaFieldByHeader(headers, rowValues, "email");

      // Skip blank / incomplete rows
      if (
        getDisplayValue(fullName) === "-" &&
        getDisplayValue(phone) === "-" &&
        getDisplayValue(email) === "-"
      ) {
        Logger.log("Skipping empty Meta row: " + (startRow + index));
        return;
      }

      try {
        const html = buildMetaLeadEmailHtml(headers, rowValues);

        sendLeadEmail(
          META_RECIPIENTS,
          CAMPAIGN_NAME + " — New Meta Lead: " + getDisplayValue(fullName),
          html
        );

        Logger.log("Meta lead email sent for: " + getDisplayValue(fullName));
      } catch (emailError) {
        Logger.log(
          "Failed to send Meta email for row " +
            (startRow + index) +
            ": " +
            emailError.toString()
        );
      }
    });
  } else {
    Logger.log("No new Meta rows to notify (row count did not increase).");
  }

  properties.setProperty("lastRowCount_Meta", String(lastRow));
  // Keep old key in sync for compatibility
  properties.setProperty("lastRowCount", String(lastRow));
}

function buildMetaLeadEmailHtml(headers, rowValues) {
  const fieldRows = META_EMAIL_FIELDS.map(function (fieldName) {
    const value = getMetaFieldByHeader(headers, rowValues, fieldName);
    return (
      "<p><strong>" +
      escapeMetaHtml(fieldName) +
      ":</strong> " +
      escapeMetaHtml(getDisplayValue(value)) +
      "</p>"
    );
  }).join("");

  return `
    <h2>New Lead — ${CAMPAIGN_NAME} (Meta)</h2>
    <p>A new lead has been submitted through Meta Lead Ads.</p>
    <hr>
    ${fieldRows}
    <hr>
    <p>
      <a href="${META_LINK}"
         style="background-color: #14332B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Meta Leads in Google Sheet
      </a>
    </p>
  `;
}

function getMetaFieldByHeader(headers, values, fieldName) {
  const target = String(fieldName || "").trim().toLowerCase();

  for (var i = 0; i < headers.length; i++) {
    const header = String(headers[i] || "").trim().toLowerCase();
    if (header === target) {
      return values[i];
    }
  }
  return "";
}

function escapeMetaHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Meta — Stage Updated At stamp
 * Columns: ... | What matters most? (10) | Stage (11) | Remarks (12) | Stage Updated At (13) | last_sent_stage (14)
 */
function onEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== META_SHEET_NAME) return;

  const STAGE_COL = 11;
  const STAMP_COL = 13;

  if (e.range.getColumn() !== STAGE_COL || e.range.getRow() === 1) return;

  const tz = Session.getScriptTimeZone();
  const ts = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss");
  sh.getRange(e.range.getRow(), STAMP_COL).setValue(ts);
}

function createMetaChangeTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const triggers = ScriptApp.getUserTriggers(ss);
  const triggerExists = triggers.some(
    (trigger) => trigger.getHandlerFunction() === "sendMetaEmailNotificationOnNewRow"
  );

  if (!triggerExists) {
    ScriptApp.newTrigger("sendMetaEmailNotificationOnNewRow")
      .forSpreadsheet(ss)
      .onChange()
      .create();
    Logger.log("Meta change trigger created successfully");
  } else {
    Logger.log("Meta change trigger already exists");
  }

  // Log all triggers for debugging
  triggers.forEach(function (trigger) {
    Logger.log("Existing trigger: " + trigger.getHandlerFunction());
  });
}

/**
 * Sync Meta row counter so existing rows do not trigger bulk emails
 */
function syncMetaRowCount() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const metaSheet = ss.getSheetByName(META_SHEET_NAME);

  if (!metaSheet) {
    Logger.log("Meta sheet not found — tab name must be exactly: Meta");
    return;
  }

  const lastRow = metaSheet.getLastRow();
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty("lastRowCount_Meta", String(lastRow));
  properties.setProperty("lastRowCount", String(lastRow));
  Logger.log("Synced lastRowCount_Meta / lastRowCount to: " + lastRow);
}

/**
 * Test Meta notification using the latest Meta row
 */
function testMetaNotification() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const metaSheet = ss.getSheetByName(META_SHEET_NAME);

  if (!metaSheet || metaSheet.getLastRow() < 2) {
    Logger.log("No Meta lead rows found to test");
    return;
  }

  const properties = PropertiesService.getScriptProperties();
  const current =
    Number(properties.getProperty("lastRowCount_Meta")) ||
    Number(properties.getProperty("lastRowCount")) ||
    metaSheet.getLastRow();
  properties.setProperty("lastRowCount_Meta", String(Math.max(current - 1, 1)));
  properties.setProperty("lastRowCount", String(Math.max(current - 1, 1)));
  handleMetaChange(metaSheet);
  Logger.log("Meta test notification completed — check your inbox / Executions log");
}

/**
 * Meta setup — run once (or after Meta trigger changes)
 */
function setupMeta() {
  createMetaChangeTrigger();
  syncMetaRowCount();
  Logger.log("Meta setup completed for: " + META_LINK);
}