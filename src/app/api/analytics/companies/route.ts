import { NextResponse } from "next/server";
import { queryAll } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const companies = await queryAll<{
    name: string;
    count: number;
    fields: string;
    locations: string;
    firstPosted: string;
    lastPosted: string;
  }>(
    `SELECT company as name, COUNT(*) as count,
            GROUP_CONCAT(DISTINCT field) as fields,
            GROUP_CONCAT(DISTINCT location) as locations,
            MIN(posted_date) as firstPosted,
            MAX(posted_date) as lastPosted
     FROM jobs WHERE company IS NOT NULL AND company != ''
     GROUP BY company ORDER BY count DESC`
  );

  return NextResponse.json({ companies });
}
