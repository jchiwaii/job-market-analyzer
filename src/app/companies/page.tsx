import { getDb } from "@/lib/db";
import CompaniesView from "./CompaniesView";

export const dynamic = "force-dynamic";

export interface CompanyRow {
  name: string;
  count: number;
  fields: string | null;
  locations: string | null;
  firstPosted: string | null;
  lastPosted: string | null;
}

function getCompaniesData() {
  const db = getDb();

  const companies = db
    .prepare(
      `SELECT company as name, COUNT(*) as count,
              GROUP_CONCAT(DISTINCT field) as fields,
              GROUP_CONCAT(DISTINCT location) as locations,
              MIN(posted_date) as firstPosted,
              MAX(posted_date) as lastPosted
       FROM jobs WHERE company IS NOT NULL AND company != ''
       GROUP BY company ORDER BY count DESC`
    )
    .all() as CompanyRow[];

  return { companies };
}

export default function CompaniesPage() {
  const { companies } = getCompaniesData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Top hiring companies on MyJobMag Kenya
        </p>
      </div>
      <CompaniesView companies={companies} />
    </>
  );
}
