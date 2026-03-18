import { NextRequest, NextResponse } from "next/server";
import { queryAll } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const groupBy = req.nextUrl.searchParams.get("group") || "day";
  const field = req.nextUrl.searchParams.get("field");

  let dateExpr: string;
  switch (groupBy) {
    case "week":
      dateExpr = "strftime('%Y-W%W', posted_date)";
      break;
    case "month":
      dateExpr = "strftime('%Y-%m', posted_date)";
      break;
    default:
      dateExpr = "posted_date";
  }

  const conditions = ["posted_date IS NOT NULL"];
  const params: Record<string, string> = {};

  if (field) {
    conditions.push("field LIKE :field");
    params.field = `%${field}%`;
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  const [trends, fieldBreakdown] = await Promise.all([
    queryAll<{ period: string; count: number }>(
      `SELECT ${dateExpr} as period, COUNT(*) as count
       FROM jobs ${where}
       GROUP BY period ORDER BY period ASC`,
      params
    ),
    queryAll<{ period: string; field: string; count: number }>(
      `SELECT ${dateExpr} as period, field, COUNT(*) as count
       FROM jobs ${where} AND field IS NOT NULL
       GROUP BY period, field ORDER BY period ASC`,
      params
    ),
  ]);

  return NextResponse.json({ trends, fieldBreakdown });
}
