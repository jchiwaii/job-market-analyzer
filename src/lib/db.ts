import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "jobs.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      slug          TEXT UNIQUE NOT NULL,
      url           TEXT NOT NULL,
      title         TEXT NOT NULL,
      company       TEXT,
      field         TEXT,
      location      TEXT,
      experience    TEXT,
      qualification TEXT,
      job_type      TEXT,
      industry      TEXT,
      description   TEXT,
      posted_date   TEXT,
      deadline      TEXT,
      scraped_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_field ON jobs(field);
    CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
    CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
    CREATE INDEX IF NOT EXISTS idx_jobs_posted ON jobs(posted_date);

    CREATE TABLE IF NOT EXISTS scrape_runs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at    TEXT NOT NULL,
      completed_at  TEXT,
      pages_scraped INTEGER DEFAULT 0,
      jobs_found    INTEGER DEFAULT 0,
      new_jobs      INTEGER DEFAULT 0
    );
  `);
}

export interface JobRow {
  id: number;
  slug: string;
  url: string;
  title: string;
  company: string | null;
  field: string | null;
  location: string | null;
  experience: string | null;
  qualification: string | null;
  job_type: string | null;
  industry: string | null;
  description: string | null;
  posted_date: string | null;
  deadline: string | null;
  scraped_at: string;
}

export function insertJob(job: Omit<JobRow, "id" | "scraped_at">) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO jobs (slug, url, title, company, field, location, experience, qualification, job_type, industry, description, posted_date, deadline)
    VALUES (@slug, @url, @title, @company, @field, @location, @experience, @qualification, @job_type, @industry, @description, @posted_date, @deadline)
  `);
  return stmt.run(job);
}

export function jobExists(slug: string): boolean {
  const db = getDb();
  const row = db.prepare("SELECT 1 FROM jobs WHERE slug = ?").get(slug);
  return !!row;
}

export function startScrapeRun(): number {
  const db = getDb();
  const result = db
    .prepare("INSERT INTO scrape_runs (started_at) VALUES (datetime('now'))")
    .run();
  return Number(result.lastInsertRowid);
}

export function finishScrapeRun(
  runId: number,
  stats: { pages_scraped: number; jobs_found: number; new_jobs: number }
) {
  const db = getDb();
  db.prepare(
    `UPDATE scrape_runs SET completed_at = datetime('now'), pages_scraped = @pages_scraped, jobs_found = @jobs_found, new_jobs = @new_jobs WHERE id = @id`
  ).run({ id: runId, ...stats });
}
