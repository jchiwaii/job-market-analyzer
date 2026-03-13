import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  const db = getDb();

  const locations = db
    .prepare(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL AND location != ''
       GROUP BY location ORDER BY count DESC`
    )
    .all() as { name: string; count: number }[];

  const regions = db
    .prepare(
      `SELECT location as name, COUNT(*) as count, field
       FROM jobs WHERE location IS NOT NULL AND location != ''
       GROUP BY location ORDER BY count DESC LIMIT 15`
    )
    .all() as { name: string; count: number; field: string }[];

  return NextResponse.json({ locations, topRegions: regions });
}
