# 2026 Sirens Member Survey

Static survey page for San Diego Sirens members, published with GitHub Pages.

- `dist/` is the site. Questions live in `dist/survey.js`; `dist/app.js` renders them.
- A shorter community version (for people who weren't 2026 members) lives at `/community/` (`dist/community/`, questions in `dist/community/survey.js`). It uses the same `app.js` and endpoint; its responses go to a separate sheet tab.
- Pushing to `main` deploys `dist/` via `.github/workflows/pages.yml`.
- Responses are sent to a Google Sheet through an Apps Script web app in `backend/` (setup in [backend/README.md](backend/README.md)). Until `endpoint` is set in `dist/survey.js`, submitted responses are shown as JSON for copying or download instead.

Preview locally:

```bash
python3 -m http.server 8123 -d dist
```
