# CRM Integration Brief – Masaar by Arada Landing Page

**For:** CRM development team (The Max Momentum – https://app.themaxmomentum.com/)  
**From:** Masaar by Arada / Propwise Realty  
**Purpose:** Integrate contact form and chatbot lead submissions from the Masaar landing page into the CRM.

---

## 1. Overview

We have a **React-based landing page** for **Masaar by Arada** (Sharjah real estate). It has two lead-capture points that we want to send into your CRM:

| Source | Description |
|--------|-------------|
| **Contact Form** | Main contact/registration form (name, phone, email, message, configuration). |
| **Chatbot** | In-page chatbot that collects name, phone, and qualifying details (e.g. selected option, visited before, configuration, page URL). |

**Current behaviour:** Both flows send data to **Google Sheets** via a **Google Apps Script** web app (POST to a single endpoint). We need these leads to also (or instead) flow into **The Max Momentum CRM** so they can be managed in one place.

---

## 2. Integration Options We Can Support

We can adapt our frontend to send leads to the CRM in any of these ways, **depending on what your platform supports**:

### Option A – CRM REST API / Webhook (Preferred)

- You provide:
  - **Webhook URL** or **REST API endpoint** for creating/updating leads or contacts.
  - **Method** (e.g. `POST`), **headers** (e.g. `Content-Type: application/json`, optional `Authorization`).
  - **Request body schema** (field names and types).
- We will:
  - Send the same payload we document below (contact form and chatbot) to that endpoint on each submission.
  - Optionally keep or remove the existing Google Sheets flow, as per your preference.

### Option B – Google Sheets as Bridge

- Your CRM already supports **Google** or **Google Sheets** (as in your integrations list).
- We keep sending leads to **Google Sheets** (current setup).
- You configure the CRM to **sync or import from that Google Sheet** (e.g. Google integration, scheduled sync, or workflow that reads the sheet).
- No change required on our side if the sheet structure stays the same; we can align column names to your CRM’s expected mapping if you share the mapping.

### Option C – Other Integrations (Zapier / Make / Typeform-style)

- If you support **Zapier**, **Make (Integromat)**, or similar: we can send to their webhook, and you connect that to the CRM.
- If you support **Typeform**-style “form” integrations: we could, with more effort, mirror our form fields to a Typeform (or similar) and let the CRM ingest from there. This is less ideal unless API/Webhook and Sheets are not possible.

**We need your confirmation on which option(s) your platform supports** (e.g. “We have a Leads API”, “We sync from Google Sheets”, “We support webhooks at …”) so we can implement accordingly.

---

## 3. Payload Structure (What We Send)

Below is the exact structure we can send to an API/Webhook or write to a sheet. All fields are sent on every submission; empty string `""` or `null` where we don’t have data.

### 3.1 Common Fields (Contact Form & Chatbot)

| Field | Type | Contact Form | Chatbot | Notes |
|-------|------|--------------|---------|--------|
| `name` | string | ✓ | ✓ | Full name |
| `phone` | string | ✓ | ✓ | E.164-style (e.g. +971…) |
| `email` | string | ✓ | — | Chatbot does not collect email |
| `message` | string | ✓ | ✓ | Free text (form) or structured summary (chatbot) |
| `source` | string | ✓ | ✓ | `"Contact Form"` or `"Chatbot"` |
| `configuration` | string | ✓ | ✓ | e.g. "Townhouse", "Villas" |

### 3.2 Contact Form Only

- **source:** `"Contact Form"`
- **message:** User’s free-text message.
- **configuration:** Selected from dropdown (e.g. Townhouse, Villas).
- **selectedOption:** `""`
- **visitedBefore:** `null`
- **pageUrl:** `""`

**Example (JSON):**

```json
{
  "name": "Ahmed Ali",
  "phone": "+971501234567",
  "email": "ahmed@example.com",
  "message": "Interested in 2 BHK and payment plans.",
  "source": "Contact Form",
  "configuration": "Townhouse",
  "selectedOption": "",
  "visitedBefore": null,
  "pageUrl": ""
}
```

### 3.3 Chatbot Only

- **source:** `"Chatbot"`
- **email:** `""`
- **message:** Preformatted string, e.g.  
  `"Chatbot Inquiry Details:\nSelected Option: Pricing & Plans\nVisited Before: Yes\nConfiguration: 2 BHK\nPage URL: https://example.com/"`
- **selectedOption:** Label of the option user selected in the bot (e.g. "Pricing & Plans", "Schedule a Visit").
- **visitedBefore:** `true` or `false`.
- **pageUrl:** URL of the page where the user was when they submitted (e.g. `https://masaar.example.com/`).

**Example (JSON):**

```json
{
  "name": "Sara Mohammed",
  "phone": "+971509876543",
  "email": "",
  "message": "Chatbot Inquiry Details:\nSelected Option: Pricing & Plans\nVisited Before: Yes\nConfiguration: Villas\nPage URL: https://masaar.example.com/",
  "source": "Chatbot",
  "configuration": "Villas",
  "selectedOption": "Pricing & Plans",
  "visitedBefore": true,
  "pageUrl": "https://masaar.example.com/"
}
```

### 3.4 Configuration Options (Dropdown)

- `"Townhouse"`
- `"Villas"`

These come from our app config and may be extended later; we can align naming with your CRM if needed.

---

## 4. Instructions for CRM Developer Team

1. **Confirm integration method**
   - Does The Max Momentum expose a **REST API or Webhook** for creating leads/contacts? If yes, please share:
     - Endpoint URL
     - HTTP method and headers
     - Request body schema and example
     - Any auth (e.g. API key, Bearer token) and where to send it
   - If you prefer **Google Sheets**: confirm that you can sync/import from a Google Sheet and whether you need a specific sheet/column layout; we can align our Google Apps Script output to that.

2. **Field mapping**
   - Map our fields to your CRM entities (e.g. Contact, Lead, Deal):
     - `name` → Contact name / Lead name  
     - `phone` → Phone  
     - `email` → Email  
     - `message` → Notes / Description  
     - `source` → Lead source (e.g. "Contact Form" / "Chatbot")  
     - `configuration` → Custom field / Product interest  
     - `selectedOption`, `visitedBefore`, `pageUrl` → Custom fields or notes, if supported
   - If your API uses different names, provide the mapping (e.g. `first_name`, `last_name` from `name`) and we can adapt the payload.

3. **Idempotency / duplicates**
   - Tell us if you support idempotency keys or unique constraints (e.g. phone + source + timestamp) so we can avoid duplicate leads when the user submits twice.

4. **Response and errors**
   - Preferred HTTP status codes and error response format so we can show a clear success/failure message to the user (and optionally retry or log).

5. **Testing**
   - Provide a **staging/sandbox** endpoint or test credentials if available, so we can test contact form and chatbot submissions before going live.

6. **Security**
   - If the endpoint is public (e.g. webhook), recommend any best practices (e.g. secret in header, HMAC, or IP allowlist) and we will implement on our side.

---

## 5. Our Current Tech Stack (For Reference)

- **Frontend:** React (Vite), React Router  
- **Lead submission:** `fetch()` POST to Google Apps Script Web App URL (JSON body)  
- **Chatbot:** Custom React component; on submit it calls the same backend flow with `source: "Chatbot"` and the extra fields above  
- **Backend (current):** Google Apps Script → single Google Sheet (Contact Form, Popup Form, and Chatbot in one sheet)

We can add a second destination (your CRM) in parallel with Sheets, or switch entirely to the CRM once the integration is confirmed.

---

## 6. Contact

For integration details, API docs, or webhook setup, please contact our development team or the project owner. We are ready to implement once we have:

- Chosen option (API/Webhook vs Sheets vs other), and  
- Endpoint URL, auth, and payload format (or sheet structure) from your side.

---

**Document version:** 1.0  
**Last updated:** February 2025  
**Project:** Masaar by Arada Landing Page – CRM Integration (The Max Momentum)
