# Google Sheet backend

Survey responses are appended as rows to a Google Sheet by a small Apps Script web app ([Code.gs](Code.gs)). Nothing here is deployed by GitHub Pages; the script lives in Google.

## Set up

1. Create a Google Sheet (e.g. "2026 Sirens Survey Responses") in the Sirens Google account.
2. In the sheet, open **Extensions → Apps Script**. Replace the contents of `Code.gs` with [Code.gs](Code.gs) and save.
3. Click **Deploy → New deployment**, choose type **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Authorize the script when prompted (it only needs access to this spreadsheet).
5. Copy the **Web app URL** (ends in `/exec`). Opening it in a browser should show `{"ok":true,"surveys":["sirens-2026","sirens-2026-nonmember"]}`.
6. Paste the URL into `endpoint` in [dist/survey.js](../dist/survey.js), commit and push.

The first response creates a **Responses** tab (member survey) or **Non-member responses** tab (non-member survey at `/community/`), each with a header row: received time, browser time, one column per question (grid rows and "Other" text get their own columns), and the full response as raw JSON.

## Updating the script

After editing `Code.gs`, paste it into Apps Script again and use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. Editing the existing deployment keeps the same URL; a *new* deployment gets a new URL that would need updating in `survey.js`.

## Notes

- Changing or adding questions in `survey.js` is safe: new question headers are appended as new columns, and existing columns never move. Renaming a question's label creates a new column, since headers include the label.
- The endpoint is public, as with any form backend. Text answers starting with `=`, `+`, `-` or `@` are prefixed with `'` so they can't run as formulas, and cell length and column count are capped.
- If a submission fails, the site keeps the respondent's answers in their browser and asks them to try again.
