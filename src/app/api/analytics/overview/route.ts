import { NextResponse } from "next/server";
import { queryOne, queryAll } from "@/lib/db";

export const revalidate = 86400;

export async function GET() {
  const [
    totalJobsRow,
    totalCompaniesRow,
    totalFieldsRow,
    totalLocationsRow,
    dateRange,
    topFields,
    topLocations,
    topCompanies,
    recentTrend,
    lastScrape,
  ] = await Promise.all([
    queryOne<{ c: number }>("SELECT COUNT(*) as c FROM jobs"),
    queryOne<{ c: number }>(
      "SELECT COUNT(DISTINCT company) as c FROM jobs WHERE company IS NOT NULL"
    ),
    queryOne<{ c: number }>(
      "SELECT COUNT(DISTINCT field) as c FROM jobs WHERE field IS NOT NULL"
    ),
    queryOne<{ c: number }>(
      "SELECT COUNT(DISTINCT location) as c FROM jobs WHERE location IS NOT NULL"
    ),
    queryOne<{ earliest: string | null; latest: string | null }>(
      "SELECT MIN(posted_date) as earliest, MAX(posted_date) as latest FROM jobs WHERE posted_date IS NOT NULL"
    ),
    queryAll<{ name: string; count: number }>(
      `SELECT field as name, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL
       GROUP BY field ORDER BY count DESC LIMIT 5`
    ),
    queryAll<{ name: string; count: number }>(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL
       GROUP BY location ORDER BY count DESC LIMIT 5`
    ),
    queryAll<{ name: string; count: number }>(
      `SELECT company as name, COUNT(*) as count
       FROM jobs WHERE company IS NOT NULL
       GROUP BY company ORDER BY count DESC LIMIT 5`
    ),
    queryAll<{ date: string; count: number }>(
      `SELECT posted_date as date, COUNT(*) as count
       FROM jobs WHERE posted_date IS NOT NULL
       GROUP BY posted_date ORDER BY posted_date DESC LIMIT 30`
    ),
    queryOne<Record<string, unknown>>(
      "SELECT * FROM scrape_runs ORDER BY id DESC LIMIT 1"
    ),
  ]);

  return NextResponse.json({
    totalJobs: totalJobsRow?.c ?? 0,
    totalCompanies: totalCompaniesRow?.c ?? 0,
    totalFields: totalFieldsRow?.c ?? 0,
    totalLocations: totalLocationsRow?.c ?? 0,
    dateRange,
    topFields,
    topLocations,
    topCompanies,
    recentTrend: [...recentTrend].reverse(),
    lastScrape,
  });
}
