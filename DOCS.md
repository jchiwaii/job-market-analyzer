# Kenya Job Market Analyzer

Scrapes, stores, and visualizes Kenyan job postings from [MyJobMag Kenya](https://www.myjobmag.co.ke) to reveal hiring trends, top fields, locations, and companies over time.

## Architecture

```
scripts/scrape.ts  ──>  data/jobs.db  ──>  Next.js API routes  ──>  Frontend pages
(cheerio + fetch)       (SQLite)           (server components)      (Recharts + Tailwind)
```

**Single TypeScript codebase** — scraper, API, and frontend all live in one project.

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Scraper   | `cheerio` for HTML parsing, JSON-LD extraction |
| Storage   | SQLite via `better-sqlite3` (file-based, zero config) |
| API       | Next.js Route Handlers (`/api/*`)         |
| Frontend  | Next.js 16, React 19, Tailwind CSS 4, Recharts |

## Setup

```bash
# Install dependencies
npm install

# Run the scraper (scrapes up to N pages, default 20)
npm run scrape          # full scrape
npm run scrape -- 5     # scrape 5 pages only

# Start the dev server
npm run dev
# Open http://localhost:3000
```

The SQLite database is created automatically at `data/jobs.db` on first scrape run.

## Scraper

**Entry point:** `scripts/scrape.ts` (run via `npx tsx`).

Two-phase process:

1. **List pages** — crawls paginated listing pages (`/`, `/page/2`, ...) to discover job URLs.
2. **Detail pages** — visits each new job URL to extract structured metadata from JSON-LD and HTML.

Features:
- **Deduplication** by URL slug (idempotent; safe to run repeatedly).
- **Rate-limited** with 1.5s delays between requests.
- Extracts: title, company, field, location, experience, qualification, job type, industry, posted date, deadline, description.
- Scrape history tracked in `scrape_runs` table.

## Database Schema

**`jobs`** table — one row per job posting:

| Column        | Type    | Notes                      |
|---------------|---------|----------------------------|
| id            | INTEGER | Auto-increment primary key |
| slug          | TEXT    | Unique, used for dedup     |
| url           | TEXT    | Full MyJobMag URL          |
| title         | TEXT    | Job title                  |
| company       | TEXT    | Hiring company             |
| field         | TEXT    | e.g., "ICT / Computer"    |
| location      | TEXT    | e.g., "Nairobi"           |
| experience    | TEXT    | e.g., "3 years"           |
| qualification | TEXT    | e.g., "BA/BSc/HND"        |
| job_type      | TEXT    | e.g., "Full Time, Onsite" |
| industry      | TEXT    | e.g., "Banking"           |
| description   | TEXT    | Truncated to 5000 chars   |
| posted_date   | TEXT    | ISO date (YYYY-MM-DD)     |
| deadline      | TEXT    | ISO date or null           |
| scraped_at    | TEXT    | Timestamp of scrape        |

**`scrape_runs`** table — one row per scraper execution with timing and counts.

## API Routes

| Endpoint                       | Returns                                        |
|--------------------------------|------------------------------------------------|
| `GET /api/jobs`                | Paginated job list with `?field=`, `?location=`, `?q=` filters |
| `GET /api/analytics/overview`  | KPI totals, top fields/locations/companies, recent trend |
| `GET /api/analytics/trends`    | Time-series data (`?group=day|week|month`, `?field=`) |
| `GET /api/analytics/fields`    | Job counts by field, qualification, and type   |
| `GET /api/analytics/locations` | Job counts by location                         |
| `GET /api/analytics/companies` | Companies ranked by job count with metadata    |

## Frontend Pages

| Route        | Purpose                                              |
|--------------|------------------------------------------------------|
| `/`          | Dashboard — KPI cards, summary charts                |
| `/trends`    | Time-series line charts (daily/weekly/monthly toggle) |
| `/fields`    | Bar + pie charts of job field distribution            |
| `/locations` | Location breakdown with bar charts and tables         |
| `/companies` | Top hiring companies with counts and detail table     |
| `/jobs`      | Searchable, filterable, paginated job browser         |

All pages feature a collapsible sidebar navigation and responsive layout.

## Accumulating Data Over Time

The scraper is designed to run repeatedly. Each run only inserts jobs not already in the database. To build up 6-12 months of trend data, schedule regular scraping:

```bash
# Example: daily cron job at 8 AM
0 8 * * * cd /path/to/job-market-analyzer && npm run scrape >> /tmp/scrape.log 2>&1
```

The more data accumulated, the richer the trend analysis becomes.
