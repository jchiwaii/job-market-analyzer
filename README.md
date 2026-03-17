# Kenya Job Market Analyzer

A data dashboard exploring job listings scraped from [MyJobMag Kenya](https://www.myjobmag.co.ke). Built to answer a simple question: what does the Kenyan job market actually look like?

## What I did

### 1. Scraping

Wrote a custom Node.js scraper using `cheerio` that crawled MyJobMag Kenya — paginating through listing pages, then visiting each job's detail page to extract structured data (field, location, experience, qualification, job type, industry, posted date). Stored everything in a local SQLite database (`jobs.db`).

### 2. Database

The scraped data lives in a single `jobs` table with ~10 columns per listing. Locally I used `better-sqlite3` for fast synchronous queries during development. For production, I migrated to [Turso](https://turso.tech) — a hosted libSQL (SQLite-compatible) platform — and imported the database using the Turso CLI.

### 3. The App

Built with **Next.js 15 App Router** — all data fetching happens in server components, no client-side API calls needed for the main pages. Each page runs parallel SQL queries via `Promise.all` and passes the results down to client components for interactivity and charts.

Pages:

- **Dashboard** — overview KPIs and top charts
- **Fields** — job demand by career field
- **Companies** — which employers are hiring most
- **Locations** — geographic breakdown with Nairobi vs rest of Kenya
- **Industry** — sector-level hiring concentration
- **Insights** — work arrangements, experience demand, company size distribution
- **Trends** — monthly posting activity over time
- **All Jobs** — searchable, filterable table of every listing

### 4. Charts & UI

Used **Recharts** for bar, pie, and line charts. Styled with **Tailwind CSS v4**. Charts are wrapped in React Error Boundaries so a single chart failure doesn't break the page.

### 5. Deployment

Deployed on **Vercel**. The database runs on Turso

## Stack

| Layer      | Tech                    |
| ---------- | ----------------------- |
| Framework  | Next.js 15 (App Router) |
| Language   | TypeScript              |
| Styling    | Tailwind CSS v4         |
| Charts     | Recharts                |
| Database   | Turso (libSQL / SQLite) |
| Scraping   | Node.js + Cheerio       |
| Deployment | Vercel                  |

## Local Setup

```bash
# Install dependencies
npm install

# Add environment variables
cp .env.local.example .env.local
# Fill in TURSO_DATABASE_URL and TURSO_AUTH_TOKEN

# Run dev server
npm run dev
```

---
