import { getDb } from "@/lib/db";
import TrendsCharts from "./TrendsCharts";

export const dynamic = "force-dynamic";

function getTrendsData() {
  const db = getDb();

  const daily = db
    .prepare(
      `SELECT posted_date as period, COUNT(*) as count
       FROM jobs WHERE posted_date IS NOT NULL
       GROUP BY posted_date ORDER BY posted_date ASC`
    )
    .all() as { period: string; count: number }[];

  const weekly = db
    .prepare(
      `SELECT strftime('%Y-W%W', posted_date) as period, COUNT(*) as count
       FROM jobs WHERE posted_date IS NOT NULL
       GROUP BY period ORDER BY period ASC`
    )
    .all() as { period: string; count: number }[];

  const monthly = db
    .prepare(
      `SELECT strftime('%Y-%m', posted_date) as period, COUNT(*) as count
       FROM jobs WHERE posted_date IS NOT NULL
       GROUP BY period ORDER BY period ASC`
    )
    .all() as { period: string; count: number }[];

  const fields = db
    .prepare(
      `SELECT DISTINCT field FROM jobs WHERE field IS NOT NULL ORDER BY field`
    )
    .all() as { field: string }[];

  return { daily, weekly, monthly, fields: fields.map((f) => f.field) };
}

export default function TrendsPage() {
  const data = getTrendsData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Trends</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Job posting volume over time
        </p>
      </div>
      <TrendsCharts
        daily={data.daily}
        weekly={data.weekly}
        monthly={data.monthly}
      />
    </>
  );
}
