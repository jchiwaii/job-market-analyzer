import { getDb } from "@/lib/db";
import LocationsView from "./LocationsView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function getLocationsData(page: number) {
  const db = getDb();
  const offset = (page - 1) * PAGE_SIZE;

  const total = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT location) as c FROM jobs WHERE location IS NOT NULL AND location <> ''"
      )
      .get() as { c: number }
  ).c;

  const locations = db
    .prepare(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL AND location <> ''
       GROUP BY location ORDER BY count DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    )
    .all() as { name: string; count: number }[];

  const top15 = db
    .prepare(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL AND location <> ''
       GROUP BY location ORDER BY count DESC LIMIT 15`
    )
    .all() as { name: string; count: number }[];

  return { locations, top15, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const { locations, top15, total, totalPages } = getLocationsData(page);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {total.toLocaleString()} locations across Kenyan counties and cities
        </p>
      </div>
      <LocationsView
        locations={locations}
        top15={top15}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
