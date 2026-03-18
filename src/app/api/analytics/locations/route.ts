import { NextResponse } from "next/server";
import { queryAll } from "@/lib/db";

export const revalidate = 86400;

export async function GET() {
  const [locations, regions] = await Promise.all([
    queryAll<{ name: string; count: number }>(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL AND location != ''
       GROUP BY location ORDER BY count DESC`
    ),
    queryAll<{ name: string; count: number; field: string }>(
      `SELECT location as name, COUNT(*) as count, field
       FROM jobs WHERE location IS NOT NULL AND location != ''
       GROUP BY location ORDER BY count DESC LIMIT 15`
    ),
  ]);

  return NextResponse.json({ locations, topRegions: regions });
}
