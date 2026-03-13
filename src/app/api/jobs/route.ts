import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const db = getDb();
  const url = req.nextUrl;

  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10))
  );
  const offset = (page - 1) * limit;

  const field = url.searchParams.get("field");
  const location = url.searchParams.get("location");
  const jobType = url.searchParams.get("type");
  const search = url.searchParams.get("q");

  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (field) {
    conditions.push("field LIKE @field");
    params.field = `%${field}%`;
  }
  if (location) {
    conditions.push("location LIKE @location");
    params.location = `%${location}%`;
  }
  if (jobType) {
    conditions.push("job_type LIKE @jobType");
    params.jobType = `%${jobType}%`;
  }
  if (search) {
    conditions.push("(title LIKE @search OR company LIKE @search)");
    params.search = `%${search}%`;
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const total = db
    .prepare(`SELECT COUNT(*) as count FROM jobs ${where}`)
    .get(params) as { count: number };

  const jobs = db
    .prepare(
      `SELECT id, slug, url, title, company, field, location, experience, qualification, job_type, industry, posted_date, deadline, scraped_at
       FROM jobs ${where}
       ORDER BY posted_date DESC, id DESC
       LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset });

  return NextResponse.json({
    jobs,
    pagination: {
      page,
      limit,
      total: total.count,
      totalPages: Math.ceil(total.count / limit),
    },
  });
}
