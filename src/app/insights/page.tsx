import { getDb } from "@/lib/db";
import KpiCard from "@/components/KpiCard";
import InsightsView from "./InsightsView";

export const dynamic = "force-dynamic";

export interface WorkTypeRow {
  category: string;
  count: number;
}

export interface ExperienceBucketRow {
  bucket: string;
  count: number;
}

export interface CompanyConcentrationRow {
  bucket: string;
  companies: number;
}

export interface FieldLocationRow {
  field: string;
  location: string;
  count: number;
}

export interface ExperienceByFieldRow {
  field: string;
  avg_years: number;
  count: number;
}

export interface QualificationByFieldRow {
  field: string;
  qualification: string;
  count: number;
}

function getInsightsData() {
  const db = getDb();

  const workTypes = db
    .prepare(
      `SELECT
        CASE
          WHEN job_type LIKE '%Remote%' THEN 'Remote'
          WHEN job_type LIKE '%Hybrid%' THEN 'Hybrid'
          WHEN job_type LIKE '%Part Time%' THEN 'Part Time'
          WHEN job_type LIKE '%Contract%' THEN 'Contract'
          WHEN job_type LIKE '%Full Time%' THEN 'Full Time'
          ELSE 'Other'
        END as category,
        COUNT(*) as count
      FROM jobs WHERE job_type IS NOT NULL
      GROUP BY category ORDER BY count DESC`
    )
    .all() as WorkTypeRow[];

  const experienceBuckets = db
    .prepare(
      `SELECT
        CASE
          WHEN experience IN ('1 year','1 Year','1-2 years','1 - 2 years') OR experience LIKE '1 year%' THEN '0–1 year'
          WHEN experience IN ('2 years','2 Years','2-3 years','2 - 3 years') OR experience LIKE '2 year%' THEN '2–3 years'
          WHEN experience IN ('3 years','3 Years','3-5 years','3 - 5 years') OR experience LIKE '3 year%' THEN '3–5 years'
          WHEN experience IN ('4 years','5 years','4 Years','5 Years','5-7 years','5 - 7 years') OR experience LIKE '4 year%' OR experience LIKE '5 year%' THEN '4–5 years'
          WHEN experience IN ('6 years','7 years','6 Years','7 Years') OR experience LIKE '6 year%' OR experience LIKE '7 year%' THEN '6–7 years'
          WHEN experience IN ('8 years','9 years','8 Years','9 Years') OR experience LIKE '8 year%' OR experience LIKE '9 year%' THEN '8–9 years'
          WHEN experience LIKE '10%' OR experience LIKE '15%' OR experience LIKE '20%' THEN '10+ years'
          ELSE NULL
        END as bucket,
        COUNT(*) as count
      FROM jobs WHERE experience IS NOT NULL AND experience <> ''
      GROUP BY bucket HAVING bucket IS NOT NULL
      ORDER BY CASE bucket
        WHEN '0–1 year' THEN 1 WHEN '2–3 years' THEN 2 WHEN '3–5 years' THEN 3
        WHEN '4–5 years' THEN 4 WHEN '6–7 years' THEN 5 WHEN '8–9 years' THEN 6
        WHEN '10+ years' THEN 7 END`
    )
    .all() as ExperienceBucketRow[];

  const companyConcentration = db
    .prepare(
      `SELECT
        CASE
          WHEN cnt = 1 THEN '1 job'
          WHEN cnt BETWEEN 2 AND 5 THEN '2–5 jobs'
          WHEN cnt BETWEEN 6 AND 20 THEN '6–20 jobs'
          WHEN cnt BETWEEN 21 AND 100 THEN '21–100 jobs'
          ELSE '100+ jobs'
        END as bucket,
        COUNT(*) as companies
      FROM (
        SELECT company, COUNT(*) as cnt FROM jobs
        WHERE company IS NOT NULL AND company <> ''
        GROUP BY company
      ) GROUP BY bucket
      ORDER BY CASE bucket WHEN '1 job' THEN 1 WHEN '2–5 jobs' THEN 2 WHEN '6–20 jobs' THEN 3 WHEN '21–100 jobs' THEN 4 ELSE 5 END`
    )
    .all() as CompanyConcentrationRow[];

  const fieldLocationCombos = db
    .prepare(
      `SELECT field, location, COUNT(*) as count
       FROM jobs
       WHERE field IS NOT NULL AND location IS NOT NULL
         AND location <> 'Nairobi' AND location <> ''
       GROUP BY field, location
       ORDER BY count DESC LIMIT 15`
    )
    .all() as FieldLocationRow[];

  const experienceByField = db
    .prepare(
      `SELECT field,
        ROUND(AVG(CAST(REPLACE(REPLACE(experience, ' years', ''), ' year', '') AS FLOAT)), 1) as avg_years,
        COUNT(*) as count
      FROM jobs
      WHERE field IS NOT NULL AND experience IS NOT NULL
        AND (experience LIKE '%year%')
        AND CAST(REPLACE(REPLACE(experience, ' years', ''), ' year', '') AS FLOAT) > 0
        AND CAST(REPLACE(REPLACE(experience, ' years', ''), ' year', '') AS FLOAT) < 30
      GROUP BY field
      HAVING count > 100
      ORDER BY avg_years DESC LIMIT 12`
    )
    .all() as ExperienceByFieldRow[];

  const qualificationByFieldRaw = db
    .prepare(
      `SELECT field, qualification, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL AND qualification IS NOT NULL AND qualification <> ''
       GROUP BY field, qualification
       ORDER BY field, count DESC`
    )
    .all() as QualificationByFieldRow[];

  // Top 10 fields by job count
  const topFieldsByCount = db
    .prepare(
      `SELECT field, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL AND field <> ''
       GROUP BY field ORDER BY count DESC LIMIT 10`
    )
    .all() as { field: string; count: number }[];

  const topFieldSet = new Set(topFieldsByCount.map((r) => r.field));

  // Pick top qualification per field for top 10 fields
  const seenFields = new Set<string>();
  const topQualByField: QualificationByFieldRow[] = [];
  for (const row of qualificationByFieldRaw) {
    if (topFieldSet.has(row.field) && !seenFields.has(row.field)) {
      seenFields.add(row.field);
      topQualByField.push(row);
    }
  }
  // Sort by job count descending (matching topFieldsByCount order)
  topQualByField.sort((a, b) => {
    const aIdx = topFieldsByCount.findIndex((r) => r.field === a.field);
    const bIdx = topFieldsByCount.findIndex((r) => r.field === b.field);
    return aIdx - bIdx;
  });

  return {
    workTypes,
    experienceBuckets,
    companyConcentration,
    fieldLocationCombos,
    experienceByField,
    topQualByField,
  };
}

