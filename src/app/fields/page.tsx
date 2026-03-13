import { getDb } from "@/lib/db";
import FieldsView from "./FieldsView";

export const dynamic = "force-dynamic";

function getFieldsData() {
  const db = getDb();

  const fields = db
    .prepare(
      `SELECT field as name, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL AND field != ''
       GROUP BY field ORDER BY count DESC`
    )
    .all() as { name: string; count: number }[];

  const qualifications = db
    .prepare(
      `SELECT qualification as name, COUNT(*) as count
       FROM jobs WHERE qualification IS NOT NULL AND qualification != ''
       GROUP BY qualification ORDER BY count DESC`
    )
    .all() as { name: string; count: number }[];

  const jobTypes = db
    .prepare(
      `SELECT job_type as name, COUNT(*) as count
       FROM jobs WHERE job_type IS NOT NULL AND job_type != ''
       GROUP BY job_type ORDER BY count DESC`
    )
    .all() as { name: string; count: number }[];

  return { fields, qualifications, jobTypes };
}

export default function FieldsPage() {
  const data = getFieldsData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Job Fields</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Breakdown by field, qualification, and job type
        </p>
      </div>
      <FieldsView
        fields={data.fields}
        qualifications={data.qualifications}
        jobTypes={data.jobTypes}
      />
    </>
  );
}
