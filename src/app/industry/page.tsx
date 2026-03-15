import { getDb } from "@/lib/db";
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

  return { industries, top15, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function IndustryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const { industries, top15, total, totalPages } = getIndustryData(page);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Industry</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {total.toLocaleString()} unique industries in the Kenyan job market
        </p>
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
