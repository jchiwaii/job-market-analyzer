import { getDb } from "@/lib/db";
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
  const summaryCards: {
    title: string;
    value: string;
    subtitle?: string;
    tone: string;
  }[] = [
    {
      title: "Unique Companies",
      value: total.toLocaleString(),
      tone: "text-[#1E4841] bg-[#ECF4E9] border-[#D9E2D7]",
    },
    {
      title: "Top Employer",
      value: top15[0]?.name ?? "—",
      subtitle: `${(top15[0]?.count ?? 0).toLocaleString()} job listings`,
      tone: "text-[#2F5F90] bg-[#EAF1F8] border-[#D6E1EE]",
    },
    {
      title: "Avg Jobs per Company",
      value: avgJobsPerCompany.toLocaleString(),
      subtitle: "across all hiring companies",
      tone: "text-[#9F6A1F] bg-[#FBF3E8] border-[#F0DFCA]",
    },
    {
      title: "Single-Listing Companies",
      value: `${singleJobPct}%`,
      subtitle: `${singleJobCompanies.toLocaleString()} posted just once`,
      tone: "text-[#7F4A83] bg-[#F5ECF7] border-[#E8D7EC]",
    },
  ];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-[#23302D] sm:text-2xl lg:text-[30px]">
          Companies
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6E7875]">
          {total.toLocaleString()} unique hiring companies on MyJobMag Kenya
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${card.tone}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {card.title}
            </p>
            <p className="mt-2 break-words text-lg font-semibold leading-snug">
              {card.value}
            </p>
            {card.subtitle && (
              <p className="mt-1 text-xs font-medium opacity-85">{card.subtitle}</p>
            )}
          </div>
        ))}
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
