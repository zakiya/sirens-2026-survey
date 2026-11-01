# 2026 Sirens Member Survey

Static survey page for San Diego Sirens members, published with GitHub Pages.

- `dist/` is the site. Questions live in `dist/survey.js`; `dist/app.js` renders them.
- Pushing to `main` deploys `dist/` via `.github/workflows/pages.yml`.
- Responses aren't sent anywhere yet: on submit they're shown as JSON for copying or download.

Preview locally:

```bash
python3 -m http.server 8123 -d dist
```
