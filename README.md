# lhsnam.github.io

Personal portfolio and notes of Le Hong Son Nam. Static site, no runtime dependencies (Node 22 only).

## Develop

```sh
node build.mjs            # builds ./dist
cd dist && python3 -m http.server 8000
BUILD_DRAFTS=1 node build.mjs   # include notes with `draft: true`
```

## Content

| What | Where |
| --- | --- |
| Profile, work, experience, publications, talks, UI strings (EN + VI) | `content/site.json` |
| Notes (Markdown, one file per language: `slug.en.md`, `slug.vi.md`) | `content/notes/` |
| Public CV | `public/CV.pdf` (source: `cv/cv.html`) |
| Styles / theme toggle | `src/style.css`, `src/app.js` |

Note front matter: `title`, `date` (YYYY-MM-DD), `tags` (comma separated), `minutes`, `summary`, optional `draft: true`.

## Google Scholar metrics

`scripts/update-scholar.mjs` reads the public Scholar profile and writes `data/scholar.json`
(totals, h-index, i10-index, citations per year, citations per paper). The deploy workflow runs it
daily and on every push. If Scholar blocks the request, the committed `data/scholar.json` is used.
Per-paper counts are matched to `publications[].match` in `content/site.json`.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages.
In the repository: **Settings → Pages → Source: GitHub Actions**.
