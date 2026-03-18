import KpiCard from "@/components/KpiCard";
import { queryOne, queryAll } from "@/lib/db";
import DashboardCharts from "./DashboardCharts";

export const revalidate = 86400;

async function getOverviewData() {
  const [
    totalJobsRow,
    totalCompaniesRow,
    totalFieldsRow,
    totalLocationsRow,
    topFields,
    topLocations,
    topCompanies,
  ] = await Promise.all([
    queryOne<{ c: number }>("SELECT COUNT(*) as c FROM jobs"),
    queryOne<{ c: number }>(
      "SELECT COUNT(DISTINCT company) as c FROM jobs WHERE company IS NOT NULL"
    ),
    queryOne<{ c: number }>(
      "SELECT COUNT(DISTINCT field) as c FROM jobs WHERE field IS NOT NULL"
    ),
    queryOne<{ c: number }>(
      "SELECT COUNT(DISTINCT location) as c FROM jobs WHERE location IS NOT NULL"
    ),
    queryAll<{ name: string; count: number }>(
      "SELECT field as name, COUNT(*) as count FROM jobs WHERE field IS NOT NULL GROUP BY field ORDER BY count DESC LIMIT 8"
    ),
    queryAll<{ name: string; count: number }>(
      "SELECT location as name, COUNT(*) as count FROM jobs WHERE location IS NOT NULL GROUP BY location ORDER BY count DESC LIMIT 8"
    ),
    queryAll<{ name: string; count: number }>(
      "SELECT company as name, COUNT(*) as count FROM jobs WHERE company IS NOT NULL GROUP BY company ORDER BY count DESC LIMIT 8"
    ),
  ]);

  return {
    totalJobs: totalJobsRow?.c ?? 0,
    totalCompanies: totalCompaniesRow?.c ?? 0,
    totalFields: totalFieldsRow?.c ?? 0,
    totalLocations: totalLocationsRow?.c ?? 0,
    topFields,
    topLocations,
    topCompanies,
  };
}

export default async function DashboardPage() {
  const data = await getOverviewData();

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
