import { getDb } from "@/lib/db";
import KpiCard from "@/components/KpiCard";
import CompaniesView from "./CompaniesView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export interface CompanyRow {
  name: string;
  count: number;
  fields: string | null;
  locations: string | null;
  firstPosted: string | null;
  lastPosted: string | null;
}

function getCompaniesData(page: number) {
  const db = getDb();
  const offset = (page - 1) * PAGE_SIZE;

  const total = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT company) as c FROM jobs WHERE company IS NOT NULL AND company <> ''"
      )
      .get() as { c: number }
  ).c;

  const companies = db
    .prepare(
      `SELECT company as name, COUNT(*) as count,
              GROUP_CONCAT(DISTINCT field) as fields,
              GROUP_CONCAT(DISTINCT location) as locations,
              MIN(posted_date) as firstPosted,
              MAX(posted_date) as lastPosted
       FROM jobs WHERE company IS NOT NULL AND company <> ''
       GROUP BY company ORDER BY count DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    )
    .all() as CompanyRow[];

  const top15 = db
    .prepare(
      `SELECT company as name, COUNT(*) as count
       FROM jobs WHERE company IS NOT NULL AND company <> ''
       GROUP BY company ORDER BY count DESC LIMIT 15`
    )
    .all() as { name: string; count: number }[];

  const totalCompanyJobs = (
    db
      .prepare("SELECT COUNT(*) as c FROM jobs WHERE company IS NOT NULL AND company <> ''")
      .get() as { c: number }
  ).c;

  const singleJobCompanies = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM (
           SELECT company FROM jobs WHERE company IS NOT NULL AND company <> ''
           GROUP BY company HAVING COUNT(*) = 1
         )`
      )
      .get() as { c: number }
  ).c;

  return { companies, total, top15, totalPages: Math.ceil(total / PAGE_SIZE), totalCompanyJobs, singleJobCompanies };
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const { companies, total, top15, totalPages, totalCompanyJobs, singleJobCompanies } = getCompaniesData(page);

  const avgJobsPerCompany = total > 0 ? Math.round(totalCompanyJobs / total) : 0;
  const singleJobPct = total > 0 ? Math.round((singleJobCompanies / total) * 100) : 0;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {total.toLocaleString()} unique hiring companies on MyJobMag Kenya
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Unique Companies" value={total} accent="emerald" />
        <KpiCard
          title="Top Employer"
          value={top15[0]?.name ?? "—"}
          subtitle={`${(top15[0]?.count ?? 0).toLocaleString()} job listings`}
          accent="blue"
        />
        <KpiCard
          title="Avg Jobs per Company"
          value={avgJobsPerCompany}
          subtitle="across all hiring companies"
          accent="amber"
        />
        <KpiCard
          title="Single-Listing Companies"
          value={`${singleJobPct}%`}
          subtitle={`${singleJobCompanies.toLocaleString()} companies posted just once`}
          accent="rose"
        />
      </div>

      <CompaniesView
        companies={companies}
        top15={top15}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
