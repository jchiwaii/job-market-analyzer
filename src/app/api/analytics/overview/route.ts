import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  const db = getDb();

  const totalJobs = (
    db.prepare("SELECT COUNT(*) as c FROM jobs").get() as { c: number }
  ).c;

  const totalCompanies = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT company) as c FROM jobs WHERE company IS NOT NULL"
      )
      .get() as { c: number }
  ).c;

  const totalFields = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT field) as c FROM jobs WHERE field IS NOT NULL"
      )
      .get() as { c: number }
  ).c;

  const totalLocations = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT location) as c FROM jobs WHERE location IS NOT NULL"
      )
      .get() as { c: number }
  ).c;

  const dateRange = db
    .prepare(
      "SELECT MIN(posted_date) as earliest, MAX(posted_date) as latest FROM jobs WHERE posted_date IS NOT NULL"
    )
    .get() as { earliest: string | null; latest: string | null };

  const topFields = db
    .prepare(
      `SELECT field as name, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL
       GROUP BY field ORDER BY count DESC LIMIT 5`
    )
    .all() as { name: string; count: number }[];

  const topLocations = db
    .prepare(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL
       GROUP BY location ORDER BY count DESC LIMIT 5`
    )
    .all() as { name: string; count: number }[];

  const topCompanies = db
    .prepare(
      `SELECT company as name, COUNT(*) as count
       FROM jobs WHERE company IS NOT NULL
       GROUP BY company ORDER BY count DESC LIMIT 5`
    )
    .all() as { name: string; count: number }[];

  const recentTrend = db
    .prepare(
      `SELECT posted_date as date, COUNT(*) as count
       FROM jobs WHERE posted_date IS NOT NULL
       GROUP BY posted_date ORDER BY posted_date DESC LIMIT 30`
    )
    .all() as { date: string; count: number }[];

  const lastScrape = db
    .prepare(
      "SELECT * FROM scrape_runs ORDER BY id DESC LIMIT 1"
    )
    .get();

  return NextResponse.json({
    totalJobs,
    totalCompanies,
    totalFields,
    totalLocations,
    dateRange,
    topFields,
    topLocations,
    topCompanies,
    recentTrend: recentTrend.reverse(),
    lastScrape,
  });
}
