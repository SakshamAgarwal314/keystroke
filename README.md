# keystroke.

A web analytics dashboard for your [MonkeyType](https://monkeytype.com) typing history — rolling averages, goal tracking, and trend analysis for every test you've ever taken.

**Live demo:** [https://keystroke-sakshamagarwal314.vercel.app](https://keystroke-sakshamagarwal314.vercel.app)]() · try the preview button for a full dashboard without an account

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Vercel](https://img.shields.io/badge/Vercel-deployed-000)

---

## What it does

MonkeyType tracks your typing tests but doesn't give you much to look at. keystroke. pulls your full test history through their API and computes the metrics that actually matter for improving:

- **Rolling averages** (7-test and 30-test) over every test, plotted against a goal line
- **Top/bottom decile analysis** — your ceiling vs. your floor
- **Accuracy and consistency trends** with a 97% target reference
- **Personalized goal tracking** with projected days-to-goal based on your 30-day improvement rate
- **Standard deviation** to quantify how steady your performance is

All stats update live — just paste a new ApeKey and reload.

## Preview mode

Don't have a MonkeyType account? Click **preview with demo data** on the login screen. The dashboard renders with 90 days of simulated progress so you can see everything without signing up.

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Hosting | Vercel |
| Data | MonkeyType REST API |

## Architecture

```
Browser
   │  (ApeKey + goal WPM)
   ▼
Next.js API route  ── fetch ──▶  MonkeyType API
   │    (server-side, key never stored)
   ▼
Analytics engine (src/lib/analytics.ts)
   │   KPIs · daily aggregates · chart data
   ▼
React dashboard (Recharts)
```

The ApeKey is forwarded once per session through a server-side API route and never persisted. Everything else runs client-side.

## Running locally

```bash
npm install
npm run dev
# http://localhost:3000
```

## Getting an ApeKey

1. Log into monkeytype.com
2. Settings → Account → enable Ape Keys (if needed)
3. Settings → Ape Keys → generate new key
4. Paste it into keystroke. — only shown once

## Deploy

```bash
gh repo create keystroke --public --source=. --push
```

Then at [vercel.com/new](https://vercel.com/new), import the repo. No env vars needed.

## License

MIT — built by Saksham Agarwal.
