# 2026 Sirens Member Survey

Static survey page for San Diego Sirens members, published with GitHub Pages.

- `dist/` is the site. `dist/index.html` links to the two surveys:
  - `/members/` – the member survey (questions in `dist/members/survey.js`)
  - `/community/` – a shorter version for people who weren't 2026 members (questions in `dist/community/survey.js`)
- `dist/app.js` renders both. They share the same endpoint; each survey's responses go to its own sheet tab.
- Pushing to `main` deploys `dist/` via `.github/workflows/pages.yml`.
- Responses are sent to a Google Sheet through an Apps Script web app in `backend/` (setup in [backend/README.md](backend/README.md)). Until `endpoint` is set in a survey's `survey.js`, submitted responses are shown as JSON for copying or download instead.

Preview locally:

```bash
python3 -m http.server 8123 -d dist
```
