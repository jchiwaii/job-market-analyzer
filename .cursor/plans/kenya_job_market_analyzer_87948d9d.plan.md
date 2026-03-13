---
name: Kenya Job Market Analyzer
overview: Build a full-stack Kenya job market analyzer that scrapes MyJobMag Kenya, stores jobs in SQLite, runs analysis via Next.js API routes, and displays trends/insights on a modern dashboard with charts.
todos:
  - id: deps
    content: "Install dependencies: better-sqlite3, cheerio, recharts, tsx, types"
    status: completed
  - id: db
    content: Create SQLite database layer (src/lib/db.ts) with schema initialization and query helpers
    status: completed
  - id: scraper
    content: Build scraper (src/lib/scraper.ts + scripts/scrape.ts) with list-page crawling + detail-page extraction
    status: completed
  - id: api
    content: Create Next.js API routes for jobs listing and all analytics endpoints
    status: completed
  - id: layout
    content: Build shared layout with sidebar navigation and responsive design
    status: completed
  - id: dashboard
    content: Build dashboard page with KPI cards and summary charts
    status: completed
  - id: pages
    content: Build trends, fields, locations, companies, and jobs pages with charts and tables
    status: completed
  - id: docs
    content: Write DOCS.md documenting architecture, setup, and usage
    status: in_progress
isProject: false
---

# Kenya Job Market Analyzer

## Architecture

```mermaid
flowchart LR
    subgraph scraper [Scraper Layer]
        S["scripts/scrape.ts\n(cheerio + fetch)"]
    end
    subgraph storage [Storage]
        DB["data/jobs.db\n(SQLite via better-sqlite3)"]
    end
    subgraph api [API Layer]
        R1["/api/jobs"]
        R2["/api/analytics/overview"]
        R3["/api/analytics/trends"]
        R4["/api/analytics/fields"]
        R5["/api/analytics/locations"]
        R6["/api/analytics/companies"]
    end
    subgraph frontend [Frontend - Next.js]
        P1["/ Dashboard"]
        P2["/trends"]
        P3["/fields"]
        P4["/locations"]
        P5["/companies"]
        P6["/jobs"]
    end
    S -->|"writes"| DB
    DB -->|"reads"| R1
    DB -->|"reads"| R2
    DB -->|"reads"| R3
    DB -->|"reads"| R4
    DB -->|"reads"| R5
    DB -->|"reads"| R6
    R1 --> P6
    R2 --> P1
    R3 --> P2
    R4 --> P3
    R5 --> P4
    R6 --> P5
```

## Tech Stack (Unified TypeScript)

- **Scraper**: `cheerio` for HTML parsing, built-in `fetch` for HTTP
- **Database**: `better-sqlite3` (file-based SQLite, zero config)
- **Charts**: `recharts` for interactive data visualizations
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4 (already initialized)
- **Runner**: `tsx` to execute scraper scripts directly

## 1. Database Schema (`src/lib/db.ts`)

Single `jobs` table with all extracted fields:

- `id` (INTEGER PRIMARY KEY)
- `slug` (TEXT UNIQUE) -- for deduplication
- `url`, `title`, `company`
- `field`, `location`, `experience`, `qualification`, `job_type`
- `description`, `posted_date`, `deadline`
- `industry`, `scraped_at`

Plus a `scrape_runs` table to track scraping history.

## 2. Scraper (`scripts/scrape.ts`)

Two-phase approach:

- **Phase 1 - List scrape**: Crawl paginated listing pages (`/page/1`, `/page/2`, ...) extracting job URLs, titles, companies, and dates. Continue until no more pages.
- **Phase 2 - Detail scrape**: Visit each job URL to extract structured metadata (field, location, qualification, experience, job type, description, industry).
- Rate-limited with 1-2s delays between requests.
- Idempotent: skips jobs already in DB (by slug).
- Run via `npm run scrape`.

Key data from the site per job detail page:

- Job Field (e.g., "Finance / Accounting / Audit")
- Location (e.g., "Busia, Eldoret, Kisumu")
- Experience (e.g., "1 year")
- Qualification (e.g., "BA/BSc/HND, Diploma")
- Job Type (e.g., "Full Time, Onsite")

## 3. API Routes (Next.js Route Handlers)

- `GET /api/jobs` -- Paginated job listing with field/location/type filters
- `GET /api/analytics/overview` -- Total jobs, unique companies, date range, top field/location
- `GET /api/analytics/trends` -- Jobs posted per week/month over time
- `GET /api/analytics/fields` -- Count by job field
- `GET /api/analytics/locations` -- Count by location
- `GET /api/analytics/companies` -- Top hiring companies ranked by job count

## 4. Frontend Pages

All pages share a sidebar/top-nav layout with dark/light mode support.

- `**/` (Dashboard): KPI cards (total jobs, companies, fields, locations) + small summary charts (top fields bar chart, recent posting trend line)
- `**/trends`: Time-series line charts showing posting volume over time, filterable by field. Weekly and monthly views.
- `**/fields`: Horizontal bar chart of jobs per field + sortable table with counts
- `**/locations`: Bar chart of jobs by Kenyan county/city + sortable table
- `**/companies`: Ranked list of top hiring companies with job counts and sparklines
- `**/jobs`: Searchable, filterable table of all scraped jobs with pagination

## 5. Dependencies to Install

```
npm install better-sqlite3 cheerio recharts
npm install -D @types/better-sqlite3 tsx
```

## 6. Documentation

A succinct `DOCS.md` covering: project purpose, architecture, how to run the scraper, how to start the dev server, and what each page shows.

## File Structure

```
scripts/
  scrape.ts            -- Standalone scraper script
src/
  lib/
    db.ts              -- SQLite connection + schema init
    scraper.ts         -- Scraping logic (list + detail)
  app/
    layout.tsx         -- Shared layout with sidebar nav
    page.tsx           -- Dashboard
    trends/page.tsx    -- Trends analysis
    fields/page.tsx    -- Fields breakdown
    locations/page.tsx -- Locations breakdown
    companies/page.tsx -- Companies ranking
    jobs/page.tsx      -- Job browser
    api/
      jobs/route.ts
      analytics/
        overview/route.ts
        trends/route.ts
        fields/route.ts
        locations/route.ts
        companies/route.ts
  components/
    Sidebar.tsx
    KpiCard.tsx
    charts/             -- Reusable chart wrappers
data/
  jobs.db              -- SQLite database (gitignored)
DOCS.md
```
