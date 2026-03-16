import { getDb } from "@/lib/db";
import KpiCard from "@/components/KpiCard";
import IndustryView from "./IndustryView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function getIndustryData(page: number) {
  const db = getDb();
  const offset = (page - 1) * PAGE_SIZE;

  const total = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT industry) as c FROM jobs WHERE industry IS NOT NULL AND industry <> ''"
      )
      .get() as { c: number }
  ).c;

  const industries = db
    .prepare(
      `SELECT industry as name, COUNT(*) as count
       FROM jobs WHERE industry IS NOT NULL AND industry <> ''
       GROUP BY industry ORDER BY count DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    )
    .all() as { name: string; count: number }[];

  const top15 = db
    .prepare(
      `SELECT industry as name, COUNT(*) as count
       FROM jobs WHERE industry IS NOT NULL AND industry <> ''
       GROUP BY industry ORDER BY count DESC LIMIT 15`
    )
    .all() as { name: string; count: number }[];

  const totalIndustryJobs = (
    db
      .prepare("SELECT COUNT(*) as c FROM jobs WHERE industry IS NOT NULL AND industry <> ''")
      .get() as { c: number }
  ).c;

  return { industries, top15, total, totalPages: Math.ceil(total / PAGE_SIZE), totalIndustryJobs };
}

export default async function IndustryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const { industries, top15, total, totalPages, totalIndustryJobs } = getIndustryData(page);

  const leadingPct = totalIndustryJobs > 0 && top15[0] ? Math.round((top15[0].count / totalIndustryJobs) * 100) : 0;
  const top3Sum = top15.slice(0, 3).reduce((s, r) => s + r.count, 0);
  const top3Pct = totalIndustryJobs > 0 ? Math.round((top3Sum / totalIndustryJobs) * 100) : 0;
  const avgJobsPerIndustry = total > 0 ? Math.round(totalIndustryJobs / total) : 0;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Industry</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {total.toLocaleString()} unique industries in the Kenyan job market
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Unique Industries" value={total} accent="emerald" />
        <KpiCard
          title="Leading Industry"
          value={top15[0]?.name ?? "—"}
          subtitle={`${leadingPct}% of industry-tagged jobs`}
          accent="blue"
        />
        <KpiCard
          title="Top 3 Market Share"
          value={`${top3Pct}%`}
          subtitle="of jobs concentrated in top 3 industries"
          accent="amber"
        />
        <KpiCard
          title="Avg Jobs per Industry"
          value={avgJobsPerIndustry.toLocaleString()}
          subtitle="across all industries"
          accent="rose"
        />
      </div>

      <IndustryView
        industries={industries}
        top15={top15}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
