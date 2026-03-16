import { getDb } from "@/lib/db";
import KpiCard from "@/components/KpiCard";
import FieldsView from "./FieldsView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function getFieldsData(page: number) {
  const db = getDb();
  const offset = (page - 1) * PAGE_SIZE;

  const total = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT field) as c FROM jobs WHERE field IS NOT NULL AND field <> ''"
      )
      .get() as { c: number }
  ).c;

  const fields = db
    .prepare(
      `SELECT field as name, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL AND field <> ''
       GROUP BY field ORDER BY count DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    )
    .all() as { name: string; count: number }[];

  const top15 = db
    .prepare(
      `SELECT field as name, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL AND field <> ''
       GROUP BY field ORDER BY count DESC LIMIT 15`
    )
    .all() as { name: string; count: number }[];

  const qualifications = db
    .prepare(
      `SELECT qualification as name, COUNT(*) as count
       FROM jobs WHERE qualification IS NOT NULL AND qualification <> ''
       GROUP BY qualification ORDER BY count DESC LIMIT 10`
    )
    .all() as { name: string; count: number }[];

  const jobTypes = db
    .prepare(
      `SELECT job_type as name, COUNT(*) as count
       FROM jobs WHERE job_type IS NOT NULL AND job_type <> ''
       GROUP BY job_type ORDER BY count DESC LIMIT 10`
    )
    .all() as { name: string; count: number }[];

  const totalJobsWithField = (
    db
      .prepare("SELECT COUNT(*) as c FROM jobs WHERE field IS NOT NULL AND field <> ''")
      .get() as { c: number }
  ).c;

  return { fields, top15, qualifications, jobTypes, total, totalPages: Math.ceil(total / PAGE_SIZE), totalJobsWithField };
}

export default async function FieldsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const { fields, top15, qualifications, jobTypes, total, totalPages, totalJobsWithField } = getFieldsData(page);

  const dominantPct = top15[0] ? Math.round((top15[0].count / totalJobsWithField) * 100) : 0;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Job Fields</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Breakdown by field, qualification, and job type
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Unique Job Fields" value={total} accent="emerald" />
        <KpiCard
          title="Dominant Field"
          value={top15[0]?.name ?? "—"}
          subtitle={`${dominantPct}% of field-tagged jobs`}
          accent="amber"
        />
        <KpiCard
          title="Most Required Qualification"
          value={qualifications[0]?.name ?? "—"}
          subtitle={`${(qualifications[0]?.count ?? 0).toLocaleString()} listings`}
          accent="blue"
        />
        <KpiCard
          title="Most Common Work Type"
          value={jobTypes[0]?.name ?? "—"}
          subtitle={`${(jobTypes[0]?.count ?? 0).toLocaleString()} listings`}
          accent="rose"
        />
      </div>

      <FieldsView
        fields={fields}
        top15={top15}
        qualifications={qualifications}
        jobTypes={jobTypes}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
