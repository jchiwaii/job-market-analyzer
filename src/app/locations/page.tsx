import { getDb } from "@/lib/db";
import KpiCard from "@/components/KpiCard";
import LocationsView from "./LocationsView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function getLocationsData(page: number) {
  const db = getDb();
  const offset = (page - 1) * PAGE_SIZE;

  const nairobiCount = (
    db
      .prepare("SELECT COUNT(*) as c FROM jobs WHERE location = 'Nairobi'")
      .get() as { c: number }
  ).c;

  const totalWithLocation = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM jobs WHERE location IS NOT NULL AND location <> ''"
      )
      .get() as { c: number }
  ).c;

  const total = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT location) as c FROM jobs WHERE location IS NOT NULL AND location <> '' AND location <> 'Nairobi'"
      )
      .get() as { c: number }
  ).c;

  const locations = db
    .prepare(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL AND location <> '' AND location <> 'Nairobi'
       GROUP BY location ORDER BY count DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    )
    .all() as { name: string; count: number }[];

  const top15 = db
    .prepare(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL AND location <> '' AND location <> 'Nairobi'
       GROUP BY location ORDER BY count DESC LIMIT 15`
    )
    .all() as { name: string; count: number }[];

  return {
    locations,
    top15,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    nairobiCount,
    totalWithLocation,
  };
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const { locations, top15, total, totalPages, nairobiCount, totalWithLocation } =
    getLocationsData(page);

  const nairobiPct = totalWithLocation > 0 ? Math.round((nairobiCount / totalWithLocation) * 100) : 0;
  const outsideNairobi = totalWithLocation - nairobiCount;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {total.toLocaleString()} locations across Kenyan counties and cities (excluding Nairobi)
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Nairobi Dominance"
          value={`${nairobiPct}%`}
          subtitle={`${nairobiCount.toLocaleString()} of ${totalWithLocation.toLocaleString()} located jobs`}
          accent="emerald"
        />
        <KpiCard
          title="Top City Outside Nairobi"
          value={top15[0]?.name ?? "—"}
          subtitle={`${(top15[0]?.count ?? 0).toLocaleString()} jobs`}
          accent="blue"
        />
        <KpiCard
          title="Jobs Outside Nairobi"
          value={outsideNairobi.toLocaleString()}
          subtitle={`${(100 - nairobiPct)}% of located listings`}
          accent="amber"
        />
        <KpiCard
          title="Unique Locations"
          value={total + 1}
          subtitle="including Nairobi"
          accent="rose"
        />
      </div>

      <LocationsView
        locations={locations}
        top15={top15}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        nairobiCount={nairobiCount}
        totalWithLocation={totalWithLocation}
      />
    </>
  );
}
