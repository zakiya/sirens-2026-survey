// Google Apps Script backend for the 2026 Sirens member survey.
//
// Bind this script to the responses spreadsheet (Extensions → Apps Script in the sheet),
// then deploy it as a web app. See backend/README.md for the full steps.
//
// The site POSTs one JSON body per response:
//   { survey, submittedAt, columns: [header, ...], row: { header: value }, answers: {...} }
// `columns` lists every question column in survey order, so the header row stays stable
// even when a respondent skipped or never saw a question. New headers are appended at the
// right, so editing the survey later never shifts existing columns.

// Each survey version (its `id` in survey.js) writes to its own tab.
const SHEETS = {
  "sirens-2026": "Member responses",
  "sirens-2026-community": "Community responses",
};
const MAX_COLUMNS = 150;
const MAX_CELL_LENGTH = 5000;
// Reject responses after this time, matching `closesAt` in dist/members/survey.js and dist/community/survey.js
// (e.g. "2026-12-15T23:59:59-08:00"). Leave empty to keep accepting responses.
// The site also checks this, but only the server check can't be bypassed.
const CLOSES_AT = "2026-11-21T23:59:59-08:00";

const FIXED_START = ["Received", "Submitted (browser time)"];
const FIXED_END = ["Raw JSON"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const sheetName = SHEETS.hasOwnProperty(body.survey) ? SHEETS[body.survey] : null;
    if (!sheetName) throw new Error("Unknown survey.");
    // The site matches this exact message to show its "closed" page.
    if (CLOSES_AT && Date.now() >= new Date(CLOSES_AT).getTime()) throw new Error("Survey closed.");
    if (!Array.isArray(body.columns) || typeof body.row !== "object" || !body.row) {
      throw new Error("Malformed response.");
    }
    const columns = body.columns.map(String).slice(0, MAX_COLUMNS);

    lock.waitLock(20000);
    const sheet = getSheet(sheetName);
    const headers = ensureHeaders(sheet, FIXED_START.concat(columns, FIXED_END));

    const values = Object.assign({}, body.row, {
      "Received": new Date(),
      "Submitted (browser time)": String(body.submittedAt || ""),
      "Raw JSON": JSON.stringify(body.answers || {}),
    });
    sheet.appendRow(headers.map((h) => cell(values[h])));
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String((err && err.message) || err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the web app URL in a browser to check the deployment is live.
function doGet() {
  return json({ ok: true, surveys: Object.keys(SHEETS) });
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Returns the header row, appending any wanted headers it doesn't have yet.
function ensureHeaders(sheet, wanted) {
  const lastCol = sheet.getLastColumn();
  let headers = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : [];
  const missing = wanted.filter((h) => headers.indexOf(h) === -1);
  if (!missing.length) return headers;

  headers = headers.concat(missing);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  return headers;
}

function cell(value) {
  if (value == null) return "";
  if (value instanceof Date) return value;
  let s = Array.isArray(value) ? value.join("; ") : String(value);
  s = s.slice(0, MAX_CELL_LENGTH);
  // Stop free-text answers from being read as formulas.
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
