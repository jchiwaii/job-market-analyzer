import { NextResponse } from "next/server";
import { queryAll } from "@/lib/db";

export const revalidate = 86400;

export async function GET() {
  const [fields, qualifications, jobTypes] = await Promise.all([
    queryAll<{ name: string; count: number }>(
      `SELECT field as name, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL AND field != ''
       GROUP BY field ORDER BY count DESC`
    ),
    queryAll<{ name: string; count: number }>(
      `SELECT qualification as name, COUNT(*) as count
       FROM jobs WHERE qualification IS NOT NULL AND qualification != ''
       GROUP BY qualification ORDER BY count DESC`
    ),
    queryAll<{ name: string; count: number }>(
      `SELECT job_type as name, COUNT(*) as count
       FROM jobs WHERE job_type IS NOT NULL AND job_type != ''
       GROUP BY job_type ORDER BY count DESC`
    ),
  ]);

  return NextResponse.json({ fields, qualifications, jobTypes });
}
