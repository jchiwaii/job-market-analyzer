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

  const topCompanies = db
    .prepare(
      `SELECT company as name, COUNT(*) as count
       FROM jobs WHERE company IS NOT NULL
       GROUP BY company ORDER BY count DESC LIMIT 8`
    )
    .all() as { name: string; count: number }[];

  return {
    totalJobs,
    totalCompanies,
    totalFields,
    totalLocations,
    topFields,
    topLocations,
    topCompanies,
  };
}

export default function DashboardPage() {
  const data = getOverviewData();

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-[#23302D] sm:text-2xl lg:text-[30px]">
          Dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[#6E7875]">
          Kenya job market overview from MyJobMag
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <KpiCard
          title="Total Jobs"
          value={data.totalJobs}
          description="The total number of job listings collected from MyJobMag across all categories and regions."
          accent="emerald"
        />
        <KpiCard
          title="Companies"
          value={data.totalCompanies}
          description="The number of distinct companies that have posted at least one job listing in the dataset."
          accent="blue"
        />
        <KpiCard
          title="Job Fields"
          value={data.totalFields}
          description="The number of unique job categories or fields represented, e.g. Engineering, Finance, Health."
          accent="amber"
        />
        <KpiCard
          title="Locations"
          value={data.totalLocations}
          description="The number of distinct towns or regions in Kenya where job opportunities have been listed."
          accent="rose"
        />
      </div>

      <DashboardCharts
        topFields={data.topFields}
        topLocations={data.topLocations}
        topCompanies={data.topCompanies}
      />
    </>
  );
}
