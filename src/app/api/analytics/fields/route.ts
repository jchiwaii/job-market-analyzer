import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  const db = getDb();

  const fields = db
    .prepare(
      `SELECT field as name, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL AND field != ''
       GROUP BY field ORDER BY count DESC`
    )
    .all() as { name: string; count: number }[];

  const qualifications = db
    .prepare(
      `SELECT qualification as name, COUNT(*) as count
       FROM jobs WHERE qualification IS NOT NULL AND qualification != ''
       GROUP BY qualification ORDER BY count DESC`
    )
    .all() as { name: string; count: number }[];

  const jobTypes = db
    .prepare(
      `SELECT job_type as name, COUNT(*) as count
       FROM jobs WHERE job_type IS NOT NULL AND job_type != ''
       GROUP BY job_type ORDER BY count DESC`
    )
    .all() as { name: string; count: number }[];

  return NextResponse.json({ fields, qualifications, jobTypes });
}
