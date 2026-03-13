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

export default async function JobsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const data = await getJobsData(sp);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">All Jobs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Browse {data.total.toLocaleString()} scraped jobs
        </p>
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
