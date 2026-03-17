import { getDb } from "@/lib/db";
import JobsTable from "./JobsTable";

export const dynamic = "force-dynamic";

export interface JobItem {
  id: number;
  title: string;
  company: string | null;
  field: string | null;
  location: string | null;
  job_type: string | null;
  qualification: string | null;
  experience: string | null;
  posted_date: string | null;
  url: string;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function getJobsData(searchParams: { [key: string]: string | undefined }) {
  const db = getDb();

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const field = searchParams.field;
  const location = searchParams.location;
  const q = searchParams.q;

  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (field) {
    conditions.push("field LIKE @field");
    params.field = `%${field}%`;
  }
  if (location) {
    conditions.push("location LIKE @location");
    params.location = `%${location}%`;
  }
  if (q) {
    conditions.push("(title LIKE @q OR company LIKE @q)");
    params.q = `%${q}%`;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const total = (
    db.prepare(`SELECT COUNT(*) as c FROM jobs ${where}`).get(params) as {
      c: number;
    }
  ).c;

  const jobs = db
    .prepare(
      `SELECT id, title, company, field, location, job_type, qualification, experience, posted_date, url
       FROM jobs ${where}
       ORDER BY posted_date DESC, id DESC
       LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as JobItem[];

  const allFields = db
    .prepare(
      "SELECT DISTINCT field FROM jobs WHERE field IS NOT NULL ORDER BY field"
    )
    .all() as { field: string }[];

  const allLocations = db
    .prepare(
      "SELECT DISTINCT location FROM jobs WHERE location IS NOT NULL ORDER BY location"
    )
    .all() as { location: string }[];

  return {
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    allFields: allFields.map((f) => f.field),
    allLocations: allLocations.map((l) => l.location),
  };
}

function getGlobalStats() {
  const db = getDb();
  const totalAll = (db.prepare("SELECT COUNT(*) as c FROM jobs").get() as { c: number }).c;
  const uniqueCompanies = (
    db.prepare("SELECT COUNT(DISTINCT company) as c FROM jobs WHERE company IS NOT NULL AND company <> ''").get() as { c: number }
  ).c;
  const uniqueLocations = (
    db.prepare("SELECT COUNT(DISTINCT location) as c FROM jobs WHERE location IS NOT NULL AND location <> ''").get() as { c: number }
  ).c;
  const withDates = (
    db.prepare("SELECT COUNT(*) as c FROM jobs WHERE posted_date IS NOT NULL").get() as { c: number }
  ).c;
  return { totalAll, uniqueCompanies, uniqueLocations, withDates };
}

export default async function JobsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const [data, global] = await Promise.all([getJobsData(sp), Promise.resolve(getGlobalStats())]);
  const activeFilterCount = [sp.q, sp.field, sp.location].filter(Boolean).length;
  const withDatesPct = global.totalAll > 0 ? Math.round((global.withDates / global.totalAll) * 100) : 0;
  const summaryCards: {
    title: string;
    value: string;
    subtitle?: string;
    tone: string;
  }[] = [
    {
      title: "Total Listings",
      value: global.totalAll.toLocaleString(),
      subtitle: "scraped from MyJobMag",
      tone: "text-[#1E4841] bg-[#ECF4E9] border-[#D9E2D7]",
    },
    {
      title: "Filtered Results",
      value: data.total.toLocaleString(),
      subtitle: activeFilterCount > 0 ? `${activeFilterCount} active filters` : "no active filters",
      tone: "text-[#2F5F90] bg-[#EAF1F8] border-[#D6E1EE]",
    },
    {
      title: "Hiring Companies",
      value: global.uniqueCompanies.toLocaleString(),
      subtitle: "unique employers",
      tone: "text-[#9F6A1F] bg-[#FBF3E8] border-[#F0DFCA]",
    },
    {
      title: "Dated Listings",
      value: `${withDatesPct}%`,
      subtitle: `${global.withDates.toLocaleString()} include posted dates`,
      tone: "text-[#7F4A83] bg-[#F5ECF7] border-[#E8D7EC]",
    },
  ];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-[#23302D] sm:text-2xl lg:text-[30px]">
          All Jobs
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6E7875]">
          Browse {data.total.toLocaleString()} scraped jobs with field, location, and keyword
          filters.
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
            <p className="mt-2 break-words text-lg font-semibold leading-snug">{card.value}</p>
            {card.subtitle && <p className="mt-1 text-xs font-medium opacity-85">{card.subtitle}</p>}
          </div>
        ))}
      </div>

      <JobsTable
        jobs={data.jobs}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        allFields={data.allFields}
        allLocations={data.allLocations}
        currentField={sp.field}
        currentLocation={sp.location}
        currentSearch={sp.q}
      />
    </>
  );
}