export default function InsightsPage() {
  const {
    workTypes,
    experienceBuckets,
    companyConcentration,
    fieldLocationCombos,
    experienceByField,
    topQualByField,
  } = getInsightsData();

  const totalWorkType = workTypes.reduce((s, r) => s + r.count, 0);
  const remoteCount = workTypes.find((w) => w.category === "Remote")?.count ?? 0;
  const remotePct = totalWorkType > 0 ? Math.round((remoteCount / totalWorkType) * 100) : 0;
  const topCombo = fieldLocationCombos[0];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Deep-dive analysis of work arrangements, experience, company structure, and more
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Most Common Arrangement"
          value={workTypes[0]?.category ?? "—"}
          subtitle={`${(workTypes[0]?.count ?? 0).toLocaleString()} listings`}
          accent="emerald"
        />
        <KpiCard
          title="Most Demanded Experience"
          value={experienceBuckets[0]?.bucket ?? "—"}
          subtitle={`${(experienceBuckets[0]?.count ?? 0).toLocaleString()} listings`}
          accent="blue"
        />
        <KpiCard
          title="Remote Jobs"
          value={`${remotePct}%`}
          subtitle={`${remoteCount.toLocaleString()} remote listings`}
          accent="amber"
        />
        <KpiCard
          title="Top Field–City Hotspot"
          value={topCombo ? `${topCombo.field}` : "—"}
          subtitle={topCombo ? `${topCombo.location} · ${topCombo.count.toLocaleString()} jobs` : undefined}
          accent="rose"
        />
      </div>

      <InsightsView
        workTypes={workTypes}
        experienceBuckets={experienceBuckets}
        companyConcentration={companyConcentration}
        fieldLocationCombos={fieldLocationCombos}
        experienceByField={experienceByField}
        topQualByField={topQualByField}
      />
    </>
  );
}
