import { getDb } from "@/lib/db";
import LocationsView from "./LocationsView";

export const dynamic = "force-dynamic";

function getLocationsData() {
  const db = getDb();

  const locations = db
    .prepare(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL AND location != ''
       GROUP BY location ORDER BY count DESC`
    )
    .all() as { name: string; count: number }[];

  return { locations };
}

export default function LocationsPage() {
  const { locations } = getLocationsData();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Job distribution across Kenyan counties and cities
        </p>
      </div>
      <LocationsView locations={locations} />
    </>
  );
}
