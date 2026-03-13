import KpiCard from "@/components/KpiCard";
import { getDb } from "@/lib/db";
import DashboardCharts from "./DashboardCharts";

export const dynamic = "force-dynamic";

function getOverviewData() {
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
       GROUP BY field ORDER BY count DESC LIMIT 8`
    )
    .all() as { name: string; count: number }[];

  const topLocations = db
    .prepare(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL
       GROUP BY location ORDER BY count DESC LIMIT 8`
    )
    .all() as { name: string; count: number }[];

  const recentTrend = db
    .prepare(
      `SELECT posted_date as period, COUNT(*) as count
       FROM jobs WHERE posted_date IS NOT NULL
       GROUP BY posted_date ORDER BY posted_date ASC LIMIT 30`
    )
    .all() as { period: string; count: number }[];

  return {
    totalJobs,
    totalCompanies,
    totalFields,
    totalLocations,
    dateRange,
    topFields,
    topLocations,
    recentTrend,
  };
}

export default function DashboardPage() {
  const data = getOverviewData();

  const dateSubtitle = data.dateRange.earliest
    ? `${data.dateRange.earliest} to ${data.dateRange.latest}`
    : "No data yet";

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Kenya job market overview from MyJobMag
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Jobs"
          value={data.totalJobs}
          subtitle={dateSubtitle}
          accent="emerald"
        />
        <KpiCard
          title="Companies"
          value={data.totalCompanies}
          subtitle="Unique employers"
          accent="blue"
        />
        <KpiCard
          title="Job Fields"
          value={data.totalFields}
          subtitle="Distinct categories"
          accent="amber"
        />
        <KpiCard
          title="Locations"
          value={data.totalLocations}
          subtitle="Across Kenya"
          accent="rose"
        />
      </div>

      <DashboardCharts
        topFields={data.topFields}
        topLocations={data.topLocations}
        recentTrend={data.recentTrend}
      />
    </>
  );
}
